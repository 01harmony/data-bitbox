// ── config.js (자동 설정 버전) ──────────────────────────────
// ⚠️ 이 파일은 이제 직접 수정하지 않아도 됩니다!
//
// 다른 선생님은 1단계(Code.gs 배포)만 하면 되고, 학생에게 보낼 주소는
// "링크_생성기.html"에서 웹 앱 URL과 SECRET_KEY 두 값을 넣으면 자동으로 만들어집니다.
//
// 학생이 그 링크(예: index.html?ep=...&sk=...)로 처음 접속하면, 아래 코드가
// 주소에 담긴 값을 이 브라우저에 한 번만 저장해 두고, 그다음부터는(다른 단원
// 페이지로 이동하거나 나중에 다시 접속해도) 저장된 값을 계속 사용합니다.
//
// 🌟 [기본값] 아래 DEFAULT_ENDPOINT / DEFAULT_SECRET은 데이터 비트박스 저작자가
// 사용한 값입니다. 주소에 ep/sk가 없고 이 브라우저에 저장된 값도 없을 때만(=지금까지
// 써오시던 그대로의 링크로 들어왔을 때) 이 기본값을 사용합니다. 그래서 기존에
// 배포해두신 주소는 이전과 똑같이 계속 작동합니다.
//
// 이 파일은 모든 단원 페이지(01_value.html, 02_bit.html, 03_number.html ...)와
// index.html에서 concept_common.js보다 먼저 불러옵니다.

(function () {
    var DEFAULT_ENDPOINT = "https://script.google.com/macros/s/AKfycbxukOY8oIDe6UrbD4tqqg3cnzQ1bQUVUXcmnLmRMkhh4N8E09Yf6RSC8w54dSck1RSX/exec";
    var DEFAULT_SECRET = "bitbox-2026";

    var LS_EP = 'bitbox_submit_endpoint';
    var LS_SK = 'bitbox_submit_secret';

    var params = new URLSearchParams(window.location.search);
    var epParam = params.get('ep');
    var skParam = params.get('sk');

    // 주소에 값이 실려 있으면(학생이 선생님 링크로 처음 들어온 경우) 이 브라우저에 저장
    if (epParam) {
        try { localStorage.setItem(LS_EP, decodeURIComponent(epParam)); } catch (e) {}
    }
    if (skParam) {
        try { localStorage.setItem(LS_SK, decodeURIComponent(skParam)); } catch (e) {}
    }

    // 저장이 끝났으면 주소창에서 ep/sk를 지워 깔끔하게 보이도록 정리
    if (epParam || skParam) {
        params.delete('ep');
        params.delete('sk');
        var newQuery = params.toString();
        var newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '') + window.location.hash;
        try { window.history.replaceState({}, '', newUrl); } catch (e) {}
    }

    var storedEp = '';
    var storedSk = '';
    try {
        storedEp = localStorage.getItem(LS_EP) || '';
        storedSk = localStorage.getItem(LS_SK) || '';
    } catch (e) {}

    // 우선순위: ① 방금 주소로 들어온 값 → ② 전에 이 브라우저에 저장해둔 값 →
    // ③ 둘 다 없으면(=기존에 써오시던 링크) 원래 기본값
    // concept_common.js가 그대로 쓰는 전역 변수 (기존 config.js와 이름 동일)
    window.SUBMIT_ENDPOINT = storedEp || DEFAULT_ENDPOINT;
    window.SUBMIT_SECRET = storedSk || DEFAULT_SECRET;
})();