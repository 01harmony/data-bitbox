// ── value_concept.js ─────────────────────────────────────────────
// [1단원: 디지털 데이터의 가치] 전용 스크립트

// 🌟 [설정] 1단원 고유 정보

        const THIS_STEP = 1; 
        const STEP_TITLE = "1. 디지털 데이터의 가치";
        const FILE_NAME_PREFIX = "디지털_데이터의_가치";
        const PASS_SCORE = 70;
        const MEMO_KEY = "value_concept_memo";
        const REF_KEY = "value_concept_reflection";

        const stepDotMap = {
            'step0-data':    0,
            'step1-intro':   1,
            'step2-visual':  2,
            'step3-compare': 3,
            'step4-quiz':    4
        };

        // 🌟 [개별 기능] 이 페이지에만 있는 특수 기능 (아날로그 vs 디지털 비교 등)
        function toggleCompare() {
            const section = document.getElementById('compare-section');
            const btn = document.getElementById('compareToggleBtn');
            if (section.style.display === 'none' || section.style.display === '') {
                section.style.display = 'grid';
                section.style.animation = 'fadeSlideDown 0.6s ease-out forwards';
                btn.classList.add('open');
                btn.querySelector('div').innerText = '아날로그와 디지털 비교 닫기';
                setTimeout(() => { section.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 50);
            } else {
                section.style.display = 'none';
                btn.classList.remove('open');
                btn.querySelector('div').innerText = '아날로그와 디지털 비교';
            }
        }

        // 🌡️ 온도계 인터랙션
        function updateThermo(val) {
            const temp = parseFloat(val);
            const ratio = (temp - (-10)) / 50;  // 0(=-10°C) ~ 1(=40°C)

            // ── 아날로그: 수은 높이 계산 ──
            // 눈금 좌표: y=30(40°) ~ y=155(-10°), 간격 25px/10°
            const tubeTop    = 30;   // 40°C 위치
            const tubeBottom = 155;  // -10°C 위치
            const maxHeight  = tubeBottom - tubeTop;  // 125px
            const mercuryHeight = Math.max(4, ratio * maxHeight);
            const mercury = document.getElementById('mercuryRect');
            if (mercury) {
                mercury.setAttribute('y', tubeBottom - mercuryHeight);
                mercury.setAttribute('height', mercuryHeight);
                const r = Math.round(100 + ratio * 155);
                const b = Math.round(220 - ratio * 190);
                mercury.setAttribute('fill', 'rgb(' + r + ',60,' + b + ')');
            }

            // ── 디지털: 0.1°C 단위로 끊김 ──
            const digitalTemp = Math.round(temp * 10) / 10;
            const digitalStr = digitalTemp.toFixed(1);
            const elDig = document.getElementById('digitalReading');
            const elDigTxt = document.getElementById('digitalReadingText');
            if (elDig) elDig.innerText = digitalStr;
            if (elDigTxt) elDigTxt.innerText = digitalStr + '°C';

            // ── 게이지 바 ──
            const barPct = ((digitalTemp + 10) / 50 * 100).toFixed(0);
            const elBar = document.getElementById('digitalBar');
            if (elBar) elBar.style.width = barPct + '%';
        }

        window.addEventListener('DOMContentLoaded', function() {
            var slider = document.getElementById('thermoSlider');
            if (slider) updateThermo(slider.value);
        });


        // ✉️ 편지 vs 이메일 탭 전환
        function switchExp(btn, type) {
            document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.exp-content').forEach(c => c.style.display = 'none');
            document.getElementById('exp-' + type).style.display = 'block';
        }


        // 🌍 생활 속 데이터 유형 선택
       const dtypeInfo = {
            text:   { icon:'📝', title:'문자 데이터', desc:'우리가 매일 주고받는 카톡부터 검색창에 입력하는 단어까지!<br>한글, 알파벳, 기호 등으로 이루어진 가장 친숙한 데이터예요.' },
            number: { icon:'🔢', title:'숫자 데이터', desc:'내 키와 몸무게, 시험 점수, 오늘의 날씨(기온)까지!<br>크기나 양을 정확하게 계산하고 비교할 수 있는 수치 정보예요.' },
            image:  { icon:'🖼️', title:'이미지 데이터', desc:'친구들과 찍은 찰칵! 셀카부터 예쁜 풍경 사진까지!<br>눈으로 보는 시각 정보로, 수많은 작은 점(픽셀)들이 모여 만들어져요.' },
            sound:  { icon:'🎵', title:'소리 데이터', desc:'매일 듣는 신나는 음악, 친구의 목소리, 게임 효과음까지!<br>귀로 듣는 모든 청각 정보도 컴퓨터 안에서는 0과 1로 저장돼요.' },
            video:  { icon:'🎬', title:'동영상 데이터', desc:'유튜브, 숏폼 영상, 넷플릭스 영화 등 우리가 즐겨보는 영상!<br>이미지와 소리가 하나로 합쳐진, 아주 크고 복잡한 데이터랍니다.' },
            sensor: { icon:'📡', title:'센서 데이터', desc:'스마트워치가 측정하는 심박수와 걸음 수, GPS 위치 정보까지!<br>우리 몸과 주변 환경의 변화를 실시간으로 읽어내는 똑똑한 데이터예요.' }
        };
        function selectDtype(el, type) {
            document.querySelectorAll('.dtype-scene').forEach(s => s.classList.remove('active'));
            el.classList.add('active');
            const info = dtypeInfo[type];
            if (!info) return;
            const panel = document.getElementById('dtypePanel');
            document.getElementById('dtypeIcon').textContent  = info.icon;
            document.getElementById('dtypeTitle').textContent = info.title;
            document.getElementById('dtypeDesc').innerHTML    = info.desc;
            panel.style.display = 'flex';
            panel.classList.remove('pop-anim');
            void panel.offsetWidth;
            panel.classList.add('pop-anim');
        }

        function toggleExample(element) {
            const answerBox = element.querySelector('.answer-box');
            const qText = element.querySelector('.q-text');
            if (answerBox.style.display === 'none' || answerBox.style.display === '') {
                answerBox.style.display = 'block';
                qText.innerText = '🔽 예시 닫기';
            } else {
                answerBox.style.display = 'none';
                qText.innerText = '❓ 실생활 예시 확인하기';
            }
        }