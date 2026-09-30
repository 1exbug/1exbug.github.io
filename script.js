const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const panel=$("#mobilePanel"), menu=$("#menuBtn");
menu?.addEventListener("click",()=>panel.classList.toggle("open"));
$$(".mobile-panel a").forEach(a=>a.addEventListener("click",()=>panel.classList.remove("open")));
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}}),{threshold:.08});
$$(".reveal").forEach(x=>obs.observe(x));
const sections=$$("main section[id]"), links=$$(".desktop-nav a");
const navObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id))}),{rootMargin:"-45% 0px -50% 0px"});
sections.forEach(s=>navObs.observe(s));
addEventListener("scroll",()=>{let h=document.documentElement.scrollHeight-innerHeight;$("#progress").style.width=(h?scrollY/h*100:0)+"%"},{passive:true});

const words=["map trust boundaries","challenge assumptions","replay state transitions","verify authorization"], type=$("#typeLine");let wi=0,ci=0,back=false;
function loop(){if(!type)return;let w=words[wi];type.textContent=w.slice(0,ci);if(!back){ci++;if(ci>w.length){back=true;return setTimeout(loop,900)}}else{ci--;if(ci===0){back=false;wi=(wi+1)%words.length}}setTimeout(loop,back?28:58)}loop();

const setTheme=()=>{document.body.classList.toggle("light",localStorage.getItem("1exbug-theme")==="light")};setTheme();
$("#themeToggle")?.addEventListener("click",()=>{localStorage.setItem("1exbug-theme",document.body.classList.contains("light")?"dark":"light");setTheme()});
async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch(e){}try{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();return true}catch(e){return false}}
$("#copyEmail")?.addEventListener("click",async()=>{if(await copyText("onexbugs@gmail.com")){const toast=$("#toast");toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1300)}});
$("#copyTerminal")?.addEventListener("click",()=>copyText("whoami\n1exbug — security researcher\nscope web api auth access-control logic\nmode responsible disclosure"));
$$('.target-row.clickable').forEach(row=>{const go=()=>{location.href=row.dataset.url};row.addEventListener('click',go);row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});

$$("[data-tilt]").forEach(c=>{c.addEventListener("pointermove",e=>{if(innerWidth<900)return;let r=c.getBoundingClientRect(),x=e.clientX/r.width-r.left/r.width,y=e.clientY/r.height-r.top/r.height;c.style.transform=`perspective(900px) rotateX(${-(e.clientY-r.top)/r.height*5+2.5}deg) rotateY(${(e.clientX-r.left)/r.width*6-3}deg) translateY(-4px)`});c.addEventListener("pointerleave",()=>c.style.transform="")});

// v20 interactive vulnerability filters
$$('#vulnFilters .filter').forEach(btn=>btn.addEventListener('click',()=>{
  $$('#vulnFilters .filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const filter=btn.dataset.filter;
  $$('.vuln-item').forEach(item=>{ item.style.display=(filter==='all'||item.dataset.vuln===filter)?'flex':'none'; });
}));

// v20 interactive research console
const consoleForm=$('#consoleForm'), consoleInput=$('#consoleInput'), consoleOutput=$('#consoleOutput');
const consoleResponses={
  about:'1exbug — independent web security research. Focus: web, API, auth, access control and business logic.',
  findings:'Documented: authentication, IDOR/BOLA, XSS, race conditions, WebSockets, session security and business logic issues.',
  targets:'1xSlots · ON-X · Zooma · BC.GAME · JetTon · Shuffle · Cloudbet · Casher · Vodka Casino',
  contact:'Telegram: @1exbug · Email: onexbugs@gmail.com · GitHub: github.com/1exbug',
  help:'about · findings · targets · contact · clear'
};
consoleForm?.addEventListener('submit',e=>{
  e.preventDefault();
  const cmd=consoleInput.value.trim().toLowerCase();
  if(!cmd)return;
  const line=document.createElement('p'); line.innerHTML='<b>1exbug@research:~$</b> '+cmd; consoleOutput.appendChild(line);
  if(cmd==='clear'){consoleOutput.innerHTML='';}
  else {const out=document.createElement('p'); out.className=consoleResponses[cmd]?'ok':'err'; out.textContent=consoleResponses[cmd]||'Unknown command. Type help.'; consoleOutput.appendChild(out);}
  consoleInput.value=''; consoleOutput.scrollTop=consoleOutput.scrollHeight;
});

/* v21 premium motion engine */
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer:fine)').matches;
  const dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');

  if (fine && dot && ring && !reduced) {
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener('pointermove', e=>{
      mx=e.clientX; my=e.clientY;
      document.body.style.setProperty('--mx',mx+'px');
      document.body.style.setProperty('--my',my+'px');
      dot.style.opacity='1'; ring.style.opacity='1';
      dot.style.transform=`translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    },{passive:true});
    function cursorLoop(){ rx+=(mx-rx)*.16; ry+=(my-ry)*.16; ring.style.transform=`translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`; requestAnimationFrame(cursorLoop); }
    cursorLoop();
    document.querySelectorAll('a,button,.clickable,.stack-list span,input').forEach(el=>{
      el.addEventListener('pointerenter',()=>ring.classList.add('hover'));
      el.addEventListener('pointerleave',()=>ring.classList.remove('hover'));
    });
  }

  if (reduced || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // Cinematic hero entrance.
  const heroTl=gsap.timeline({defaults:{ease:'power4.out'}});
  heroTl.from('.hero-copy .status-line',{y:20,opacity:0,duration:.7})
    .from('.hero-index',{y:24,opacity:0,duration:.6},'-=.45')
    .from('.hero h1',{y:55,opacity:0,filter:'blur(12px)',duration:1.05},'-=.4')
    .from('.hero-sub',{y:24,opacity:0,duration:.7},'-=.65')
    .from('.hero-actions .btn',{y:20,opacity:0,stagger:.09,duration:.55},'-=.45')
    .from('.hero-foot',{opacity:0,y:14,duration:.5},'-=.3')
    .from('.hero-visual',{x:60,opacity:0,scale:.92,rotateY:-8,duration:1.2},'-=1');

  // Scroll-linked depth and section choreography.
  gsap.utils.toArray('.section-head').forEach((head)=>{
    gsap.fromTo(head.querySelector('h2'),{y:28,opacity:0,clipPath:'inset(100% 0 0 0)'},{scrollTrigger:{trigger:head,start:'top 88%',once:true},y:0,opacity:1,clipPath:'inset(0% 0 0 0)',duration:.85,ease:'power3.out',immediateRender:false});
  });
  gsap.utils.toArray('.metrics > div').forEach((el,i)=>{
    gsap.fromTo(el,{y:30,opacity:0,scale:.9},{scrollTrigger:{trigger:'.metrics',start:'top 90%',once:true},y:0,opacity:1,scale:1,duration:.7,delay:i*.08,ease:'back.out(1.7)',immediateRender:false});
  });
  gsap.utils.toArray('.research-card,.principle,.method-card,.target-row,.bounty-row,.vuln-item').forEach((el,i)=>{
    gsap.fromTo(el,{y:42,opacity:0,rotateX:5,transformPerspective:900},{scrollTrigger:{trigger:el,start:'top 92%',once:true},y:0,opacity:1,rotateX:0,duration:.8,delay:(i%4)*.06,ease:'power3.out',immediateRender:false});
  });

  // Subtle hero parallax; no scroll hijacking.
  gsap.to('.hero-visual',{yPercent:-8,rotateZ:.7,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.2}});
  gsap.to('.hero-copy',{yPercent:-5,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.5}});
  gsap.to('.hero-scanline',{y:()=>innerHeight*1.15,ease:'none',scrollTrigger:{start:0,end:()=>document.documentElement.scrollHeight-innerHeight,scrub:true}});

  // Magnetic buttons.
  document.querySelectorAll('.hero-actions .btn,.contact-links a,.contact-links button').forEach(btn=>{
    btn.addEventListener('pointermove',e=>{
      const r=btn.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.13,y=(e.clientY-r.top-r.height/2)*.13;
      gsap.to(btn,{x,y,duration:.35,ease:'power3.out',overwrite:true});
    });
    btn.addEventListener('pointerleave',()=>gsap.to(btn,{x:0,y:0,duration:.55,ease:'elastic.out(1,.45)'}));
  });

  // 3D tilt with smooth interpolation for research cards.
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotateX:-y*4.5,rotateY:x*6,z:12,duration:.45,ease:'power2.out',overwrite:true});
    });
    card.addEventListener('pointerleave',()=>gsap.to(card,{rotateX:0,rotateY:0,z:0,duration:.8,ease:'elastic.out(1,.55)'}));
  });
})();

// Keep ScrollTrigger positions correct after fonts/layout settle.
window.addEventListener('load',()=>{ if(window.ScrollTrigger) ScrollTrigger.refresh(true); });
