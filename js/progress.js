/* 6. PROGRESS */
const TOTAL=7;
const STEP_COLORS={ 1:'#00f5c4',2:'#00f5c4', 3:'#0a84ff',4:'#0a84ff', 5:'#bf5af2',6:'#bf5af2',7:'#4361ee' };
function getCompleted(){ try{ return JSON.parse(localStorage.getItem('completedSteps')||'[]'); }catch{ return []; } }
function renderProgress(){
    const done=getCompleted();
    const segs=document.getElementById('progSegs');
    const cnt=document.getElementById('progCount');
    if(!segs || !cnt) return;
    segs.innerHTML='';
    for(let i=1;i<=TOTAL;i++){
        const seg=document.createElement('div');
        seg.className='prog-seg'+(done.includes(i)?' done':'');
        const col=STEP_COLORS[i];
        if(done.includes(i)){
            seg.style.background=col; seg.style.boxShadow=`0 0 10px ${col}`; seg.style.color=col;
        }
        segs.appendChild(seg);
    }
    cnt.textContent=`${done.length} / ${TOTAL}`;
    // 카운터 색: 어두운 색 계열은 밝은 톤으로 가독성 확보
    const CNT_COLORS={ 3:'#7ec3ff', 4:'#7ec3ff', 7:'#b8c0ff' };
    const maxDone=done.length>0?Math.max(...done):0;
    cnt.style.color=done.length>0?(CNT_COLORS[maxDone]||STEP_COLORS[maxDone]):'rgba(255,255,255,0.3)';
    document.querySelectorAll('.step-item').forEach(el=>{
        const s=parseInt(el.dataset.step);
        // STEP 7 번호 칩: 어두운 네이비 대신 밝은 페리윙클로 가독성 확보
        if(s===7){
            const num=el.querySelector('.step-num');
            if(num){
                num.style.color='#b8c0ff';
                num.style.borderColor='#b8c0ff';
            }
        }
        const isDone=done.includes(s);
        el.classList.toggle('is-done',isDone);
        // ✓ DONE 배지에 통과 점수 표시 (예: "✓ 100점")
        const badge=el.querySelector('.done-badge');
        if(badge){
            const sc=localStorage.getItem('score_step'+s);
            badge.textContent=(isDone && sc!==null)?`✓ ${sc}점`:'✓ DONE';
            if(isDone){
                // 배지 전용 색: 어두운 색 계열은 밝은 톤으로 가독성 확보
                const BADGE_COLORS={ 3:'#7ec3ff', 4:'#7ec3ff', 7:'#b8c0ff' };
                const bcol=BADGE_COLORS[s]||STEP_COLORS[s];
                badge.style.color=bcol;
                badge.style.fontWeight='900';
                badge.style.fontSize='0.85rem';
                badge.style.textShadow=`0 0 8px ${bcol}66`;
            }
        }
    });
}
renderProgress();

/* 7. MODAL */
const modal=document.getElementById('modal');
const mIcon=document.getElementById('mIcon');
const mTitle=document.getElementById('mTitle');
const mDesc=document.getElementById('mDesc');
const mBtns=document.getElementById('mBtns');

function openModal({icon,title,titleType,descHTML,buttonsHTML,noOverlayClose=false}){
    if(!modal) return;
    mTitle.className='modal-title'+(titleType?` type-${titleType}`:'');
    mIcon.textContent=icon; mTitle.textContent=title;
    mDesc.innerHTML=descHTML; mBtns.innerHTML=buttonsHTML;
    modal.dataset.noc=noOverlayClose?'1':''; modal.classList.add('show');
    const fb=mBtns.querySelector('button'); if(fb) setTimeout(()=>fb.focus(),50);
}
function closeModal(){ if(modal) modal.classList.remove('show'); }
if(modal){
    modal.addEventListener('click',e=>{ if(e.target===modal&&!modal.dataset.noc) closeModal(); });
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&modal&&modal.classList.contains('show')) closeModal(); });

function openResetModal(){
    openModal({
        icon:'⚠',title:'전체 데이터 초기화',titleType:'danger',
        descHTML:`저장된 <b>퀴즈 점수, 학습 메모, 소감문</b> 등<br>모든 기록이 영구적으로 삭제됩니다.<br><br>초기화하시겠습니까?`,
        buttonsHTML:`<button class="mbtn cancel" onclick="closeModal()">취소</button><button class="mbtn danger" onclick="executeReset()">초기화 진행</button>`,
        noOverlayClose:true
    });
}
function executeReset(){
    localStorage.clear(); renderProgress();
    openModal({
        icon:'✓',title:'초기화 완료',titleType:'success',
        descHTML:'모든 학습 데이터가 초기화되었습니다.',
        buttonsHTML:`<button class="mbtn primary" onclick="closeModal()">확인</button>`
    });
}
function openInfoModal(){
    openModal({
        icon:'ⓒ',title:'저작권 및 출처',titleType:'info',
        descHTML:`
        <div style="text-align:left;font-size:0.85rem;line-height:1.7;color:rgba(240,244,255,0.6);">
            <p style="margin-top:0;">본 <b style="color:var(--mint)">'데이터 비트박스'</b>는 교육 목적으로 제작된 프로그램입니다.</p>
            <div style="background:rgba(255,255,255,0.04);padding:14px;border-radius:10px;margin-bottom:10px;border:1px solid rgba(0,245,196,0.1);">
                <strong style="color:var(--mint)">1. 자체 제작 (100% Coding Art)</strong><br>
                모든 인터랙티브 시각 자료는 CSS·JS Canvas API로 코드 드로잉한 순수 창작물입니다.
                일부는 Google(Gemini) &amp; Claude 생성형 시각자료입니다.
            </div>
            <div style="background:rgba(255,255,255,0.04);padding:14px;border-radius:10px;border:1px solid rgba(191,90,242,0.1);">
                <strong style="color:var(--violet)">2. 오픈소스 (Open Source)</strong><br>
                • UI 아이콘: Google Material Icons (Apache 2.0)<br>
                • 웹 폰트: Noto Sans KR, Orbitron, JetBrains Mono (OFL)
            </div>
        </div>`,
        buttonsHTML:`<button class="mbtn primary" onclick="closeModal()">확인했습니다</button>`
    });
}
const copyBtn = document.getElementById('copyBtn');
if(copyBtn){ copyBtn.addEventListener('click',e=>{ e.preventDefault(); openInfoModal(); }); }