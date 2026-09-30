(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const root = document.documentElement;
  const body = document.body;

  /* ---------- helpers ---------- */
  const safeStorageGet = (key, fallback = null) => {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  };
  const safeStorageSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  };

  /* ---------- mobile navigation ---------- */
  const panel = $('#mobilePanel');
  const menu = $('#menuBtn');

  const setMenu = (open) => {
    if (!panel || !menu) return;
    panel.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  menu?.addEventListener('click', () => setMenu(!panel.classList.contains('open')));
  $$('.mobile-panel a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (event) => {
    if (!panel || !menu || !panel.classList.contains('open')) return;
    if (!panel.contains(event.target) && !menu.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  /* ---------- scroll progress ---------- */
  const progress = $('#progress');
  let scrollTicking = false;
  const updateProgress = () => {
    scrollTicking = false;
    if (!progress) return;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const pct = max ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progress.style.width = `${pct}%`;
  };
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateProgress);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  /* ---------- theme ---------- */
  const themeButton = $('#themeToggle');
  const applyTheme = (theme) => {
    const light = theme === 'light';
    body.classList.toggle('light', light);
    themeButton?.setAttribute('aria-pressed', String(light));
    themeButton?.setAttribute('title', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeButton?.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  };
  const storedTheme = safeStorageGet('1exbug-theme');
  const preferredTheme = storedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(preferredTheme);
  themeButton?.addEventListener('click', () => {
    const next = body.classList.contains('light') ? 'dark' : 'light';
    safeStorageSet('1exbug-theme', next);
    applyTheme(next);
  });

  /* ---------- clipboard + toast ---------- */
  const showToast = (messageKey = 'copied') => {
    const toast = $('#toast');
    if (!toast) return;
    // language system owns the text; only replace it when a custom message is passed.
    if (messageKey !== 'copied') toast.textContent = messageKey;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1400);
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  };

  $('#copyEmail')?.addEventListener('click', async () => {
    if (await copyText('onexbugs@gmail.com')) showToast();
  });

  $('#copyTerminal')?.addEventListener('click', async () => {
    const text = [
      'whoami',
      '1exbug — security researcher',
      'scope web api auth access-control logic',
      'mode responsible disclosure'
    ].join('\n');
    if (await copyText(text)) showToast();
  });

  /* ---------- typing line ---------- */
  const type = $('#typeLine');
  const words = ['map trust boundaries', 'challenge assumptions', 'replay state transitions', 'verify authorization'];
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let typeTimer = 0;
  const typeLoop = () => {
    if (!type) return;
    const word = words[wordIndex];
    type.textContent = deleting ? word.slice(0, charIndex) : word.slice(0, charIndex);

    if (!deleting) {
      charIndex += 1;
      if (charIndex > word.length) {
        deleting = true;
        typeTimer = window.setTimeout(typeLoop, 900);
        return;
      }
    } else {
      charIndex -= 1;
      if (charIndex <= 0) {
        charIndex = 0;
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    }
    typeTimer = window.setTimeout(typeLoop, deleting ? 28 : 58);
  };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) typeLoop();
  else if (type) type.textContent = words[0];

  /* ---------- active navigation ---------- */
  const navLinks = $$('.desktop-nav a');
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window && navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach(section => navObserver.observe(section));
  }

  /* ---------- vulnerability filters ---------- */
  const filterButtons = $$('#vulnFilters .filter');
  const vulnItems = $$('.vuln-item');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      vulnItems.forEach(item => {
        item.hidden = !(filter === 'all' || item.dataset.vuln === filter);
      });
    });
  });
  filterButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === 0)));

  /* ---------- research console ---------- */
  const consoleForm = $('#consoleForm');
  const consoleInput = $('#consoleInput');
  const consoleOutput = $('#consoleOutput');
  const consoleResponses = {
    about: '1exbug — independent web security research. Focus: web, API, auth, access control and business logic.',
    findings: '16 documented findings across authentication, authorization, IDOR/BOLA, XSS, race conditions, WebSockets and business logic.',
    targets: '1xSlots · ON-X · Zooma · BC.GAME · JetTon · Shuffle · Cloudbet · Casher · Vodka Casino',
    payouts: '1xSlots — 200 000 ₽ · ON-X Casino — 75 000 ₽ · Zooma Casino — 35 000 ₽ offered',
    status: 'Public write-ups: 2 · Responsible disclosure: active · Contact: @onexbug / onexbugs@gmail.com',
    contact: 'Telegram: @onexbug · Email: onexbugs@gmail.com · GitHub: github.com/1exbug',
    help: 'about · findings · targets · payouts · contact · status · clear'
  };

  const appendConsoleLine = (text, className = '') => {
    if (!consoleOutput) return;
    const line = document.createElement('p');
    if (className) line.className = className;
    line.textContent = text;
    consoleOutput.appendChild(line);
    while (consoleOutput.children.length > 42) consoleOutput.firstElementChild?.remove();
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  };

  consoleForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = (consoleInput?.value || '').trim().toLowerCase();
    if (!command || !consoleOutput) return;

    const prompt = document.createElement('p');
    const promptLabel = document.createElement('b');
    promptLabel.textContent = '1exbug@research:~$';
    prompt.append(promptLabel, document.createTextNode(` ${command}`));
    consoleOutput.appendChild(prompt);

    if (command === 'clear') {
      consoleOutput.replaceChildren();
    } else {
      appendConsoleLine(consoleResponses[command] || 'Unknown command. Type help.', consoleResponses[command] ? 'ok' : 'err');
    }
    if (consoleInput) consoleInput.value = '';
    consoleInput?.focus();
  });

  /* ---------- cinematic motion ---------- */
  if (!reducedMotion && window.gsap && window.ScrollTrigger) {
    try {
      body.classList.add('js-motion');
      gsap.registerPlugin(ScrollTrigger);

      // Make all motion elements start from a known state. If GSAP itself is unavailable,
      // the .js-motion class is never added, so the page remains fully visible.
      const reveals = gsap.utils.toArray('.reveal');
      gsap.set(reveals, { autoAlpha: 0, y: 24, scale: 0.99 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      heroTl
        .fromTo('.hero-copy .status-line', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7 })
        .fromTo('.hero-index', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55 }, '-=.4')
        .fromTo('.hero h1', { y: 52, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .85 }, '-=.35')
        .fromTo('.hero-sub', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .65 }, '-=.55')
        .fromTo('.hero-actions .btn', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, stagger: .07 }, '-=.42')
        .fromTo('.hero-foot', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45 }, '-=.3')
        .fromTo('.hero-visual', { x: 48, autoAlpha: 0, scale: .94, rotateY: -7 }, { x: 0, autoAlpha: 1, scale: 1, rotateY: 0, duration: 1.05 }, '-=.85');

      // Standard scroll reveals. One trigger per element keeps layout calculations simple and robust.
      reveals.forEach((element, index) => {
        gsap.to(element, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: .8,
          delay: (index % 4) * .055,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: {
            trigger: element,
            start: 'top 91%',
            once: true,
            invalidateOnRefresh: true
          }
        });
      });

      // Gentle parallax only on the hero; no scroll hijacking.
      gsap.to('.hero-visual', {
        yPercent: -7,
        rotateZ: .6,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
      gsap.to('.hero-copy', {
        yPercent: -4,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
      });
      gsap.to('.hero-scanline', {
        y: () => window.innerHeight * 1.1,
        ease: 'none',
        scrollTrigger: { start: 0, end: () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight), scrub: true }
      });

      // Desktop-only tilt. matchMedia automatically reverts these transforms when the breakpoint changes.
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px) and (pointer: fine)', () => {
        document.querySelectorAll('[data-tilt]').forEach(card => {
          const setX = gsap.quickTo(card, 'rotateX', { duration: .35, ease: 'power3.out' });
          const setY = gsap.quickTo(card, 'rotateY', { duration: .35, ease: 'power3.out' });
          const setZ = gsap.quickTo(card, 'z', { duration: .35, ease: 'power3.out' });
          const move = (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - .5;
            const y = (event.clientY - rect.top) / rect.height - .5;
            setX(-y * 4.2);
            setY(x * 5.5);
            setZ(10);
          };
          const leave = () => {
            setX(0); setY(0); setZ(0);
          };
          card.addEventListener('pointermove', move, { passive: true });
          card.addEventListener('pointerleave', leave, { passive: true });
        });
      });

      // Magnetic interactions for major CTAs only.
      $$('.hero-actions .btn, .contact-links a, .contact-links button').forEach(button => {
        const move = (event) => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) * .11;
          const y = (event.clientY - rect.top - rect.height / 2) * .11;
          gsap.to(button, { x, y, duration: .3, ease: 'power3.out', overwrite: true });
        };
        const leave = () => gsap.to(button, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.5)', overwrite: true });
        button.addEventListener('pointermove', move, { passive: true });
        button.addEventListener('pointerleave', leave, { passive: true });
      });

      // Custom cursor, desktop only.
      const dot = $('#cursorDot');
      const ring = $('#cursorRing');
      if (dot && ring && matchMedia('(pointer: fine)').matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        const moveCursor = (event) => {
          mouseX = event.clientX;
          mouseY = event.clientY;
          body.style.setProperty('--mx', `${mouseX}px`);
          body.style.setProperty('--my', `${mouseY}px`);
          dot.style.opacity = '1';
          ring.style.opacity = '1';
          dot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0) translate(-50%,-50%)`;
        };
        addEventListener('pointermove', moveCursor, { passive: true });
        const cursorFrame = () => {
          ringX += (mouseX - ringX) * .16;
          ringY += (mouseY - ringY) * .16;
          ring.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
          requestAnimationFrame(cursorFrame);
        };
        requestAnimationFrame(cursorFrame);
        $$('a, button, input, [data-tilt]').forEach(element => {
          element.addEventListener('pointerenter', () => ring.classList.add('hover'));
          element.addEventListener('pointerleave', () => ring.classList.remove('hover'));
        });
      }

      // GSAP calculates trigger positions from the rendered layout; refresh after fonts/layout settle.
      addEventListener('load', () => window.requestAnimationFrame(() => ScrollTrigger.refresh(true)), { once: true });
      setTimeout(() => ScrollTrigger.refresh(true), 250);
      setTimeout(() => ScrollTrigger.refresh(true), 900);
    } catch (error) {
      console.warn('Motion engine fallback:', error);
      body.classList.remove('js-motion');
      $$('.reveal').forEach(element => {
        element.style.removeProperty('opacity');
        element.style.removeProperty('visibility');
        element.style.removeProperty('transform');
        element.style.removeProperty('filter');
      });
    }
  }

  /* Ensure anchors work even when a script or animation library fails. */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', () => {
      const id = anchor.getAttribute('href');
      if (id && id.length > 1) setTimeout(() => updateProgress(), 0);
    });
  });

  // Release the timer on page teardown.
  addEventListener('pagehide', () => window.clearTimeout(typeTimer), { once: true });
})();
