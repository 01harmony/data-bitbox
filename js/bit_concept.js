// ── bit_concept.js ─────────────────────────────────────────────
// [2단원: 비트란?] 전용 스크립트

// 🌟 [설정] 2단원 고유 정보
const THIS_STEP = 2;
const STEP_TITLE = "2. 비트란?";
const FILE_NAME_PREFIX = "비트_개념";
const PASS_SCORE = 70;
const MEMO_KEY = "value_bit_memo";
const REF_KEY = "value_bit_reflection";

// ✅ stepId → dotIndex 매핑
const stepDotMap = {
    'step1-visual': 0,
    'step2-concept': 1,
    'step3-quiz': 2
};

// 🌟 [개별 기능] 2단원 전용 스크립트 (전구 스위치 + CPU 여정 애니메이션)
function toggleBit() {
    const sw     = document.getElementById('bitSwitch');
    const parent = document.getElementById('switchParent');  // bj-main
    const knob   = document.getElementById('knobText');
    const result = document.getElementById('resultBit');
    const offText = document.getElementById('offText');
    const onText  = document.getElementById('onText');
    const bulbOff = document.getElementById('bulbOff');
    const bulbOn  = document.getElementById('bulbOn');
    const cpuState   = document.getElementById('cpuState');
    const resultSub  = document.getElementById('resultSub');
    const bjeOff = document.getElementById('bjeOff');
    const bjeOn  = document.getElementById('bjeOn');

    if (sw.classList.contains('on')) {
        // ── OFF 상태로 전환 ──
        sw.classList.remove('on');
        parent.classList.remove('on');
        knob.innerText = '';
        result.innerText = '0';
        result.classList.remove('on');
        offText.classList.add('active');
        onText.classList.remove('active');
        bulbOff.style.display = 'block';
        bulbOn.style.display  = 'none';

        if (cpuState)   { cpuState.innerText   = '✔️ 0인식'; }
        if (resultSub)  { resultSub.innerHTML  = '전기 없음 → <b>0</b>'; }
        if (bjeOff) { bjeOff.style.display = 'inline-block'; }
        if (bjeOn)  { bjeOn.style.display  = 'none'; }
    } else {
        // ── ON 상태로 전환 ──
        sw.classList.add('on');
        parent.classList.add('on');
        knob.innerText = '';
        result.innerText = '1';
        result.classList.add('on');
        offText.classList.remove('active');
        onText.classList.add('active');
        bulbOff.style.display = 'none';
        bulbOn.style.display  = 'block';

        setTimeout(function() {
            if (cpuState) { cpuState.innerText = '⚡1 인식'; }
        }, 500);
        if (resultSub)  { resultSub.innerHTML  = '전기 있음 → <b>1</b>'; }
        if (bjeOff) { bjeOff.style.display = 'none'; }
        if (bjeOn)  { bjeOn.style.display  = 'inline-block'; }
    }
}

// 🌟 [개별 기능] 2단원 전용 스크립트 (퀴즈 힌트 버튼)
function toggleHint(btn, text) {
    const display = btn.nextElementSibling;
    if (display.style.display === 'none' || display.style.display === '') {
        display.innerText = text; display.style.display = 'inline-block';
    } else { 
        display.style.display = 'none'; 
    }
}
// ── step3-byte: stepDotMap 보정 ──────────────────────────────
// step3-byte 단계 추가로 인해 기존 매핑 업데이트
stepDotMap['step3-byte'] = 2;
stepDotMap['step3-quiz'] = 3;

// ── step3-byte: 용량 단위 클릭 상세 설명 ─────────────────────
const byteDetails = {
    bit:  {
        title: '🔵 1 bit (비트)',
        color: 'var(--teal-main)',
        desc:  '비트는 Binary Digit의 줄임말이에요.<br>0 또는 1, 딱 두 가지 값만 표현할 수 있는 <b>디지털 데이터의 가장 작은 단위</b>예요.<br>💡 예: 전구가 꺼지면 0, 켜지면 1!'
    },
    byte: {
        title: '🟢 1 Byte (바이트)',
        color: '#2e7d32',
        desc:  '비트 8개를 묶으면 1바이트가 돼요.<br>1바이트로는 영문자 1글자를 저장할 수 있어요.<br>🔤 예: 알파벳 \u0022A\u0022는 1바이트(65번)로 저장돼요.'
    },
    kb: {
        title: '🟡 1 KB (킬로바이트)',
        color: '#f57f17',
        desc:  '1,024바이트를 묶으면 1킬로바이트(KB)예요.<br>왜 1,000이 아니라 1,024일까요? 컴퓨터는 2의 거듭제곱으로 계산하기 때문이에요. (2\u00B9\u2070 = 1,024)<br>📝 예: 짧은 메모 파일이 약 1~10KB 정도예요.'
    },
    mb: {
        title: '🔴 1 MB (메가바이트)',
        color: '#c2185b',
        desc:  '1,024KB를 묶으면 1메가바이트(MB)예요.<br>스마트폰으로 찍은 사진 한 장이 보통 2~5MB 정도예요.<br>📷 예: 음악 파일 1곡이 약 3~5MB예요.'
    },
    gb: {
        title: '🟣 1 GB (기가바이트)',
        color: '#6a1b9a',
        desc:  '1,024MB를 묶으면 1기가바이트(GB)예요.<br>스마트폰 저장 공간이나 USB 메모리 용량으로 자주 쓰여요.<br>🎬 예: 영화 1편이 약 1~2GB, 스마트폰이 보통 128GB예요.'
    },
    tb: {
        title: '🔷 1 TB (테라바이트)',
        color: '#1a237e',
        desc:  '1,024GB를 묶으면 1테라바이트(TB)예요.<br>컴퓨터 하드디스크나 외장하드 용량으로 자주 쓰여요.<br>💾 예: 1TB 외장하드에 영화를 약 500편 저장할 수 있어요!'
    }
};

function showByteDetail(key) {
    var d = byteDetails[key];
    if (!d) return;
    var box = document.getElementById('byteDetailBox');
    var con = document.getElementById('byteDetailContent');
    con.innerHTML = '<span style="font-size:1.05rem;font-weight:900;color:' + d.color + '">' + d.title + '</span><br><br>' + d.desc;
    box.style.setProperty('display', 'block', 'important');
    box.style.borderColor = d.color;
}

// ── 비트봇 말풍선 타자기 ──────────────────────────────────────
var bbLines = [
    { plain:'▪비트(Bit)는 컴퓨터가 다루는 가장 작은 데이터 단위야.', html:'<em>▪비트(Bit)</em>는 컴퓨터가 다루는 가장 작은 데이터 단위야.' },
    { plain:'▪비트는 0 또는 1, 딱 두 가지 값만 가질 수 있어.', html:'▪비트는 <em>0</em> 또는 <em>1</em>, 딱 두 가지 값만 가질 수 있어.' },
    { plain:'▪전기가 흐르면 1, 흐르지 않으면 0 - 바로 컴퓨터의 언어야.', html:'▪전기가 흐르면 <em>1</em>, 흐르지 않으면 <em>0</em> - 바로 <strong>컴퓨터의 언어</strong>야.' },
    { plain:'▪8개의 비트를 묶으면 1바이트가 되고 더 많은 정보를 표현할 수 있지.', html:'▪8개의 비트를 묶으면 <em>1바이트가 되고</em> 더 많은 정보를 표현할 수 있지.<br>' },
    { plain:'➤ 그럼 직접 탐구하며 비트에 대해 더 자세히 알아볼까?', html:'<em>➤ 그럼 직접 탐구하며 비트에 대해 더 자세히 알아볼까?</em>' }
];
var bbLi = 0, bbCi = 0, bbTm = null;

function bbType() {
    var bbEl = document.getElementById('bb-story');
    if (!bbEl) return;
    var cur = bbLines[bbLi];
    if (bbCi < cur.plain.length) {
        var done = bbLines.slice(0, bbLi).map(function(l){ return l.html; }).join('<br>');
        bbEl.innerHTML = (done ? done + '<br>' : '') + cur.plain.slice(0, bbCi + 1) + '<span class="bb-cursor"></span>';
        bbCi++;
        bbTm = setTimeout(bbType, 26);
    } else {
        bbLi++; bbCi = 0;
        if (bbLi < bbLines.length) bbTm = setTimeout(bbType, 320);
        else bbEl.innerHTML = bbLines.map(function(l){ return l.html; }).join('<br>');
    }
}

function bbClose() {
    if (bbTm) clearTimeout(bbTm);
    var s = document.getElementById('bb-scene');
    var b = document.getElementById('bb-backdrop');
    if (s) { s.classList.add('bb-scene-exit'); setTimeout(function(){ s.style.display='none'; if(b) b.style.display='none'; }, 300); }
}

window.addEventListener('load', function() {
    // 비트봇 타자기 시작
    setTimeout(bbType, 600);

    // 비트봇 버튼 hover
    var btnS  = document.getElementById('bb-btn-start');
    var btnSk = document.getElementById('bb-btn-skip');
    if (btnS) {
        btnS.addEventListener('mouseenter', function(){ btnS.style.setProperty('background','#0e9b87','important'); btnS.style.setProperty('transform','translateY(-2px)','important'); btnS.style.setProperty('box-shadow','0 7px 0 #0a5c56','important'); });
        btnS.addEventListener('mouseleave', function(){ btnS.style.setProperty('background','#0f766e','important'); btnS.style.setProperty('transform','translateY(0)','important'); btnS.style.setProperty('box-shadow','0 5px 0 #0a5c56','important'); });
        btnS.addEventListener('mousedown',  function(){ btnS.style.setProperty('transform','translateY(4px)','important'); btnS.style.setProperty('box-shadow','0 1px 0 #0a5c56','important'); });
        btnS.addEventListener('mouseup',    function(){ btnS.style.setProperty('transform','translateY(-2px)','important'); btnS.style.setProperty('box-shadow','0 7px 0 #0a5c56','important'); });
    }
    if (btnSk) {
        btnSk.addEventListener('mouseenter', function(){ btnSk.style.setProperty('background','rgba(255,255,255,0.18)','important'); btnSk.style.setProperty('color','rgba(255,255,255,0.95)','important'); });
        btnSk.addEventListener('mouseleave', function(){ btnSk.style.setProperty('background','rgba(255,255,255,0.08)','important'); btnSk.style.setProperty('color','rgba(255,255,255,0.7)','important'); });
    }
});