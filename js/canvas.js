/* 1. STAR FIELD */
(function(){
    const c = document.getElementById('starCanvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    let stars = [];
    function resize(){
        c.width = innerWidth; c.height = innerHeight;
        stars = Array.from({length:220}, ()=>({
            x: Math.random()*innerWidth, y: Math.random()*innerHeight,
            r: Math.random()*1.4+0.2, o: Math.random()*0.7+0.1,
            sp: Math.random()*0.015+0.003, phase: Math.random()*Math.PI*2
        }));
    }
    let t=0;
    function draw(){
        ctx.clearRect(0,0,c.width,c.height);
        stars.forEach(s=>{
            ctx.globalAlpha = s.o*(0.5+0.5*Math.sin(t*s.sp+s.phase));
            ctx.fillStyle='#fff';
            ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha=1; t+=1;
        requestAnimationFrame(draw);
    }
    resize(); addEventListener('resize',resize); draw();
})();

/* 2. PERSPECTIVE GRID */
(function(){
    const c = document.getElementById('gridCanvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    let offset = 0;
    function resize(){ c.width=innerWidth; c.height=innerHeight; }
    function draw(){
        ctx.clearRect(0,0,c.width,c.height);
        const W=c.width, H=c.height, HH=H*0.62;
        const LINES=18, VCOLS=22;
        for(let i=0;i<LINES;i++){
            const t = (i/(LINES-1));
            const y = HH + (H-HH)*(t*t) + (offset*t*t*60)%((H-HH)/LINES);
            const alpha = t*0.55;
            ctx.strokeStyle=`rgba(0,245,196,${alpha})`; ctx.lineWidth=0.5;
            ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
        }
        const vp = {x:W/2, y:HH};
        for(let i=0;i<=VCOLS;i++){
            const bx = (i/VCOLS)*W;
            const alpha = 0.15 + 0.2*(1-Math.abs(i/VCOLS-0.5)*2);
            ctx.strokeStyle=`rgba(0,245,196,${alpha})`; ctx.lineWidth=0.4;
            ctx.beginPath(); ctx.moveTo(vp.x,vp.y); ctx.lineTo(bx,H); ctx.stroke();
        }
        const gr = ctx.createLinearGradient(0,HH-40,0,HH+40);
        gr.addColorStop(0,'rgba(0,245,196,0)'); gr.addColorStop(0.5,'rgba(0,245,196,0.25)'); gr.addColorStop(1,'rgba(0,245,196,0)');
        ctx.fillStyle=gr; ctx.fillRect(0,HH-40,W,80);
        offset+=0.3; requestAnimationFrame(draw);
    }
    resize(); addEventListener('resize',resize); draw();
})();

/* 3. PARTICLE STREAM */
(function(){
    const c = document.getElementById('particleCanvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    let pts = [];
    const COLORS=['#00f5c4','#0a84ff','#bf5af2','#ffd60a'];
    function resize(){
        c.width=innerWidth; c.height=innerHeight;
        pts = Array.from({length:55},()=>mkPt());
    }
    function mkPt(){
        return {
            x: Math.random()*innerWidth, y: Math.random()*innerHeight,
            vy: -(Math.random()*0.6+0.15), vx: (Math.random()-0.5)*0.3,
            life:0, maxLife: 180+Math.random()*200,
            char: Math.random()>0.5?'1':'0', size: Math.random()*8+7,
            col: COLORS[Math.floor(Math.random()*COLORS.length)]
        };
    }
    function draw(){
        ctx.clearRect(0,0,c.width,c.height);
        ctx.font='700 12px "JetBrains Mono", monospace';
        pts.forEach((p,i)=>{
            p.x+=p.vx; p.y+=p.vy; p.life++;
            if(p.life>p.maxLife||p.y<-30) pts[i]=mkPt();
            const alpha = Math.min(p.life/30,1)*Math.min((p.maxLife-p.life)/30,1)*0.45;
            ctx.globalAlpha=alpha; ctx.fillStyle=p.col;
            ctx.font=`700 ${p.size}px "JetBrains Mono",monospace`;
            ctx.fillText(p.char,p.x,p.y);
        });
        ctx.globalAlpha=1; requestAnimationFrame(draw);
    }
    resize(); addEventListener('resize',resize); draw();
})();

/* 4. HERO TYPING */
(function(){
    const el = document.getElementById('typedText');
    if(!el) return;
    const txt = '어떻게 이해할까?';
    let i=0;
    setTimeout(function type(){
        if(i<=txt.length){ el.textContent=txt.slice(0,i++); setTimeout(type,95); }
    },1000);
})();

/* 5. 3D TILT */
document.querySelectorAll('.pillar').forEach(card=>{
    card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        const dx=(e.clientX-cx)/r.width, dy=(e.clientY-cy)/r.height;
        card.style.transform=`translateY(-8px) rotateY(${dx*10}deg) rotateX(${-dy*8}deg)`;
    });
    card.addEventListener('mouseleave',()=>{
        card.style.transform=''; card.style.transition='transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.4s, box-shadow 0.4s';
    });
    card.addEventListener('mouseenter',()=>{
        card.style.transition='transform 0.08s ease, border-color 0.4s, box-shadow 0.4s';
    });
});