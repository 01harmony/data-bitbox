// ── sound_concept.js ─────────────────────────────────────────────
// [6단원: 소리의 디지털 표현] 전용 스크립트

// 🌟 [설정] 6단원 고유 정보
const THIS_STEP = 6;
const STEP_TITLE = "6. 소리의 디지털 표현";
const FILE_NAME_PREFIX = "소리_개념";
const PASS_SCORE = 70;
const MEMO_KEY = "value_sound_memo";
const REF_KEY = "value_sound_reflection";

const stepDotMap = {
    'step1-visual':   0,
    'step2-concept':  1,
    'step3-advanced': 2,
    'step4-quiz':     3
};

// 🌟 [추가 보정] 캔버스와 감싸는 영역을 250px로 자동 확장하여 위아래 여백 확보!
document.addEventListener('DOMContentLoaded', () => {
    const dCanvas = document.getElementById('drawCanvas');
    if (dCanvas) { 
        dCanvas.height = 250; 
        dCanvas.style.height = '250px'; 
    }

    // 창 크기 변경 시 오른쪽 그리드 재구성 (반응형)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (document.getElementById('sampleGrid')) {
                buildRightGrid();
                // 이미 샘플링된 데이터 있으면 점도 다시 그리기
                if (extractedQuantValues && extractedQuantValues.length > 0) {
                    setupQuantizationInputs();
                }
            }
        }, 150);
    });
    const drawArea = document.querySelector('.draw-area');
    if (drawArea) drawArea.style.height = '250px';
    const sampleGrid = document.getElementById('sampleGrid');
    if (sampleGrid) sampleGrid.style.height = '250px';
});

// 🌟 [연결] 6단원 HTML의 기존 버튼 및 퀴즈 함수를 공통 파일과 연결
window.resetStatus = function() {
    if (typeof setStatus === 'function') setStatus('normal');
};
window.checkAns = function(el) {
    if (typeof check === 'function') {
        check(el);
        if (el.classList.contains('correct')) el.classList.add('blank-correct');
    }
};

window.goStep = function(id) {
    const current = document.querySelector('.step-container.active');
    const next = document.getElementById(id);
    if(current === next) return;
    current.style.opacity = '0';
    const currentNum = parseInt(current.id.match(/\d+/)[0]);
    const nextNum = parseInt(id.match(/\d+/)[0]);
    const isNext = nextNum > currentNum;
    current.style.transform = isNext ? 'translateX(-20px)' : 'translateX(20px)';
    setTimeout(() => {
        current.classList.remove('active'); current.style.display = '';
        next.classList.add('active'); next.style.display = '';
        
        if(id === 'step3-advanced') initDrawCanvas();
        
        next.style.opacity = '0';
        next.style.transform = isNext ? 'translateX(20px)' : 'translateX(-20px)';
        void next.offsetWidth;
        setTimeout(() => { 
            if (typeof updateDots === 'function') updateDots(stepDotMap[id]);
            next.style.opacity = '1'; next.style.transform = 'translateX(0)'; 
        }, 50);
    }, 400);
};

window.revealInline = function(btn, text, color) { 
    const span = document.createElement('span'); 
    span.className = 'pop-anim revealed-text'; 
    span.style.color = color; 
    span.style.fontWeight = '900'; 
    span.innerText = text; 
    btn.parentNode.replaceChild(span, btn); 
};

// 🌟 [개별 기능] 1단계: 변환 과정 애니메이션 
const visCanvas = document.getElementById('soundVisCanvas'); 
const visCtx = visCanvas ? visCanvas.getContext('2d') : null; 
let scanX = 0; let isScanning = false; let visTick = 0; let sampledPoints = []; 

function drawWaveform() {
    if(!visCtx) return;
    visCtx.fillStyle = 'rgba(18, 10, 33, 1)'; visCtx.fillRect(0, 0, 600, 300);
    visCtx.strokeStyle = 'rgba(179, 136, 255, 0.15)'; visCtx.lineWidth = 1;
    let offset = (visTick * 0.5) % 30;
    for(let i=0; i<=600; i+=30) { visCtx.beginPath(); visCtx.moveTo(i - offset, 0); visCtx.lineTo(i - offset, 300); visCtx.stroke(); }
    for(let i=0; i<=300; i+=30) { visCtx.beginPath(); visCtx.moveTo(0, i); visCtx.lineTo(600, i); visCtx.stroke(); }
    const lines = [{ color: 'rgba(209, 196, 233, 0.3)', width: 6, offset: 0.8 }, { color: 'rgba(126, 87, 194, 0.6)', width: 4, offset: 0.4 }, { color: '#ffffff', width: 2, offset: 0 }];
    lines.forEach(line => {
        visCtx.beginPath(); visCtx.strokeStyle = line.color; visCtx.lineWidth = line.width;
        if(line.width === 2) { visCtx.shadowBlur = 10; visCtx.shadowColor = '#b388ff'; } else { visCtx.shadowBlur = 0; }
        for (let x = 0; x < 600; x++) { 
            let env = Math.sin((x / 600) * Math.PI); 
            let freq1 = Math.sin((x + visTick * 1.5) * 0.02) * 45; 
            let freq2 = Math.sin((x + visTick * 3.0) * 0.05) * 20; 
            let freq3 = Math.sin((x - visTick * 2.0) * 0.01) * 15; 
            let yOffset = Math.sin(x * 0.05 + visTick) * line.offset * 20; 
            let y = 150 + env * (freq1 + freq2 + freq3) + yOffset; 
            if (x === 0) visCtx.moveTo(x, y); else visCtx.lineTo(x, y); 
        }
        visCtx.stroke();
    });
    visCtx.shadowBlur = 0;
    if(isScanning) {
        const nextSampleX = sampledPoints.length * 30;
        if(scanX >= nextSampleX && nextSampleX < 600) {
            const sx = nextSampleX;
            const env  = Math.sin((sx / 600) * Math.PI);
            const freq1 = Math.sin((sx + visTick * 1.5) * 0.02) * 45;
            const freq2 = Math.sin((sx + visTick * 3.0) * 0.05) * 20;
            const freq3 = Math.sin((sx - visTick * 2.0) * 0.01) * 15;
            const sy = 150 + env * (freq1 + freq2 + freq3);
            sampledPoints.push({ x: sx, y: sy });
        }
        sampledPoints.forEach(pt => {
            if(pt.x >= scanX) return; 
            visCtx.fillStyle = 'rgba(0, 184, 148, 0.3)';
            visCtx.fillRect(pt.x - 2, pt.y, 4, 300 - pt.y);
            visCtx.fillStyle = '#00b894';
            visCtx.beginPath(); visCtx.arc(pt.x, pt.y, 5, 0, Math.PI*2); visCtx.fill();
            let qVal = Math.floor((300 - pt.y) / 9.6);
            if(qVal < 0) qVal = 0; if(qVal > 31) qVal = 31;
            const bin = qVal.toString(2).padStart(5, '0');
            visCtx.fillStyle = '#ffeaa7';
            visCtx.font = 'bold 12px "JetBrains Mono", monospace';
            visCtx.textAlign = 'center';
            visCtx.fillText(bin, pt.x, pt.y - 12);
        });
        visCtx.textAlign = 'left';
        visCtx.fillStyle = '#00cec9';
        visCtx.shadowColor = '#00cec9';
        visCtx.shadowBlur = 12;
        visCtx.fillRect(scanX, 0, 4, 300);
        visCtx.shadowBlur = 0;
        scanX += 3;
    }
    if(isScanning && scanX >= 600) {
        setTimeout(() => { isScanning = false; sampledPoints = []; }, 1000);
        scanX = 600; 
    }
    if(!isScanning) visTick += 1.5;
    requestAnimationFrame(drawWaveform);
}
if(visCanvas) drawWaveform();

window.startAudioScan = function() {
    if(isScanning) return;
    isScanning = true; scanX = 0; visTick = 100; sampledPoints = [];
};

// 🌟 [개별 기능] 실습 캔버스 (수동/자동/오디오 업로드)
const dCanvas = document.getElementById('drawCanvas'); 
const dCtx = dCanvas ? dCanvas.getContext('2d') : null; 
let isDrawing = false, drawnPath = [], currentMode = 'manual', currentSampleCount = 10, extractedQuantValues = [];
let audioCtx = null, originalAudioBuffer = null;
let mediaElementSource = null, analyser = null, animationId = null;

window.setMode = function(mode, btn) { 
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); currentMode = mode; 
    
    document.getElementById('sliderArea').style.display = 'none';
    document.getElementById('drawPanel').style.display = 'none'; 
    document.getElementById('rightPanel').style.display = 'none'; 
    document.getElementById('uploadModeArea').style.display = 'none'; 
    const legendBox = document.getElementById('autoLegendBox');
    if (legendBox) { legendBox.style.display = 'none'; legendBox.style.minHeight = ''; }
    const msgAreaRst = document.getElementById('autoMessageArea');
    if (msgAreaRst) { msgAreaRst.style.display = 'none'; msgAreaRst.style.marginTop = '10px'; msgAreaRst.style.minHeight = ''; }

    if(mode === 'manual') { 
        currentSampleCount = 10; 
        document.getElementById('rightPanelTitle').innerText = '2. 양자화 & 부호화 실습 (3비트)'; 
        document.getElementById('drawPanel').style.display = 'flex'; 
        document.getElementById('rightPanel').style.display = 'flex'; 
        document.getElementById('manualInputsArea').style.display = 'block'; 
        document.getElementById('autoMessageArea').style.display = 'none'; 
        
        const slider = document.getElementById('sampleSlider');
        slider.min = "16"; slider.max = "256"; slider.step = "8"; slider.value = "32";
        if(drawnPath.length > 20) doSampling(); 
    } else if (mode === 'auto') { 
        document.getElementById('sliderArea').style.display = 'flex'; 
        const slider = document.getElementById('sampleSlider');
        slider.min = "1"; slider.max = "5"; slider.step = "1"; slider.value = "3";
        currentSampleCount = 3;
        document.getElementById('sliderValDisplay').innerText = '3개/초';
        updateRightPanelTitle();
        const descEl = document.getElementById('sampleSliderDesc');
        if (descEl) descEl.innerHTML = `✂️ 1초에 <b>3번</b> 측정해요 → 1초 구간에 점 <b>3개</b>가 찍혀요. <span style="color:#aaa;font-size:0.78rem;margin-left:6px;">슬라이더를 움직여 차이를 확인해보세요!</span>`;
        document.getElementById('drawPanel').style.display = 'flex'; 
        document.getElementById('rightPanel').style.display = 'flex'; 
        document.getElementById('manualInputsArea').style.display = 'none'; 
        document.getElementById('autoMessageArea').style.display = 'none'; 
        if(drawnPath.length > 20) doSampling(); 
    } else if (mode === 'upload') {
        document.getElementById('sliderArea').style.display = 'none'; 
        document.getElementById('uploadModeArea').style.display = 'flex';
        stopRealtimeVisualization();
    } 
};

// ── 비트 심도 전역 변수 ──────────────────────────────────────────
let currentBitDepth = 3;
let uploadBitDepth  = 3;

// ── 비트 심도 설정 (자동 변환 모드) ──────────────────────────────
window.setBitDepth = function(bits) {
    currentBitDepth = bits;
    [2, 3, 4].forEach(b => {
        const btn = document.getElementById('bitBtn' + b);
        if (btn) btn.className = 'bit-btn' + (b === bits ? ' active-bit' : '');
    });
    const desc = document.getElementById('bitDepthDesc');
    if (desc) {
        const descs = {
            2: '🎚️ <b>2비트</b> = 소리를 딱 <b>4단계</b>로만 기록해요. 계단이 매우 커서 소리가 거칠게 끊겨요! <span style="color:#555;font-size:0.85rem;">왼쪽 그래프에서 격자가 4줄로 바뀌는 것을 확인해보세요!</span>',
            3: '🎵 <b>3비트</b> = 소리를 <b>8단계</b>로 기록해요. 단계 수가 4개→8개로 <b>2배 늘어나</b> 더 정밀하게 기록돼요! <span style="color:#555;font-size:0.85rem;">왼쪽/오른쪽 그래프에서 8줄 격자를 확인해보세요!</span>',
            4: '💿 <b>4비트</b> = 소리를 <b>16단계</b>로 기록해요. 단계 수가 8개→16개로 <b>2배 늘어나</b> 원음에 훨씬 가까워져요! <span style="color:#555;font-size:0.85rem;">2비트와 비교해보면 차이가 확 느껴져요!</span>'
        };
        desc.innerHTML = descs[bits];
    }
    updateCapacity();
    updateRightPanelTitle();
    // 왼쪽 캔버스 격자를 비트 심도에 맞게 즉시 갱신
    redrawDrawnPath();
    if (drawnPath.length > 20) doSampling();
};

// ── 비트 심도 설정 (업로드 모드) ────────────────────────────────
window.setUploadBitDepth = function(bits) {
    uploadBitDepth = bits;
    [3, 8, 16].forEach(b => {
        const btn = document.getElementById('uploadBitBtn' + b);
        if (btn) btn.className = 'bit-btn' + (b === bits ? ' active-bit' : '');
    });
    const labels = {
        3:  '🎵 <b>3비트</b> = 소리를 <b>8단계</b>로만 기록해요. 마치 계단처럼 뚝뚝 끊기는 소리가 납니다. <span style="color:#aaa;font-size:0.78rem;margin-left:4px;">버튼을 눌러 차이를 확인해보세요!</span>',
        8:  '🎮 <b>8비트</b> = 소리를 <b>256단계</b>로 기록해요. 옛날 게임 BGM 수준이에요. 3비트보다 훨씬 부드럽죠? <span style="color:#aaa;font-size:0.78rem;margin-left:4px;">16비트와도 비교해보세요!</span>',
        16: '💿 <b>16비트</b> = 소리를 <b>65,536단계</b>로 기록해요. 우리가 듣는 <b>CD 음질</b>이에요. 원본 파형과 거의 똑같아요! <span style="color:#aaa;font-size:0.78rem;margin-left:4px;">비트 수가 많을수록 원음에 가까워요!</span>'
    };
    const lbl = document.getElementById('uploadBitLabel');
    if (lbl) lbl.innerHTML = labels[bits];
    updateUploadCapacity();
    if (typeof originalAudioBuffer !== 'undefined' && originalAudioBuffer) applyResampling();
};

// ── 용량 계산 ────────────────────────────────────────────────────
function updateRightPanelTitle() {
    const el = document.getElementById('rightPanelTitle');
    if (!el) return;
    if (currentMode === 'auto') {
        el.innerText = `2. 디지털 파형 (1초에 ${currentSampleCount}개 표본화 · ${currentBitDepth}비트 양자화)`;
    } else {
        el.innerText = '2. 양자화 & 부호화 실습 (3비트)';
    }
}

function updateCapacity() {
    const el = document.getElementById('capCalc');
    if (!el) return;
    const total = currentSampleCount * currentBitDepth;
    if (currentMode === 'auto') {
        el.textContent = currentSampleCount + '개/초 × ' + currentBitDepth + '비트 = ' + total + '비트/초';
    } else {
        el.textContent = currentSampleCount + '개 × ' + currentBitDepth + '비트 = ' + total + '비트';
    }
}

function updateUploadCapacity() {
    const el = document.getElementById('uploadCapCalc');
    if (!el) return;
    const slider = document.getElementById('uploadSampleSlider');
    const rate   = slider ? parseInt(slider.value) : 44100;
    const total  = rate * uploadBitDepth;
    el.textContent = rate.toLocaleString('ko-KR') + ' × ' + uploadBitDepth + '비트 = ' + total.toLocaleString('ko-KR') + '비트/초';
}

window.onUploadSliderChange = function() {
    const val = parseInt(document.getElementById('uploadSampleSlider').value);
    const max = parseInt(document.getElementById('uploadSampleSlider').max);
    const formatted = val.toLocaleString('ko-KR');
    const isOriginal = (val === max);
    document.getElementById('uploadSliderValDisplay').innerText = val.toLocaleString('ko-KR');

    let label = '';
    if      (val >= 44100) label = '💿 CD 음질 — 1초에 44,100번 측정. 사람이 들을 수 있는 모든 소리를 담아냅니다';
    else if (val >= 28000) label = '🎵 FM 라디오 수준 — 1초에 약 30,000번 측정. 음악도 자연스럽게 들립니다';
    else if (val >= 16000) label = '🎙️ MP3(중간 품질) 수준 — 1초에 약 22,000번 측정. 약간 차이가 느껴집니다';
    else if (val >= 8000)  label = '📻 AM 라디오 수준 — 1초에 약 9,000번 측정. 소리가 뭉개지기 시작합니다';
    else if (val >= 5000)  label = '📟 옛날 유선전화 수준 — 목소리는 잘 들리지만 고음이 사라져 음악이 먹먹하게 들립니다';
    else if (val >= 200)   label = '🔇 매우 낮은 품질 — 소리가 심하게 뭉개져 거의 알아들을 수 없습니다';
    else                   label = '🔇 거의 무음 — 측정 횟수가 너무 적어 소리 정보가 거의 사라집니다';


    const qualityEl = document.getElementById('uploadQualityLabel');
    if (qualityEl) qualityEl.innerHTML = label;
    updateUploadCapacity();
};

window.onSliderChange = function() { 
    let sliderVal = parseInt(document.getElementById('sampleSlider').value); 
    document.getElementById('sliderValDisplay').innerText = sliderVal + '개/초'; 
    currentSampleCount = sliderVal; 
    updateRightPanelTitle();
    const descEl = document.getElementById('sampleSliderDesc');
    if (descEl && currentMode === 'auto') {
        const msgs = {
            1: `✂️ 1초에 <b>1번</b>만 측정해요 → 1초마다 점 <b>1개</b>. 아주 듬성듬성! <span style="color:#aaa;font-size:0.78rem;margin-left:6px;">1초 구간에 점이 딱 1개만 찍혀요!</span>`,
            2: `✂️ 1초에 <b>2번</b> 측정해요 → 1초마다 점 <b>2개</b>. 약간 더 정밀해요. <span style="color:#aaa;font-size:0.78rem;margin-left:6px;">1초 구간에 점 2개가 찍혀요!</span>`,
            3: `✂️ 1초에 <b>3번</b> 측정해요 → 1초마다 점 <b>3개</b>. 파형을 더 잘 표현해요. <span style="color:#aaa;font-size:0.78rem;margin-left:6px;">1개일 때와 비교해보세요!</span>`,
            4: `✂️ 1초에 <b>4번</b> 측정해요 → 1초마다 점 <b>4개</b>. 꽤 촘촘해졌어요! <span style="color:#aaa;font-size:0.78rem;margin-left:6px;">원래 파형과 비슷해지고 있어요!</span>`,
            5: `✂️ 1초에 <b>5번</b> 측정해요 → 1초마다 점 <b>5개</b>. 원래 파형에 가장 가까워요! <span style="color:#aaa;font-size:0.78rem;margin-left:6px;">1개와 많이 다르죠?</span>`
        };
        descEl.innerHTML = msgs[sliderVal] || msgs[3];
    }
    updateCapacity();
    if(drawnPath.length > 20) doSampling(); 
};

window.onUploadSliderRelease = function() { if (currentMode === 'upload') applyResampling(); };

window.handleAudioUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
            originalAudioBuffer = buffer;
            document.getElementById('uploadSliderGroup').style.opacity = '1';
            document.getElementById('uploadSliderGroup').style.pointerEvents = 'auto';
            document.getElementById('uploadControlGroup').style.opacity = '1';
            document.getElementById('uploadControlGroup').style.pointerEvents = 'auto';

            const maxRate = Math.floor(buffer.sampleRate);
            const slider = document.getElementById('uploadSampleSlider');
            slider.max   = maxRate; slider.value = maxRate;
            onUploadSliderChange();

            const qualityEl = document.getElementById('uploadQualityLabel');
            if (qualityEl && maxRate !== 44100) qualityEl.innerText = '💿 원본 음질 — 1초에 ' + maxRate.toLocaleString('ko-KR') + '번 측정';
            applyResampling();
        }, function(err) {
            if(typeof showCustomAlert === 'function') showCustomAlert("오류!", "오디오 파일을 읽는 데 실패했습니다. 다른 파일을 시도해주세요.");
        });
    };
    reader.readAsArrayBuffer(file);
};

function applyResampling() {
    if (!originalAudioBuffer || currentMode !== 'upload') return;
    const simulatedRate = parseInt(document.getElementById('uploadSampleSlider').value);
    const originalRate  = originalAudioBuffer.sampleRate;
    const degradedBuffer = audioCtx.createBuffer(originalAudioBuffer.numberOfChannels, originalAudioBuffer.length, originalRate);
    const step = originalRate / simulatedRate;

    for (let channel = 0; channel < originalAudioBuffer.numberOfChannels; channel++) {
        const inputData  = originalAudioBuffer.getChannelData(channel);
        const outputData = degradedBuffer.getChannelData(channel);
        let lastSampleIndex = 0, nextSampleIndex = step, lastSampleValue = inputData[0] || 0;
        let nextIdx = Math.min(Math.floor(nextSampleIndex), inputData.length - 1);
        let nextSampleValue = inputData[nextIdx] || 0;

        for (let i = 0; i < inputData.length; i++) {
            if (i >= nextSampleIndex) {
                lastSampleIndex = nextSampleIndex; lastSampleValue = nextSampleValue; nextSampleIndex += step;
                const nIdx = Math.min(Math.floor(nextSampleIndex), inputData.length - 1);
                nextSampleValue = inputData[nIdx] || 0;
            }
            const t = (i - lastSampleIndex) / step;
            const interpolated = lastSampleValue + (nextSampleValue - lastSampleValue) * t;
            const levels_q = Math.pow(2, uploadBitDepth);
            const step_q   = 2.0 / levels_q;
            outputData[i]  = Math.round(interpolated / step_q) * step_q;
        }
    }

    const wavBlob  = bufferToWave(degradedBuffer, originalRate);
    const audioUrl = URL.createObjectURL(wavBlob);
    const player   = document.getElementById('audioPlayer');
    const wasPlaying  = !player.paused && player.currentTime > 0;
    const savedTime   = player.currentTime;

    const onCanPlay = function() {
        player.removeEventListener('canplay', onCanPlay);
        if (savedTime > 0) { try { player.currentTime = savedTime; } catch(e) {} }
        if (wasPlaying) player.play().catch(function() {}); 
    };
    player.addEventListener('canplay', onCanPlay);
    player.src = audioUrl;
    setupRealtimeVisualization(player);
}

function setupRealtimeVisualization(player) {
    if (!audioCtx) return;
    if (!analyser) { analyser = audioCtx.createAnalyser(); analyser.fftSize = 2048; }
    if (!mediaElementSource) {
        try { mediaElementSource = audioCtx.createMediaElementSource(player); mediaElementSource.connect(analyser); analyser.connect(audioCtx.destination); } 
        catch (e) {}
    }
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    drawRealtimeWaveform();
}

function drawRealtimeWaveform() {
    if (currentMode !== 'upload') return;
    const canvas = document.getElementById('realtimeWaveCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width, height = canvas.height;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (currentMode !== 'upload') { cancelAnimationFrame(animationId); return; }
        animationId = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = '#1e272e'; ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 2; ctx.strokeStyle = '#00f5c4'; ctx.beginPath();
        const sliceWidth = width * 1.0 / bufferLength; let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0; const y = height / 2 - (v - 1.0) * (height / 2);
            if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(width, height / 2); ctx.stroke();
    }
    if(animationId) cancelAnimationFrame(animationId); draw();
}

function stopRealtimeVisualization() {
    if(animationId) { cancelAnimationFrame(animationId); animationId = null; }
    const player = document.getElementById('audioPlayer');
    if(player) player.pause();
}

function bufferToWave(abuffer, targetRate) {
    var numOfChan = abuffer.numberOfChannels, length = abuffer.length * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length), view = new DataView(buffer),
        channels = [], i, sample, offset = 0, pos = 0;
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66);
    setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(targetRate); 
    setUint32(targetRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); 
    setUint32(0x61746164); setUint32(length - pos - 4); 

    for(i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));
    while(pos < abuffer.length) {
        for(i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][pos]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0;
            view.setInt16(offset, sample, true); offset += 2;
        }
        pos++;
    }
    return new Blob([buffer], {type: "audio/wav"});
    function setUint16(data) { view.setUint16(offset, data, true); offset += 2; }
    function setUint32(data) { view.setUint32(offset, data, true); offset += 4; }
}

// 🌟 [핵심 보정 1] 높이 250px 확장 및 위아래 20px 패딩을 완벽하게 맞춘 배경 그리드
function drawGrid() { 
    dCtx.strokeStyle = '#dfe6e9'; dCtx.lineWidth = 1;
    
    // auto 모드: 비트 심도별 격자 (2비트=4줄, 3비트=8줄, 4비트=16줄)
    // manual 모드: 항상 8줄 (0~7)
    const levels    = (currentMode === 'auto') ? Math.pow(2, currentBitDepth) : 8;
    const stepYdraw = 210 / (levels - 1); // 캔버스 픽셀 간격

    for(let i = 0; i < levels; i++) { 
        let y = 230 - (i * stepYdraw);
        dCtx.strokeStyle = '#dfe6e9'; dCtx.lineWidth = 1;
        dCtx.beginPath(); dCtx.moveTo(25, y); dCtx.lineTo(395, y); dCtx.stroke(); 
        // 4비트(16줄)는 짝수 번호만 표시
        if (levels <= 8 || i % 2 === 0) {
            dCtx.fillStyle = '#b2bec3'; dCtx.font = 'bold 10px Inter'; dCtx.textAlign = 'left'; 
            dCtx.fillText(i, 5, y + 4); 
        }
    } 
    for(let i=0; i<=10; i++) { 
        let x = 25 + i * 37; 
        dCtx.strokeStyle = '#dfe6e9'; dCtx.lineWidth = 1;
        dCtx.beginPath(); dCtx.moveTo(x, 0); dCtx.lineTo(x, 250); dCtx.stroke(); 
        if(i > 0) { 
            dCtx.fillStyle = '#b2bec3'; dCtx.font = 'bold 10px Inter'; dCtx.textAlign = 'center'; 
            dCtx.fillText(i + '초', x, 245); 
        } 
    } 
    dCtx.strokeStyle = '#b2bec3'; dCtx.lineWidth = 2; 
    dCtx.beginPath(); dCtx.moveTo(25, 0); dCtx.lineTo(25, 250); dCtx.stroke(); 
    dCtx.beginPath(); dCtx.moveTo(25, 230); dCtx.lineTo(395, 230); dCtx.stroke(); 
}

// 🌟 [핵심 보정 2] 오른쪽 결과창의 그리드도 250px 높이에 맞춰 정밀 배치
// ── 오른쪽 그리드 메트릭 (buildRightGrid <-> setupQuantizationInputs 공유) ──
let rightGridM = { LP: 25, BP: 20, secW: 37, UH: 210 };

// ── 선형 보간: 파형 위 정확한 Y값 계산 ──────────────────────────
function getInterpolatedY(sortedPath, targetX) {
    if (!sortedPath || sortedPath.length === 0) return 115; // fallback
    // targetX 양쪽 점 탐색
    let left = null, right = null;
    for (let i = 0; i < sortedPath.length - 1; i++) {
        if (sortedPath[i].x <= targetX && sortedPath[i + 1].x >= targetX) {
            left  = sortedPath[i];
            right = sortedPath[i + 1];
            break;
        }
    }
    if (left && right && right.x !== left.x) {
        // 선형 보간
        const t = (targetX - left.x) / (right.x - left.x);
        return left.y + t * (right.y - left.y);
    }
    // fallback: 가장 가까운 점
    let closest = sortedPath[0], minDiff = Infinity;
    for (let pt of sortedPath) {
        const diff = Math.abs(pt.x - targetX);
        if (diff < minDiff) { minDiff = diff; closest = pt; }
    }
    return closest.y;
}

function buildRightGrid() { 
    const grid = document.getElementById('sampleGrid'); 
    if (!grid) return;

    // 컨테이너 실제 너비 측정 (0이면 fallback)
    const GW = grid.clientWidth  > 0 ? grid.clientWidth  : 420;
    const GH = grid.clientHeight > 0 ? grid.clientHeight : 250;

    // 기준(420×250) 대비 스케일
    const sX = GW / 420;
    const sY = GH / 250;

    const LP   = Math.round(35  * sX);   // 왼쪽 여백 (Y축 레이블 공간 확보)
    const BP   = Math.round(20  * sY);   // 아래 여백
    const topP = Math.round(20  * sY);   // 위 여백
    const UW   = GW - LP - Math.round(5 * sX); // 사용 가능 너비
    const UH   = GH - BP - topP;              // 사용 가능 높이
    const secW = UW / 10;                      // 초당 픽셀

    // 메트릭 저장 (setupQuantizationInputs에서 사용)
    rightGridM = { LP, BP, secW, UH, GH };

    // overflow 방지
    grid.style.overflow = 'hidden';

    const isAuto = (currentMode === 'auto');
    const levels = isAuto ? Math.pow(2, currentBitDepth) : 8;
    const stepY  = UH / (levels - 1);

    const lineColors  = { 2: '#e17055', 3: '#6c5ce7', 4: '#0984e3' };
    const lineColor   = isAuto ? (lineColors[currentBitDepth] || '#6c5ce7') : '#dfe6e9';
    const lineWidth_s = isAuto && currentBitDepth === 2 ? '2px' : '1px';
    const lineOpacity = isAuto ? (currentBitDepth === 2 ? '0.75' : currentBitDepth === 3 ? '0.55' : '0.45') : '1';

    grid.innerHTML = `<span style="position:absolute; top:-25px; left:0; font-size:11px; font-weight:900; color:#86868b;">진폭(Amplitude) ▲</span><span style="position:absolute; bottom:-20px; right:0; font-size:11px; font-weight:900; color:#86868b;">시간(Time) ▶</span>`;

    // 가로 격자선 (수평)
    for (let i = 0; i < levels; i++) { 
        const bottomPx = BP + i * stepY; 
        const line = document.createElement('div'); 
        line.style.cssText = `position:absolute; left:${LP}px; width:${UW}px; height:${lineWidth_s}; background:${lineColor}; opacity:${lineOpacity}; bottom:${bottomPx}px; z-index:1;`; 
        grid.appendChild(line); 
        if (!isAuto || currentBitDepth <= 3 || i % 2 === 0) {
            const label = document.createElement('span'); 
            const labelLeft = Math.round(LP - 22); // 격자선에서 22px 왼쪽 (2자리 숫자 공간 확보)
            label.style.cssText = `position:absolute; left:${labelLeft}px; font-size:${isAuto && currentBitDepth === 4 ? '8' : '10'}px; color:${isAuto ? lineColor : '#b2bec3'}; font-weight:700; bottom:${bottomPx - 4}px; z-index:2; opacity:0.9;`; 
            label.innerText = i; 
            grid.appendChild(label); 
        }
    }

    // auto 모드: 비트심도 배지 + 1초 구간 강조박스
    if (isAuto) {
        const badge = document.createElement('div');
        const badgeColors = { 2: '#e17055', 3: '#6c5ce7', 4: '#0984e3' };
        badge.style.cssText = `position:absolute; top:4px; right:8px; background:${badgeColors[currentBitDepth]}; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:20px; z-index:10;`;
        badge.innerText = { 2: '2비트 — 4단계', 3: '3비트 — 8단계', 4: '4비트 — 16단계' }[currentBitDepth];
        grid.appendChild(badge);
        const hlBox = document.createElement('div');
        hlBox.style.cssText = `position:absolute; left:${LP}px; width:${secW}px; top:0; bottom:${BP}px; background:rgba(108,92,231,0.05); border-left:2px dashed #6c5ce7; border-right:2px dashed #6c5ce7; z-index:0;`;
        grid.appendChild(hlBox);
        const hlLabel = document.createElement('span');
        hlLabel.style.cssText = `position:absolute; left:${LP + 3}px; top:2px; font-size:9px; color:#6c5ce7; font-weight:800; z-index:5;`;
        hlLabel.innerText = '← 1초 →';
        grid.appendChild(hlLabel);
    }

    // 세로 격자선 (초 단위)
    for (let i = 0; i <= 10; i++) { 
        const x = Math.round(LP + i * secW);
        const line = document.createElement('div'); 
        line.style.cssText = `position:absolute; bottom:0; height:100%; width:1px; background:#dfe6e9; left:${x}px; z-index:1;`; 
        grid.appendChild(line); 
        if (i > 0) { 
            const label = document.createElement('span'); 
            label.style.cssText = `position:absolute; left:${x}px; transform:translateX(-50%); font-size:10px; color:#b2bec3; font-weight:700; bottom:2px; z-index:2; white-space:nowrap;`; 
            label.innerText = i + '초'; 
            grid.appendChild(label); 
        } 
    } 
}

function redrawDrawnPath() { 
    dCtx.clearRect(0,0,420,250); drawGrid(); if(drawnPath.length === 0) return; 
    dCtx.beginPath(); dCtx.strokeStyle = '#6c5ce7'; dCtx.lineWidth = 4; dCtx.lineCap = 'round'; dCtx.lineJoin = 'round'; dCtx.moveTo(drawnPath[0].x, drawnPath[0].y); 
    for(let i=1; i<drawnPath.length; i++) { dCtx.lineTo(drawnPath[i].x, drawnPath[i].y); } dCtx.stroke(); 
}

window.initDrawCanvas = function() { 
    if(!dCtx) return;
    dCtx.clearRect(0,0,420,250); drawnPath = []; extractedQuantValues = []; drawGrid(); 
    document.getElementById('rightPanel').style.opacity = '0.5'; 
    document.getElementById('rightPanel').style.pointerEvents = 'none'; 
    const lbInit  = document.getElementById('autoLegendBox');
    const msgInit = document.getElementById('autoMessageArea');
    if (lbInit)  { lbInit.style.display  = 'none'; lbInit.style.minHeight  = ''; }
    if (msgInit) { msgInit.style.display = 'none'; msgInit.style.minHeight = ''; msgInit.style.marginTop = '10px'; }
    document.getElementById('quantInputs').innerHTML = ''; 
    document.getElementById('binInputs').innerHTML = ''; 
    buildRightGrid(); document.getElementById('drawHintBox').classList.remove('hidden'); 
};
window.resetDrawing = function() { window.initDrawCanvas(); };

// 🌟 [핵심 보정 3] 고해상도 모니터에서도 마우스 위치 밀림 방지
function getEventPos(e) { 
    const rect = dCanvas.getBoundingClientRect(); 
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // y 제한: 위로는 약 7.4 수준(y=8px), 아래로는 0 눈금(y=230px)까지만 그리기 허용
    const rawY = (clientY - rect.top) * (dCanvas.height / rect.height);
    return { 
        x: (clientX - rect.left) * (dCanvas.width / rect.width), 
        y: Math.min(230, Math.max(8, rawY)) 
    }; 
}

function startDraw(e) { 
    const pos = getEventPos(e); 
    if (pos.x > 27) { if(typeof showCustomAlert === 'function') showCustomAlert("주의!", "정확한 변환을 위해 파형은 반드시 왼쪽 끝 '0초' 위치 부근에서 시작해주세요."); isDrawing = false; return; } 
    isDrawing = true; drawnPath = []; redrawDrawnPath(); drawnPath.push(pos); document.getElementById('drawHintBox').classList.add('hidden'); 
}
function moveDraw(e) { 
    if(!isDrawing) return; 
    const pos = getEventPos(e);
    if(drawnPath.length > 0 && pos.x < drawnPath[drawnPath.length - 1].x) return;
    drawnPath.push(pos); 
    redrawDrawnPath(); 
}
function endDraw() { isDrawing = false; }
if(dCanvas) {
    dCanvas.addEventListener('mousedown', startDraw); window.addEventListener('mousemove', moveDraw); window.addEventListener('mouseup', endDraw);
    dCanvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); startDraw(e); }, {passive:false});
    window.addEventListener('touchmove', (e)=>{ if(isDrawing) e.preventDefault(); moveDraw(e); }, {passive:false});
    window.addEventListener('touchend', endDraw);
}

// 🌟 [핵심 보정 4] 250px 높이에 맞춘 양자화 계산 공식
window.doSampling = function() { 
    if(drawnPath.length < 20) { if(typeof showCustomAlert === 'function') showCustomAlert("주의!", "소리 파형을 연결해서 길게 그려주세요!"); return; } 
    let sortedPath = [...drawnPath].sort((a, b) => a.x - b.x); let maxX = sortedPath[sortedPath.length - 1].x; 
    if (maxX < 393) { if(typeof showCustomAlert === 'function') showCustomAlert("주의!", "완벽한 표본화를 위해 파형을 오른쪽 끝(10초)까지 그려주세요!<br><br>[다시 그리기]를 누르고 다시 시도해 보세요."); return; } 
    
    extractedQuantValues = []; redrawDrawnPath(); let sampleXPoints = []; 
    if (currentMode === 'manual') { 
        for(let i = 0; i <= currentSampleCount; i++) { sampleXPoints.push(25 + (i * 37)); } 
    } else { 
        // 1초에 currentSampleCount개, 10초 전체에 반복 (1초=37px)
        const dotSpacing = 37 / currentSampleCount;
        for(let sec = 0; sec < 10; sec++) {
            for(let s = 0; s < currentSampleCount; s++) {
                sampleXPoints.push(25 + sec * 37 + dotSpacing * (s + 0.5));
            }
        }
    } 
    
    let digitalPoints = [];
    let autoOriginalYs = []; // auto 모드: 원본 Y 좌표 별도 보관
    const stepY = 30;
    const autoBitLevels = Math.pow(2, currentBitDepth) - 1;
    const autoStepY = 210 / autoBitLevels;
    
    sampleXPoints.forEach((targetX) => { 
        // 선형 보간으로 파형 위 정확한 Y 계산
        const exactY = getInterpolatedY(sortedPath, targetX);
        let snappedY; 
        
        if (currentMode === 'manual') { 
            let qValue = Math.round((230 - exactY) / stepY); 
            if(qValue < 0) qValue = 0; if(qValue > 7) qValue = 7; 
            extractedQuantValues.push(qValue); 
            snappedY = 230 - (qValue * stepY); 
            // manual: 점선 + 빨간 점
            dCtx.strokeStyle = '#d63031'; dCtx.lineWidth = 1.5; dCtx.setLineDash([3, 3]); dCtx.beginPath(); dCtx.moveTo(targetX, 230); dCtx.lineTo(targetX, exactY); dCtx.stroke(); dCtx.setLineDash([]); 
            dCtx.fillStyle = '#d63031'; dCtx.beginPath(); dCtx.arc(targetX, exactY, 4, 0, Math.PI*2); dCtx.fill(); 
        } else { 
            let highQValue = Math.round((230 - exactY) / autoStepY); 
            if(highQValue < 0) highQValue = 0; if(highQValue > autoBitLevels) highQValue = autoBitLevels;
            snappedY = 230 - (highQValue * autoStepY);
            extractedQuantValues.push({ val: highQValue, max: autoBitLevels });
            autoOriginalYs.push({ x: targetX, y: exactY });
        } 
        digitalPoints.push({x: targetX, y: snappedY}); 
    }); 

    dCtx.setLineDash([]); 

    // ① 초록 계단선 먼저 그리기
    if(currentMode === 'auto') { 
        dCtx.beginPath(); dCtx.strokeStyle = '#00b894'; dCtx.lineWidth = 2.5; 
        for(let i = 0; i < digitalPoints.length; i++) { 
            if(i === 0) { dCtx.moveTo(digitalPoints[i].x, digitalPoints[i].y); } 
            else { dCtx.lineTo(digitalPoints[i].x, digitalPoints[i-1].y); dCtx.lineTo(digitalPoints[i].x, digitalPoints[i].y); } 
        } 
        dCtx.stroke(); 

        // ② 빨간 점을 초록선 위에 나중에 그리기 → 항상 보임
        dCtx.fillStyle = '#d63031';
        autoOriginalYs.forEach(({x, y}) => {
            dCtx.beginPath();
            dCtx.arc(x, y, 3.5, 0, Math.PI * 2);
            dCtx.fill();
        });
    } 
    setupQuantizationInputs(); 

    if (currentMode === 'auto') {
        const lbEl  = document.getElementById('autoLegendBox');
        const msgEl = document.getElementById('autoMessageArea');

        // 이미 정렬 완료된 상태면 그냥 표시만
        const alreadyAligned = lbEl && lbEl.style.minHeight !== '';

        if (alreadyAligned) {
            if (lbEl)  lbEl.style.display  = 'flex';
            if (msgEl) msgEl.style.display = 'flex';
        } else {
            // 첫 표시: visibility:hidden 상태로 레이아웃만 잡은 뒤 한번에 보여줌
            if (lbEl)  { lbEl.style.visibility  = 'hidden'; lbEl.style.display  = 'flex'; lbEl.style.minHeight  = ''; }
            if (msgEl) { msgEl.style.visibility = 'hidden'; msgEl.style.display = 'flex'; msgEl.style.minHeight = ''; msgEl.style.marginTop = '10px'; }

            // 레이아웃 확정 후 측정
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!lbEl || !msgEl) return;
                    // Y 정렬
                    const lbTop  = lbEl.getBoundingClientRect().top;
                    const msgTop = msgEl.getBoundingClientRect().top;
                    const diff   = lbTop - msgTop;
                    const currMT = parseFloat(getComputedStyle(msgEl).marginTop) || 0;
                    msgEl.style.marginTop = Math.max(0, currMT + diff) + 'px';
                    // 높이 동일화
                    const maxH = Math.max(lbEl.offsetHeight, msgEl.offsetHeight);
                    lbEl.style.minHeight  = maxH + 'px';
                    msgEl.style.minHeight = maxH + 'px';
                    // 이제 한번에 보여주기
                    lbEl.style.visibility  = '';
                    msgEl.style.visibility = '';
                });
            });
        }
    } else {
        const lb = document.getElementById('autoLegendBox');
        if (lb) lb.style.display = 'none';
    }
};

// 🌟 [핵심 보정 5] 오른쪽 박스에 생성되는 빨간 점과 막대기 높이 일치
function setupQuantizationInputs() { 
    const panel = document.getElementById('rightPanel'); panel.style.opacity = '1'; panel.style.pointerEvents = 'auto'; buildRightGrid(); 
    const grid = document.getElementById('sampleGrid'); const qRow = document.getElementById('quantInputs'); const bRow = document.getElementById('binInputs'); 
    qRow.innerHTML = ''; bRow.innerHTML = ''; currentLabCorrectCount = 0; 
    const stepY = 30; 
    
    extractedQuantValues.forEach((item, index) => {
        const val    = typeof item === 'object' ? item.val : item;
        const maxVal = typeof item === 'object' ? item.max : 7;
        let xPos;
        if(currentMode === 'manual') {
            // 세로 격자선(초 눈금)과 동일한 좌표 체계 사용 — 각 초 위치에 정확히 정렬
            xPos = rightGridM.LP + index * rightGridM.secW;
        } else {
            // rightGridM의 실제 스케일된 좌표 사용
            const sec      = Math.floor(index / currentSampleCount);
            const posInSec = index % currentSampleCount;
            xPos = rightGridM.LP + sec * rightGridM.secW + (rightGridM.secW / currentSampleCount) * (posInSec + 0.5);
        }
        if (currentMode === 'manual') {
            let bottomPx = 20 + (val * stepY);
            let dot = document.createElement('div'); dot.style.cssText = `position:absolute; width:10px; height:10px; background:#d63031; border-radius:50%; bottom:${bottomPx}px; left:${xPos}px; transform:translate(-50%, 50%); box-shadow:0 0 10px rgba(214, 48, 49, 0.6); z-index:3;`; 
            let bar = document.createElement('div'); bar.style.cssText = `position:absolute; background:rgba(108, 92, 231, 0.2); border:1px solid rgba(108, 92, 231, 0.4); border-bottom:none; border-radius:4px 4px 0 0; width:16px; height:${val * stepY}px; left:${xPos}px; bottom:20px; transform:translateX(-50%);`; 
            grid.appendChild(bar); grid.appendChild(dot); 
            
            let qInp = document.createElement('input'); qInp.type = 'text'; qInp.className = 'q-input'; qInp.maxLength = 1; qInp.style.left = xPos + 'px'; qInp.setAttribute('data-ans', val.toString()); qInp.placeholder = "?"; qInp.oninput = function() { checkLabInput(this); }; qRow.appendChild(qInp); 
            let bInp = document.createElement('input'); bInp.type = 'text'; bInp.className = 'b-input'; bInp.maxLength = 3; bInp.style.left = xPos + 'px'; let binStr = val.toString(2).padStart(3, '0'); bInp.setAttribute('data-ans', binStr); bInp.placeholder = "???"; bInp.oninput = function() { checkLabInput(this); }; bRow.appendChild(bInp); 
        } else {
            // rightGridM 기반 정확한 Y 위치 계산
            const dotPx        = currentSampleCount <= 1 ? 11 : currentSampleCount <= 2 ? 10 : currentSampleCount <= 3 ? 9 : currentSampleCount <= 4 ? 8 : 7;
            const exactBottomPx = rightGridM.BP + (val / maxVal) * rightGridM.UH;
            const dot = document.createElement('div');
            dot.style.cssText = `position:absolute; width:${dotPx}px; height:${dotPx}px; background:#d63031; border-radius:50%; left:${xPos}px; transform:translate(-50%, 50%); bottom:${exactBottomPx}px; z-index:3; box-shadow:0 0 5px rgba(214,48,49,0.5);`;
            grid.appendChild(dot);
        } 
    }); 
}

// 🌟 [개별 기능] 마이크 녹음 (MediaRecorder API)
let mediaRecorder = null;
let recordedChunks = [];
let recordingStream = null;

// 🎙️ 마이크 고지 모달 열기/닫기
window.openMicConsent = function() {
    const modal = document.getElementById('micConsentModal');
    if (modal) modal.style.display = 'flex';
};
window.closeMicConsent = function(agreed) {
    const modal = document.getElementById('micConsentModal');
    if (modal) modal.style.display = 'none';
    if (agreed) startRecording();
};

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                recordingStream = stream;
                recordedChunks = [];
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = function(e) {
                    if (e.data.size > 0) recordedChunks.push(e.data);
                };

                mediaRecorder.onstop = function() {
                    // 스트림 종료
                    recordingStream.getTracks().forEach(t => t.stop());

                    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                    const url  = URL.createObjectURL(blob);

                    // 기존 업로드 모드와 동일하게 처리
                    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

                    blob.arrayBuffer().then(function(ab) {
                        audioCtx.decodeAudioData(ab, function(buffer) {
                            originalAudioBuffer = buffer;

                            // 컨트롤 활성화
                            document.getElementById('uploadSliderGroup').style.opacity  = '1';
                            document.getElementById('uploadSliderGroup').style.pointerEvents = 'auto';
                            document.getElementById('uploadControlGroup').style.opacity = '1';
                            document.getElementById('uploadControlGroup').style.pointerEvents = 'auto';

                            const maxRate = Math.floor(buffer.sampleRate);
                            const slider  = document.getElementById('uploadSampleSlider');
                            slider.max   = maxRate;
                            slider.value = maxRate;
                            onUploadSliderChange();

                            const qualityEl = document.getElementById('uploadQualityLabel');
                            if (qualityEl) qualityEl.innerText = '🎙️ 녹음 완료 — 1초에 ' + maxRate.toLocaleString('ko-KR') + '번 측정';

                            // 플레이어에 녹음 오디오 연결
                            const player = document.getElementById('audioPlayer');
                            player.src   = url;
                            setupRealtimeVisualization(player);
                            applyResampling();
                        }, function() {
                            if (typeof showCustomAlert === 'function')
                                showCustomAlert("오류!", "녹음 파일을 읽는 데 실패했습니다. 다시 시도해주세요.");
                        });
                    });

                    // 버튼 원래대로
                    const btn = document.getElementById('recordBtn');
                    if (btn) {
                        btn.textContent = '🎙️ 녹음 시작';
                        btn.style.background = '#d63031';
                        btn.style.boxShadow  = '';
                        btn.style.animation  = '';
                    }
                };

                mediaRecorder.start();

                // 버튼 → 녹음 중 상태
                const btn = document.getElementById('recordBtn');
                if (btn) {
                    btn.textContent = '⏹️ 녹음 중지';
                    btn.style.background = '#b71c1c';
                    btn.style.boxShadow  = '0 0 0 4px rgba(214,48,49,0.3)';
                    btn.style.animation  = 'recPulse 1s ease-in-out infinite';
                }
            })
            .catch(function(err) {
                if (typeof showCustomAlert === 'function')
                    showCustomAlert("마이크 오류!", "마이크 접근 권한이 필요합니다.<br>브라우저 주소창의 🔒 아이콘을 클릭해 마이크를 허용해 주세요.");
            });
}

window.toggleRecording = function() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    } else {
        openMicConsent();
    }
};

window.checkLabInput = function(inp) { 
    const userVal = inp.value.trim(); const ansVal = inp.getAttribute('data-ans'); const totalRequiredInputs = currentMode === 'manual' ? (currentSampleCount + 1) * 2 : 0; 
    inp.classList.remove('input-error'); 
    if(userVal === ansVal) { 
        inp.classList.add('lab-input-correct'); inp.disabled = true; currentLabCorrectCount++; 
        if(currentLabCorrectCount === totalRequiredInputs) { if(typeof showCustomAlert === 'function') showCustomAlert("🎉 완벽합니다!", "양자화 및 부호화를 모두 성공했습니다!<br>이제 다음 단계 퀴즈로 넘어가세요.", "success"); } 
    } else if (userVal !== "") { 
        if(userVal.length >= ansVal.length) { inp.classList.add('input-error'); setTimeout(() => inp.classList.remove('input-error'), 400); } 
    } 
};

// 🌟 [개별 기능] PCM 3단계 애니메이션 (HiDPI 선명 버전)
(function() {
    const canvas = document.getElementById('pcmAnimCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const CSS_W = 900, CSS_H = 280;
    const dpr = Math.max(window.devicePixelRatio || 1, 3);
    canvas.width  = CSS_W * dpr; canvas.height = CSS_H * dpr;
    canvas.style.width  = '100%'; canvas.style.maxWidth = CSS_W + 'px'; canvas.style.height = 'auto';
    ctx.scale(dpr, dpr);
    const W = CSS_W, H = CSS_H, PAD = 48, WAVE_TOP = 52, WAVE_BOT = H - 64, INNER_W = W - PAD * 2, INNER_H = WAVE_BOT - WAVE_TOP, SAMPLES = 12, Y_LEVELS = 8;
    function analogY(nx) { const t = nx * Math.PI * 2.2; return 0.5 + 0.38 * Math.sin(t) * Math.cos(t * 0.4 + 0.5); }
    const sampleXs = Array.from({length: SAMPLES}, (_, i) => PAD + (i / (SAMPLES - 1)) * INNER_W);
    const sampleYs  = sampleXs.map(sx => analogY((sx - PAD) / INNER_W));
    const quantized  = sampleYs.map(y => Math.round(y * (Y_LEVELS - 1)));
    const encoded    = quantized.map(v => v.toString(2).padStart(3, '0'));
    function waveY(norm) { return WAVE_BOT - norm * INNER_H; }
    function gridY(qv)   { return WAVE_BOT - (qv / (Y_LEVELS - 1)) * INNER_H; }

    function drawBackground() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#334155'; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText('진폭', 16, WAVE_TOP + INNER_H / 2); ctx.textAlign = 'left';
        for (let i = 0; i <= Y_LEVELS - 1; i++) {
            const y = gridY(i);
            ctx.strokeStyle = i === 0 ? '#94a3b8' : '#cbd5e1'; ctx.lineWidth = i === 0 ? 1.5 : 0.8; ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD + 8, y); ctx.stroke();
            ctx.fillStyle = '#334155'; ctx.font = 'bold 12px JetBrains Mono, monospace'; ctx.textAlign = 'right'; ctx.fillText(i, PAD - 8, y + 4.5);
        }
        ctx.textAlign = 'left';
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PAD, WAVE_BOT); ctx.lineTo(W - PAD, WAVE_BOT); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(PAD, WAVE_TOP - 10); ctx.lineTo(PAD, WAVE_BOT); ctx.stroke();
        ctx.beginPath();
        for (let px = 0; px <= INNER_W; px++) { const y = waveY(analogY(px / INNER_W)); px === 0 ? ctx.moveTo(PAD + px, y) : ctx.lineTo(PAD + px, y); }
        ctx.strokeStyle = '#0984e3'; ctx.lineWidth = 2.5; ctx.shadowColor = 'rgba(9,132,227,0.25)'; ctx.shadowBlur = 3; ctx.stroke(); ctx.shadowBlur = 0;
    }

    let animFrame = null;
    function cancelAnim() { if (animFrame) { clearTimeout(animFrame); cancelAnimationFrame(animFrame); animFrame = null; } }

    // ── 표본화: 점+세로선이 왼쪽→오른쪽으로 하나씩 등장 ──
    function drawStep1() {
        cancelAnim();
        drawBackground();
        ctx.fillStyle = '#0984e3'; ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText('① 표본화 (Sampling) — 일정한 시간 간격으로 값을 추출합니다', PAD, 34);
        document.getElementById('pcmAnimLabel').textContent = '아날로그 파형을 ' + SAMPLES + '개의 시간 지점에서 측정합니다. 파란 점이 추출된 표본(샘플)입니다.';
        let i = 0;
        function drawNext() {
            if (i >= SAMPLES) return;
            const sx = sampleXs[i], sy = waveY(sampleYs[i]);
            ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(9,132,227,0.45)'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(sx, WAVE_BOT); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(sx, sy, 5.5, 0, Math.PI * 2); ctx.fillStyle = '#0984e3'; ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.stroke();
            i++;
            animFrame = setTimeout(drawNext, 120);
        }
        drawNext();
    }

    // ── 양자화: 빨간점 먼저, 그 다음 보라 화살표+점+숫자 순차 등장 ──
    function drawStep2() {
        cancelAnim();
        drawBackground();
        ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText('② 양자화 (Quantization) — 추출값을 가장 가까운 정수(0~7)로 반올림합니다', PAD, 34);
        document.getElementById('pcmAnimLabel').innerHTML = '<b><span style="color:#e74c3c;">빨간색 점(원래 값)</span> → 보라 점(반올림된 정수). 보라색 숫자(0~7)가 양자화된 정수값입니다.</b>';
        // 먼저 빨간 점 전부 그리기
        sampleXs.forEach((sx, i) => {
            const origY = waveY(sampleYs[i]);
            ctx.beginPath(); ctx.arc(sx, origY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ff0000'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();
        });
        // 그 다음 보라 점+화살표+숫자 순차 등장
        let i = 0;
        function drawNext() {
            if (i >= SAMPLES) return;
            const sx = sampleXs[i], origY = waveY(sampleYs[i]), qy = gridY(quantized[i]);
            if (Math.abs(origY - qy) > 3) {
                ctx.strokeStyle = '#a29bfe'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.moveTo(sx, origY + (qy > origY ? 5 : -5)); ctx.lineTo(sx, qy + (qy > origY ? -7 : 7)); ctx.stroke(); ctx.setLineDash([]);
                const dir = qy > origY ? 1 : -1;
                ctx.fillStyle = '#a29bfe'; ctx.beginPath(); ctx.moveTo(sx, qy); ctx.lineTo(sx - 4, qy - dir * 7); ctx.lineTo(sx + 4, qy - dir * 7); ctx.closePath(); ctx.fill();
            }
            ctx.beginPath(); ctx.arc(sx, qy, 5, 0, Math.PI * 2); ctx.fillStyle = '#6c5ce7'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.stroke();
            ctx.fillStyle = '#4527a0'; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(quantized[i], sx, qy - 10);
            ctx.textAlign = 'left';
            i++;
            animFrame = setTimeout(drawNext, 130);
        }
        animFrame = setTimeout(drawNext, 300);
    }

    // ── 부호화: 점 등장 후 이진수가 위→아래 비트 순서로 하나씩 나타남 ──
    function drawStep3() {
        cancelAnim();
        drawBackground();
        ctx.fillStyle = '#00b894'; ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText('③ 부호화 (Encoding) — 정수값을 3비트 이진수로 변환합니다', PAD, 34);
        document.getElementById('pcmAnimLabel').textContent = '정수값(점 위 숫자) → 아래 3비트 이진수. 초록=1, 회색=0. 예) 4 → 100, 6 → 110';
        // 먼저 점+정수값 전부
        sampleXs.forEach((sx, i) => {
            const qy = gridY(quantized[i]);
            ctx.strokeStyle = 'rgba(0,184,148,0.3)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx, qy + 6); ctx.lineTo(sx, WAVE_BOT + 6); ctx.stroke();
            ctx.beginPath(); ctx.arc(sx, qy, 5, 0, Math.PI * 2); ctx.fillStyle = '#00b894'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.stroke();
            ctx.fillStyle = '#065f46'; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(quantized[i], sx, qy - 9);
            ctx.textAlign = 'left';
        });
        // 이진수: 열(샘플) × 행(비트) 순서로 순차 등장
        const total = SAMPLES * 3;
        let idx = 0;
        function drawNextBit() {
            if (idx >= total) return;
            const si = Math.floor(idx / 3), bi = idx % 3;
            const sx = sampleXs[si];
            const bit = encoded[si][bi];
            ctx.fillStyle = bit === '1' ? '#059669' : '#94a3b8';
            ctx.font = 'bold 12px JetBrains Mono, monospace'; ctx.textAlign = 'center';
            ctx.fillText(bit, sx, WAVE_BOT + 16 + bi * 16);
            ctx.textAlign = 'left';
            idx++;
            animFrame = setTimeout(drawNextBit, 60);
        }
        animFrame = setTimeout(drawNextBit, 400);
    }

    window.pcmStep = function(n) {
        // 인라인 스타일 대신 CSS 클래스로 활성/비활성 전환
        ['pcmBtn1','pcmBtn2','pcmBtn3'].forEach((id, idx) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            if (idx + 1 === n) {
                btn.classList.add('pcm-active');
            } else {
                btn.classList.remove('pcm-active');
            }
        });
        if (n === 1) drawStep1(); else if (n === 2) drawStep2(); else drawStep3();
    };

    drawStep1();
})();