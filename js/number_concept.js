// ── number_concept.js ─────────────────────────────────────────────
// [3단원: 숫자의 디지털 표현] 전용 스크립트

// 🌟 [설정] 3단원 고유 정보
const THIS_STEP = 3;
const STEP_TITLE = "3. 숫자의 디지털 표현";
const FILE_NAME_PREFIX = "숫자_개념";
const PASS_SCORE = 70;
const MEMO_KEY = "number_concept_memo";
const REF_KEY = "number_concept_reflection";

// ✅ 진행 점 매핑
const stepDotMap = {
    'step1-visual':  0,
    'step3-tip':     1,
    'step4-tip2':    2,
    'step5-quiz':    3
};

// 🌟 [개별 기능] 1. 전구 스위치 및 이진수 계산기
let bulbStates = Array(16).fill(0);

function toggleBulb(idx) {
    bulbStates[idx] = 1 - bulbStates[idx];
    const bulb = document.getElementById('bulb-' + idx);
    const wrap = document.getElementById('bw-' + idx);
    
    if (bulbStates[idx]) {
        bulb.innerText = '1';
        bulb.classList.add('on');
        wrap.classList.add('on');
    } else {
        bulb.innerText = '0';
        bulb.classList.remove('on');
        wrap.classList.remove('on');
    }
    updateNumberResult();
}

function updateNumberResult() {
    let leftBin = bulbStates.slice(8, 16).reverse().join('');
    let rightBin = bulbStates.slice(0, 8).reverse().join('');
    document.getElementById('binary-text').innerText = leftBin + ' ' + rightBin;

    let decValue = 0;
    for (let i = 0; i < 16; i++) {
        if (bulbStates[i] === 1) decValue += Math.pow(2, i);
    }
    document.getElementById('decimal-text').innerText = decValue;

    // 이진수 수식 계산 (켜진 전구만, 괄호로 묶기)
    const box = document.getElementById('bin-formula-box');
    if (box) {
        const expHTML = ['2<sup>0</sup>','2<sup>1</sup>','2<sup>2</sup>','2<sup>3</sup>',
                         '2<sup>4</sup>','2<sup>5</sup>','2<sup>6</sup>','2<sup>7</sup>',
                         '2<sup>8</sup>','2<sup>9</sup>','2<sup>10</sup>','2<sup>11</sup>',
                         '2<sup>12</sup>','2<sup>13</sup>','2<sup>14</sup>','2<sup>15</sup>'];
        const terms = [];
        for (let i = 15; i >= 0; i--) {
            if (bulbStates[i] === 1) {
                terms.push(`(1 × ${expHTML[i]})`);
            }
        }
        if (terms.length === 0) {
            box.innerHTML = '<span style="color:#aaa;font-weight:600;">전구를 켜면 수식이 나타납니다</span>';
        } else {
            const formula = terms.join(' <span style="color:#64748b;font-weight:700;">+</span> ');
            box.innerHTML = formula +
                ' <span style="color:#64748b;font-weight:700;"> = </span>' +
                `<span style="color:#0284c7;font-size:1.05rem;font-weight:900;">${decValue}</span>`;
        }
    }

    const val2 = bulbStates[1];
    const val1 = bulbStates[0];
    document.querySelectorAll('.postit').forEach(el => el.classList.remove('active'));
    if (val2 === 0 && val1 === 0) document.getElementById('postit-00').classList.add('active');
    if (val2 === 0 && val1 === 1) document.getElementById('postit-01').classList.add('active');
    if (val2 === 1 && val1 === 0) document.getElementById('postit-10').classList.add('active');
    if (val2 === 1 && val1 === 1) document.getElementById('postit-11').classList.add('active');
}


// 🌟 [개별 기능] 2. 나눗셈 빈칸 채우기 정답 확인
// ── 오답 처리: 상자 흔들림 + 값 지우기 ──
(function injectWrongShakeStyle() {
    const st = document.createElement('style');
    st.textContent = '@keyframes ncWrongShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} } .nc-wrong { animation: ncWrongShake 0.4s ease; background-color:#fee2e2 !important; border-color:#ef4444 !important; }';
    document.head.appendChild(st);
})();

function shakeWrong(el) {
    el.classList.add('nc-wrong');
    setTimeout(() => {
        el.classList.remove('nc-wrong');
        el.value = '';
    }, 400);
}

function isWrongComplete(el) {
    const ans = el.getAttribute('data-ans');
    if (el.value.length === 0) return false;
    // 입력한 부분이 정답의 시작과 다르면 즉시 오답 처리
    return !ans.startsWith(el.value);
}

function checkDiv(el) {
    if (el.value === el.getAttribute('data-ans')) {
        el.style.backgroundColor = '#d1fae5';
        el.style.borderColor = '#10b981';
        el.style.color = '#047857';
        el.disabled = true;
    } else if (isWrongComplete(el)) {
        shakeWrong(el);
    }
    const allInputs = document.querySelectorAll('#step3-tip .val-box');
    let allCorrect = true;
    allInputs.forEach(input => {
        if (input.value !== input.getAttribute('data-ans')) allCorrect = false;
    });
    if (allCorrect) {
        document.getElementById('final-bin').innerText = "1 1 0 1";
        document.getElementById('resultBox').style.backgroundColor = '#d1fae5';
        document.getElementById('resultBox').style.borderColor = '#10b981';
    }
}

function checkBinToDec(el) {
    if (el.value === el.getAttribute('data-ans')) {
        el.style.backgroundColor = '#d1fae5';
        el.style.borderColor = '#10b981';
        el.style.color = '#047857';
        el.disabled = true;
    } else if (isWrongComplete(el)) {
        shakeWrong(el);
    }
}

function checkBinToDecFinal(el) {
    if (el.value === el.getAttribute('data-ans')) {
        el.style.backgroundColor = '#d1fae5';
        el.style.borderColor = '#10b981';
        el.style.color = '#047857';
        el.disabled = true;
        document.getElementById('resultBox2').style.backgroundColor = '#d1fae5';
        document.getElementById('resultBox2').style.borderColor = '#10b981';
    } else if (isWrongComplete(el)) {
        shakeWrong(el);
    }
}

// 🌟 [개별 기능] 3. 힌트 버튼 토글
function toggleHint(btn, text) {
    const display = btn.nextElementSibling;
    if (display.style.display === 'none' || display.style.display === '') {
        display.innerText = text; display.style.display = 'inline-block';
    } else { display.style.display = 'none'; }
}

// 🌟 [개별 기능] 3-1. 개념 카드 토글
window.toggleConceptCard = function(cardId) {
    const card = document.getElementById(cardId);
    const icon = document.getElementById(cardId + '-icon');
    if (!card) return;
    const isOpen = card.style.display !== 'none';
    card.style.display = isOpen ? 'none' : 'block';
    if (icon) icon.textContent = isOpen ? '❓' : '✅';
};

// 🌟 [개별 기능] 4. 10진수 전구 — 클릭할 때마다 0→1→...→9→0 순환
let decBulbValues = Array(8).fill(0);

window.cycleDecBulb = function(idx) {
    decBulbValues[idx] = (decBulbValues[idx] + 1) % 10;
    const val = decBulbValues[idx];
    const bulb = document.getElementById('bulb-' + idx);
    const wrap = document.getElementById('bw-' + idx);
    bulb.innerText = val;
    // 0이면 꺼진 상태, 1~9는 밝기 단계별 색상
    if (val === 0) {
        bulb.className = 'bulb dec-bulb';
        bulb.style.background = '';
        bulb.style.color = '';
        bulb.style.boxShadow = '';
        wrap.classList.remove('on');
    } else {
        const intensity = Math.round(80 + (val / 9) * 130);
        const hex = intensity.toString(16).padStart(2, '0');
        bulb.style.background = `#ff${hex}00`;
        bulb.style.color = '#7c2d12';   // 항상 진한 갈색으로 고정 — 잘 보임
        bulb.style.fontWeight = '900';
        bulb.style.boxShadow = `0 0 ${val * 4}px rgba(255,${Math.round((val/9)*160)},0,0.8)`;
        bulb.className = 'bulb dec-bulb on';
        wrap.classList.add('on');
    }
    updateDecResult();
    updateDecPostits();
    updateDecFormula();
};

function updateDecResult() {
    // 10진수 값 계산 (8자리, 인덱스 7이 최고자리)
    let decVal = 0;
    for (let i = 0; i < 8; i++) {
        decVal += decBulbValues[i] * Math.pow(10, i);
    }
    const display = [...decBulbValues].reverse().join('');
    document.getElementById('binary-text').innerText = display.replace(/^0+/, '') || '0';
    document.getElementById('decimal-text').innerText = decVal.toLocaleString('ko-KR');
}

function updateDecPostits() {
    // 켜진 자리(0이 아닌) dpv 카드 하이라이트
    for (let i = 0; i < 8; i++) {
        const card = document.getElementById('dpv-' + i);
        if (!card) continue;
        if (decBulbValues[i] > 0) {
            card.style.borderColor = '#c2410c';
            card.style.background = '#fff7ed';
            card.style.color = '#c2410c';
            card.style.fontWeight = '900';
        } else {
            card.style.borderColor = '';
            card.style.background = '';
            card.style.color = '';
            card.style.fontWeight = '';
        }
    }
}

function updateDecFormula() {
    const box = document.getElementById('dec-formula-box');
    if (!box) return;

    const expHTML = ['10<sup>0</sup>','10<sup>1</sup>','10<sup>2</sup>',
                     '10<sup>3</sup>','10<sup>4</sup>','10<sup>5</sup>',
                     '10<sup>6</sup>','10<sup>7</sup>'];
    const terms = [];
    let total = 0;
    for (let i = 7; i >= 0; i--) {
        const v = decBulbValues[i];
        if (v > 0) {
            // 각 항을 괄호로 묶어 표시
            terms.push(`(<span style="color:#ea580c;font-weight:900;">${v}</span> × ${expHTML[i]})`);
            total += v * Math.pow(10, i);
        }
    }

    if (terms.length === 0) {
        box.innerHTML = '<span style="color:#aaa;font-weight:600;">전구를 클릭하면 수식이 나타납니다</span>';
        // decimal-text-dec 초기화
        const dtd = document.getElementById('decimal-text-dec');
        if (dtd) dtd.innerText = '0';
        return;
    }

    const formula = terms.join(' <span style="color:#64748b; font-weight:700;">+</span> ');
    box.innerHTML = formula +
        ' <span style="color:#64748b; font-weight:700;"> = </span>' +
        `<span style="color:#c2410c;font-size:1.05rem;font-weight:900;">${total.toLocaleString('ko-KR')}</span>`;

    // result-dec-row 업데이트
    const dtd = document.getElementById('decimal-text-dec');
    if (dtd) dtd.innerText = total.toLocaleString('ko-KR');
}

// setMode 기능: 이진수↔10진수 전환 시 전구 자리값 표시 변경
window.setMode = function(mode) {
    document.getElementById('btn-bin').classList.remove('active');
    document.getElementById('btn-dec').classList.remove('active');
    const desc = document.getElementById('mode-desc');
    
    if (mode === 'bin') {
        document.getElementById('btn-bin').classList.add('active');
        desc.innerHTML = '각 자리는 오른쪽→왼쪽으로 <b>2배</b>씩 커집니다 &nbsp;|&nbsp; 이진수는 <b>0(꺼짐)</b>과 <b>1(켜짐)</b> 두 가지로만 표현해요';
        document.getElementById('postit-bin').style.display = 'block';
        document.getElementById('postit-dec').style.display = 'none';
        // 이진수 result row 표시
        const rbin = document.getElementById('result-bin-row');
        const rdec = document.getElementById('result-dec-row');
        if (rbin) rbin.style.display = 'block';
        if (rdec) rdec.style.display = 'none';
    } else {
        document.getElementById('btn-dec').classList.add('active');
        desc.innerHTML = '각 자리는 오른쪽→왼쪽으로 <b>10배</b>씩 커집니다 &nbsp;|&nbsp; 십진수는 <b>0~9</b>까지 열 가지 숫자로 표현해요';
        document.getElementById('postit-bin').style.display = 'none';
        document.getElementById('postit-dec').style.display = 'flex';
        document.getElementById('postit-dec').style.flexDirection = 'column';
        // 10진수 result row 표시 (이진수: 텍스트 숨김)
        const rbin = document.getElementById('result-bin-row');
        const rdec = document.getElementById('result-dec-row');
        if (rbin) rbin.style.display = 'none';
        if (rdec) rdec.style.display = 'block';
    }

    const pvLabels = [
        {exp:'2<sup>0</sup>',  num:'1'},
        {exp:'2<sup>1</sup>',  num:'2'},
        {exp:'2<sup>2</sup>',  num:'4'},
        {exp:'2<sup>3</sup>',  num:'8'},
        {exp:'2<sup>4</sup>',  num:'16'},
        {exp:'2<sup>5</sup>',  num:'32'},
        {exp:'2<sup>6</sup>',  num:'64'},
        {exp:'2<sup>7</sup>',  num:'128'},
    ];
    const pvDecLabels = [
        {exp:'10<sup>0</sup>', num:'1'},
        {exp:'10<sup>1</sup>', num:'10'},
        {exp:'10<sup>2</sup>', num:'100'},
        {exp:'10<sup>3</sup>', num:'1,000'},
        {exp:'10<sup>4</sup>', num:'1만'},
        {exp:'10<sup>5</sup>', num:'10만'},
        {exp:'10<sup>6</sup>', num:'100만'},
        {exp:'10<sup>7</sup>', num:'1,000만'},
    ];
    const labels = mode === 'dec' ? pvDecLabels : pvLabels;
    const clickFn = mode === 'dec' ? 'cycleDecBulb' : 'toggleBulb';
    
    for (let i = 0; i < 8; i++) {
        const pv = document.getElementById('pv-' + i);
        if (pv) pv.innerHTML = labels[i].exp + '<br><small>' + labels[i].num + '</small>';
        const wrap = document.getElementById('bw-' + i);
        if (wrap) {
            wrap.setAttribute('onclick', clickFn + '(' + i + ')');
            // 🌟 10진수 클래스 추가/제거를 확실하게 처리합니다.
            if (mode === 'dec') {
                wrap.classList.add('dec-bulb-wrap');
            } else {
                wrap.classList.remove('dec-bulb-wrap');
            }
        }
        // 전구 값 리셋
        const bulb = document.getElementById('bulb-' + i);
        if (bulb) {
            if (mode === 'dec') {
                decBulbValues[i] = 0;
                bulb.innerText = '0';
                bulb.className = 'bulb dec-bulb';
                bulb.style.background = '';
                bulb.style.boxShadow = '';
            } else {
                bulbStates[i] = 0;
                bulb.innerText = '0';
                bulb.className = 'bulb';
                bulb.style.background = '';
                bulb.style.boxShadow = '';
            }
            if(wrap) wrap.classList.remove('on');
        }
    }
    
    // 결과 초기화
    if (mode === 'dec') {
        document.getElementById('binary-text').innerText = '0';
        document.getElementById('decimal-text').innerText = '0';
        updateDecPostits();
        updateDecFormula();
    } else {
        updateNumberResult();
    }
};

// 🌟 새로고침 시 2진수 모드로 확실하게 동기화시킵니다.
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('btn-bin')) {
        setMode('bin');
    }
});