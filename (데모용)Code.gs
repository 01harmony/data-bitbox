/**
 * ==================================================================
 *  데이터 비트박스 - 교사용 제출/피드백 백엔드 (Google Apps Script)
 * ==================================================================
 *  이 스크립트는 "선생님 각자의 구글 계정"에 배포하는 것을 전제로 합니다.
 *  배포한 선생님의 구글 드라이브 안에 있는 스프레드시트에만 데이터가
 *  저장되며, 다른 선생님/다른 학교와는 데이터가 전혀 공유되지 않습니다.
 *
 *  사용법 요약 (자세한 내용은 "데이터 비트박스-교사용 대시보드 설치 가이드.pdf" 참고):
 *   1) 아래 SECRET_KEY(학생 제출용), ADMIN_SECRET(교사 대시보드용) 값을
 *      각각 나만 아는 문자열로, 서로 다르게 바꾸세요.
 *   2) 이 스크립트가 저장될 구글 스프레드시트를 하나 만들고 연결하세요.
 *      (Apps Script 편집기를 스프레드시트에서 "확장 프로그램 > Apps Script"로
 *       열었다면 이미 자동으로 연결되어 있습니다.)
 *   3) 배포 > 새 배포 > 유형: 웹 앱
 *        - 실행 계정: 나
 *        - 액세스 권한: 모든 사용자
 *      로 배포하고, 생성된 웹 앱 URL을 복사해 두세요.
 *      (그 URL + SECRET_KEY 값을 이후 사이트의 config.js에 넣게 됩니다.)
 * ==================================================================
 */

// 🔑 [필수 수정 1] 학생 제출용 비밀값. 나만 아는 값으로 바꾸세요.
//    이 값은 사이트의 config.js에도 그대로 들어가서 깃허브(공개 저장소)에 노출됩니다.
//    → 학생이 "제출"할 때만 쓰이는 값이라고 생각하면 됩니다.
const SECRET_KEY = "bitbox-2026";

// 🔑 [필수 수정 2] 선생님(관리자) 전용 비밀값. SECRET_KEY와 반드시 다른 값으로 바꾸세요.
//    이 값은 어떤 파일에도 저장하지 말고, 대시보드를 열 때마다 선생님이 직접 입력합니다.
//    → 전체 학생 데이터 조회(list) / 피드백 저장(feedback)은 이 값으로만 가능합니다.
const ADMIN_SECRET = "bitbox-teacher-only";

// 데이터가 저장될 시트 이름 (원하면 바꿔도 됩니다)
const SHEET_NAME = "제출기록";

// 시트에 실제로 표시될 한글 헤더
// 🌟 [추가] "피드백열람일시"(학생이 피드백을 확인한 시각), "재제출요청"(선생님이 다시
// 제출해달라고 표시한 상태) 2개 컬럼을 맨 뒤에 추가했습니다.
const HEADERS = [
  "타임스탬프", "학번", "이름", "반", "단원ID", "단원명",
  "점수", "소요시간(초)", "배움노트", "배움활동소감",
  "선생님피드백", "피드백일시", "피드백열람일시", "재제출요청"
];

// 위 HEADERS와 1:1로 대응하는, 대시보드/학생 화면이 사용할 JSON 키
const HEADER_KEYS = [
  "timestamp", "studentId", "studentName", "className", "unitId", "unitTitle",
  "score", "elapsedSeconds", "memo", "reflection",
  "feedback", "feedbackDate", "feedbackReadAt", "resubmitRequested"
];

// 🌟 [추가] 학번별 개인 PIN(4자리)이 저장될 시트 이름 — 스프레드시트에 이 탭이 없으면
// 스크립트가 자동으로 만들어주므로, 따로 시트를 추가하실 필요는 없습니다.
const PIN_SHEET_NAME = "학생인증";
const PIN_HEADERS = ["학번", "PIN", "최초등록일시"];

// 🌟 [추가] 대시보드의 "피드백 빠른 문구"가 저장될 시트 이름 — 이 브라우저/컴퓨터뿐 아니라
// 어떤 기기에서 대시보드를 열어도 같은 문구 목록을 쓸 수 있도록 서버(이 시트)에 저장합니다.
const PHRASE_SHEET_NAME = "빠른문구";

// 🌟 [추가] 대시보드의 "반 명단 관리"(미제출 학생 확인용)가 저장될 시트 이름 — 역시 브라우저가
// 아니라 서버에 저장해서, 어떤 기기에서 대시보드를 열어도 같은 명단을 씁니다.
const ROSTER_SHEET_NAME = "반명단";
const ROSTER_HEADERS = ["학년", "반", "시작번호", "끝번호"];

// ------------------------------------------------------------------
// 진입점: POST (제출 / 피드백 저장)
// ------------------------------------------------------------------
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    // 학생 제출: SECRET_KEY로만 허용
    if (body.action === "submit") {
      if (body.secret !== SECRET_KEY) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      // 🌟 [추가] 학번+PIN 확인: 처음 쓰는 학번이면 이번 PIN을 등록, 이미 등록된 학번이면
      // PIN이 일치할 때만 통과시킵니다. (다른 사람이 학번만 알아도 제출 못 하게 막는 역할)
      const pinCheck = verifyOrRegisterPin(body.studentId, body.pin);
      if (!pinCheck.ok) return jsonResponse(pinCheck);
      return handleSubmit(body);
    }

    // 선생님 피드백 저장: ADMIN_SECRET으로만 허용 (SECRET_KEY로는 저장 불가)
    if (body.action === "feedback") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleFeedback(body);
    }

    // 대시보드 전체 데이터 삭제: ADMIN_SECRET으로만 허용 (되돌릴 수 없음)
    if (body.action === "clearAll") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleClearAll();
    }

    // 대시보드에서 특정 학생 1건만 삭제: ADMIN_SECRET으로만 허용 (되돌릴 수 없음)
    if (body.action === "deleteRow") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleDeleteRow(body);
    }

    // 🌟 [추가] 학생이 PIN을 잊어버렸을 때, 선생님이 대시보드에서 등록을 지워주는 기능.
    // 지우고 나면 그 학생은 다음 제출/피드백 확인 때 새 PIN을 다시 등록하게 됩니다.
    // ADMIN_SECRET으로만 허용.
    if (body.action === "resetPin") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleResetPin(body);
    }

    // 🌟 [추가] 등록된 모든 학생의 PIN을 한 번에 초기화. 제출/피드백 기록은 건드리지 않고
    // "학생인증" 시트만 헤더만 남기고 비웁니다. ADMIN_SECRET으로만 허용.
    if (body.action === "resetAllPins") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleResetAllPins();
    }

    // 🌟 [추가] 학생이 자기 피드백을 실제로 열람했을 때 학생 화면에서 호출.
    // (같은 컴퓨터의 다른 학생이 남의 피드백을 "읽음"으로 만들 수 없도록 PIN도 함께 확인)
    if (body.action === "markFeedbackRead") {
      if (body.secret !== SECRET_KEY) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      const pinCheck = verifyOrRegisterPin(body.studentId, body.pin);
      if (!pinCheck.ok) return jsonResponse(pinCheck);
      return handleMarkFeedbackRead(body);
    }

    // 🌟 [추가] 선생님이 대시보드에서 특정 학생의 특정 단원에 "재제출 요청"을 걸거나 해제할 때 호출.
    // ADMIN_SECRET으로만 허용.
    if (body.action === "requestResubmit") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleRequestResubmit(body);
    }

    // 🌟 [추가] "피드백 빠른 문구" 목록을 통째로 저장(덮어쓰기). ADMIN_SECRET으로만 허용.
    if (body.action === "savePhrases") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleSavePhrases(body);
    }

    // 🌟 [추가] "반 명단" 목록을 통째로 저장(덮어쓰기). ADMIN_SECRET으로만 허용.
    if (body.action === "saveRoster") {
      if (body.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleSaveRoster(body);
    }

    return jsonResponse({ ok: false, error: "UNKNOWN_ACTION" });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ------------------------------------------------------------------
// 진입점: GET (목록 조회 / 특정 학생 피드백 조회 / 연결 확인)
// ------------------------------------------------------------------
function doGet(e) {
  try {
    const params = e.parameter || {};

    // 대시보드 전용: 전체 목록 조회는 ADMIN_SECRET으로만 허용
    if (params.action === "list") {
      if (params.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleList();
    }

    // 학생 화면용: 자기 자신의 단원 피드백 하나만 조회 (SECRET_KEY로 허용)
    if (params.action === "feedback") {
      if (params.secret !== SECRET_KEY) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      // 🌟 [추가] 피드백 확인도 제출과 똑같이 학번+PIN을 확인합니다.
      // (그래야 같은 컴퓨터를 쓰는 다른 학생이 남의 학번으로 피드백을 훔쳐볼 수 없습니다.)
      const pinCheck = verifyOrRegisterPin(params.studentId, params.pin);
      if (!pinCheck.ok) return jsonResponse(pinCheck);
      return handleGetFeedback(params);
    }

    // 🌟 [추가] 대시보드용: "피드백 빠른 문구" 목록 조회. ADMIN_SECRET으로만 허용.
    if (params.action === "phrases") {
      if (params.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleGetPhrases();
    }

    // 🌟 [추가] 대시보드용: "반 명단" 목록 조회. ADMIN_SECRET으로만 허용.
    if (params.action === "roster") {
      if (params.secret !== ADMIN_SECRET) return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      return handleGetRoster();
    }

    // 연결 확인용: 둘 중 아무 비밀값이나 맞으면 통과
    if (params.action === "ping") {
      if (params.secret !== SECRET_KEY && params.secret !== ADMIN_SECRET) {
        return jsonResponse({ ok: false, error: "AUTH_FAILED" });
      }
      const sheet = getSheet();
      return jsonResponse({ ok: true, sheet: SHEET_NAME, rowCount: sheet.getLastRow() - 1 });
    }

    return jsonResponse({ ok: false, error: "UNKNOWN_ACTION" });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ------------------------------------------------------------------
// 내부 로직
// ------------------------------------------------------------------
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaderColumns(sheet);
  }
  return sheet;
}

// 🌟 [추가] 이전 버전 스크립트로 이미 쓰던 시트라면 "피드백열람일시"/"재제출요청" 같은
// 새 컬럼이 없을 수 있습니다. 기존 데이터는 전혀 건드리지 않고, 헤더 행에 빠진 컬럼만
// 뒤쪽에 채워 넣습니다.
function ensureHeaderColumns(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < HEADERS.length) {
    const missing = HEADERS.slice(lastCol);
    sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
  }
}

// 같은 학생(studentId) + 같은 단원(unitId) 조합의 기존 행을 찾음 (없으면 -1)
function findRow(sheet, studentId, unitId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(studentId) && String(data[i][4]) === String(unitId)) {
      return i + 1; // 실제 시트 행 번호(1-base, 헤더 포함)
    }
  }
  return -1;
}

// 제출: 같은 학생+단원이 이미 있으면 "최신 결과로 덮어쓰기", 없으면 새 행 추가
// (선생님 피드백/피드백일시는 항상 보존됨)
function handleSubmit(body) {
  const sheet = getSheet();
  const row = findRow(sheet, body.studentId, body.unitId);
  const now = new Date();

  const rowData = [
    now,
    body.studentId || "",
    body.studentName || "",
    body.className || "",
    body.unitId || "",
    body.unitTitle || "",
    Number(body.score) || 0,
    Number(body.elapsedSeconds) || 0,
    body.memo || "",
    body.reflection || ""
  ];

  if (row === -1) {
    // 새 제출: 피드백 관련 4칸(피드백/피드백일시/피드백열람일시/재제출요청)은 비워둔 채 추가
    sheet.appendRow(rowData.concat(["", "", "", ""]));
  } else {
    // 재제출: 배움노트/소감 등은 최신 내용으로 덮어쓰되, 선생님 피드백·피드백일시·열람일시(11~13열)는
    // 그대로 보존합니다. 다만 "재제출 요청" 상태는 이번 재제출로 해결된 것이므로 초기화합니다.
    sheet.getRange(row, 1, 1, rowData.length).setValues([rowData]);
    sheet.getRange(row, 14, 1, 1).setValue("");
  }

  return jsonResponse({ ok: true });
}

// 선생님 대시보드에서 특정 학생+단원에 피드백을 남길 때 호출
function handleFeedback(body) {
  const sheet = getSheet();
  const row = findRow(sheet, body.studentId, body.unitId);
  if (row === -1) return jsonResponse({ ok: false, error: "NOT_FOUND" });

  sheet.getRange(row, 11, 1, 2).setValues([[body.feedback || "", new Date()]]);
  // 🌟 [추가] 피드백 내용이 새로 바뀌었으니 "열람" 상태는 초기화합니다.
  // (학생이 예전 내용을 이미 읽었더라도, 바뀐 내용은 다시 읽어야 하니까요.)
  sheet.getRange(row, 13, 1, 1).setValue("");
  return jsonResponse({ ok: true });
}

// 선생님 대시보드에서 학생 1명(1건)만 삭제할 때 호출 — 되돌릴 수 없음
function handleDeleteRow(body) {
  const sheet = getSheet();
  const row = findRow(sheet, body.studentId, body.unitId);
  if (row === -1) return jsonResponse({ ok: false, error: "NOT_FOUND" });

  sheet.deleteRow(row);
  return jsonResponse({ ok: true });
}

// 선생님 대시보드에서 "전체 삭제"를 눌렀을 때 호출 — 헤더 행만 남기고 모든 제출/피드백 데이터를 삭제
// ⚠️ 되돌릴 수 없습니다. (구글 스프레드시트 자체의 "수정 기록"에서 복구를 시도할 수는 있습니다)
function handleClearAll() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return jsonResponse({ ok: true });
}

// 대시보드용: 전체 제출 기록을 JSON 배열로 반환
function handleList() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).map(r => {
    const obj = {};
    HEADER_KEYS.forEach((key, idx) => { obj[key] = r[idx]; });
    obj.resubmitRequested = !!obj.resubmitRequested; // "TRUE"/"" → true/false
    return obj;
  });
  return jsonResponse({ ok: true, rows: rows });
}

// 학생 화면용: 자신의 특정 단원에 대한 선생님 피드백만 조회
function handleGetFeedback(params) {
  const sheet = getSheet();
  const row = findRow(sheet, params.studentId, params.unitId);
  if (row === -1) return jsonResponse({ ok: true, feedback: "", feedbackDate: "", resubmitRequested: false });

  // 11:선생님피드백, 12:피드백일시, 13:피드백열람일시, 14:재제출요청
  const vals = sheet.getRange(row, 11, 1, 4).getValues()[0];
  return jsonResponse({
    ok: true,
    feedback: vals[0] || "",
    feedbackDate: vals[1] ? Utilities.formatDate(new Date(vals[1]), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm") : "",
    resubmitRequested: !!vals[3]
  });
}

// 🌟 [추가] PIN이 저장될 시트를 가져오거나, 없으면 새로 만듭니다. (수동으로 시트를 추가하실 필요 없음)
function getPinSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PIN_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PIN_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(PIN_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 🌟 [추가] 학번+PIN 확인
// - 처음 보는 학번이면: 이번에 입력한 PIN을 그 학번의 PIN으로 등록하고 통과시킵니다.
// - 이미 등록된 학번이면: 저장된 PIN과 일치할 때만 통과시키고, 다르면 PIN_MISMATCH를 돌려줍니다.
function verifyOrRegisterPin(studentId, pin) {
  const sid = String(studentId || "").trim();
  const p = String(pin || "").trim();

  if (!/^[0-9]{4}$/.test(p)) {
    return { ok: false, error: "INVALID_PIN" };
  }

  const sheet = getPinSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === sid) {
      if (String(data[i][1]) === p) {
        return { ok: true, isNew: false };
      }
      return { ok: false, error: "PIN_MISMATCH" };
    }
  }

  // 처음 쓰는 학번 → 이번에 입력한 PIN을 그대로 등록
  sheet.appendRow([sid, p, new Date()]);
  return { ok: true, isNew: true };
}

// 🌟 [추가] 학생이 PIN을 잊어버렸을 때, 선생님이 대시보드에서 등록을 지워주는 기능.
// 지운 뒤 그 학생이 다시 제출/피드백 확인을 하면, 그때 입력한 PIN이 새 PIN으로 등록됩니다.
function handleResetPin(body) {
  const sid = String(body.studentId || "").trim();
  const sheet = getPinSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === sid) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ ok: true });
    }
  }
  return jsonResponse({ ok: false, error: "NOT_FOUND" });
}

// 🌟 [추가] 선생님 대시보드에서 "전체 PIN 초기화"를 눌렀을 때 호출 — "학생인증" 시트를
// 헤더 행만 남기고 모두 비웁니다. (handleClearAll과 동일한 방식이지만 제출기록 시트는
// 건드리지 않으므로, 학생들의 배움노트·소감·선생님피드백은 그대로 보존됩니다.)
function handleResetAllPins() {
  const sheet = getPinSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return jsonResponse({ ok: true });
}

// 🌟 [추가] 학생이 자기 피드백을 열람했을 때 "피드백열람일시"를 기록합니다.
// 아직 선생님 피드백 자체가 없으면(=볼 게 없으면) 기록하지 않습니다.
function handleMarkFeedbackRead(body) {
  const sheet = getSheet();
  const row = findRow(sheet, body.studentId, body.unitId);
  if (row === -1) return jsonResponse({ ok: false, error: "NOT_FOUND" });

  const feedbackVal = sheet.getRange(row, 11, 1, 1).getValue();
  if (feedbackVal) {
    sheet.getRange(row, 13, 1, 1).setValue(new Date());
  }
  return jsonResponse({ ok: true });
}

// 🌟 [추가] 선생님이 특정 제출 건에 "재제출 요청"을 걸거나(true) 해제(false)합니다.
function handleRequestResubmit(body) {
  const sheet = getSheet();
  const row = findRow(sheet, body.studentId, body.unitId);
  if (row === -1) return jsonResponse({ ok: false, error: "NOT_FOUND" });

  sheet.getRange(row, 14, 1, 1).setValue(body.requested ? "TRUE" : "");
  return jsonResponse({ ok: true });
}

// 🌟 [추가] "빠른 문구" 시트를 가져오거나, 없으면 새로 만듭니다.
function getPhraseSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PHRASE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PHRASE_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["문구"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 🌟 [추가] 저장된 빠른 문구 목록을 순서대로 반환합니다. (등록된 게 없으면 빈 배열)
function handleGetPhrases() {
  const sheet = getPhraseSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return jsonResponse({ ok: true, phrases: [] });

  const vals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const phrases = vals.map(r => String(r[0] || "").trim()).filter(Boolean);
  return jsonResponse({ ok: true, phrases: phrases });
}

// 🌟 [추가] 빠른 문구 목록을 통째로 덮어씁니다. (대시보드의 "문구 관리"에서 저장할 때 호출)
function handleSavePhrases(body) {
  const phrases = Array.isArray(body.phrases)
    ? body.phrases.map(p => String(p || "").trim()).filter(Boolean)
    : [];
  const sheet = getPhraseSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  if (phrases.length) {
    sheet.getRange(2, 1, phrases.length, 1).setValues(phrases.map(p => [p]));
  }
  return jsonResponse({ ok: true });
}

// 🌟 [추가] "반 명단" 시트를 가져오거나, 없으면 새로 만듭니다.
function getRosterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(ROSTER_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ROSTER_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 🌟 [추가] 저장된 반 명단 목록을 반환합니다. (등록된 게 없으면 빈 배열)
function handleGetRoster() {
  const sheet = getRosterSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return jsonResponse({ ok: true, roster: [] });

  const vals = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  const roster = vals
    .filter(r => r[0] !== "" && r[1] !== "")
    .map(r => ({
      grade: String(r[0]),
      cls: String(r[1]).padStart(2, "0"),
      start: Number(r[2]) || 1,
      end: Number(r[3]) || 1
    }));
  return jsonResponse({ ok: true, roster: roster });
}

// 🌟 [추가] 반 명단 목록을 통째로 덮어씁니다. (대시보드의 "명단 관리"에서 추가/삭제할 때마다 호출)
function handleSaveRoster(body) {
  const roster = Array.isArray(body.roster) ? body.roster : [];
  const sheet = getRosterSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  if (roster.length) {
    const rows = roster.map(r => [
      String(r.grade || ""), String(r.cls || ""), Number(r.start) || 1, Number(r.end) || 1
    ]);
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
  return jsonResponse({ ok: true });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}