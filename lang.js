const T={en:{
nav:{about:"About",research:"Research",method:"Method",stack:"Stack",contact:"Contact"},
hero:{status:"Independent security research",sub:"I research web applications and APIs to uncover weaknesses in authentication, access control and business logic.",cta:"View research",contact:"Contact"},
metrics:{findings:"documented findings",targets:"referenced targets",focus:"core focus areas",writeups:"public write-ups"},
labels:{about:"ABOUT",research:"RESEARCH",targets:"TARGETS",method:"METHOD",stack:"STACK",contact:"CONTACT"},
about:{title:"Think like the application.",text:"Security research is less about throwing payloads at a target and more about understanding what the application assumes is true. I map those assumptions, challenge them and turn unexpected behavior into reproducible evidence.",p1h:"Observe",p1p:"Map endpoints, roles, tokens, state transitions and trust boundaries.",p2h:"Challenge",p2p:"Test what happens when the expected sequence, identity or state changes.",p3h:"Prove",p3p:"Reduce the behavior to a clean, repeatable proof and document it responsibly."},
research:{title:"Selected findings."},
cards:{slots:{title:"Authentication & account logic",text:"Authentication, session and account-control issues documented across the application."},onx:{title:"Authorization & business logic",text:"KYC, payout, balance, race-condition and WebSocket access-control findings."},zooma:{title:"Responsible disclosure",text:"Race conditions, IDOR, XSS and token-exposure issues reported through a responsible disclosure channel."}},
read:"Read write-up",
targets:{title:"Research surface.",target:"Target",state:"State",pending:"disclosure"},
method:{title:"Map. Model. Break. Prove.",m1h:"Map",m1p:"Routes, APIs, parameters, roles, tokens and application state.",m2h:"Model",m2p:"Trust boundaries, assumptions and what the server actually verifies.",m3h:"Break",m3p:"Authorization, validation, concurrency, state and business logic.",m4h:"Prove",m4p:"Minimal reproduction, evidence, impact and responsible disclosure."},
stack:{title:"Tools & focus."},
contact:{title:"Let's talk security.",text:"Responsible disclosure, research collaboration or a technical question — choose a channel."},
copied:"Email copied"
},ru:{
nav:{about:"Обо мне",research:"Исследования",method:"Метод",stack:"Стек",contact:"Контакты"},
hero:{status:"Независимое исследование безопасности",sub:"Исследую веб-приложения и API, чтобы находить слабые места в аутентификации, контроле доступа и бизнес-логике.",cta:"Смотреть исследования",contact:"Связаться"},
metrics:{findings:"документированных находок",targets:"упомянутых целей",focus:"ключевых направлений",writeups:"публичных write-up"},
labels:{about:"ОБО МНЕ",research:"ИССЛЕДОВАНИЯ",targets:"ЦЕЛИ",method:"МЕТОД",stack:"СТЕК",contact:"КОНТАКТЫ"},
about:{title:"Думать как приложение.",text:"Исследование безопасности — это не просто отправка payload. Важно понять, какие предположения делает приложение, проверить их и превратить неожиданное поведение в воспроизводимое доказательство.",p1h:"Наблюдать",p1p:"Изучать endpoints, роли, токены, состояния и границы доверия.",p2h:"Проверять",p2p:"Менять ожидаемый порядок действий, идентичность и состояние системы.",p3h:"Доказывать",p3p:"Сводить поведение к чистому повторяемому PoC и ответственно документировать результат."},
research:{title:"Избранные находки."},
cards:{slots:{title:"Аутентификация и аккаунт",text:"Задокументированные проблемы аутентификации, сессий и управления аккаунтом."},onx:{title:"Контроль доступа и бизнес-логика",text:"Находки в KYC, выплатах, балансах, race condition и WebSocket-доступе."},zooma:{title:"Ответственное раскрытие",text:"Race condition, IDOR, XSS и проблемы с токенами переданы через канал ответственного раскрытия."}},
read:"Читать write-up",
targets:{title:"Поверхность исследования.",target:"Цель",state:"Статус",pending:"раскрытие"},
method:{title:"Карта. Модель. Атака. Доказательство.",m1h:"Карта",m1p:"Маршруты, API, параметры, роли, токены и состояния приложения.",m2h:"Модель",m2p:"Границы доверия, предположения и реальные проверки сервера.",m3h:"Атака",m3p:"Авторизация, валидация, конкуренция, состояния и бизнес-логика.",m4h:"Доказательство",m4p:"Минимальное воспроизведение, доказательства, воздействие и ответственное раскрытие."},
stack:{title:"Инструменты и фокус."},
contact:{title:"Поговорим о безопасности.",text:"Ответственное раскрытие, исследовательское сотрудничество или технический вопрос — выбери удобный канал."},
copied:"Почта скопирована"
}};
function val(o,k){if(Object.prototype.hasOwnProperty.call(o,k))return o[k];return k.split(".").reduce((x,p)=>x?.[p],o)}
let lang=localStorage.getItem("1exbug-lang")||"en";
function apply(langName){
  lang = langName === "ru" ? "ru" : "en";
  localStorage.setItem("1exbug-lang", lang);
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(e=>{
    const v = val(T[lang], e.dataset.i18n);
    if(v != null) e.textContent = v;
  });
  const en = document.getElementById("langEN");
  const ru = document.getElementById("langRU");
  en?.classList.toggle("active", lang === "en");
  ru?.classList.toggle("active", lang === "ru");
  en?.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
  ru?.setAttribute("aria-pressed", lang === "ru" ? "true" : "false");
}

document.getElementById("langEN")?.addEventListener("click", () => apply("en"));
document.getElementById("langRU")?.addEventListener("click", () => apply("ru"));
apply(lang);
