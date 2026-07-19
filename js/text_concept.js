// ── text_concept.js ─────────────────────────────────────────────
// [4단원: 문자의 디지털 표현] 전용 스크립트

// 🌟 [설정] 4단원 고유 정보
const THIS_STEP = 4;
const STEP_TITLE = "4. 문자의 디지털 표현";
const FILE_NAME_PREFIX = "문자_개념";
const PASS_SCORE = 70;
const MEMO_KEY = "value_text_memo";
const REF_KEY = "value_text_reflection";

// ✅ 화면 진행 점 매핑
const stepDotMap = {
    'step1-visual':  0,
    'step2-concept': 1,
    'step3-ascii':   2,
    'step4-unicode': 3,
    'step5-utf8':    4,
    'step6-quiz':    5
};

// 🌟 [개별 기능] 1. 타이핑 문자 변환기 (ASCII / Unicode)
function typeChar(btnEl, char, dec, bin, standard) {
    document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('pressed'));
    btnEl.classList.add('pressed');

    const elChar = document.getElementById('dispChar');
    const elDec = document.getElementById('dispDec');
    const elBin = document.getElementById('dispBin');
    const elStdLabel = document.getElementById('codeStandardLabel');

    // 출력 박스 참조
    const boxChar = elChar ? elChar.closest('.process-box') : null;
    const boxDec  = elDec  ? elDec.closest('.process-box')  : null;
    const boxBin  = elBin  ? elBin.closest('.process-box')  : null;

    // 초기화: 활성 상태 제거, 값 리셋
    [boxChar, boxDec, boxBin].forEach(b => b && b.classList.remove('active'));
    [elChar, elDec, elBin, elStdLabel].forEach(el => {
        if(el) { el.classList.remove('pop-anim'); }
    });
    elChar.innerText = '-'; elDec.innerText = '-'; elBin.innerText = '-';
    if(elStdLabel) elStdLabel.innerHTML = '약속된 번호표';

    // ① 입력된 문자 박스 활성화
    setTimeout(() => {
        if(boxChar) boxChar.classList.add('active');
        elChar.innerText = `'${char}'`;
        elChar.classList.add('pop-anim');
    }, 50);

    // ② 약속된 번호표 박스 활성화 (네이비 배경에 어울리는 색상으로 교체)
    setTimeout(() => {
        if(boxDec) boxDec.classList.add('active');
        if(standard === 'ASCII') {
            elStdLabel.innerHTML = '<span style="color:#38bdf8;">아스키코드</span>';
        } else {
            elStdLabel.innerHTML = '<span style="color:#38bdf8;">🌍 유니코드</span>';
        }
        elStdLabel.classList.add('pop-anim');
        elDec.innerText = dec;
        elDec.style.color = ''; // CSS .process-box.active .process-value 에서 통일 관리
        elDec.classList.add('pop-anim');
    }, 300);

    // ③ 이진수 박스 활성화
    setTimeout(() => {
        if(boxBin) boxBin.classList.add('active');
        elBin.innerHTML = bin.includes(' ') ? bin.replace(/ /g, '<br>') : bin;
        // fontSize는 CSS .bin-value에서 통일 관리
        elBin.classList.add('pop-anim');
    }, 600);
}

// 🌟 [개별 기능] 2. 인라인 텍스트 특수 효과 (배경색 포함)
function revealInline(btn, text, color, bgColor) {
    const span = document.createElement('span');
    span.className = 'pop-anim revealed-text';
    span.style.color = color;
    span.style.fontWeight = '900';
    span.style.fontSize = '1.05rem';
    span.style.backgroundColor = bgColor; 
    span.style.padding = '2px 8px';
    span.style.borderRadius = '8px';
    span.style.boxShadow = `0 2px 5px ${color}40`; 
    span.innerText = text;
    btn.parentNode.replaceChild(span, btn);
}

// 🌟 [개별 기능] 3. 전체 아스키코드표 렌더링
window.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('ascii-table')) {
        renderAsciiTable();
    }
});

function renderAsciiTable() {
    const container = document.getElementById('ascii-table');
    let html = '';
    const hiddenDecimals = [33, 48, 65, 97, 122]; 
    
    for(let i = 32; i <= 126; i++) {
        let char = String.fromCharCode(i);
        if(i === 32) char = 'SPACE'; 
        
        let binStr = i.toString(2).padStart(8, '0');
        let innerHtml = `<div class="ascii-dec">${i}</div><div class="ascii-bin">${binStr}</div>`;
        
        if(hiddenDecimals.includes(i)) {
            innerHtml = `<button class="reveal-btn small yellow" onclick="revealCode(this, '${i}', '${binStr}', '#1d1d1f')">❔</button>`;
        }
        
        html += `
        <div class="ascii-cell">
            <div class="ascii-char">${char}</div>
            <div class="ascii-content">${innerHtml}</div>
        </div>`;
    }
    container.innerHTML = html;
}

// 🌟 [개별 기능] 4. 숨겨진 코드 확인 (카드 뒤집기)
function revealCode(btn, dec, bin, color) {
    const parent = btn.parentElement;
    let resultHtml = `<div class="ascii-dec pop-anim" style="color: ${color}; font-size: 1.1rem; line-height:1.2;">${dec}</div>`;
    if (bin) {
        resultHtml += `<div class="ascii-bin pop-anim">${bin}</div>`;
    }
    parent.innerHTML = resultHtml;
}

// 🌟 [개별 기능] 5. UTF-8 인코더 로직
function executeUTF8() {
    const inputVal = document.getElementById('utf8Input').value;
    const display = document.getElementById('byteDisplay');
    const infoText = document.getElementById('byteInfoText');
    display.innerHTML = '';
    
    if(!inputVal) {
        infoText.innerText = "문자를 한 개 입력해주세요!";
        return;
    }
    
    // 첫 번째 문자(코드 포인트 기준)만 변환 — 이모지도 1글자로 처리
    const firstChar = Array.from(inputVal)[0];
    document.getElementById('utf8Input').value = firstChar;

    const encoder = new TextEncoder();
    const view = encoder.encode(firstChar);
    
    let html = '';
    view.forEach((byte, index) => {
        const binStr = byte.toString(2).padStart(8, '0');
        html += `<div class="byte-box" style="animation-delay:${index * 0.1}s">${binStr}</div>`;
    });
    
    display.innerHTML = html;
    
    let bytes = view.length;
    const isHangul = /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(firstChar);
    const cp = firstChar.codePointAt(0);
    const isEmoji = cp >= 0x1F000 || (cp >= 0x2600 && cp <= 0x27BF);

    if(bytes === 1) {
        infoText.innerHTML = `영문자/숫자/기호는 <span style="color:var(--apple-blue)">1바이트(8비트)</span>를 사용합니다!`;
    } else if(isHangul) {
        infoText.innerHTML = `한글은 <span style="color:var(--apple-red)">3바이트(24비트)</span>를 사용합니다!`;
    } else if(isEmoji) {
        infoText.innerHTML = `이모지는 <span style="color:var(--ocean-blue)">${bytes}바이트(${bytes * 8}비트)</span>를 사용합니다!`;
    } else {
        infoText.innerHTML = `이 문자는 <span style="color:var(--ocean-blue)">${bytes}바이트(${bytes * 8}비트)</span>를 사용합니다!`;
    }
    infoText.style.display = 'block';
}