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
