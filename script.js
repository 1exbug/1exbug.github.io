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

  /* ---------- dependency-free motion ---------- */
  // The page is intentionally fail-open: CSS keeps every content block visible.
  // Motion is an enhancement only and never controls whether content is rendered.
  const motionElements = $$('.reveal');
  const addMotion = (element, delay = 0) => {
    if (!element || element.dataset.motionDone === '1') return;
    element.dataset.motionDone = '1';
    element.style.setProperty('--motion-delay', `${delay}ms`);
    requestAnimationFrame(() => element.classList.add('in-view'));
  };

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = motionElements.indexOf(entry.target);
        addMotion(entry.target, (index >= 0 ? index % 4 : 0) * 55);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    motionElements.forEach(el => motionObserver.observe(el));
  } else {
    motionElements.forEach(el => addMotion(el, 0));
  }

  // Hero entrance runs only after content is already renderable.
  if (!reducedMotion) {
    requestAnimationFrame(() => document.body.classList.add('page-ready'));
  } else {
    document.body.classList.add('motion-reduced');
  }

  // Lightweight hero parallax using rAF; no scroll hijacking and no dependencies.
  const hero = $('.hero');
  const heroCopy = $('.hero-copy');
  const heroVisual = $('.hero-visual');
  let parallaxTick = false;
  const updateParallax = () => {
    parallaxTick = false;
    if (reducedMotion || !hero) return;
    const y = Math.min(window.scrollY, Math.max(0, hero.offsetHeight));
    const factor = Math.min(1, y / Math.max(1, hero.offsetHeight));
    if (heroCopy) heroCopy.style.setProperty('--parallax-y', `${(-factor * 22).toFixed(1)}px`);
    if (heroVisual) heroVisual.style.setProperty('--parallax-y', `${(-factor * 34).toFixed(1)}px`);
  };
  const onParallaxScroll = () => {
    if (parallaxTick) return;
    parallaxTick = true;
    requestAnimationFrame(updateParallax);
  };
  addEventListener('scroll', onParallaxScroll, { passive: true });
  updateParallax();

  // Desktop card tilt with CSS custom properties only.
  if (!reducedMotion && matchMedia('(pointer: fine)').matches && innerWidth >= 901) {
    $$('[data-tilt]').forEach(card => {
      const move = event => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--rx', `${(-y * 3.2).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(x * 4.2).toFixed(2)}deg`);
        card.style.setProperty('--tz', '7px');
      };
      const leave = () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--tz', '0px');
      };
      card.addEventListener('pointermove', move, { passive: true });
      card.addEventListener('pointerleave', leave, { passive: true });
    });
  }

  // Magnetic effect for primary actions only.
  if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
    $$('.hero-actions .btn, .contact-links a, .contact-links button').forEach(button => {
      const move = event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
        button.style.setProperty('--mx-btn', `${x.toFixed(1)}px`);
        button.style.setProperty('--my-btn', `${y.toFixed(1)}px`);
      };
      const leave = () => {
        button.style.setProperty('--mx-btn', '0px');
        button.style.setProperty('--my-btn', '0px');
      };
      button.addEventListener('pointermove', move, { passive: true });
      button.addEventListener('pointerleave', leave, { passive: true });
    });
  }

  // Custom cursor is purely decorative and never required for interaction.
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!reducedMotion && dot && ring && matchMedia('(pointer: fine)').matches) {
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;
    const moveCursor = event => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      body.style.setProperty('--mx', `${mouseX}px`);
      body.style.setProperty('--my', `${mouseY}px`);
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };
    addEventListener('pointermove', moveCursor, { passive: true });
    const cursorFrame = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(cursorFrame);
    };
    requestAnimationFrame(cursorFrame);
    $$('a, button, input, [data-tilt]').forEach(element => {
      element.addEventListener('pointerenter', () => ring.classList.add('hover'));
      element.addEventListener('pointerleave', () => ring.classList.remove('hover'));
    });
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
