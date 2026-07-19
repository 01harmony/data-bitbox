/* 8. TREASURE BOX TRANSITION */
(function(){
    const overlay  = document.getElementById('tb-overlay');
    const box      = document.getElementById('tb-box');
    const lid      = document.getElementById('tb-lid');
    const lock     = document.getElementById('tb-lock');
    const flash    = document.getElementById('tb-flash');
    if(!overlay || !box) return;
    
    let navigating = false; let currentStep = '1';

    const PARTICLE_POOL = {
        '1': { words: ['0','1','ON','OFF','⚡','디지털','DATA','BIT'], bins:  ['0','1','00','11','01','10'], colors: ['#00f5c4','#00cec9','#55efc4','#b2fff0'] },
        '2': { words: ['bit','byte','1KB','8bit','0','1','nibble'], bins:  ['00000000','11111111','01010101','10101010','00001000'], colors: ['#00f5c4','#00b894','#81ecec','#a8e6cf'] },
        '3': { words: ['7','42','255','0','∞','10진수','2진수'], bins:  ['00000111','00101010','11111111','00000000','00001010'], colors: ['#fdcb6e','#f9ca24','#f0932b','#ffeaa7'] },
        '4': { words: ['A','B','가','나','65','97','ASCII'], bins:  ['01000001','01000010','01100001','01000011','01100010'], colors: ['#5ac8fa','#74b9ff','#0984e3','#a8d8ea'] },
        '5': { words: ['■','□','RGB','px','pixel','■□','색상'], bins:  ['11111111','00000000','11110000','00001111','10101010'], colors: ['#d08ef7','#a29bfe','#6c5ce7','#e8c4ff'] },
        '6': { words: ['♪','Hz','PCM','wav','~','소리','파형'], bins:  ['10110100','01001011','11001100','10001000','01110111'], colors: ['#fd79a8','#e84393','#ff7675','#fab1c3'] },
        '7': { words: ['▶','fps','24','🎬','frame','px','영상'], bins:  ['00011000','00010000','11000000','00001111','10000001'], colors: ['#487eb0','#74b9ff','#0652DD','#a8c4e0'] }
    };

    function launchParticles(step) {
        const pool = PARTICLE_POOL[step] || PARTICLE_POOL['1'];
        const cx = window.innerWidth / 2; const cy = window.innerHeight / 2;
        const COUNT = 35;
        for (let i = 0; i < COUNT; i++) {
            setTimeout(() => {
                const isBin  = Math.random() < 0.4;
                const pool_  = isBin ? pool.bins : pool.words;
                const text   = pool_[Math.floor(Math.random() * pool_.length)];
                const color  = pool.colors[Math.floor(Math.random() * pool.colors.length)];
                const size   = isBin ? (14 + Math.random() * 10) : (24 + Math.random() * 20);
                const alpha  = isBin ? (0.65 + Math.random() * 0.25) : 1.0;
                const angleDeg   = -90 + (Math.random() - 0.5) * 160;
                const angleRad   = angleDeg * Math.PI / 180;
                const speed  = 120 + Math.random() * 150;
                const vx = Math.cos(angleRad) * speed; const vy = Math.sin(angleRad) * speed;
                const startX = cx + (Math.random() - 0.5) * 60; const startY = cy + (Math.random() - 0.5) * 20;

                const el = document.createElement('div'); el.className = 'bit-particle'; el.textContent = text;
                el.style.cssText = `
                    position: fixed; left: ${startX}px; top: ${startY}px; font-size: ${size}px; color: ${color};
                    opacity: ${alpha}; text-shadow: 0 0 ${isBin ? 10 : 20}px ${color}, 0 0 ${isBin ? 20 : 40}px ${color};
                    transform: translate(-50%, -50%) rotate(${(Math.random()-0.5)*20}deg);
                    pointer-events: none; z-index: 99999; font-weight: 900; font-family: 'JetBrains Mono', monospace; white-space: nowrap;
                `;
                (document.getElementById('tb-overlay') || document.body).appendChild(el);

                const duration = 2000 + Math.random() * 1000; const gravity  = 40;
                const startTime = performance.now();
                function animate(now) {
                    const t = (now - startTime) / 1000;
                    if (t > duration / 1000) { el.remove(); return; }
                    const x = startX + vx * t; const y = startY + vy * t + 0.5 * gravity * t * t;
                    const progress = t / (duration / 1000);
                    const opacity  = alpha * (1 - Math.pow(progress, 1.5));
                    const scale    = 1 + progress * 0.3;
                    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.opacity = Math.max(0, opacity);
                    el.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${(Math.random()-0.5)*2 + (progress*15)}deg)`;
                    requestAnimationFrame(animate);
                }
                requestAnimationFrame(animate);
            }, i * 20 + Math.random() * 20);
        }
    }

    function playTransition(href) {
        if(navigating) return;
        navigating = true;
        overlay.classList.add('darken');
        setTimeout(() => { overlay.classList.add('show-box'); }, 150);
        setTimeout(() => { box.classList.add('wiggle'); lock.textContent = '🔓'; }, 650);
        setTimeout(() => { box.classList.remove('wiggle'); overlay.classList.add('open-lid'); }, 1100);
        setTimeout(() => { launchParticles(currentStep); }, 1100);
        setTimeout(() => { overlay.classList.add('burst'); }, 1380);
        setTimeout(() => { flash.classList.add('on'); }, 2900);
        setTimeout(() => { window.location.href = href; }, 3200);
    }

    const BITBOX_NAMES = { '1': '⬡ 디지털 비트박스 ⬡', '2': '⬡ 비트 비트박스 ⬡', '3': '⬡ 숫자 비트박스 ⬡', '4': '⬡ 문자 비트박스 ⬡', '5': '⬡ 이미지 비트박스 ⬡', '6': '⬡ 소리 비트박스 ⬡', '7': '⬡ 동영상 비트박스 ⬡' };

    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const step = this.dataset.step;
            currentStep = step;

            const label = document.getElementById('tb-label');
            label.textContent = BITBOX_NAMES[step] || '⬡ BITBOX ⬡';

            const tbBody = document.getElementById('tb-body'); const tbLid = document.getElementById('tb-lid'); const tbLock = document.getElementById('tb-lock');
            tbBody.style.background = ''; tbBody.style.borderColor = ''; tbBody.style.boxShadow = '';
            tbLid.style.background  = ''; tbLid.style.borderColor  = ''; tbLid.style.boxShadow  = '';
            tbLock.style.background = ''; tbLock.style.borderColor = ''; tbLock.style.boxShadow = '';
            tbBody.style.setProperty('--tb-stripe', '#ffd700'); tbBody.style.setProperty('--tb-stripe-glow', 'rgba(255,215,0,0.6)');
            box.style.filter = 'none';

            if (step === '1' || step === '2') {
                tbBody.style.background = 'linear-gradient(145deg, #006b54, #004d3a, #003326)'; tbBody.style.borderColor = '#00f5c4'; tbBody.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), inset 0 2px 8px rgba(0,245,196,0.15)';
                tbLid.style.background = 'linear-gradient(145deg, #00a884, #006b54, #004d3a)'; tbLid.style.borderColor = '#00f5c4'; tbLid.style.boxShadow = '0 0 25px rgba(0,245,196,0.5), inset 0 3px 10px rgba(255,255,255,0.15)';
                tbLock.style.background = 'radial-gradient(circle at 35% 30%, #00f5c4, #00a884, #006b54)'; tbLock.style.borderColor = '#00f5c4'; tbLock.style.boxShadow = '0 0 16px rgba(0,245,196,0.7), inset 0 2px 6px rgba(255,255,255,0.3)';
                label.style.color = '#ffffff'; label.style.textShadow = '0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)';
            } else if (step === '3' || step === '4') {
                tbBody.style.background = 'linear-gradient(145deg, #1565c0, #0d47a1, #082a6b)'; tbBody.style.borderColor = '#5ac8fa'; tbBody.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), inset 0 2px 8px rgba(90,200,250,0.15)';
                tbLid.style.background = 'linear-gradient(145deg, #1e88e5, #1565c0, #0d47a1)'; tbLid.style.borderColor = '#5ac8fa'; tbLid.style.boxShadow = '0 0 25px rgba(90,200,250,0.5), inset 0 3px 10px rgba(255,255,255,0.15)';
                tbLock.style.background = 'radial-gradient(circle at 35% 30%, #90caf9, #1e88e5, #0d47a1)'; tbLock.style.borderColor = '#5ac8fa'; tbLock.style.boxShadow = '0 0 16px rgba(90,200,250,0.7), inset 0 2px 6px rgba(255,255,255,0.3)';
                label.style.color = '#ffffff'; label.style.textShadow = '0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)';
            } else if (step === '5' || step === '6') {
                tbBody.style.background = 'linear-gradient(145deg, #6a1b9a, #4a148c, #2d0060)'; tbBody.style.borderColor = '#d08ef7'; tbBody.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), inset 0 2px 8px rgba(191,90,242,0.15)';
                tbLid.style.background = 'linear-gradient(145deg, #8e24aa, #6a1b9a, #4a148c)'; tbLid.style.borderColor = '#d08ef7'; tbLid.style.boxShadow = '0 0 25px rgba(191,90,242,0.5), inset 0 3px 10px rgba(255,255,255,0.15)';
                tbLock.style.background = 'radial-gradient(circle at 35% 30%, #d08ef7, #8e24aa, #6a1b9a)'; tbLock.style.borderColor = '#d08ef7'; tbLock.style.boxShadow = '0 0 16px rgba(191,90,242,0.7), inset 0 2px 6px rgba(255,255,255,0.3)';
                label.style.color = '#ffffff'; label.style.textShadow = '0 0 8px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.9)';
            } else {
                tbBody.style.background = 'linear-gradient(145deg, #2c3e6b, #192a56, #0f1a3a)'; tbBody.style.borderColor = '#487eb0'; tbBody.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), inset 0 2px 8px rgba(72,126,176,0.15)';
                tbLid.style.background = 'linear-gradient(145deg, #3d5a8a, #2c3e6b, #192a56)'; tbLid.style.borderColor = '#487eb0'; tbLid.style.boxShadow = '0 0 25px rgba(72,126,176,0.5), inset 0 3px 10px rgba(255,255,255,0.15)';
                tbLock.style.background = 'radial-gradient(circle at 35% 30%, #a8c4e0, #487eb0, #2c3e6b)'; tbLock.style.borderColor = '#487eb0'; tbLock.style.boxShadow = '0 0 16px rgba(72,126,176,0.7), inset 0 2px 6px rgba(255,255,255,0.3)';
                label.style.color = '#ffffff'; label.style.textShadow = '0 0 8px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.9)';
            }
            playTransition(href);
        });
    });
})();