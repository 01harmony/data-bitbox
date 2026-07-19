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
    cnt.style.color=done.length>0?STEP_COLORS[Math.max(...done)]:'rgba(255,255,255,0.3)';
    document.querySelectorAll('.step-item').forEach(el=>{
        const s=parseInt(el.dataset.step);
        el.classList.toggle('is-done',done.includes(s));
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