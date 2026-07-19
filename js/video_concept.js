// ── video_concept.js ─────────────────────────────────────────────
// [7단원: 동영상의 디지털 표현] 전용 스크립트

// 🌟 [설정] 7단원 고유 정보
const THIS_STEP = 7;
const STEP_TITLE = "7. 동영상의 디지털 표현";
const FILE_NAME_PREFIX = "동영상_개념";
const PASS_SCORE = 70;
const MEMO_KEY = "value_video_memo";
const REF_KEY = "value_video_reflection";

const stepDotMap = {
    'step1-visual':   0,
    'step2-concept':  1,
    'step3-advanced': 2,
    'step4-quiz':     3
};

// ── 공통 연결 ────────────────────────────────────────────────────
window.resetStatus = function() {
    if (typeof setStatus === 'function') setStatus('normal');
};

window.checkAns = function(el) {
    if (typeof check === 'function') {
        check(el);
        if (el.classList.contains('correct')) {
            el.classList.add('blank-correct');
            const toast = document.getElementById('toast');
            if (toast) {
                toast.innerText = "정답입니다! 🎉";
                toast.style.opacity = 1;
                setTimeout(() => toast.style.opacity = 0, 1500);
            }
        } else if (el.value.trim() !== "" && el.value.trim() !== el.getAttribute('data-answer')) {
            el.classList.add('blank-error');
            setTimeout(() => el.classList.remove('blank-error'), 400);
        }
    }
};

window.showCustomAlert = function(msg) {
    const overlay = document.getElementById('customAlertOverlay');
    const msgBox  = document.getElementById('customAlertMsg');
    if (overlay && msgBox) { msgBox.innerHTML = msg; overlay.style.display = 'flex'; }
};

window.closeCustomAlert = function() {
    const overlay = document.getElementById('customAlertOverlay');
    if (overlay) overlay.style.display = 'none';
};

// ── 화면 이동 ────────────────────────────────────────────────────
window.goStep = function(id) {
    const current = document.querySelector('.step-container.active');
    const next    = document.getElementById(id);
    if (current === next) return;

    current.style.opacity   = '0';
    const currentNum = parseInt(current.id.match(/\d+/)[0]);
    const nextNum    = parseInt(id.match(/\d+/)[0]);
    const isNext     = nextNum > currentNum;
    current.style.transform = isNext ? 'translateX(-20px)' : 'translateX(20px)';

    setTimeout(() => {
        current.classList.remove('active'); current.style.display = '';
        next.classList.add('active');       next.style.display    = '';

        // Step3 진입 시 FPS 실험실 초기화
        if (id === 'step3-advanced') initFPSLab();

        next.style.opacity   = '0';
        next.style.transform = isNext ? 'translateX(20px)' : 'translateX(-20px)';
        void next.offsetWidth;
        setTimeout(() => {
            next.style.opacity   = '1';
            next.style.transform = 'translateX(0)';
        }, 50);
        if (typeof updateDots === 'function') updateDots(stepDotMap[id]);
    }, 400);
};

window.revealInline = function(btn, text, color) {
    const span = document.createElement('span');
    span.className    = 'pop-anim revealed-text';
    span.style.color      = color;
    span.style.fontWeight = '900';
    span.innerText = text;
    btn.parentNode.replaceChild(span, btn);
};

// ══════════════════════════════════════════════════════════════════
//  STEP 1 : 튀는 공 애니메이션 + 프레임 분해
// ══════════════════════════════════════════════════════════════════
const vCanvas = document.getElementById('videoVisCanvas');
const vCtx    = vCanvas ? vCanvas.getContext('2d') : null;
let vTick        = 0;
let isDissected  = false;

// drawBall: step1 & step3 공유 유틸
function drawBall(ctx, x, y, scaleX, scaleY) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    // 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath(); ctx.ellipse(0, 20, 25, 5, 0, 0, Math.PI * 2); ctx.fill();
    // 공 본체
    const grad = ctx.createRadialGradient(-5, -10, 5, 0, 0, 25);
    grad.addColorStop(0, '#ffc048');
    grad.addColorStop(1, '#f39c12');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill();
    // 하이라이트
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(-8, -8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// 공의 물리 위치 계산 (0~1 타임라인 → y좌표 + 스케일)
function getBallState(time) {
    let bounceY, sx = 1, sy = 1;
    if (time < 0.45) {
        bounceY = 80 + 140 * Math.pow(time / 0.45, 2);
    } else if (time < 0.55) {
        const t = (time - 0.45) / 0.1;
        const squish = Math.sin(t * Math.PI);
        sx = 1 + 0.3 * squish; sy = 1 - 0.3 * squish;
        bounceY = 220 + 10 * squish;
    } else {
        const t = (time - 0.55) / 0.45;
        bounceY = 220 - 140 * t * (2 - t);
    }
    return { bounceY, sx, sy };
}

function drawVideoVisual() {
    if (!vCtx) return;

    if (isDissected) {
        // ── 분해 뷰 (정적, RAF 없음) ─────────────────────────────
        const CW = 600, CH = 300;
        const FRAMES  = 5;
        const LABEL_H = 32;
        const NUM_H   = 22;
        const CARD_H  = CH - LABEL_H - NUM_H - 10; // ≈236px
        const CARD_W  = 94;
        const GAP     = (CW - FRAMES * CARD_W) / (FRAMES + 1);
        const IMG_PAD = 4;
        const IMG_W   = CARD_W - IMG_PAD * 2;
        const IMG_H   = CARD_H - IMG_PAD * 2;
        // 여유 맵핑: 공 반지름(25px)이 절대 잘리지 않도록 30px 여백
        const BY_MIN  = 50, BY_MAX = 260;

        // 5개 time 포인트: 모두 다른 위치, 공이 잘 보이도록 선택
        // F1: 막 떨어지기 시작, F2: 중간 낙하, F3: 바닥 찌그러짐,
        // F4: 튀어 오르는 중, F5: 많이 올라온 상태
        const TIMES = [0.08, 0.28, 0.50, 0.60, 0.88]; // F4: 0.68→0.60 (더 아래)

        vCtx.clearRect(0, 0, CW, CH);
        vCtx.fillStyle = '#1a1a2e';
        vCtx.fillRect(0, 0, CW, CH);

        // 상단 레이블
        vCtx.fillStyle = '#ffd32a';
        vCtx.font      = 'bold 12px "Pretendard", sans-serif';
        vCtx.textAlign = 'center';
        vCtx.fillText('🎞️ 프레임 분해 — 5장의 정지 이미지가 모여 1초 움직임이 됩니다', CW / 2, 20);

        for (let i = 0; i < FRAMES; i++) {
            const fx = Math.round(GAP + i * (CARD_W + GAP));
            const fy = LABEL_H + 4;

            // 카드 (흰색)
            vCtx.fillStyle     = '#ffffff';
            vCtx.shadowColor   = 'rgba(0,0,0,0.28)';
            vCtx.shadowBlur    = 8;
            vCtx.shadowOffsetY = 3;
            vCtx.fillRect(fx, fy, CARD_W, CARD_H);
            vCtx.shadowBlur = 0; vCtx.shadowColor = 'transparent';

            // 이미지 영역
            const ix = fx + IMG_PAD, iy = fy + IMG_PAD;
            vCtx.fillStyle = '#eef0f5';
            vCtx.fillRect(ix, iy, IMG_W, IMG_H);

            // 공 위치: 선택된 time 포인트 → 모두 다른 위치
            const state = getBallState(TIMES[i]);
            const ballY = iy + ((state.bounceY - BY_MIN) / (BY_MAX - BY_MIN)) * IMG_H;

            vCtx.save();
            vCtx.beginPath();
            vCtx.rect(ix, iy, IMG_W, IMG_H);
            vCtx.clip();
            drawBall(vCtx, ix + IMG_W / 2, ballY, state.sx, state.sy);
            vCtx.restore();

            // 화살표
            if (i < FRAMES - 1) {
                vCtx.fillStyle = '#7a7a9a';
                vCtx.font      = 'bold 15px sans-serif';
                vCtx.textAlign = 'center';
                vCtx.fillText('→', fx + CARD_W + GAP / 2, fy + CARD_H / 2 + 5);
            }

            // 프레임 번호
            vCtx.fillStyle = '#ffd32a';
            vCtx.font      = 'bold 11px "Pretendard", sans-serif';
            vCtx.textAlign = 'center';
            vCtx.fillText(`${i + 1}번 프레임`, fx + CARD_W / 2, fy + CARD_H + 15);
        }
        vCtx.textAlign = 'left';

    } else {
        // ── 재생 뷰 ──────────────────────────────────────────────
        vCtx.clearRect(0, 0, 600, 300);
        const time  = (vTick % 60) / 60;
        const state = getBallState(time);
        vCtx.fillStyle = '#f1f2f6';
        vCtx.fillRect(0, 0, 600, 300);
        drawBall(vCtx, 300, state.bounceY, state.sx, state.sy);
        vCtx.fillStyle = 'rgba(0,0,0,0.4)';
        vCtx.font      = '800 18px Pretendard';
        vCtx.textAlign = 'center';
        vCtx.fillText('연속으로 빠르게 재생하면 움직이는 것처럼 보입니다!', 300, 40);
        vTick++;
        requestAnimationFrame(drawVideoVisual);
    }
}
if (vCanvas) drawVideoVisual();

window.toggleFilmScan = function() {
    isDissected = !isDissected;
    const btn = document.getElementById('btnDissect');
    if (isDissected) {
        btn.innerText        = '▶️ 연속 재생하기 (애니메이션 확인)';
        btn.style.background = 'var(--soft-red)';
        drawVideoVisual();                          // 즉시 정적 렌더
    } else {
        btn.innerText        = '🎞️ 프레임 분해하기 (정지 이미지 확인)';
        btn.style.background = 'var(--multi-navy)';
        requestAnimationFrame(drawVideoVisual);     // 애니메이션 재시작
    }
};

// ══════════════════════════════════════════════════════════════════
//  STEP 3 : FPS 실험실 — 🐧 펭귄 걷기 캔버스 + 프레임 격자
// ══════════════════════════════════════════════════════════════════
const fCanvas = document.getElementById('fpsCanvas');
const fCtx    = fCanvas ? fCanvas.getContext('2d') : null;
const FW = 500, FH = 260;

let currentFps    = 8;
let fpsRAF        = null;
let fpsPaused     = false;
let fpsLabReady   = false;

let fpsFrames   = [];
let fpsFrameIdx = 0;
let fpsLastTime = 0;

// ─── 펭귄 걷기 시뮬 ──────────────────────────────────────────────
function eio(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; } // easeInOut (전역)
const WALK_CYCLE = 22;    // 최적값 — 4·8fps 포함 전 fps 다리 각도 다양 (최소 30°↑)
const GROUND_Y   = FH - 36 - 40; // 진행 바(36px) + 다리·발(40px) 위 — 진행바 겹침 방지

// tick → 펭귄 x 위치 (항상 동일한 왕복 경로)
function getPengX(tick) {
    const span  = FW - 80;
    const phase = (tick * 1.8) % (span * 2);
    return phase < span ? 40 + phase : 40 + (span * 2 - phase);
}
function getPengDir(tick) {
    const span  = FW - 80;
    const phase = (tick * 1.8) % (span * 2);
    return phase < span ? 1 : -1;
}

// ─── 새끼 펭귄 그리기 ─────────────────────────────────────────
// 엄마의 절반 크기, 이글루 앞에서 엄마를 기다림
function drawBabyPenguin(ctx, x, gy) {
    const S = 0.52; // 크기 스케일 (엄마의 절반)
    ctx.save();
    ctx.translate(x, gy);

    // 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 14 * S, 4 * S, 0, 0, Math.PI * 2);
    ctx.fill();

    // 다리 + 발
    ctx.fillStyle = '#FF8C00';
    [-7 * S, 7 * S].forEach(ox => {
        ctx.beginPath();
        ctx.rect(ox - 4 * S, -3 * S, 8 * S, 14 * S);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(ox, 12 * S, 10 * S, 4 * S, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // 몸통
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(0, -20 * S, 18 * S, 24 * S, 0, 0, Math.PI * 2);
    ctx.fill();

    // 배
    ctx.fillStyle = '#eef2ff';
    ctx.beginPath();
    ctx.ellipse(0, -18 * S, 11 * S, 17 * S, 0, 0, Math.PI * 2);
    ctx.fill();

    // 왼쪽 날개 (엄마 방향으로 살짝 들어올림)
    ctx.fillStyle = '#2c2c4e';
    ctx.save();
    ctx.translate(-14 * S, -22 * S);
    ctx.rotate(-0.6); // 들어올린 날개
    ctx.beginPath();
    ctx.ellipse(0, 8 * S, 6 * S, 16 * S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 오른쪽 날개
    ctx.fillStyle = '#1a1a2e';
    ctx.save();
    ctx.translate(14 * S, -22 * S);
    ctx.rotate(0.3);
    ctx.beginPath();
    ctx.ellipse(0, 8 * S, 6 * S, 16 * S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 머리 (더 동그랗게 — 아기 특징)
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(0, -44 * S, 16 * S, 0, Math.PI * 2);
    ctx.fill();

    // 얼굴 흰 부분
    ctx.fillStyle = '#eef2ff';
    ctx.beginPath();
    ctx.ellipse(0, -43 * S, 10 * S, 11 * S, 0, 0, Math.PI * 2);
    ctx.fill();

    // 눈 (왼쪽 방향 — 엄마 보는 방향)
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(-5 * S, -47 * S, 3.5 * S, 0, Math.PI * 2);
    ctx.fill();
    // 눈 하이라이트
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6 * S, -48 * S, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
    // 반짝이는 눈 (아기라 더 빛남)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(-3.5 * S, -46 * S, 1 * S, 0, Math.PI * 2);
    ctx.fill();

    // 부리 (작고 귀엽게)
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(-7 * S, -44 * S);
    ctx.lineTo(-14 * S, -42 * S);
    ctx.lineTo(-7 * S, -40 * S);
    ctx.closePath();
    ctx.fill();

    // 볼터치 (핑크)
    ctx.fillStyle = 'rgba(255,160,160,0.65)';
    ctx.beginPath();
    ctx.ellipse(-6 * S, -39 * S, 5 * S, 3 * S, 0, 0, Math.PI * 2);
    ctx.fill();

    // 머리 위 삐죽 털 (아기 특징)
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2 * S;
    ctx.beginPath();
    ctx.moveTo(-2 * S, -60 * S);
    ctx.lineTo( 0 * S, -68 * S);
    ctx.lineTo( 3 * S, -62 * S);
    ctx.stroke();

    ctx.restore();
}

// ─── 이글루 그리기 ────────────────────────────────────────────
// ix: 이글루 중심 x, gy: 바닥 y
function drawIgloo(ctx, ix, gy) {
    const iw = 72; // 이글루 반너비 (크게)
    const ih = 58; // 이글루 높이 (크게)

    // ── 눈 쌓인 언덕 (이글루 아래 둔덕) ──
    ctx.fillStyle = '#daeeff';
    ctx.beginPath();
    ctx.ellipse(ix, gy + 5, iw + 14, 16, 0, Math.PI, 0);
    ctx.fill();

    // ── 이글루 본체 (반구) ──
    const bodyGrad = ctx.createRadialGradient(ix - 14, gy - ih * 0.6, 6, ix, gy, iw);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.6, '#e8f4fd');
    bodyGrad.addColorStop(1, '#b8d8f0');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(ix, gy, iw, ih, 0, Math.PI, 0);
    ctx.fill();

    // ── 이글루 윤곽선 ──
    ctx.strokeStyle = '#a0c4e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(ix, gy, iw, ih, 0, Math.PI, 0);
    ctx.stroke();

    // ── 입구 (아치형 터널) ──
    ctx.fillStyle = '#6aa8cc';
    ctx.beginPath();
    ctx.ellipse(ix, gy + 3, 18, 26, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#2c6e99';
    ctx.beginPath();
    ctx.ellipse(ix, gy + 3, 13, 21, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#a0c4e0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(ix, gy + 3, 18, 26, 0, Math.PI, 0);
    ctx.stroke();

    // ── 눈 블록 라인 (이글루 질감) ──
    ctx.strokeStyle = 'rgba(160,196,224,0.5)';
    ctx.lineWidth = 1.2;
    for (let row = 1; row <= 3; row++) {
        const ratio = row / 4;
        const ry = gy - ih * Math.sin(Math.PI * ratio);
        const rx = iw * Math.cos(Math.PI * ratio);
        ctx.beginPath();
        ctx.moveTo(ix - rx, ry);
        ctx.lineTo(ix + rx, ry);
        ctx.stroke();
    }

    // ── 지붕 눈 (반짝임) ──
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(ix - 18, gy - ih * 0.75, 11, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // ── 고드름 4개 ──
    ctx.fillStyle = '#a8d4f0';
    [ix - 28, ix - 10, ix + 10, ix + 28].forEach((gx, gi) => {
        const glen = 7 + gi * 2;
        ctx.beginPath();
        ctx.moveTo(gx - 3, gy - 2);
        ctx.lineTo(gx + 3, gy - 2);
        ctx.lineTo(gx, gy - 2 + glen);
        ctx.closePath();
        ctx.fill();
    });

    // ── 집 이모지 ──
    ctx.font = 'bold 11px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏠', ix, gy - ih - 8);
    ctx.textAlign = 'left';
}

// ─── 귀여운 펭귄 그리기 (크고 역동적) ─────────────────────────────
function drawPenguin(ctx, x, tick, dir) {
    const walkPhase = (tick % WALK_CYCLE) / WALK_CYCLE; // 0~1
    const wobble    = Math.sin(walkPhase * Math.PI * 2) * 7 * dir; // 뒤뚱 (더 크게)
    const bobY      = Math.abs(Math.sin(walkPhase * Math.PI * 2)) * 5; // 위아래 통통

    // 날개 펄럭임: 걷는 주기에 맞춰 위아래로 크게 (±45도)
    const wingFlap  = Math.sin(walkPhase * Math.PI * 2) * 45;

    // 다리 스윙: 4단계 키프레임 — 붙였다 벌렸다
    // 0.00~0.25: 모음→왼앞/오른뒤  0.25~0.50: 벌림→모음
    // 0.50~0.75: 모음→오른앞/왼뒤  0.75~1.00: 벌림→모음
    const SPREAD = 36;
    let legSwingL, legSwingR;
    if (walkPhase < 0.25) {
        const t = eio(walkPhase / 0.25);
        legSwingL =  SPREAD * t;  legSwingR = -SPREAD * t;
    } else if (walkPhase < 0.50) {
        const t = eio((walkPhase - 0.25) / 0.25);
        legSwingL =  SPREAD * (1-t); legSwingR = -SPREAD * (1-t);
    } else if (walkPhase < 0.75) {
        const t = eio((walkPhase - 0.50) / 0.25);
        legSwingL = -SPREAD * t;  legSwingR =  SPREAD * t;
    } else {
        const t = eio((walkPhase - 0.75) / 0.25);
        legSwingL = -SPREAD * (1-t); legSwingR =  SPREAD * (1-t);
    }
    legSwingL *= dir; legSwingR *= dir;

    const py = GROUND_Y - bobY;

    ctx.save();
    ctx.translate(x, py);
    ctx.rotate((wobble * Math.PI) / 180);

    // ══ 그리기 순서: 날개(뒤) → 다리 → 몸통 → 날개(앞) → 머리 ══
    // 다리가 몸통에 안 묻히고, 앞날개가 몸통 위에 보이도록

    // ── 뒤쪽 날개 (몸통보다 먼저) ──
    ctx.fillStyle = '#2c2c4e';
    ctx.save();
    ctx.translate(dir > 0 ? -26 : 26, -42);
    ctx.rotate(((dir > 0 ? -20 - wingFlap : 20 + wingFlap) * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 10, 9, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 왼쪽 다리 + 발 ──
    ctx.save();
    ctx.translate(-13, -2);
    ctx.rotate((legSwingL * Math.PI) / 180);
    // 다리: y=-8에서 시작해 몸통 안으로 파고들어 연결처럼 보임
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.rect(-5, -8, 10, 28);
    ctx.fill();
    // 발 (크고 납작하게)
    ctx.beginPath();
    ctx.ellipse(dir > 0 ? 4 : -4, 22, 14, 6, dir > 0 ? 0.2 : -0.2, 0, Math.PI * 2);
    ctx.fill();
    // 발가락 선
    ctx.strokeStyle = '#cc6600';
    ctx.lineWidth = 1.5;
    for (let t = -1; t <= 1; t++) {
        ctx.beginPath();
        ctx.moveTo(dir > 0 ? 4 : -4, 20);
        ctx.lineTo((dir > 0 ? 4 : -4) + t * 10, 27);
        ctx.stroke();
    }
    ctx.restore();

    // ── 오른쪽 다리 + 발 ──
    ctx.save();
    ctx.translate(13, -2);
    ctx.rotate((legSwingR * Math.PI) / 180);
    // 다리: y=-8에서 시작해 몸통 안으로 파고들어 연결처럼 보임
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.rect(-5, -8, 10, 28);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dir > 0 ? 4 : -4, 22, 14, 6, dir > 0 ? 0.2 : -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cc6600';
    ctx.lineWidth = 1.5;
    for (let t = -1; t <= 1; t++) {
        ctx.beginPath();
        ctx.moveTo(dir > 0 ? 4 : -4, 20);
        ctx.lineTo((dir > 0 ? 4 : -4) + t * 10, 27);
        ctx.stroke();
    }
    ctx.restore();

    // ── 몸통 ──
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(0, -36, 24, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 배 (흰색) ──
    ctx.fillStyle = '#eef2ff';
    ctx.beginPath();
    ctx.ellipse(0, -34, 15, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 앞쪽 날개 (몸통 위에) ──
    ctx.fillStyle = '#1a1a2e';
    ctx.save();
    ctx.translate(dir > 0 ? 24 : -24, -42);
    ctx.rotate(((dir > 0 ? 20 + wingFlap : -20 - wingFlap) * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 10, 9, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // 날개 끝 하이라이트
    ctx.fillStyle = '#3a3a5e';
    ctx.beginPath();
    ctx.ellipse(0, 18, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 머리 ──
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(0, -70, 20, 0, Math.PI * 2);
    ctx.fill();

    // ── 얼굴 흰 부분 ──
    ctx.fillStyle = '#eef2ff';
    ctx.beginPath();
    ctx.ellipse(0, -69, 13, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 눈 ──
    const eyeX = dir > 0 ? 7 : -7;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(eyeX, -74, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + dir * 1.5, -75, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // ── 부리 ──
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    if (dir > 0) {
        ctx.moveTo(10, -71); ctx.lineTo(22, -68); ctx.lineTo(10, -65);
    } else {
        ctx.moveTo(-10, -71); ctx.lineTo(-22, -68); ctx.lineTo(-10, -65);
    }
    ctx.closePath();
    ctx.fill();

    // ── 볼터치 ──
    ctx.fillStyle = 'rgba(255, 140, 140, 0.6)';
    ctx.beginPath();
    ctx.ellipse(dir > 0 ? 9 : -9, -65, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ─── 배경 + 펭귄 한 프레임 스냅샷 ───────────────────────────────
function snapshotFrame(tick) {
    const mc   = document.createElement('canvas');
    mc.width   = FW; mc.height = FH;
    const mctx = mc.getContext('2d');

    // 하늘 그라디언트
    const sky = mctx.createLinearGradient(0, 0, 0, FH);
    sky.addColorStop(0,   '#d0eaff');
    sky.addColorStop(1,   '#f7fbff');
    mctx.fillStyle = sky;
    mctx.fillRect(0, 0, FW, FH);

    // 구름 (고정 위치 2개)
    function cloud(ctx, cx, cy, r) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        [[0,0,r],[r*0.7,-r*0.3,r*0.75],[-r*0.7,-r*0.2,r*0.7]].forEach(([dx,dy,cr]) => {
            ctx.beginPath(); ctx.arc(cx+dx, cy+dy, cr, 0, Math.PI*2); ctx.fill();
        });
    }
    cloud(mctx,  90, 40, 18);
    cloud(mctx, 370, 55, 14);

    // 눈밭 바닥
    const snow = mctx.createLinearGradient(0, GROUND_Y, 0, FH);
    snow.addColorStop(0, '#e8f4fd');
    snow.addColorStop(1, '#cce0f5');
    mctx.fillStyle = snow;
    mctx.beginPath();
    mctx.moveTo(0, GROUND_Y + 5);
    // 울퉁불퉁한 눈 표면
    for (let bx = 0; bx <= FW; bx += 40) {
        mctx.quadraticCurveTo(bx + 20, GROUND_Y - 4, bx + 40, GROUND_Y + 5);
    }
    mctx.lineTo(FW, FH); mctx.lineTo(0, FH); mctx.closePath();
    mctx.fill();

    // 발자국 (지나온 자리에 작은 타원)
    const px    = getPengX(tick);
    const pdir  = getPengDir(tick);
    mctx.fillStyle = 'rgba(150,190,220,0.55)';
    for (let t = tick - 60; t < tick; t += 14) {
        if (t < 0) continue;
        const fx = getPengX(t);
        const fo = Math.sin((t % WALK_CYCLE / WALK_CYCLE) * Math.PI * 2) * 7;
        mctx.beginPath();
        mctx.ellipse(fx + fo, GROUND_Y + 10, 5, 3, 0.3, 0, Math.PI * 2);
        mctx.fill();
        mctx.beginPath();
        mctx.ellipse(fx - fo, GROUND_Y + 14, 5, 3, -0.3, 0, Math.PI * 2);
        mctx.fill();
    }

    // 이글루 (오른쪽 고정 — 펭귄의 목적지)
    drawIgloo(mctx, FW - 115, GROUND_Y);

    // 새끼 펭귄 (이글루 앞에서 엄마를 기다림)
    // 엄마 펭귄이 가까워질수록 새끼가 살짝 흥분해서 앞뒤로 흔들림
    const babyX   = FW - 115 - 48; // 이글루 입구 앞
    const distToMom = Math.abs(px - babyX);
    const excite  = distToMom < 80 ? Math.sin(tick * 1.2) * 3 : Math.sin(tick * 0.4) * 1.5;
    drawBabyPenguin(mctx, babyX + excite, GROUND_Y);

    // 엄마 펭귄 그리기
    drawPenguin(mctx, px, tick, pdir);

    return mc;
}

// fps 수만큼 프레임 생성
// ── 핵심 원칙 ──────────────────────────────────────────────────
// fps가 달라도 펭귄은 항상 JOURNEY_TICKS(고정 거리)를 이동.
// 그 구간을 fps 등분해서 각 위치를 스냅샷 → 프레임 수만 달라짐.
const JOURNEY_TICKS = 139; // 도달x≈290px(아기와 47px 간격), WC=22 조합 최적

// ── 스냅샷 캐시: fps별로 한 번 만들면 재사용 ──────────────────
const _framesCache = {}; // { fps: [canvas, ...] }

function buildFrames(fps) {
    if (_framesCache[fps]) return _framesCache[fps]; // 이미 만든 것 재사용

    // JOURNEY_TICKS를 fps 등분 → 각 tick에서 직접 스냅샷
    // JOURNEY_TICKS=120, WALK_CYCLE=24(=120/5)라
    // 어떤 fps든 walkPhase가 사이클 전체에 균등 분포
    const frames = [];
    for (let f = 0; f < fps; f++) {
        const t = Math.round((f / fps) * JOURNEY_TICKS);
        frames.push(snapshotFrame(t));
    }
    _framesCache[fps] = frames;
    return frames;
}

// ─── 재생 루프 ───────────────────────────────────────────────────
// 정확히 fps개 프레임을 1초에 재생 → 0.7초 대기 → 반복
// "24fps = 1초에 24장" 을 명확하게 체감
let fpsWaiting = false;

function startFPSLoop() {
    if (fpsRAF) { cancelAnimationFrame(fpsRAF); fpsRAF = null; }
    fpsFrameIdx = 0;
    fpsWaiting  = false;

    function loop(now) {
        if (fpsPaused || !fCtx) {
            fpsRAF = requestAnimationFrame(loop); // 일시정지 중에도 resume 대기
            return;
        }

        // 재생 구간: 1000/fps ms 간격
        const interval = 1000 / currentFps;
        if (now - fpsLastTime < interval) {
            fpsRAF = requestAnimationFrame(loop);
            return;
        }
        fpsLastTime = now;

        // 마지막 프레임 후 → RAF 중단 + setTimeout 700ms 대기
        if (fpsFrameIdx >= fpsFrames.length) {
            fpsRAF = null;
            setTimeout(() => {
                if (fpsPaused) { fpsRAF = requestAnimationFrame(loop); return; }
                fpsFrameIdx = 0;
                fpsLastTime = performance.now();
                fpsRAF = requestAnimationFrame(loop);
            }, 700);
            return;
        }

        const frame = fpsFrames[fpsFrameIdx];
        fpsFrameIdx++;
        fpsRAF = requestAnimationFrame(loop);

        fCtx.clearRect(0, 0, FW, FH);
        fCtx.drawImage(frame, 0, 0, FW, FH);

        // 상단 오버레이
        fCtx.fillStyle = 'rgba(30, 30, 50, 0.75)';
        fCtx.fillRect(0, 0, FW, 28);
        fCtx.fillStyle = '#00d2d3';
        fCtx.font      = 'bold 13px "JetBrains Mono", monospace';
        fCtx.textAlign = 'left';
        fCtx.fillText(`▶  ${currentFps} fps`, 10, 19);
        fCtx.fillStyle = '#ffd32a';
        fCtx.textAlign = 'right';
        fCtx.fillText(`${fpsFrameIdx} / ${fpsFrames.length}장`, FW - 10, 19);
        fCtx.textAlign = 'left';

        // ── 하단 1초 진행 바 ──
        const BAR_H    = 36;
        const BAR_Y    = FH - BAR_H;
        const progress = fpsFrameIdx / fpsFrames.length;

        // 배경
        fCtx.fillStyle = 'rgba(20, 20, 40, 0.88)';
        fCtx.fillRect(0, BAR_Y, FW, BAR_H);

        // 트랙 (회색)
        const bx = 12, bw = FW - 24, by = BAR_Y + 7, bh = 12;
        fCtx.fillStyle = 'rgba(255,255,255,0.15)';
        fCtx.fillRect(bx, by, bw, bh);

        // 진행 채움 (청록)
        if (progress > 0) {
            fCtx.fillStyle = '#00d2d3';
            fCtx.fillRect(bx, by, bw * progress, bh);
        }

        // ⏱ 1초 레이블
        fCtx.fillStyle = '#ffffff';
        fCtx.font      = 'bold 13px "Pretendard", "Apple SD Gothic Neo", sans-serif';
        fCtx.textAlign = 'center';
        fCtx.fillText('⏱  1초', FW / 2, BAR_Y + BAR_H - 4);

        // 0초 / 1초 눈금
        fCtx.fillStyle = 'rgba(255,255,255,0.55)';
        fCtx.font      = 'bold 10px "Pretendard", "Apple SD Gothic Neo", sans-serif';
        fCtx.textAlign = 'left';
        fCtx.fillText('0초', bx, BAR_Y + BAR_H - 4);
        fCtx.textAlign = 'right';
        fCtx.fillText('1초', bx + bw, BAR_Y + BAR_H - 4);
        fCtx.textAlign = 'left';
    }
    fpsRAF = requestAnimationFrame(loop);
}

// ─── FPS 실험실 초기화 (step3 진입 시 1회) ───────────────────────
function initFPSLab() {
    // 재진입 시 재생 루프만 재시작 (슬라이더·캐시는 유지)
    if (fpsLabReady) {
        if (!fpsRAF) startFPSLoop(); // 루프가 꺼져있으면 재시작
        return;
    }
    fpsLabReady = true;

    currentFps  = 8;
    fpsFrames   = buildFrames(currentFps);
    fpsLastTime = 0;

    updateFPSUI();
    renderFrameGrid();
    startFPSLoop();
}

// ─── 슬라이더 변경 ───────────────────────────────────────────────
window.updateFPS = function() {
    const slider = document.getElementById('fpsSlider');
    if (!slider) return;
    currentFps = parseInt(slider.value);
    fpsFrames  = buildFrames(currentFps);
    fpsFrameIdx = 0;
    updateFPSUI();
    renderFrameGrid();
};

function updateFPSUI() {
    const disp = document.getElementById('fpsValDisplay');
    if (disp) disp.textContent = currentFps + ' fps';

    const std = document.getElementById('fpsStandard');
    if (std) {
        if      (currentFps <= 4)  std.textContent = '🐌 아주 뚝뚝 끊겨요';
        else if (currentFps <= 8)  std.textContent = '😵 많이 어색해요';
        else if (currentFps <= 14) std.textContent = '😐 조금 끊려요';
        else if (currentFps <= 20) std.textContent = '🙂 꽤 부드러워요';
        else if (currentFps <= 23) std.textContent = '😊 거의 자연스러워요';
        else                       std.textContent = '🎬 영화 수준! (24fps)';
    }

    const countEl = document.getElementById('fpsFrameCount');
    if (countEl) countEl.textContent = currentFps + '프레임';
}

// ─── 핵심: 프레임 격자 렌더링 ────────────────────────────────────
// fps 수만큼 작은 이미지 카드를 격자로 배치
// → 학생이 "24fps = 24장의 사진" 을 한눈에 확인
function renderFrameGrid() {
    const wrap = document.getElementById('fpsFrameStrip');
    if (!wrap) return;
    wrap.innerHTML = '';

    const fps  = currentFps;
    const cols = fps <= 4 ? fps : fps <= 8 ? 4 : fps <= 12 ? 6 : fps <= 18 ? 6 : 8;
    const containerW = wrap.clientWidth || 580;
    const gap  = 4;
    const cellW = Math.floor((containerW - gap * (cols - 1)) / cols);
    const cellH = Math.round(cellW * (FH / FW));  // 비율 유지

    wrap.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${cols}, ${cellW}px);
        gap: ${gap}px;
        width: 100%;
    `;

    for (let i = 0; i < fps; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `
            position: relative;
            width:  ${cellW}px;
            height: ${cellH + 17}px;
            border-radius: 5px;
            overflow: hidden;
            background: #fff;
            border: 2px solid rgba(0,0,0,0.10);
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        `;

        // 미니 캔버스 (2× HiDPI)
        const mc  = document.createElement('canvas');
        mc.width  = cellW * 2;
        mc.height = cellH * 2;
        mc.style.cssText = `width:${cellW}px; height:${cellH}px; display:block;`;
        const mctx = mc.getContext('2d');
        if (fpsFrames[i]) {
            mctx.drawImage(fpsFrames[i], 0, 0, FW, FH, 0, 0, cellW * 2, cellH * 2);
        }
        cell.appendChild(mc);

        // 프레임 번호 레이블
        const label = document.createElement('div');
        label.style.cssText = `
            position: absolute; bottom: 0; left: 0; right: 0;
            height: 17px; line-height: 17px;
            background: rgba(30,30,50,0.72);
            color: #ffd32a;
            font-size: ${fps <= 8 ? 11 : fps <= 16 ? 9 : 8}px;
            font-weight: 900;
            font-family: 'JetBrains Mono', monospace;
            text-align: center;
        `;
        label.textContent = 'F' + (i + 1);
        cell.appendChild(label);

        wrap.appendChild(cell);
    }

    // fps별 설명 문구
    updateFrameExplain(fps);
}

function updateFrameExplain(fps) {
    const el = document.getElementById('fpsExplainText');
    if (!el) return;
    if (fps === 1) {
        el.textContent = '1초에 사진 1장 → 거의 슬라이드쇼 수준이에요!';
    } else if (fps <= 6) {
        el.textContent = `1초에 사진 ${fps}장 → 화면이 뚝뚝 끊겨 보여요.`;
    } else if (fps <= 12) {
        el.textContent = `1초에 사진 ${fps}장 → 어느 정도 움직임이 느껴지지만 아직 어색해요.`;
    } else if (fps <= 20) {
        el.textContent = `1초에 사진 ${fps}장 → 꽤 자연스러운 움직임이에요!`;
    } else if (fps < 24) {
        el.textContent = `1초에 사진 ${fps}장 → 거의 부드러워요. 영화(24fps)에 가까워지고 있어요!`;
    } else {
        el.textContent = '🎬 1초에 사진 24장! 이게 바로 영화 기준 fps예요. 눈이 자연스러운 움직임으로 착각합니다.';
    }
}

// ─── 일시정지 토글 ───────────────────────────────────────────────
window.toggleFPSPause = function() {
    fpsPaused = !fpsPaused;
    const btn = document.getElementById('fpsPauseBtn');
    if (btn) btn.textContent = fpsPaused ? '▶ 재생' : '⏸ 일시정지';
};

// ─── 미션 정답 체크 ──────────────────────────────────────────────
window.checkMission = function() {
    const inputVal = document.getElementById('missionInput').value.trim();
    if (inputVal === '600') {
        document.getElementById('missionInput').style.backgroundColor = '#d4edda';
        document.getElementById('missionInput').style.borderColor     = '#28a745';
        document.getElementById('missionInput').style.color           = '#155724';
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText    = '미션 성공! 🎉 2 × 30 × 10 = 600 MB';
            toast.style.opacity = 1;
            setTimeout(() => toast.style.opacity = 0, 2500);
        }
    } else {
        showCustomAlert('❌ 오답입니다!<br><br>힌트: (이미지 1장 용량) × (fps) × (초 수)<br>→ 2MB × 30 × 10 = ?');
        document.getElementById('missionInput').value = '';
        document.getElementById('missionInput').focus();
    }
};

// ── 하위 호환: startFPSAnimation은 goStep에서 더 이상 쓰이지 않지만 안전하게 유지 ──
window.startFPSAnimation = function() {};