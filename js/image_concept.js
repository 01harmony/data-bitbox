// ── image_concept.js ─────────────────────────────────────────────
// [5단원: 이미지의 디지털 표현] 전용 스크립트

// 🌟 [설정] 5단원 고유 정보
const THIS_STEP = 5;
const STEP_TITLE = "5. 이미지의 디지털 표현";
const FILE_NAME_PREFIX = "이미지_개념";
const PASS_SCORE = 70;
const MEMO_KEY = "value_image_memo";
const REF_KEY = "value_image_reflection";

// ✅ 화면 진행 점 매핑
const stepDotMap = {
    'step1-visual':  0,
    'step2-concept': 1,
    'step3-advanced': 2,
    'step4-bitmap':  3,
    'step5-vector':  4,
    'step6-quiz':    5
};

// 🌟 [개별 기능] 특수 인라인 버튼 (HTML <b> 태그 지원 덮어쓰기)
window.revealInline = function(btn, text, color = 'var(--teal-main)') {
    const span = document.createElement('span');
    span.className = 'pop-anim revealed-text'; 
    span.style.color = color;
    span.style.borderColor = color; 
    span.style.fontWeight = '900';
    span.innerHTML = text; 
    btn.parentNode.replaceChild(span, btn);
};

// 🌟 [개별 기능] 1단계: 자율주행 자동차 및 신호등 애니메이션
const sCanvas = document.getElementById('sourceCanvas');
const sCtx = sCanvas ? sCanvas.getContext('2d', {willReadFrequently: true}) : null;
const lCanvas = document.getElementById('loupeCanvas');
const lCtx = lCanvas ? lCanvas.getContext('2d') : null;
const wrapper = document.getElementById('canvasWrapper');
if(lCtx) lCtx.imageSmoothingEnabled = false;

let trafficLight = 'EW_GREEN'; 
let car1X = -60, car2X = 640; 
let bikeY = 420; 
let tick = 0;
let isMag = false, mX = 0, mY = 0;

if(wrapper) {
    wrapper.addEventListener('mousedown', () => {
        trafficLight = (trafficLight === 'EW_GREEN') ? 'NS_GREEN' : 'EW_GREEN';
    });

    wrapper.addEventListener('mousemove', (e) => {
        const r = wrapper.getBoundingClientRect(); mX = e.clientX - r.left; mY = e.clientY - r.top;
        if(mX<0 || mY<0 || mX>620 || mY>400) { isMag = false; lCanvas.style.display = 'none'; return; }
        isMag = true; lCanvas.style.display = 'block';
        lCanvas.style.left = (mX - 140) + 'px'; lCanvas.style.top = (mY - 140) + 'px';
    });
    wrapper.addEventListener('mouseleave', () => { isMag = false; lCanvas.style.display = 'none'; });
}

function drawCity() {
    if(!sCtx) return;
    sCtx.clearRect(0, 0, 620, 400);
    sCtx.fillStyle = "#81ecec"; sCtx.fillRect(0,0,620,400); 
    sCtx.fillStyle = "#b8e994"; sCtx.fillRect(0,80,620,320); 

    sCtx.fillStyle = "#ffffff";
    sCtx.beginPath(); sCtx.arc(80, 40, 20, 0, Math.PI*2); sCtx.arc(100, 40, 25, 0, Math.PI*2); sCtx.arc(120, 40, 20, 0, Math.PI*2); sCtx.fill();
    sCtx.beginPath(); sCtx.arc(500, 50, 25, 0, Math.PI*2); sCtx.arc(530, 50, 30, 0, Math.PI*2); sCtx.arc(560, 50, 25, 0, Math.PI*2); sCtx.fill();

    sCtx.fillStyle = "#dcdde1"; 
    sCtx.fillRect(30, 80, 200, 100); sCtx.fillRect(390, 80, 200, 100);
    sCtx.fillRect(30, 260, 200, 120); sCtx.fillRect(390, 260, 200, 120);

    sCtx.fillStyle = "#353b48"; 
    sCtx.fillRect(0, 180, 620, 80); 
    sCtx.fillRect(230, 80, 160, 320); 

    sCtx.fillStyle = "#fbc531";
    for(let i=0; i<620; i+=40) { if(i<230 || i>390) sCtx.fillRect(i, 218, 20, 4); }
    for(let i=80; i<400; i+=40) { if(i<180 || i>260) sCtx.fillRect(308, i, 4, 20); }
    
    sCtx.fillStyle = "#f5f6fa";
    for(let i=190; i<250; i+=12) { sCtx.fillRect(235, i, 15, 6); sCtx.fillRect(370, i, 15, 6); }
    for(let i=245; i<305; i+=12) { sCtx.fillRect(i-10, 185, 6, 15); sCtx.fillRect(i-10, 240, 6, 15); }

    function drawTree(x, y) {
        sCtx.fillStyle = "#8d6e63"; sCtx.fillRect(x-4, y, 8, 25); 
        sCtx.fillStyle = "#10ac84"; 
        sCtx.beginPath(); sCtx.arc(x-10, y-5, 15, 0, Math.PI*2); sCtx.fill();
        sCtx.beginPath(); sCtx.arc(x+10, y-5, 15, 0, Math.PI*2); sCtx.fill();
        sCtx.beginPath(); sCtx.arc(x, y-15, 18, 0, Math.PI*2); sCtx.fill();
    }
    drawTree(210, 160); drawTree(410, 160); drawTree(210, 280); drawTree(410, 280);

    function drawBldg(x, y, w, h, baseC, roofC, text) {
        sCtx.fillStyle = baseC; sCtx.fillRect(x, y, w, h);
        sCtx.fillStyle = roofC; sCtx.fillRect(x, y, w, 25);
        sCtx.fillStyle = "#ffffff"; sCtx.font = "bold 12px Pretendard"; sCtx.fillText(text, x+10, y+18);
        sCtx.fillStyle = "rgba(255,255,255,0.4)";
        for(let i=x+15; i<x+w-15; i+=25) {
            for(let j=y+35; j<y+h-15; j+=20) { sCtx.fillRect(i, j, 12, 12); }
        }
    }
    drawBldg(50, 90, 120, 90, "#e17055", "#0984e3", "HOSPITAL 🚨"); 
    drawBldg(440, 90, 120, 90, "#74b9ff", "#0984e3", "POLICE 🚨"); 
    drawBldg(50, 270, 120, 90, "#ffeaa7", "#fdcb6e", "SCHOOL 🏫");
    drawBldg(440, 270, 120, 90, "#81ecec", "#00cec9", "MART 🛒");

    function drawTrafficLight(x, y, type) {
        sCtx.fillStyle = "#000000"; 
        sCtx.fillRect(x, y, 14, 30); 
        let redOn = false, greenOn = false;
        if(type === 'EW') { redOn = trafficLight==='NS_GREEN'; greenOn = trafficLight==='EW_GREEN'; }
        if(type === 'NS') { redOn = trafficLight==='EW_GREEN'; greenOn = trafficLight==='NS_GREEN'; }
        sCtx.fillStyle = redOn ? "#ff4757" : "#574b90"; sCtx.beginPath(); sCtx.arc(x+7, y+8, 4, 0, Math.PI*2); sCtx.fill();
        sCtx.fillStyle = greenOn ? "#2ed573" : "#574b90"; sCtx.beginPath(); sCtx.arc(x+7, y+22, 4, 0, Math.PI*2); sCtx.fill();
    }
    drawTrafficLight(210, 140, 'EW'); drawTrafficLight(395, 265, 'EW'); 
    drawTrafficLight(395, 140, 'NS'); drawTrafficLight(210, 265, 'NS'); 

    let car1Stop = (trafficLight === 'NS_GREEN' && car1X > 150 && car1X < 180);
    if(!car1Stop) car1X += 1.5; if(car1X > 640) car1X = -60;
    
    let car2Stop = (trafficLight === 'NS_GREEN' && car2X < 470 && car2X > 440);
    if(!car2Stop) car2X -= 1.2; if(car2X < -60) car2X = 640;

    let bikeStop = (trafficLight === 'EW_GREEN' && bikeY < 280 && bikeY > 260);
    if(!bikeStop) bikeY -= 1; if(bikeY < 60) bikeY = 420;

    sCtx.fillStyle = "#0984e3"; sCtx.fillRect(car1X, 190, 45, 22); 
    sCtx.fillStyle = "rgba(255,255,255,0.7)"; sCtx.fillRect(car1X+30, 192, 10, 18); 
    
    sCtx.fillStyle = "#d63031"; sCtx.fillRect(car2X, 228, 50, 22); 
    sCtx.fillStyle = "rgba(255,255,255,0.7)"; sCtx.fillRect(car2X+10, 230, 12, 18);

    sCtx.fillStyle = "#2ed573"; sCtx.beginPath(); sCtx.arc(265, bikeY, 6, 0, Math.PI*2); sCtx.fill(); 
    sCtx.fillStyle = "#f368e0"; sCtx.fillRect(262, bikeY+6, 6, 12); 

    tick++;
    if(isMag) updateLoupe();
    requestAnimationFrame(drawCity);
}
if(sCanvas) drawCity();

function updateLoupe() {
    lCtx.clearRect(0, 0, 280, 280); lCtx.save();
    lCtx.beginPath(); lCtx.arc(140, 140, 136, 0, Math.PI * 2); lCtx.clip();

    const zoom = 15; const capSize = 280 / zoom; 
    lCtx.drawImage(sCanvas, mX - capSize/2, mY - capSize/2, capSize, capSize, 0, 0, 280, 280);

    lCtx.strokeStyle = 'rgba(0,0,0,0.15)'; lCtx.lineWidth = 1;
    for(let i=0; i<=280; i+=zoom) { lCtx.beginPath(); lCtx.moveTo(i,0); lCtx.lineTo(i,280); lCtx.stroke(); lCtx.beginPath(); lCtx.moveTo(0,i); lCtx.lineTo(280,i); lCtx.stroke(); }

    lCtx.strokeStyle = '#ff2d55'; lCtx.lineWidth = 4;
    lCtx.strokeRect(140 - (zoom/2), 140 - (zoom/2), zoom, zoom);

    const pixel = sCtx.getImageData(mX, mY, 1, 1).data;
    const r = pixel[0].toString(2).padStart(8, '0');
    const g = pixel[1].toString(2).padStart(8, '0');
    const b = pixel[2].toString(2).padStart(8, '0');

    lCtx.fillStyle = 'rgba(0, 0, 0, 0.85)'; lCtx.fillRect(0, 160, 280, 120);
    
    lCtx.font = 'bold 11px Inter'; lCtx.fillStyle = '#fbc531'; lCtx.textAlign = 'center';
    lCtx.fillText('24비트 트루 컬러 데이터', 140, 180);

    lCtx.font = 'bold 12px Inter'; lCtx.fillStyle = '#ffffff';
    lCtx.fillText(`RGB (${pixel[0]}, ${pixel[1]}, ${pixel[2]})`, 140, 202);
    
    lCtx.font = 'bold 14px monospace';
    lCtx.fillStyle = '#ff7675'; lCtx.fillText(`R: ${r}`, 140, 225);
    lCtx.fillStyle = '#55efc4'; lCtx.fillText(`G: ${g}`, 140, 245);
    lCtx.fillStyle = '#74b9ff'; lCtx.fillText(`B: ${b}`, 140, 265);
    lCtx.restore();
}

// 🌟 [개별 기능] 커스텀 화면 이동 로직
window.goStep = function(id) {
    const current = document.querySelector('.step-container.active');
    const next = document.getElementById(id);
    if(current === next) return;

    current.style.opacity = '0'; 
    
    const currentNum = parseInt(current.id.match(/\d+/)[0]);
    const nextNum = parseInt(id.match(/\d+/)[0]);
    
    current.style.transform = (nextNum > currentNum) ? 'translateX(-20px)' : 'translateX(20px)';
    
    setTimeout(() => {
        current.classList.remove('active'); next.classList.add('active');
        
        if(id === 'step3-advanced' && currentMode === 'custom') {
            makeGrid(); 
        } else if(id === 'step3-advanced' && currentMode === 'hd') {
            drawAppleOnLeft();
            updateResultCanvas();
        } else if(id === 'step4-bitmap') {
            setBitDepth(currentBitDepth); 
        } else if(id === 'step5-vector') {
            updateVector(); 
        }

        setTimeout(() => { next.style.opacity = '1'; next.style.transform = 'translateX(0)'; }, 50);
        
        if (typeof updateDots === 'function') {
            updateDots(stepDotMap[id]);
        }
    }, 400); 
};

// 🌟 [개별 기능] 실습 패널 (비트맵 해상도 조절)
let gridData = []; 
let currentW = 16, currentH = 16;
let currentMode = 'custom'; 
let isInitialLoad = true;
let uploadedPhotoImg = null; // 📸 업로드된 사진 이미지 객체

// 📸 파일 선택 핸들러
window.handlePhotoUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    loadPhotoFile(file);
};

// 📸 드래그&드롭 핸들러
window.handlePhotoDrop = function(event) {
    event.preventDefault();
    const dropZone = document.getElementById('photoDropZone');
    dropZone.style.borderColor = '#a29bfe';
    dropZone.style.background = '#f8f6ff';
    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    loadPhotoFile(file);
};

// 📸 공통 이미지 로드 함수
function loadPhotoFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            uploadedPhotoImg = img;

            // 왼쪽 원본 캔버스에 표시
            // canvas 픽셀 버퍼 = 원본 해상도 그대로, CSS 표시 크기만 300px 이내
            const leftCanvas = document.getElementById('leftPhotoCanvas');
            const lCtx = leftCanvas.getContext('2d');
            const displayScale = Math.min(300 / img.width, 300 / img.height);
            const displayW = Math.round(img.width * displayScale);
            const displayH = Math.round(img.height * displayScale);
            leftCanvas.width  = img.width;
            leftCanvas.height = img.height;
            leftCanvas.style.width  = displayW + 'px';
            leftCanvas.style.height = displayH + 'px';
            lCtx.imageSmoothingEnabled = true;
            lCtx.imageSmoothingQuality = 'high';
            lCtx.drawImage(img, 0, 0, img.width, img.height);

            // 드롭존 숨기고 프리뷰 표시
            document.getElementById('photoDropZone').style.display = 'none';
            const previewWrap = document.getElementById('photoPreviewWrap');
            previewWrap.style.display = 'flex';

            // 원본 해상도 라벨
            const label = document.getElementById('photoInfoLabel');
            label.textContent = `📌 원본 (${img.width} × ${img.height} px)`;

            // 📸 슬라이더: 원본 해상도에서 시작 → 낮추는 탐구
            const originalMaxDim = Math.max(img.width, img.height);
            const PHOTO_SLIDER_MAX = Math.min(originalMaxDim, 1200); // 원본이 상한
            const slider = document.getElementById('resSlider');
            slider.min = 4;
            slider.max = PHOTO_SLIDER_MAX;
            slider.value = PHOTO_SLIDER_MAX; // 원본 해상도에서 출발
            const minLp = document.getElementById('sliderMinLabel');
            const maxLp = document.getElementById('sliderMaxLabel');
            if (minLp) minLp.textContent = '4×4 픽셀 (극저해상도)';
            if (maxLp) maxLp.textContent = uploadedPhotoImg.width + '×' + uploadedPhotoImg.height + ' 픽셀 (원본 해상도)';

            updateResultCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.switchMode = function(mode) {
    currentMode = mode;
    document.querySelectorAll('#modeCustom, #modeHD, #modePhoto').forEach(b => b.classList.remove('active'));
    
    const descText = document.getElementById('modeDescText');

    // 왼쪽 입력 패널 배경을 탭마다 다르게
    const leftPanel = document.querySelector('#step3-advanced .pixel-workspace .panel:first-child');
    if (leftPanel) {
        const panelBg = {
            custom: `#ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M 16 0 L 0 0 0 16' fill='none' stroke='%23e8e4f8' stroke-width='0.8'/%3E%3C/svg%3E")`,
            hd:     'linear-gradient(160deg, #eef2ff 0%, #e0e7ff 100%)',
            photo:  'linear-gradient(160deg, #fdf4ff 0%, #f3e8ff 100%)'
        };
        leftPanel.style.background = panelBg[mode] || '#fafafa';
    }

    if(mode === 'custom') {
        document.getElementById('modeCustom').classList.add('active');
        descText.innerHTML = "'내가 그린 픽셀 아트' 모드를 선택했습니다. 캔버스에 직접 그림을 그리고 우측 슬라이더로 해상도를 조절해 보세요.";
        
        document.getElementById('customSettings').style.display = 'flex';
        document.getElementById('hdSettings').style.display = 'none';
        document.getElementById('customUI').style.display = 'block';
        document.getElementById('hdUI').style.display = 'none';
        document.getElementById('photoUI').style.display = 'none';
        
        const maxPx = Math.max(currentW, currentH);
        document.getElementById('resSlider').max = maxPx;
        document.getElementById('resSlider').value = maxPx;
        const minL = document.getElementById('sliderMinLabel');
        const maxL = document.getElementById('sliderMaxLabel');
        if (minL) minL.textContent = '4×4 픽셀 (저해상도)';
       if (maxL) maxL.textContent = maxPx + '×' + maxPx + ' 픽셀 (고해상도)';
        makeGrid();
    } else if(mode === 'hd') {
        document.getElementById('modeHD').classList.add('active');
        descText.innerHTML = "'고해상도 비트맵 원본' 모드입니다. 원본은 고해상도 <b>비트맵</b>으로 저장된 이미지입니다. 우측 슬라이더로 해상도(픽셀 수)를 줄여가며 <b>계단 현상</b>이 나타나는 과정을 관찰하세요.";
        
        document.getElementById('customSettings').style.display = 'none';
        document.getElementById('hdSettings').style.display = 'block';
        document.getElementById('customUI').style.display = 'none';
        document.getElementById('hdUI').style.display = 'flex';
        document.getElementById('photoUI').style.display = 'none';
        
        document.getElementById('resSlider').max = 300;
        document.getElementById('resSlider').value = 300;
        const minLhd = document.getElementById('sliderMinLabel');
        const maxLhd = document.getElementById('sliderMaxLabel');
        if (minLhd) minLhd.textContent = '4×4 픽셀 (저해상도)';
        if (maxLhd) maxLhd.textContent = '300×300 픽셀 (원본 고해상도)';
        
        drawAppleOnLeft(); 
        updateResultCanvas();
    } else if(mode === 'photo') {
        document.getElementById('modePhoto').classList.add('active');
        descText.innerHTML = "📸 <b>'내 사진으로 해상도 실험!'</b> 모드입니다. 직접 찍은 사진을 업로드하고, 슬라이더로 해상도를 낮추면 어떻게 변하는지 관찰하세요!";
        
        document.getElementById('customSettings').style.display = 'none';
        document.getElementById('hdSettings').style.display = 'none';
        document.getElementById('customUI').style.display = 'none';
        document.getElementById('hdUI').style.display = 'none';
        document.getElementById('photoUI').style.display = 'flex';

        // 이미 업로드된 사진이 있으면 → 프리뷰 표시 + 슬라이더 복원
        if (uploadedPhotoImg) {
            document.getElementById('photoDropZone').style.display = 'none';
            document.getElementById('photoPreviewWrap').style.display = 'flex';

            const originalMaxDim = Math.max(uploadedPhotoImg.width, uploadedPhotoImg.height);
            const PHOTO_SLIDER_MAX = Math.min(originalMaxDim, 1200);
            const slider = document.getElementById('resSlider');
            slider.min = 4;
            slider.max = PHOTO_SLIDER_MAX;
            slider.value = PHOTO_SLIDER_MAX;
            const minLp = document.getElementById('sliderMinLabel');
            const maxLp = document.getElementById('sliderMaxLabel');
            if (minLp) minLp.textContent = '4×4 픽셀 (극저해상도)';
            if (maxLp) maxLp.textContent = uploadedPhotoImg.width + '×' + uploadedPhotoImg.height + ' 픽셀 (원본 해상도)';
            updateResultCanvas();
        } else {
            // 사진 없음 → 드롭존 표시, 출력 캔버스 안내문
            document.getElementById('photoDropZone').style.display = 'flex';
            document.getElementById('photoPreviewWrap').style.display = 'none';

            const resCanvas = document.getElementById('resultCanvas');
            const rCtx = resCanvas.getContext('2d');
            resCanvas.width = 300; resCanvas.height = 300;
            resCanvas.style.width = '300px'; resCanvas.style.height = '300px';
            rCtx.fillStyle = '#f8f6ff';
            rCtx.fillRect(0, 0, 300, 300);
            rCtx.fillStyle = '#a29bfe';
            rCtx.font = 'bold 15px sans-serif';
            rCtx.textAlign = 'center';
            rCtx.fillText('📸 사진을 업로드하면', 150, 135);
            rCtx.fillText('여기에 결과가 나타납니다!', 150, 162);
            const chip = document.getElementById('resValueDisplay');
            if (chip) { chip.style.display = 'none'; }
        }
    }
};

window.drawBeautifulApple = function(ctx, x, y, scale) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.lineWidth = 14; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#8b4513"; ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(-5, -100, 15, -100, 10, -70); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#34c759"; ctx.beginPath(); ctx.moveTo(5, -80); ctx.bezierCurveTo(30, -105, 55, -95, 60, -75); ctx.bezierCurveTo(50, -60, 25, -65, 5, -80); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ff2d55"; ctx.beginPath(); ctx.moveTo(0, -65); ctx.bezierCurveTo(40, -75, 85, -50, 85, 0); ctx.bezierCurveTo(85, 60, 40, 95, 0, 95); ctx.bezierCurveTo(-40, 95, -85, 60, -85, 0); ctx.bezierCurveTo(-85, -50, -40, -75, 0, -65); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
};

window.drawAppleOnLeft = function() {
    const c = document.getElementById('leftHdCanvas');
    const ctx = c.getContext('2d');
    ctx.clearRect(0,0,300,300);
    drawBeautifulApple(ctx, 150, 150, 1.3); 
};

window.updateColorBin = function() {
    const hex = document.getElementById('colorPicker').value;
    const r = parseInt(hex.substr(1,2), 16).toString(2).padStart(8, '0');
    const g = parseInt(hex.substr(3,2), 16).toString(2).padStart(8, '0');
    const b = parseInt(hex.substr(5,2), 16).toString(2).padStart(8, '0');
    document.getElementById('binDisplay').innerHTML = `<span style="color:#ff7675">R:<br>${r}</span><br><span style="color:#55efc4">G:<br>${g}</span><br><span style="color:#74b9ff">B:<br>${b}</span>`;
};

window.makeGrid = function() {
    // 모눈종이 배경 — 초기 로드 시에도 적용
    const leftPanel = document.querySelector('#step3-advanced .pixel-workspace .panel:first-child');
    if (leftPanel) leftPanel.style.background = `#ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M 16 0 L 0 0 0 16' fill='none' stroke='%23e8e4f8' stroke-width='0.8'/%3E%3C/svg%3E")`;

    currentW = parseInt(document.getElementById('cWidth').value) || 16;
    currentH = parseInt(document.getElementById('cHeight').value) || 16;
    if(currentW > 50) { currentW = 50; document.getElementById('cWidth').value = 50; }
    if(currentH > 50) { currentH = 50; document.getElementById('cHeight').value = 50; }
    if(currentW < 4) { currentW = 4; document.getElementById('cWidth').value = 4; }
    if(currentH < 4) { currentH = 4; document.getElementById('cHeight').value = 4; }
    
    const grid = document.getElementById('drawGrid');
    grid.style.gridTemplateColumns = `repeat(${currentW}, 1fr)`;
    grid.innerHTML = '';

    // ── 컨테이너 크기: 항상 정사각형 셀이 되도록 W:H 비율로 계산 ──
    const MAX_BOX = 300;   // 허용 최대 픽셀
    let boxW, boxH;
    if (currentW >= currentH) {
        boxW = MAX_BOX;
        boxH = Math.round(MAX_BOX * currentH / currentW);
    } else {
        boxH = MAX_BOX;
        boxW = Math.round(MAX_BOX * currentW / currentH);
    }
    const container = document.getElementById('gridContainer');
    if (container) {
        container.style.width  = boxW + 'px';
        container.style.height = boxH + 'px';
    }

    // 🌟 [수정 포인트 1] 초기 로드(16x16) 외에는 무조건 입력된 가로*세로 크기만큼 배열 생성
    if(isInitialLoad && currentW === 16 && currentH === 16) {
        const layout = [
            "WWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWW", "WWWWKKWWWWKKWWWW", "WWWKRRKWWKRRKWWW",
            "WWKRRRRKKRRRRKWW", "WKRRPRRRRRRRRRKW", "WKRRPRRRRRRRRRKW", "WKRRRRRRRRRRRRKW",
            "WKRRRRRRRRRRRRKW", "WWKRRRRRRRRRRKWW", "WWWKRRRRRRRRKWWW", "WWWWKRRRRRRKWWWW",
            "WWWWWKRRRRKWWWWW", "WWWWWWKRRKWWWWWW", "WWWWWWWKKWWWWWWW", "WWWWWWWWWWWWWWWW"
        ];
        const cMap = {'W':'#ffffff', 'K':'#000000', 'R':'#ff2d55', 'P':'#ffb6c1'};
        gridData = [];
        for(let y=0; y<16; y++) {
            for(let x=0; x<16; x++) { gridData.push(cMap[layout[y][x]]); }
        }
        isInitialLoad = false;
    } else {
        gridData = Array(currentW * currentH).fill('#ffffff');
    }

    for(let i=0; i<currentW * currentH; i++) {
        let cell = document.createElement('div');
        cell.className = 'draw-cell'; cell.dataset.index = i;
        cell.style.background = gridData[i];
        const paint = () => { const hex = document.getElementById('colorPicker').value; cell.style.background = hex; gridData[i] = hex; updateResultCanvas(); };
        cell.onmousedown = paint;
        cell.onmouseenter = (e) => { if(e.buttons === 1) paint(); };
        grid.appendChild(cell);
    }

    // 슬라이더: 가장 긴 축 기준
    const maxDimension = Math.max(currentW, currentH);
    document.getElementById('resSlider').max = maxDimension;
    document.getElementById('resSlider').value = maxDimension;
    
    updateResultCanvas();
};

window.updateResultCanvas = function() {
    const resCanvas = document.getElementById('resultCanvas');
    const rCtx = resCanvas.getContext('2d');
    rCtx.imageSmoothingEnabled = false; 

    const sliderVal = parseInt(document.getElementById('resSlider').value);
    const slider = document.getElementById('resSlider');
    const sliderMax = parseInt(slider.max) || 50;

    // 🌟 [수정 포인트 3] 직사각형 비율을 반영하여 출력 캔버스 배율 계산
    let outW, outH;
    if (currentMode === 'custom') {
        const ratio = currentW / currentH;
        if (currentW >= currentH) {
            outW = sliderVal;
            outH = Math.round(sliderVal / ratio);
        } else {
            outH = sliderVal;
            outW = Math.round(sliderVal * ratio);
        }
    } else if (currentMode === 'photo' && uploadedPhotoImg) {
        const ratio = uploadedPhotoImg.width / uploadedPhotoImg.height;
        if (ratio >= 1) {
            outW = sliderVal;
            outH = Math.round(sliderVal / ratio);
        } else {
            outH = sliderVal;
            outW = Math.round(sliderVal * ratio);
        }
    } else {
        outW = sliderVal; outH = sliderVal; // HD 모드는 무조건 1:1
    }

    // 상단 칩 텍스트 업데이트
    const modeLabel = `${outW} × ${outH} 픽셀`;
    const chip = document.getElementById('resValueDisplay');
    if (chip) {
        if (currentMode === 'photo') {
            chip.style.display = 'none'; // photo 모드는 칩 숨김
        } else {
            chip.style.display = '';
            chip.textContent = modeLabel;
            chip.classList.remove('bump');
            void chip.offsetWidth;
            chip.classList.add('bump');
            setTimeout(() => chip.classList.remove('bump'), 200);
        }
    }

    // 슬라이더 최대값 라벨 동기화
    const maxL = document.getElementById('sliderMaxLabel');
    if (maxL) {
        if (currentMode === 'hd') maxL.textContent = '300×300 픽셀 (원본 고해상도)';
        else if (currentMode === 'photo' && uploadedPhotoImg) {
            const origDim = Math.max(uploadedPhotoImg.width, uploadedPhotoImg.height);
            maxL.textContent = uploadedPhotoImg.width + '×' + uploadedPhotoImg.height + ' 픽셀 (원본 해상도)';
        } else {
             // 최대 크기일 때의 실제 WxH 텍스트 표시
             let maxW, maxH;
             const ratio = currentW / currentH;
             if (currentW >= currentH) { maxW = sliderMax; maxH = Math.round(sliderMax / ratio); }
             else { maxH = sliderMax; maxW = Math.round(sliderMax * ratio); }
             maxL.textContent = maxW + '×' + maxH + ' 픽셀 (고해상도)';
        }
    }
    
    const wrap = document.getElementById('resultCanvasWrap');
    if (wrap) {
        wrap.classList.remove('pulsing');
        void wrap.offsetWidth;
        wrap.classList.add('pulsing');
        setTimeout(() => wrap.classList.remove('pulsing'), 500);
    }

    // ── 출력 캔버스 크기 설정 ──
    // photo 모드: 캔버스 내부 해상도 = outW×outH (원본 픽셀 그대로),
    //             CSS 표시 크기만 300px 이내로 축소 → 원본일 때 선명하게 보임
    // custom·hd: 기존 방식 유지 (픽셀 아트는 내부=표시 크기 동일해야 계단현상 보임)
    const DISPLAY_MAX = 300;
    let canvasDisplayW, canvasDisplayH;
    let internalW, internalH; // 캔버스 픽셀 버퍼 크기

    if (currentMode === 'photo' && uploadedPhotoImg) {
        // 내부 해상도 = 슬라이더 값(outW×outH)
        internalW = outW; internalH = outH;
        // CSS 표시 크기 = 항상 300px 이내 (비율 유지)
        const dispScale = Math.min(DISPLAY_MAX / outW, DISPLAY_MAX / outH);
        canvasDisplayW = Math.round(outW * dispScale);
        canvasDisplayH = Math.round(outH * dispScale);
    } else if (currentMode === 'hd') {
        internalW = canvasDisplayW = DISPLAY_MAX;
        internalH = canvasDisplayH = DISPLAY_MAX;
    } else if (currentW >= currentH) {
        internalW = canvasDisplayW = DISPLAY_MAX;
        internalH = canvasDisplayH = Math.round(DISPLAY_MAX * currentH / currentW);
    } else {
        internalH = canvasDisplayH = DISPLAY_MAX;
        internalW = canvasDisplayW = Math.round(DISPLAY_MAX * currentW / currentH);
    }

    resCanvas.width  = internalW;
    resCanvas.height = internalH;
    resCanvas.style.width  = canvasDisplayW + 'px';
    resCanvas.style.height = canvasDisplayH + 'px';

    // ⚠️ canvas.width 재설정 시 컨텍스트 초기화 → 다시 설정
    rCtx.imageSmoothingEnabled = false;

    // wrapper도 CSS 표시 크기로 맞춤
    const resWrap = document.getElementById('resultCanvasWrap');
    if (resWrap) {
        resWrap.style.width  = canvasDisplayW + 'px';
        resWrap.style.height = canvasDisplayH + 'px';
    }

    rCtx.clearRect(0, 0, internalW, internalH);

    // 중간 변환 캔버스 (sliderVal 픽셀 수로 다운샘플)
    const downCanvas = document.createElement('canvas');
    downCanvas.width = outW; downCanvas.height = outH;
    const dCtx = downCanvas.getContext('2d');
    dCtx.imageSmoothingEnabled = false;

    if(currentMode === 'custom') {
        const offCanvas = document.createElement('canvas'); 
        offCanvas.width = currentW; offCanvas.height = currentH;
        const oCtx = offCanvas.getContext('2d');
        for(let y=0; y<currentH; y++) {
            for(let x=0; x<currentW; x++) { oCtx.fillStyle = gridData[y * currentW + x]; oCtx.fillRect(x, y, 1, 1); }
        }
        dCtx.drawImage(offCanvas, 0, 0, currentW, currentH, 0, 0, outW, outH);
    } else if(currentMode === 'hd') {
        const vectorCanvas = document.createElement('canvas'); vectorCanvas.width = 300; vectorCanvas.height = 300;
        const vCtx = vectorCanvas.getContext('2d');
        vCtx.fillStyle = '#ffffff'; vCtx.fillRect(0,0,300,300);
        drawBeautifulApple(vCtx, 150, 150, 1.3); 
        dCtx.drawImage(vectorCanvas, 0, 0, 300, 300, 0, 0, outW, outH);
    } else if(currentMode === 'photo') {
        if (!uploadedPhotoImg) return;
        dCtx.drawImage(uploadedPhotoImg, 0, 0, uploadedPhotoImg.width, uploadedPhotoImg.height, 0, 0, outW, outH);
    }

    // 최종: downCanvas(outW×outH) → resCanvas(internalW×internalH) 가득 채워 그리기
    rCtx.drawImage(downCanvas, 0, 0, outW, outH, 0, 0, internalW, internalH);

    // 격자선 그리기 (저해상도일 때만)
    if (Math.max(outW, outH) <= 30) {
        rCtx.strokeStyle = 'rgba(0, 0, 0, 0.15)'; rCtx.lineWidth = 1;
        const cellW = internalW / outW;
        const cellH = internalH / outH;

        for(let i=0; i<=outW; i++) {
            rCtx.beginPath(); rCtx.moveTo(i*cellW, 0); rCtx.lineTo(i*cellW, internalH); rCtx.stroke();
        }
        for(let i=0; i<=outH; i++) {
            rCtx.beginPath(); rCtx.moveTo(0, i*cellH); rCtx.lineTo(internalW, i*cellH); rCtx.stroke();
        }
    }
};
// 🌟 [개별 기능] 비트맵 암호 해독기
let currentBitDepth = 1;
let currentNBit = 2;       // N-Bit 모드에서 선택된 비트 수
let decoderPalette = {};

// ── 기본 팔레트 색상 ──────────────────────────────────────
const PALETTE_DEFAULTS = {
    1:  ['#ffffff','#ff2d55'],
    2:  ['#ffffff','#fdcb6e','#2d3436','#ff7675'],
    3:  ['#ffffff','#fdcb6e','#2d3436','#6c5ce7','#00b894','#0984e3','#e17055','#dfe6e9'],
    4:  ['#ffffff','#fdcb6e','#2d3436','#6c5ce7',
         '#00b894','#0984e3','#e17055','#fd79a8',
         '#a29bfe','#55efc4','#ffeaa7','#fab1a0',
         '#74b9ff','#636e72','#b2bec3','#1e272e']
};

// ── 기본 예제 코드 ────────────────────────────────────────
const EXAMPLE_CODES = {
    1: `0011001100
0111111110
1111111111
1111111111
0111111110
0011111100
0001111000
0000110000
0000000000
0000000000`,
    2: `00000000000000000000
00010100000000010100
01010101010101010101
01010101010101010101
01011001010101100101
01010101101001010101
01010101010101010101
00011101010101110100
00000101010101010000
00000000000000000000`
};

// ── 공통: 모드 버튼 상태 초기화 ──────────────────────────
function clearModeButtons() {
    ['btn1bit','btnNbit','btn8bit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
}

// ── 공통: 팔레트 + 코드 + 캔버스 그리기 ─────────────────
function buildPaletteAndRender(bits, exampleCode) {
    currentBitDepth = bits;
    const colorCount = Math.pow(2, bits);
    const defaults = PALETTE_DEFAULTS[bits] || PALETTE_DEFAULTS[4];

    // 팔레트 초기화
    decoderPalette = {};
    const paletteArea = document.getElementById('paletteArea');
    paletteArea.innerHTML = '<div class="palette-title">🎨 팔레트 (색상 선택)</div>';

    // 행 목록 생성
    const rowsWrap = document.createElement('div');
    rowsWrap.className = 'palette-rows';

    for (let i = 0; i < colorCount; i++) {
        const key = i.toString(2).padStart(bits, '0');
        decoderPalette[key] = defaults[i] || '#cccccc';

        const row = document.createElement('div');
        row.className = 'palette-row';
        row.innerHTML = `
            <span class="pal-key-label">${key}</span>
            <input type="color" id="pal_${key}" value="${decoderPalette[key]}"
                   class="pal-color" onchange="updateDecoderPalette()">
        `;
        rowsWrap.appendChild(row);
    }
    paletteArea.appendChild(rowsWrap);

    // 예제 코드 세팅
    document.getElementById('codeInput').value = exampleCode ||
        Array(10).fill('0'.repeat(bits * 10)).join('\n');

    renderDecoder();
}

// ── 1-Bit 모드 ───────────────────────────────────────────
window.setBitDepth = function(bits) {
    clearModeButtons();
    document.getElementById('btn1bit').classList.add('active');
    document.getElementById('nbitPicker').style.display = 'none';
    document.getElementById('bitInfoArea').style.display = 'none';
    document.getElementById('decoderMainArea').style.display = 'flex';
    buildPaletteAndRender(1, EXAMPLE_CODES[1]);
};

// ── N-Bit 버튼 클릭 — 피커 열기 + 기존 선택 비트 유지 ──
window.activateNBit = function() {
    clearModeButtons();
    document.getElementById('btnNbit').classList.add('active');
    document.getElementById('bitInfoArea').style.display = 'none';
    document.getElementById('decoderMainArea').style.display = 'flex';
    const picker = document.getElementById('nbitPicker');
    picker.style.display = 'flex';
    setNBit(currentNBit);   // 마지막 선택 비트 수로 복원
};

// ── N-Bit 비트수 선택 ────────────────────────────────────
window.setNBit = function(n) {
    currentNBit = n;
    // 숫자 버튼 활성화
    [2,3,4].forEach(v => {
        const btn = document.getElementById('nbitBtn' + v);
        if (btn) btn.classList.toggle('nbit-num-active', v === n);
    });
    buildPaletteAndRender(n, EXAMPLE_CODES[n] || null);
};

// ── 비트 심도 정보 패널 ──────────────────────────────────
window.showBitInfo = function() {
    clearModeButtons();
    document.getElementById('btn8bit').classList.add('active');
    document.getElementById('nbitPicker').style.display = 'none';
    document.getElementById('decoderMainArea').style.display = 'none';
    document.getElementById('bitInfoArea').style.display = 'block';
};

// ── 팔레트 색상 변경 시 재렌더 ───────────────────────────
window.updateDecoderPalette = function() {
    const colorCount = Math.pow(2, currentBitDepth);
    for (let i = 0; i < colorCount; i++) {
        const key = i.toString(2).padStart(currentBitDepth, '0');
        const el = document.getElementById('pal_' + key);
        if (el) decoderPalette[key] = el.value;
    }
    renderDecoder();
};

// ── 캔버스 렌더 ──────────────────────────────────────────
window.renderDecoder = function() {
    const canvas = document.getElementById('decoderCanvas');
    const ctx = canvas.getContext('2d');
    const GRID = 10;
    const CELL = 39;
    const W = GRID * CELL;

    canvas.width  = W;
    canvas.height = W;

    ctx.clearRect(0, 0, W, W);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, W);

    const codeText = document.getElementById('codeInput').value.replace(/[^01]/g, '');
    let pixelIndex = 0;

    for (let i = 0; i < codeText.length; i += currentBitDepth) {
        if (pixelIndex >= GRID * GRID) break;
        const chunk = codeText.substring(i, i + currentBitDepth);
        const color = decoderPalette[chunk];
        const px = pixelIndex % GRID;
        const py = Math.floor(pixelIndex / GRID);
        if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(px * CELL, py * CELL, CELL, CELL);
        }
        pixelIndex++;
    }

    // 격자선
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
    }
};

// 🌟 [개별 기능] 벡터 그래픽
window.updateVector = function() {
    const cx = document.getElementById('vecX').value;
    const cy = document.getElementById('vecY').value;
    const r = document.getElementById('vecR').value;
    const color = document.getElementById('vecColor').value;

    const circle = document.getElementById('vCircle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', color);

    document.getElementById('vecCode').innerHTML = 
        `&lt;svg width="200" height="200"&gt;<br>` +
        `&nbsp;&nbsp;&lt;circle <br>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;cx="<span style="color:#e17055">${cx}</span>" <br>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;cy="<span style="color:#0984e3">${cy}</span>" <br>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;r="<span style="color:#00b894">${r}</span>" <br>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;fill="<span style="color:#6c5ce7">${color}</span>" <br>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;stroke="#2d3436" stroke-width="4" /&gt;<br>` +
        `&lt;/svg&gt;`;
};

window.updateVectorZoom = function() {
    const z = document.getElementById('vecZoom').value;
    document.getElementById('vecZoomText').innerText = `현재 확대 배율: ${z}x`;
    
    const w = 200 / z;
    const h = 200 / z;
    const x = 100 - w/2; 
    const y = 100 - h/2;
    
    document.getElementById('vectorSvg').setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
};

// 🌟 [개별 기능] 아이패드/태블릿 터치 드로잉 지원
const gridContainerBox = document.getElementById('gridContainer');
if (gridContainerBox) {
    gridContainerBox.addEventListener('touchmove', function(e) {
        e.preventDefault(); 
        let touch = e.touches[0];
        let element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('draw-cell')) {
            const hex = document.getElementById('colorPicker').value;
            element.style.background = hex;
            gridData[element.dataset.index] = hex;
            updateResultCanvas();
        }
    }, { passive: false });

    gridContainerBox.addEventListener('touchstart', function(e) {
        e.preventDefault(); 
        let touch = e.touches[0];
        let element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('draw-cell')) {
            const hex = document.getElementById('colorPicker').value;
            element.style.background = hex;
            gridData[element.dataset.index] = hex;
            updateResultCanvas();
        }
    }, { passive: false });
}