const menuBtn=document.querySelector('.menu-btn'),sidebar=document.querySelector('.sidebar');
menuBtn?.addEventListener('click',()=>sidebar.classList.toggle('open'));
document.querySelectorAll('.sidebar nav a').forEach(link=>link.addEventListener('click',()=>sidebar.classList.remove('open')));
const sections=[...document.querySelectorAll('main section[id]')],navLinks=[...document.querySelectorAll('.sidebar nav a')];
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>observer.observe(s));
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>reveal.observe(e));
