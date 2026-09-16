/* =========================================================
   [데이터 비트박스] 개념 탐구 공통 스크립트 (concept_common.js)
   - 퀴즈 타이머, 채점, 드래그 앤 드롭, 보고서 출력, 노트 저장
========================================================= */

// ✅ 진행 점 업데이트
function updateDots(stepIndex) {
    for (var i = 0; i < 10; i++) {
        var dot = document.getElementById('dot' + i);
        if (!dot) continue; 
        
        if (i < stepIndex) dot.className = 'prog-dot done';
        else if (i === stepIndex) dot.className = 'prog-dot cur';
        else dot.className = 'prog-dot';
    }
}

function setStatus(status) {
    document.body.className = ''; 
    if(status === 'help') document.body.classList.add('status-help');
    if(status === 'done') document.body.classList.add('status-done');
    try {
        if(status === 'normal') localStorage.removeItem('status_step' + (typeof THIS_STEP !== 'undefined' ? THIS_STEP : ''));
        else localStorage.setItem('status_step' + (typeof THIS_STEP !== 'undefined' ? THIS_STEP : ''), status);
    } catch(e) {}
}

// 🌟 [재수정] 제목(예: "✅ 제출 완료")에 이미 아이콘이 들어있는 경우가 많아서, 팝업 맨 위의
//    큰 아이콘과 제목 앞 아이콘이 위아래로 겹쳐 보이는 문제가 있었습니다.
//    그래서 맨 위 아이콘 자리는 아예 숨기고, 아이콘은 제목 텍스트 안에만 보이도록 통일했습니다.
//    (icon 인자는 더 이상 화면에 표시하는 데 쓰이지 않지만, 혹시 나중에 다시 필요할 경우를
//     대비해 매개변수 자체는 그대로 남겨둡니다.)
function showCustomAlert(title, message, icon) {
    const alertTitleEl = document.getElementById('alertTitle');
    const iconEl = document.getElementById('customAlertIcon')
        || (alertTitleEl && alertTitleEl.previousElementSibling)
        || document.querySelector('#customAlertModal .alert-box > div:first-child');
    if (iconEl) iconEl.style.display = 'none';
    if (alertTitleEl) alertTitleEl.innerText = title;
    document.getElementById('alertMessage').innerHTML = message;
    document.getElementById('customAlertModal').style.display = 'flex';
}
function closeCustomAlert() {
    document.getElementById('customAlertModal').style.display = 'none';
}

function revealInline(btn, text, color = 'var(--teal-main)') {
    const span = document.createElement('span');
    span.className = 'pop-anim revealed-text'; 
    span.style.color = color;
    span.style.fontWeight = '900';
    span.style.backgroundColor = 'white';
    span.style.padding = '4px 10px';
    span.style.borderRadius = '12px';
    span.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    span.innerText = text;
    btn.parentNode.replaceChild(span, btn);
}

function goToStep(currentId, nextId) {
    const currentStep = document.getElementById(currentId);
    const nextStep = document.getElementById(nextId);
    if (!currentStep || !nextStep) return;
    
    const isNext = typeof stepDotMap !== 'undefined' && stepDotMap[nextId] > stepDotMap[currentId];
    
    currentStep.style.opacity = '0';
    currentStep.style.transform = isNext ? 'translateX(-20px)' : 'translateX(20px)';
    
    setTimeout(() => {
        currentStep.style.display = 'none';
        nextStep.style.display = 'flex';
        if(nextId.includes('quiz')) nextStep.style.display = 'block'; 
        
        nextStep.style.opacity = '0';
        nextStep.style.transform = isNext ? 'translateX(20px)' : 'translateX(-20px)';
        
        void nextStep.offsetWidth; 
        
        setTimeout(() => {
            nextStep.style.opacity = '1';
            nextStep.style.transform = 'translateX(0)';
        }, 50);

        if(typeof stepDotMap !== 'undefined') updateDots(stepDotMap[nextId]);
    }, 400); 
}

// ✅ 퀴즈 시스템
let timerInterval;
let elapsedSeconds = 0;
let isQuizStarted = false;
let score = 0;
let correctAnswers = 0; 
const scored = new Set();

function markStepDone(finalScore) {
    // 🌟 [수정] 70점 미만이어도 채점 결과(현재 점수)를 그대로 저장/표시합니다.
    //    합격/불합격과 무관하게 "채점하기"를 누르면 항상 최신 점수로 반영됩니다.
    try {
        const done = JSON.parse(localStorage.getItem('completedSteps') || '[]');
        if (typeof THIS_STEP !== 'undefined' && !done.includes(THIS_STEP)) {
            done.push(THIS_STEP);
            localStorage.setItem('completedSteps', JSON.stringify(done));
        }
        localStorage.setItem('score_step' + THIS_STEP, finalScore);
        localStorage.setItem('score_step' + THIS_STEP + '_date', new Date().toLocaleDateString('ko-KR'));
    } catch(e) { console.warn('저장 실패:', e); }
}

function startQuizTimer() {
    isQuizStarted = true;
    
    // 🌟 [수정] 퀴즈 시작 시 복원되어 있던 기존 정답과 점수 모두 날리기 (새 출발)
    score = 0;
    correctAnswers = 0;
    scored.clear();
    elapsedSeconds = 0;
    if (typeof THIS_STEP !== 'undefined') localStorage.removeItem('quiz_state_step' + THIS_STEP);

    const btn = document.getElementById('startQuizBtn');
    if(btn) btn.style.display = 'none';
    document.getElementById('submitQuizBtnWrap').style.display = 'block';
    document.getElementById('wordBank').style.opacity = '1';
    document.getElementById('wordBank').style.pointerEvents = 'auto';
    document.getElementById('quizForm').classList.add('quiz-active');
    
    // 빈칸 초기화
    document.querySelectorAll('.blank').forEach(el => {
        el.value = ''; // 텍스트 지우기
        el.classList.remove('correct'); // 파란색 정답 테두리 지우기
        el.disabled = false; // 다시 입력 가능하도록 활성화
    });

    timerInterval = setInterval(() => {
        elapsedSeconds++;
        const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const s = String(elapsedSeconds % 60).padStart(2, '0');
        document.getElementById('quizTimer').innerText = `⏱️ ${m}:${s}`;
    }, 1000);
}

function resetQuiz() {
    clearInterval(timerInterval);
    elapsedSeconds = 0;
    document.getElementById('quizTimer').innerText = '⏱️ 00:00';
    isQuizStarted = false;
    score = 0;
    correctAnswers = 0;
    scored.clear();
    document.querySelectorAll('.blank').forEach(el => {
        el.value = '';
        el.classList.remove('correct');
        el.disabled = true;
    });
    const btn = document.getElementById('startQuizBtn');
    if(btn) btn.style.display = 'inline-block';
    document.getElementById('submitQuizBtnWrap').style.display = 'none';
    document.getElementById('wordBank').style.opacity = '0.4';
    document.getElementById('wordBank').style.pointerEvents = 'none';
    document.getElementById('quizForm').classList.remove('quiz-active');
    
    if (typeof THIS_STEP !== 'undefined') localStorage.removeItem('quiz_state_step' + THIS_STEP);
}

function saveQuizState() {
    if (typeof THIS_STEP === 'undefined') return;
    const blanks = document.querySelectorAll('.blank');
    const state = Array.from(blanks).map(el => el.value);
    localStorage.setItem('quiz_state_step' + THIS_STEP, JSON.stringify(state));
}

function check(el) {
    if (!isQuizStarted) return;
    const val = el.value.trim();
    const answer = el.getAttribute('data-answer');
    const answerAlt = el.getAttribute('data-answer-alt');

    // 🌟 data-swap="true": 짝 단위 채점 — 같은 문항의 스왑 칸이 모두 채워지고
    //    그 조합이 정답 집합과 정확히 일치할 때만(순서 무관) 두 칸을 동시에 정답 처리.
    //    예: "0과 1" ✓, "1과 0" ✓ / "0과 0", "1과 1", 한 칸만 입력 ✗
    if (el.getAttribute('data-swap') === 'true') {
        const box = el.closest('.quiz-box');
        if (!box) return;
        const group = Array.from(box.querySelectorAll('input[data-swap="true"]'));
        const values = group.map(p => p.value.trim());
        if (values.some(v => v === '')) return; // 아직 짝이 완성되지 않음
        const answers = group.map(p => p.getAttribute('data-answer'));
        const isPairCorrect =
            values.slice().sort().join('\u0000') === answers.slice().sort().join('\u0000');
        if (isPairCorrect) {
            group.forEach(p => {
                if (!scored.has(p)) {
                    p.classList.add('correct');
                    p.disabled = true;
                    scored.add(p);
                    score += parseInt(p.getAttribute('data-score') || '10');
                    correctAnswers++;
                }
            });
        }
        return;
    }

    const isCorrect = val === answer || (answerAlt && val === answerAlt);
    if (isCorrect && !scored.has(el)) {
        el.classList.add('correct');
        el.disabled = true;
        scored.add(el);
        score += parseInt(el.getAttribute('data-score') || '10');
        correctAnswers++;
    }
    // 실시간 자동 저장 로직 삭제됨 (이제 채점 버튼을 누를 때만 저장)
}

function submitQuiz() {
    if(!isQuizStarted) return;
    clearInterval(timerInterval); 
    
    // 🌟 [수정] 채점하기 버튼을 눌렀을 때만 퀴즈 상태를 1회 저장!
    saveQuizState();
    
    showSuccess();
}

function allowDrop(ev) { if(isQuizStarted) ev.preventDefault(); }
function drag(ev) { if(isQuizStarted) ev.dataTransfer.setData("text", ev.target.innerText); }
function drop(ev) {
    if(!isQuizStarted) return;
    ev.preventDefault();
    ev.target.value = ev.dataTransfer.getData("text");
    check(ev.target);
}

// ✅ 모달 팝업
function openTipPopup() {
    const content = document.getElementById('modalContent');
    content.className = 'modal-content';
    content.innerHTML = `
        <h3 style="color:var(--teal-main);">💡 미션 가이드</h3>
        <p style="line-height:1.8; text-align:left; padding:0 20px; font-size:1.05rem; word-break:keep-all;">
            - <b>[▶️ 퀴즈 시작]</b> 버튼을 누르면 타이머가 켜지고 입력이 가능해집니다.<br>
            - 보기 단어를 마우스로 <b>끌어서</b> 빈칸에 넣거나 <b>직접 입력</b>해 보세요.<br>
            - 모든 문제를 푼 뒤 화면 하단의 <b>[✏️ 채점하기]</b> 버튼을 누르면 점수와 시간이 나옵니다.
        </p>
        <button onclick="closeModal()" style="width:100%; padding:14px; background:var(--teal-main); color:white; border:none; border-radius:12px; font-weight:700; font-size:1.1rem; cursor:pointer; margin-top:10px;">확인</button>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function showSuccess() {
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    const finalScore = score; 
    markStepDone(finalScore);
    
    const content = document.getElementById('modalContent');
    content.className = 'modal-content';
    
    let titleText = typeof STEP_TITLE !== 'undefined' ? STEP_TITLE.replace(/^[0-9]+\.\s*/, '') : '탐구';

    content.innerHTML = `
        <div style="font-size:3rem; margin-bottom:15px;">🕵️‍♂️✨</div>
        <h2 style="color:var(--teal-main); margin-bottom:15px;">${titleText} 완료!</h2>
        <div style="background:#f0fdfa; border: 1px solid rgba(20, 184, 166, 0.2); padding:15px; border-radius:12px; margin-bottom:20px;">
            <p style="margin:5px 0; font-size:1.1rem; font-weight:800;">최종 점수: <span style="color:var(--apple-red); font-size:1.3rem;">${finalScore}점</span></p>
            <p style="margin:5px 0; font-size:1.1rem; font-weight:800;">풀이 시간: <span style="color:var(--teal-main); font-size:1.3rem;">${m}분 ${s}초</span></p>
        </div>
        <p style="font-size:0.95rem; color:#555; margin-bottom:20px;">${titleText}을(를) 마스터했습니다!!<br>창을 닫고 우측 하단의 버튼을 눌러 보고서를 저장하세요.</p>
        <button onclick="closeModal()" style="width:100%; padding:14px; background:var(--teal-main); color:white; border:none; border-radius:12px; font-weight:700; font-size:1.1rem; cursor:pointer;">확인 및 닫기</button>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
    
   const pass = typeof PASS_SCORE !== 'undefined' ? PASS_SCORE : 70;
    if(finalScore >= pass) {
        let maxIndex = 2; 
        if (typeof stepDotMap !== 'undefined') {
            maxIndex = Math.max(...Object.values(stepDotMap));
        }
        let lastDot = document.getElementById('dot' + maxIndex);
        if(lastDot) lastDot.className = 'prog-dot done';
        
        setStatus('done'); 
    }
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }

// ✅ 보고서 다운로드 (TXT / PNG)
function downloadReportTXT() {
    const finalScore = score;
    const memo = document.getElementById('memoInput') ? document.getElementById('memoInput').value : '';
    const reflection = document.getElementById('reflectionInput') ? document.getElementById('reflectionInput').value : '';
    const dateStr = new Date().toLocaleString('ko-KR');
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    const timeStr = isQuizStarted ? `${m}분 ${s}초` : "측정 불가";
    
    let reportTitle = typeof STEP_TITLE !== 'undefined' ? STEP_TITLE : "학습 결과";
    let fileName = typeof FILE_NAME_PREFIX !== 'undefined' ? FILE_NAME_PREFIX : "학습결과";

    const txtContent = 
`==================================================
        [데이터 비트박스] 학습 결과 보고서
==================================================

▶ 단원명 : ${reportTitle}
▶ 일  시 : ${dateStr}
▶ 점  수 : ${finalScore} 점
▶ 시  간 : ${timeStr}

--------------------------------------------------
[📌 배움 노트]
${memo || "작성된 내용이 없습니다."}

--------------------------------------------------
[🌿 배움 활동 소감]
${reflection || "작성된 내용이 없습니다."}

==================================================
* 본 보고서는 '데이터 비트박스' 시스템에서 자동 생성되었습니다.
==================================================`;

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}_학습결과.txt`;
    link.click();
}

function downloadReportImageOffline() {
    const finalScore = score;
    const memo = document.getElementById('memoInput') ? document.getElementById('memoInput').value : '';
    const reflection = document.getElementById('reflectionInput') ? document.getElementById('reflectionInput').value : '';
    const dateStr = new Date().toLocaleString('ko-KR');
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    const timeStr = isQuizStarted ? `${m}분 ${s}초` : "측정 불가";
    
    let reportTitle = typeof STEP_TITLE !== 'undefined' ? STEP_TITLE : "학습 결과";
    let fileName = typeof FILE_NAME_PREFIX !== 'undefined' ? FILE_NAME_PREFIX : "학습결과";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    function getLines(text, maxWidth) {
        ctx.font = "18px sans-serif";
        const lines = [];
        const paragraphs = text.split('\n');
        paragraphs.forEach(p => {
            let currentLine = '';
            for(let i=0; i<p.length; i++) {
                const char = p[i];
                const testLine = currentLine + char;
                if(ctx.measureText(testLine).width > maxWidth && i > 0) { lines.push(currentLine); currentLine = char; }
                else currentLine = testLine;
            }
            lines.push(currentLine);
        });
        return lines;
    }
    const memoLines = getLines(memo || "작성된 내용이 없습니다.", 620);
    const reflectionLines = getLines(reflection || "작성된 내용이 없습니다.", 620);
    const totalHeight = 500 + (memoLines.length * 28) + (reflectionLines.length * 28) + 100;
    
    canvas.height = totalHeight;
    ctx.fillStyle = '#f0fdfa'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#14b8a6'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(40, 40, 720, totalHeight - 80, 24); ctx.fill(); ctx.stroke();
    
    ctx.fillStyle = '#0f766e'; ctx.font = "bold 32px sans-serif"; ctx.textAlign = 'center';
    ctx.fillText("[데이터 비트박스] 학습 결과 보고서", 400, 100);
    ctx.strokeStyle = '#14b8a6'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(230, 120); ctx.lineTo(570, 120); ctx.stroke();
    
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(70, 150, 660, 150, 16); ctx.fill();
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = 'left'; ctx.font = "bold 20px sans-serif"; ctx.fillStyle = '#1d1d1f';
    ctx.fillText("▶ 단원명: " + reportTitle, 100, 195);
    ctx.fillText("▶ 일시: " + dateStr, 100, 235);
    ctx.fillStyle = '#ef4444'; ctx.fillText("▶ 퀴즈 점수: " + finalScore + " 점", 100, 275);
    ctx.fillStyle = '#0f766e'; ctx.fillText("▶ 풀이 시간: " + timeStr, 400, 275);
    
    let currentY = 350;
    ctx.fillStyle = '#047857'; ctx.font = "bold 24px sans-serif"; ctx.fillText("📌 배움 노트", 70, currentY); currentY += 25;
    ctx.fillStyle = '#f0fdfa'; const memoBoxHeight = (memoLines.length * 28) + 40;
    ctx.beginPath(); ctx.roundRect(70, currentY, 660, memoBoxHeight, 12); ctx.fill();
    ctx.strokeStyle = '#ccfbf1'; ctx.stroke();
    ctx.fillStyle = '#334155'; ctx.font = "18px sans-serif"; currentY += 35;
    memoLines.forEach(line => { ctx.fillText(line, 90, currentY); currentY += 28; });
    currentY += 40;
    
    ctx.fillStyle = '#047857'; ctx.font = "bold 24px sans-serif"; ctx.fillText("🌿 배움 활동 소감", 70, currentY); currentY += 25;
    ctx.fillStyle = '#f0fdfa'; const refBoxHeight = (reflectionLines.length * 28) + 40;
    ctx.beginPath(); ctx.roundRect(70, currentY, 660, refBoxHeight, 12); ctx.fill();
    ctx.strokeStyle = '#ccfbf1'; ctx.stroke();
    ctx.fillStyle = '#334155'; ctx.font = "18px sans-serif"; currentY += 35;
    reflectionLines.forEach(line => { ctx.fillText(line, 90, currentY); currentY += 28; });
    currentY += 70;
    
    ctx.fillStyle = '#94a3b8'; ctx.font = "bold 16px sans-serif"; ctx.textAlign = 'center';
    ctx.fillText("본 보고서는 '데이터 비트박스' 시스템에서 자동 생성되었습니다.", 400, currentY);
    
    const link = document.createElement('a');
    link.download = `${fileName}_보고서.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ── 학번 확인 & 선생님 제출 ──────────────────────────────────
const STUDENT_ID_KEY = 'dbb_student_id';
let _studentIdCallback = null;

function getSavedStudentId() {
    return localStorage.getItem(STUDENT_ID_KEY);
}

// 저장된 학번이 있으면 바로 callback 실행, 없으면 입력창(모달)을 띄운 뒤 실행
// (현재는 "제출"/"피드백 확인" 모두 매번 재확인하는 ensureStudentIdFresh를 쓰기 때문에
//  이 함수는 실제로는 호출되지 않지만, 혹시 필요할 경우를 위해 남겨둡니다.)
function ensureStudentId(callback) {
    const saved = getSavedStudentId();
    if (saved) { callback(saved); return; }
    _studentIdCallback = callback;
    openStudentIdModal();
}

// 저장된 학번이 있어도 항상 다시 확인시키고 싶을 때 사용 (피드백 확인처럼
// 다른 사람의 정보가 노출될 수 있는, 같은 PC를 여럿이 쓰는 상황에 민감한 동작용)
// ⚠️ 입력창을 절대 미리 채우지 않습니다. 이전 값이 채워져 있으면 학생이
// 그냥 확인/엔터만 눌러버려서 "본인 확인"이라는 목적 자체가 무력화되기 때문에,
// 매번 5자리를 직접 입력해야만 다음 단계로 진행되도록 빈 칸으로 띄웁니다.
// 🌟 [추가] errorMsg/prefillId: 서버에서 PIN이 틀렸다는 응답을 받았을 때, 같은 학번은
// 채워둔 채로 안내 문구와 함께 다시 입력창을 띄우기 위한 용도입니다(정상 흐름에서는 안 씀).
function ensureStudentIdFresh(callback, errorMsg, prefillId) {
    _studentIdCallback = callback;
    openStudentIdModal(errorMsg || null, prefillId || null);
}

// 🌟 [추가] callback(studentId, pin) — 학번과 함께 개인 PIN(4자리)도 같이 확인합니다.
// PIN은 학생이 "처음 제출/확인할 때 스스로 정하는 번호"이고, 그 뒤로는 계속 같은 PIN을
// 입력해야만 통과됩니다(서버 쪽 검증은 Code.gs에서 처리). 학번만 알아도 남의 이름으로
// 제출/피드백 열람이 안 되도록 막아주는 두 번째 잠금장치입니다.
// 🌟 [수정] PIN 칸을 type="password"로 만들었더니, 브라우저가 그걸 "로그인 폼(아이디+비밀번호)"으로
// 착각해서 학번 칸에 저장된 다른 값(예: 주소창 자동완성 기록의 "https...")을 멋대로 채워 넣는
// 문제가 있었습니다. 그래서 두 칸 모두 자동완성/자동수정을 전부 꺼서 브라우저가 손대지 못하게
// 했고, PIN 칸은 type="text"로 바꾸되 화면에는 여전히 ●●●●처럼 가려져 보이도록
// (-webkit-text-security) 스타일만 적용했습니다.
function openStudentIdModal(errorMsg, prefillId) {
    const content = document.getElementById('modalContent');
    content.className = 'modal-content-small';
    content.innerHTML = `
        <div style="font-size:2.2rem; margin-bottom:10px;">🙋</div>
        <h3 style="margin-bottom:10px; font-size:1.2rem; font-weight:900;">학번과 PIN을 입력해주세요</h3>
        <p style="font-size:0.92rem; color:#555; line-height:1.6; margin-bottom:6px; word-break:keep-all;">
            학번 5자리(예: <b>10101</b>)와 나만의 PIN 4자리를 입력하세요
        </p>
        <p style="font-size:0.78rem; color:#0f766e; font-weight:700; margin-bottom:4px; word-break:keep-all;">
            PIN은 처음 입력한 값이 계속 사용돼요
        </p>
        <p style="font-size:0.78rem; color:#dc2626; font-weight:700; margin-bottom:14px; word-break:keep-all;">
            ⚠️ 다른 친구 PC라면 학번·PIN을 꼭 확인하세요
        </p>
        <input id="studentIdInput" type="text" inputmode="numeric" maxlength="5" placeholder="학번 (예: 10101)"
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            data-lpignore="true" data-1p-ignore="true"
            value="${prefillId ? String(prefillId).replace(/[^0-9]/g, '') : ''}"
            style="width:100%; padding:12px; font-size:1.15rem; text-align:center; letter-spacing:3px;
                   border:2px solid #cbd5e1; border-radius:10px; margin-bottom:8px; box-sizing:border-box;">
        <input id="studentPinInput" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="PIN 4자리"
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            data-lpignore="true" data-1p-ignore="true"
            style="width:100%; padding:12px; font-size:1.15rem; text-align:center; letter-spacing:6px;
                   -webkit-text-security: disc; text-security: disc;
                   border:2px solid #cbd5e1; border-radius:10px; margin-bottom:8px; box-sizing:border-box;">
        ${errorMsg ? `<p style="color:#ef4444; font-size:0.85rem; margin-bottom:10px;">${errorMsg}</p>` : ''}
        <div style="display:flex; gap:8px;">
            <button onclick="cancelStudentIdModal()" style="flex:1; padding:12px; background:#f1f5f9;
                color:#64748b; border:none; border-radius:12px; font-weight:700; font-size:1rem; cursor:pointer;">취소</button>
            <button onclick="confirmStudentId()" style="flex:2; padding:12px; background:var(--teal-main, #0f766e);
                color:white; border:none; border-radius:12px; font-weight:700; font-size:1rem; cursor:pointer;">확인</button>
        </div>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';

    const idInput = document.getElementById('studentIdInput');
    const pinInput = document.getElementById('studentPinInput');
    const enterHandler = function(e) {
        if (e.key === 'Enter') { e.preventDefault(); confirmStudentId(); }
    };
    if (idInput) {
        if (prefillId) { pinInput && pinInput.focus(); } else { idInput.focus(); }
        idInput.addEventListener('keydown', enterHandler);
    }
    if (pinInput) pinInput.addEventListener('keydown', enterHandler);
}

// 🌟 [추가] "제출"/"피드백 확인" 버튼을 눌렀다가 마음이 바뀌었을 때 학번·PIN 입력창을 취소합니다.
// 입력값은 저장하지 않고, 원래 하려던 동작(제출/피드백 확인)도 실행되지 않습니다.
function cancelStudentIdModal() {
    _studentIdCallback = null;
    closeModal();
}

function confirmStudentId() {
    const idInput = document.getElementById('studentIdInput');
    const pinInput = document.getElementById('studentPinInput');
    const val = idInput ? idInput.value.trim() : '';
    const pin = pinInput ? pinInput.value.trim() : '';

    // 학번 형식 검사: 1~3(학년) + 4자리 = 총 5자리 숫자
    if (!/^[1-3][0-9]{4}$/.test(val)) {
        openStudentIdModal('5자리 학번 형식이 올바르지 않습니다. (예: 10101)', val);
        return;
    }
    // PIN 형식 검사: 숫자 4자리
    if (!/^[0-9]{4}$/.test(pin)) {
        openStudentIdModal('PIN은 숫자 4자리로 입력해주세요.', val);
        return;
    }

    localStorage.setItem(STUDENT_ID_KEY, val);
    closeModal();
    if (_studentIdCallback) {
        const cb = _studentIdCallback;
        _studentIdCallback = null;
        cb(val, pin);
    }
}

// "📤 선생님께 제출" 버튼에서 호출
// ⚠️ ensureStudentId가 아니라 ensureStudentIdFresh를 사용합니다.
// 제출할 때마다 학번을 다시 확인해야, 옆 친구가 무심코 남의 이름으로
// 제출해버리는 실수를 막을 수 있기 때문입니다.
// 🌟 [추가] 학번뿐 아니라 PIN(4자리)도 서버(Code.gs)에서 함께 검증합니다.
// PIN이 기존에 등록된 값과 다르면(PIN_MISMATCH), 입력창을 다시 띄워 재입력을 받습니다
// (attempt 함수로 재귀적으로 재시도).
function submitToTeacher() {
    if (typeof SUBMIT_ENDPOINT === 'undefined' || !SUBMIT_ENDPOINT || SUBMIT_ENDPOINT.indexOf('http') !== 0) {
        showCustomAlert('ℹ️ 안내', '아직 제출 기능이 설정되지 않았습니다.<br>선생님께 문의해주세요.', 'ℹ️');
        return;
    }

    function attempt(errorMsg, prefillId) {
        ensureStudentIdFresh(function (studentId, pin) {
            const memo = document.getElementById('memoInput') ? document.getElementById('memoInput').value : '';
            const reflection = document.getElementById('reflectionInput') ? document.getElementById('reflectionInput').value : '';
            const unitId = typeof THIS_STEP !== 'undefined' ? THIS_STEP : '';
            const unitTitle = typeof STEP_TITLE !== 'undefined' ? STEP_TITLE : '';

            const payload = {
                action: 'submit',
                secret: (typeof SUBMIT_SECRET !== 'undefined') ? SUBMIT_SECRET : '',
                studentId: studentId,
                pin: pin,
                unitId: unitId,
                unitTitle: unitTitle,
                score: score,                    // concept_common.js 상단에 이미 선언된 전역 변수
                elapsedSeconds: elapsedSeconds,   // 〃
                memo: memo,
                reflection: reflection
            };

            const btn = document.getElementById('submitTeacherBtn');
            const btnLabel = btn ? btn.querySelector('div') : null;
            if (btn) btn.style.pointerEvents = 'none';
            if (btnLabel) btnLabel.innerText = '제출 중...';

            fetch(SUBMIT_ENDPOINT, {
                method: 'POST',
                // text/plain 으로 보내야 브라우저가 사전 확인 요청(preflight)을 보내지 않아
                // Google Apps Script와 CORS 문제 없이 통신됩니다.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    if (data && data.ok) {
                        showCustomAlert('✅ 제출 완료', '선생님께 성공적으로 제출되었습니다.', '✅');
                    } else if (data && data.error === 'PIN_MISMATCH') {
                        attempt('PIN이 이전에 등록한 값과 다릅니다.<br>본인의 PIN 4자리를 다시 확인해주세요.', studentId);
                    } else if (data && data.error === 'INVALID_PIN') {
                        attempt('PIN은 숫자 4자리로 입력해주세요.', studentId);
                    } else {
                        showCustomAlert('⚠️ 제출 실패', (data && data.error) ? data.error : '알 수 없는 오류가 발생했습니다.', '⚠️');
                    }
                })
                .catch(() => {
                    showCustomAlert('⚠️ 제출 실패', '인터넷 연결을 확인한 뒤 다시 시도해주세요.', '⚠️');
                })
                .finally(() => {
                    if (btn) btn.style.pointerEvents = 'auto';
                    if (btnLabel) btnLabel.innerText = '📤 선생님께 제출';
                });
        }, errorMsg, prefillId);
    }

    attempt(null, null);
}

// "💬 선생님 피드백 확인" 버튼에서 호출 — 현재 단원에 대해 선생님이 남긴 피드백을 조회
function checkTeacherFeedback() {
    if (typeof SUBMIT_ENDPOINT === 'undefined' || !SUBMIT_ENDPOINT || SUBMIT_ENDPOINT.indexOf('http') !== 0) {
        showCustomAlert('ℹ️ 안내', '아직 제출 기능이 설정되지 않았습니다.<br>선생님께 문의해주세요.', 'ℹ️');
        return;
    }

    // ⚠️ ensureStudentId가 아니라 ensureStudentIdFresh를 사용합니다.
    // 같은 PC를 여러 학생이 함께 쓰는 경우(컴퓨터실 등), 저장된 학번을 확인 없이
    // 재사용하면 이전 학생의 피드백이 그대로 노출될 수 있기 때문에,
    // 피드백 확인은 매번 학번을 다시 확인시킵니다.
    // 🌟 [추가] PIN도 함께 확인해서, 학번만 알아도 남의 피드백을 열어볼 수 없게 막습니다.
    function attempt(errorMsg, prefillId) {
        ensureStudentIdFresh(function (studentId, pin) {
            const unitId = typeof THIS_STEP !== 'undefined' ? THIS_STEP : '';

            const btn = document.getElementById('checkFeedbackBtn');
            const btnLabel = btn ? btn.querySelector('div') : null;
            if (btn) btn.style.pointerEvents = 'none';
            if (btnLabel) btnLabel.innerText = '확인 중...';

            const url = SUBMIT_ENDPOINT
                + '?action=feedback'
                + '&secret=' + encodeURIComponent((typeof SUBMIT_SECRET !== 'undefined') ? SUBMIT_SECRET : '')
                + '&studentId=' + encodeURIComponent(studentId)
                + '&pin=' + encodeURIComponent(pin)
                + '&unitId=' + encodeURIComponent(unitId);

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (!data || !data.ok) {
                        if (data && data.error === 'PIN_MISMATCH') {
                            attempt('PIN이 이전에 등록한 값과 다릅니다.<br>본인의 PIN 4자리를 다시 확인해주세요.', studentId);
                            return;
                        }
                        if (data && data.error === 'INVALID_PIN') {
                            attempt('PIN은 숫자 4자리로 입력해주세요.', studentId);
                            return;
                        }
                        showCustomAlert('⚠️ 확인 실패', (data && data.error) ? data.error : '알 수 없는 오류가 발생했습니다.', '⚠️');
                        return;
                    }
                    // 🌟 [추가] 선생님이 이 단원에 "재제출"을 요청했다면, 피드백 확인 시 함께 안내합니다.
                    const resubmitNote = data.resubmitRequested
                        ? '<div style="background:#fff7ed; border:1px solid rgba(217,119,6,0.35); border-radius:12px; padding:10px 14px; margin-bottom:12px; color:#92400e; font-weight:800; font-size:0.88rem; text-align:left;">🔄내용을 보완해서 다시 제출해주세요!</div>'
                        : '';

                    if (data.feedback) {
                        const dateLine = data.feedbackDate
                            ? `<br><br><span style="font-size:0.78rem; color:#999;">(${data.feedbackDate} 작성)</span>`
                            : '';
                        showCustomAlert('💬 선생님 피드백', resubmitNote + String(data.feedback).replace(/\n/g, '<br>') + dateLine, '💬');
                        // 🌟 [추가] 피드백을 실제로 보여준 시점에 "열람"으로 기록 (실패해도 학생 경험엔 영향 없도록 조용히 무시)
                        markFeedbackReadSilently(studentId, pin, unitId);
                    } else if (data.resubmitRequested) {
                        showCustomAlert('🔄 재제출 요청', resubmitNote, '🔄');
                    } else {
                        showCustomAlert('ℹ️ 안내', '아직 선생님이 남긴 피드백이 없습니다.<br>제출 후 시간이 지나면 다시 확인해보세요.', 'ℹ️');
                    }
                })
                .catch(() => {
                    showCustomAlert('⚠️ 확인 실패', '인터넷 연결을 확인한 뒤 다시 시도해주세요.', '⚠️');
                })
                .finally(() => {
                    if (btn) btn.style.pointerEvents = 'auto';
                    if (btnLabel) btnLabel.innerText = '💬 선생님 피드백 확인';
                });
        }, errorMsg, prefillId);
    }

    attempt(null, null);
}

// 🌟 [추가] 학생이 피드백을 실제로 확인한 시점을 서버에 기록 (선생님 대시보드의 "읽음" 표시용).
// 실패하더라도 학생에게는 아무 영향이 없어야 하므로 오류를 조용히 무시합니다.
function markFeedbackReadSilently(studentId, pin, unitId) {
    if (typeof SUBMIT_ENDPOINT === 'undefined' || !SUBMIT_ENDPOINT || SUBMIT_ENDPOINT.indexOf('http') !== 0) return;
    fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: 'markFeedbackRead',
            secret: (typeof SUBMIT_SECRET !== 'undefined') ? SUBMIT_SECRET : '',
            studentId: studentId,
            pin: pin,
            unitId: unitId
        })
    }).catch(() => { /* 읽음 표시 실패는 조용히 무시 */ });
}

// ✅ 페이지 로드 시 저장된 데이터 복원
window.onload = function() {
    try {
        const savedStatus = localStorage.getItem('status_step' + (typeof THIS_STEP !== 'undefined' ? THIS_STEP : ''));
        if(savedStatus) document.body.classList.add('status-' + savedStatus);
        const done = JSON.parse(localStorage.getItem('completedSteps') || '[]');
        if(typeof THIS_STEP !== 'undefined' && done.includes(THIS_STEP)) {
            const activeMenu = document.querySelector('.menu-link.active');
            if(activeMenu && !activeMenu.textContent.includes('✓')) activeMenu.textContent += ' ✓';
        }
    } catch(e) {}

    const wordBank = document.querySelector('.word-bank');
    if(wordBank) {
        for (let i = wordBank.children.length; i >= 0; i--) {
            wordBank.appendChild(wordBank.children[Math.random() * i | 0]);
        }
    }

    const memoInput = document.getElementById('memoInput');
    const reflectionInput = document.getElementById('reflectionInput');
    if(memoInput && reflectionInput) {
        let mKey = typeof MEMO_KEY !== 'undefined' ? MEMO_KEY : 'memo';
        let rKey = typeof REF_KEY !== 'undefined' ? REF_KEY : 'ref';
        
        if(localStorage.getItem(mKey)) memoInput.value = localStorage.getItem(mKey);
        if(localStorage.getItem(rKey)) reflectionInput.value = localStorage.getItem(rKey);
        
        memoInput.addEventListener('input', function() { localStorage.setItem(mKey, this.value); });
        reflectionInput.addEventListener('input', function() { localStorage.setItem(rKey, this.value); });
    }

    // 🌟 페이지 진입 시 [채점 완료된] 저장된 퀴즈 상태 복원
    try {
        if (typeof THIS_STEP !== 'undefined') {
            const savedQuiz = localStorage.getItem('quiz_state_step' + THIS_STEP);
            if (savedQuiz) {
                const state = JSON.parse(savedQuiz);
                const blanks = document.querySelectorAll('.blank');
                
                const tempStarted = isQuizStarted; 
                isQuizStarted = true; 
                
                blanks.forEach((el, idx) => {
                    if (state[idx]) {
                        el.value = state[idx];
                        check(el); 
                    }
                });
                
                isQuizStarted = tempStarted; 
            }
        }
    } catch(e) {}
};

// ✅ 단원 기록 지우기
function eraseStepContent() {
    const content = document.getElementById('modalContent');
    content.className = 'modal-content-small';
    content.innerHTML = `
        <div style="font-size:2.2rem; margin-bottom:10px;">🗑️</div>
        <h3 style="color:#ef4444; margin-bottom:10px; font-size:1.2rem; font-weight:900;">현재 단원 학습 내용 지우기</h3>
        <p style="font-size:0.9rem; color:#555; line-height:1.9; margin-bottom:22px; text-align:left; padding:0 4px; word-break:keep-all;">
            아래 내용이 모두 삭제됩니다.<br>
            <span style="color:#ef4444;">• 퀴즈 점수 및 완료 기록<br>• 배움 노트 내용<br>• 배움 활동 소감 내용<br>• SOS·미션 완료 테두리 상태</span>
        </p>
        <div style="display:flex; gap:10px;">
            <button onclick="closeModal()" style="flex:1; padding:11px; background:#f1f5f9; color:#64748b; border:none; border-radius:12px; font-weight:700; font-size:0.95rem; cursor:pointer;">취소</button>
            <button onclick="doEraseContent()" style="flex:1; padding:11px; background:#ef4444; color:white; border:none; border-radius:12px; font-weight:700; font-size:0.95rem; cursor:pointer;">지우기</button>
        </div>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function doEraseContent() {
    try {
        if (typeof THIS_STEP !== 'undefined') {
            localStorage.removeItem('score_step' + THIS_STEP);
            localStorage.removeItem('score_step' + THIS_STEP + '_date');
            localStorage.removeItem('quiz_state_step' + THIS_STEP);
            
            const done = JSON.parse(localStorage.getItem('completedSteps') || '[]');
            localStorage.setItem('completedSteps', JSON.stringify(done.filter(s => s !== THIS_STEP)));
            localStorage.removeItem('status_step' + THIS_STEP);
        }
        
        let mKey = typeof MEMO_KEY !== 'undefined' ? MEMO_KEY : 'memo';
        let rKey = typeof REF_KEY !== 'undefined' ? REF_KEY : 'ref';
        localStorage.removeItem(mKey);
        localStorage.removeItem(rKey);
        
        if(document.getElementById('memoInput')) document.getElementById('memoInput').value = '';
        if(document.getElementById('reflectionInput')) document.getElementById('reflectionInput').value = '';
        
        resetQuiz();
        setStatus('normal');
        updateDots(0);
        
        const activeMenu = document.querySelector('.menu-link.active');
        if (activeMenu && activeMenu.textContent.endsWith(' ✓')) {
            activeMenu.textContent = activeMenu.textContent.replace(' ✓', '');
        }
    } catch(e) {}
    
    document.getElementById('modalContent').className = 'modal-content-small';
    document.getElementById('modalContent').innerHTML = `
        <div style="font-size:2.2rem; margin-bottom:10px;">✅</div>
        <h3 style="margin-bottom:10px; font-size:1.2rem; font-weight:900;">삭제 완료!</h3>
        <p style="font-size:0.9rem; color:#555; margin-bottom:18px;">현재 단원 학습 내용이 모두 삭제되었습니다.</p>
        <button onclick="closeModal()" style="width:100%; padding:11px; color:white; border:none; border-radius:12px; font-weight:700; font-size:0.95rem; cursor:pointer; background:#10b981;">확인</button>
    `;
}

window.addEventListener('keydown', function(e) {
    const alertOverlay = document.getElementById('customAlertModal') || document.getElementById('customAlertOverlay');
    if (alertOverlay && alertOverlay.style.display === 'flex') {
        if (e.key === 'Enter') { e.preventDefault(); closeCustomAlert(); }
    }
});

// =========================================================
// 🌟 [추가 엔진] 챕터 상단(Header) 0과 1 우주 배경 및 동적 테마 애니메이션 🌟
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (!header) return;

    let theme = 'mint'; 
    const activeMenu = document.querySelector('.menu-link.active');
    if (activeMenu) {
        const text = activeMenu.textContent;
        if (text.includes('숫자') || text.includes('문자')) {
            theme = 'blue';
        }
        else if (text.includes('이미지') || text.includes('소리')) {
            theme = 'violet';
        }
        else if (text.includes('동영상')) {
            theme = 'navy';
        }
    }

    const palette = {
        mint: {
            main: '#00f5c4',
            bg: 'rgba(0, 245, 196, 0.12)',
            border: 'rgba(0, 245, 196, 0.2)',
            badgeBg: 'rgba(0, 245, 196, 0.15)',
            shadow: 'rgba(0, 245, 196, 0.2)',
            particle1: '0, 245, 196',
            particle2: '10, 132, 255'
        },
        blue: {
            main: '#5ac8fa',
            bg: 'rgba(10, 132, 255, 0.12)',
            border: 'rgba(10, 132, 255, 0.2)',
            badgeBg: 'rgba(10, 132, 255, 0.15)',
            shadow: 'rgba(10, 132, 255, 0.2)',
            particle1: '10, 132, 255',
            particle2: '90, 200, 250'
        },
        violet: {
            main: '#d08ef7',
            bg: 'rgba(191, 90, 242, 0.12)',
            border: 'rgba(191, 90, 242, 0.2)',
            badgeBg: 'rgba(191, 90, 242, 0.15)',
            shadow: 'rgba(191, 90, 242, 0.2)',
            particle1: '191, 90, 242',
            particle2: '208, 142, 247'
        },
        navy: {
            main: '#748fd8',
            bg: 'rgba(116, 143, 216, 0.12)',
            border: 'rgba(116, 143, 216, 0.2)',
            badgeBg: 'rgba(116, 143, 216, 0.15)',
            shadow: 'rgba(116, 143, 216, 0.2)',
            particle1: '116, 143, 216',
            particle2: '130, 155, 225'
        }
    };

    const colors = palette[theme];

    header.style.position = 'relative';
    header.style.background = '#03050d'; 
    header.style.borderBottom = `1px solid ${colors.border}`;

    Array.from(header.children).forEach(child => {
        child.style.position = 'relative';
        child.style.zIndex = '10';
    });

    const style = document.createElement('style');
    style.innerHTML = `
        html body header .main-title { color: #ffffff !important; text-shadow: 0 0 12px ${colors.shadow} !important; }
        
        html body header .target-badge { background: ${colors.badgeBg} !important; color: ${colors.main} !important; border: 1px solid ${colors.border} !important; }
        
        html body .progress .prog-dot.cur { 
            background: ${colors.main} !important; 
            box-shadow: 0 0 12px ${colors.shadow}, 0 0 20px ${colors.shadow} !important; 
        }
        
        html body .progress .prog-dot.done { 
            background: ${colors.main} !important; 
            opacity: 0.7; 
        }

        html body header .status-btn { 
            background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%) !important; 
            color: #ffffff !important; 
            border: 1px solid rgba(255,255,255,0.15) !important; 
            border-bottom: 2.5px solid rgba(150, 160, 175, 0.45) !important; 
            box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 5px rgba(0,0,0,0.4) !important; 
            transition: all 0.15s ease !important;
            transform: translateY(0);
        }
        html body header .status-btn:hover { background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%) !important; transform: translateY(-1px) !important; }
        html body header .status-btn:active { transform: translateY(2px) !important; border-bottom-width: 1px !important; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.2) !important; }

        html body header .status-btn.btn-help { 
            color: #ff453a !important; background: linear-gradient(180deg, rgba(255,69,58,0.15) 0%, rgba(255,69,58,0.02) 100%) !important; 
            border-color: rgba(255,69,58,0.3) !important; border-bottom: 2.5px solid rgba(120,20,15,0.7) !important;
            box-shadow: inset 0 1px 1px rgba(255,100,100,0.3), 0 2px 5px rgba(0,0,0,0.4) !important;
        }

        html body header .status-btn.btn-done { 
            color: #34c759 !important; background: linear-gradient(180deg, rgba(52,199,89,0.15) 0%, rgba(52,199,89,0.02) 100%) !important; 
            border-color: rgba(52,199,89,0.3) !important; border-bottom: 2.5px solid rgba(20,80,30,0.7) !important;
            box-shadow: inset 0 1px 1px rgba(100,255,150,0.3), 0 2px 5px rgba(0,0,0,0.4) !important;
        }
        
        html body header nav .menu-item .menu-link { color: rgba(255,255,255,0.6) !important; background: transparent !important; border-color: transparent !important; box-shadow: none !important; }
        html body header nav .menu-item:hover > .menu-link,
        html body header nav .menu-item:hover > .menu-link:not(.active) { color: #ffffff !important; background: rgba(255,255,255,0.05) !important; border-color: transparent !important; }
        
        html body header nav .menu-item .menu-link.active,
        html body header nav .menu-item:hover > .menu-link.active { 
            background: ${colors.bg} !important; 
            color: ${colors.main} !important; 
            box-shadow: 0 -4px 12px ${colors.shadow} !important; 
            border-color: transparent !important; 
        }
        
        html body header .dropdown { background: rgba(10, 15, 30, 0.95) !important; border: 1px solid ${colors.border} !important; backdrop-filter: blur(10px) !important; }
        html body header .dropdown li a { color: rgba(255,255,255,0.8) !important; background: transparent !important; }
        html body header .dropdown li a:hover { background: ${colors.badgeBg} !important; color: ${colors.main} !important; }
    `;
    document.head.appendChild(style);

    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden;';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width: 100%; height: 100%; opacity: 0.7;'; 
    canvasContainer.appendChild(canvas);
    header.insertBefore(canvasContainer, header.firstChild);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [], stars = [];

    function resize() {
        width = header.clientWidth;
        height = header.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random();
            this.speed = Math.random() * 0.03 + 0.01;
        }
        update() {
            this.opacity += this.speed;
            if (this.opacity > 1 || this.opacity < 0) this.speed = -this.speed;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    class Particle {
        constructor() { this.reset(); this.y = Math.random() * height; }
        reset() {
            this.x = Math.random() * width;
            this.y = height + 20;
            this.speed = Math.random() * 0.4 + 0.1;
            this.text = Math.random() > 0.5 ? '0' : '1';
            this.size = Math.random() * 12 + 10;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? `rgba(${colors.particle1}, ${this.opacity})` : `rgba(${colors.particle2}, ${this.opacity})`;
        }
        update() {
            this.y -= this.speed;
            if (this.y < -30) this.reset();
        }
        draw() {
            ctx.font = `900 ${this.size}px "JetBrains Mono", monospace`;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        }
    }

    for (let i = 0; i < 50; i++) stars.push(new Star());
    for (let i = 0; i < 30; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        stars.forEach(s => { s.update(); s.draw(); });
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
});


// ==========================================================================
// [데이터 비트박스] 사이드바 내부 정렬형 비트봇 시스템 (테두리 상자 축소 및 말풍선 다이어트)
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. 챗봇 전용 CSS 스타일 동적 주입
    const chatbotStyle = document.createElement('style');
    chatbotStyle.textContent = `
        /* 챗봇 창 (사이드바 내부 버튼을 누르면 화면 기준으로 안전하게 팝업) */
        #chatbot-window {
            position: fixed;
            bottom: 90px; 
            right: 25px;
            width: 360px;
            height: 460px;
            background: white;
            border-radius: 14px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            z-index: 9999;
            display: none; /* 초기 상태 숨김 */
            flex-direction: column;
            overflow: hidden;
            border: 2px solid #0f766e;
            font-family: 'Pretendard', sans-serif;
        }
        .chatbot-header {
            background-color: #0f766e;
            color: white;
            padding: 12px 16px;
            font-weight: bold;
            font-size: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chatbot-body {
            flex: 1;
            padding: 14px;
            overflow-y: auto;
            background-color: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .chat-msg {
            max-width: 92%;
            padding: 9px 12px;
            border-radius: 12px;
            font-size: 13.5px;
            line-height: 1.45;
            word-break: break-all;
        }
        .bot-msg {
            background-color: #f1f5f9;
            color: #1e293b;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
            border: 1px solid #e2e8f0;
        }
        .user-msg {
            background-color: #0f766e;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }
        .chatbot-input-area {
            display: flex;
            padding: 10px;
            border-top: 1px solid #e2e8f0;
            background: white;
            gap: 6px;
        }
        .chatbot-input-area input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            outline: none;
            font-size: 13px;
            cursor: text !important;
        }
        .chatbot-input-area button {
            padding: 0 14px;
            background-color: #0f766e;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 13px;
        }

        /* ---------------------------------------------------- */
        /* 사이드바 최하단 지우기 상자 + 비트봇 정렬 레이아웃 */
        .erase-section {
            display: flex !important;
            gap: 10px !important;
            align-items: stretch !important;
            width: 100% !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
        }

        /* 챗봇 버튼: SVG 말풍선 */
        #chatbot-toggle-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            order: -1;
        }
        #chatbot-toggle-btn {
            position: relative;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: flex-start;
            transition: transform 0.2s, filter 0.2s;
        }
        #chatbot-toggle-btn:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
        }
        #chatbot-toggle-btn::before { content: none; }
        #chatbot-toggle-btn::after  { content: none; }
        #chatbot-toggle-btn .bubble-text {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: -0.3px;
            pointer-events: none;
            white-space: nowrap;
        }

        /* 🎯 지우기 버튼: 높이·글씨 중앙 정렬 통일 */
        .erase-section .erase-btn {
            flex: 1 !important;
            margin: 0 !important;
            height: 46px !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            padding: 0 12px !important;
            white-space: nowrap !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            border-radius: 14px !important;
            background: #ffffff !important;
            border: 2px solid #0f766e !important;
            color: #0f766e !important;
            box-shadow: 0 2px 6px rgba(15,118,110,0.15) !important;
            cursor: pointer !important;
            line-height: 1.4 !important;
        }
        .erase-section .erase-btn:hover {
            background: #f0faf9 !important;
        }

        @keyframes floatUpDown {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
    `;
    document.head.appendChild(chatbotStyle);

    // 2. 챗봇 대화창 화면 주입 (body에 직접 붙임)
    const chatbotWindowHTML = `
        <div id="chatbot-window">
            <div class="chatbot-header">
                <span>💬 개념 안내 비트봇</span>
                <span style="cursor:pointer; font-size: 16px;" id="chatbot-close-x">✖</span>
            </div>
            <div class="chatbot-body" id="chatbot-messages">
                <div class="chat-msg bot-msg">안녕! <br> 나는 데이터 비트박스 개념 안내 '비트봇'이야.<br>핵심 단어를 입력하면 개념을 설명해줄께!<br>(예:비트, 픽셀...)</div>
            </div>
            <div class="chatbot-input-area">
                <input type="text" id="chatbot-input" placeholder="예: 픽셀, 아날로그, 디지털...">
                <button id="chatbot-send-btn">전송</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotWindowHTML);

    // 3. 🎯 사이드바 내부 .erase-section(지우기 상자) 안에 나란히 재배치
    const eraseSection = document.querySelector('.erase-section');
    if (eraseSection) {
        // 비트봇 버튼과 초미니 말풍선 구조 생성
        const toggleWrapper = document.createElement('div');
        toggleWrapper.id = 'chatbot-toggle-wrapper';
        toggleWrapper.innerHTML = `
            <button id="chatbot-toggle-btn">
                <svg width="130" height="60" viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="bubble-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#0f766e"/>
                            <stop offset="100%" stop-color="#0d9488"/>
                        </linearGradient>
                        <filter id="bubble-shadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f766e" flood-opacity="0.35"/>
                        </filter>
                    </defs>
                    <path d="
                        M 14 2
                        Q 2 2 2 14
                        L 2 34
                        Q 2 46 14 46
                        L 74 46
                        L 68 58
                        L 92 46
                        Q 128 46 128 34
                        L 128 14
                        Q 128 2 116 2
                        Z
                    " fill="url(#bubble-grad)" filter="url(#bubble-shadow)"/>
                </svg>
                <span class="bubble-text">개념 안내 비트봇</span>
            </button>
        `;
        // 지우기 버튼 왼쪽(앞)에 삽입
        eraseSection.insertBefore(toggleWrapper, eraseSection.firstChild);
    }

    // 4. 이벤트 리스너 연결
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const closeX = document.getElementById('chatbot-close-x');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const inputField = document.getElementById('chatbot-input');

    if(toggleBtn) toggleBtn.addEventListener('click', toggleChatbot);
    if(closeX) closeX.addEventListener('click', toggleChatbot);
    if(sendBtn) sendBtn.addEventListener('click', sendChatMessage);
    if(inputField) inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendChatMessage();
    });

    function toggleChatbot() {
        const chatWindow = document.getElementById('chatbot-window');
        const isHidden = chatWindow.style.display === 'none' || chatWindow.style.display === '';
        chatWindow.style.display = isHidden ? 'flex' : 'none';

        if (isHidden) inputField.focus();
    }

    // 5. 가장 긴 단어 우선 매칭(Scoring) 검색 엔진
    function sendChatMessage() {
        const message = inputField.value.trim();
        if (!message) return;

        addMessageToUI('user-msg', message);
        inputField.value = '';
        const userInput = message.replace(/\s+/g, '').toLowerCase();

        let bestMatch = null;
        let maxScore = 0;

        if (typeof SEARCH_DB !== 'undefined' && Array.isArray(SEARCH_DB)) {
            SEARCH_DB.forEach(item => {
                let targets = [];
                if (typeof item.keyword === 'string') targets.push(item.keyword);
                if (Array.isArray(item.aliases)) targets.push(...item.aliases);
                if (Array.isArray(item.keywords)) targets.push(...item.keywords);
                if (typeof item.title === 'string') targets.push(item.title);

                targets.forEach(target => {
                    if (!target) return;
                    const cleanTarget = target.replace(/\s+/g, '').toLowerCase();
                    let currentScore = 0;

                    if (userInput === cleanTarget) currentScore = cleanTarget.length + 100; 
                    else if (userInput.includes(cleanTarget)) currentScore = cleanTarget.length;
                    else if (cleanTarget.includes(userInput)) currentScore = userInput.length;

                    if (currentScore > maxScore) {
                        maxScore = currentScore;
                        bestMatch = item;
                    }
                });
            });
        }

        setTimeout(() => {
            if (bestMatch) {
                const titleText = bestMatch.keyword || bestMatch.title || "탐구 개념";
                const descText = bestMatch.desc || "관련 설명을 찾았어!";
                const url = bestMatch.url || "#";
                const anchor = bestMatch.anchor || "";
                const stepText = bestMatch.step ? `${bestMatch.step}단원: ` : "";
                const safeDesc = descText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

                const reply = `<strong>[${titleText}]</strong>\n${safeDesc}\n\n🎯 <a href="${url}${anchor}" style="color:#0f766e; font-weight:bold; text-decoration:underline;">[${stepText}${bestMatch.title || titleText}] 페이지로 이동해서 탐구하기</a>`;
                addMessageToUI('bot-msg', reply);
            } else {
                addMessageToUI('bot-msg', '아직 내가 학습하지 못한 내용인 것 같아. 핵심 단어(예: 비트, 인공지능)를 다시 입력해 줄래?');
            }
        }, 300);
    }

    function addMessageToUI(className, text) {
        const msgContainer = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${className}`;
        msgDiv.innerHTML = text.replace(/\n/g,'<br>');
        msgContainer.appendChild(msgDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
});