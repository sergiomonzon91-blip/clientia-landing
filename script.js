/* ClientIA · Landing */
(function () {
  "use strict";

  /* ===== Configuración: completar con los datos reales ===== */
  var CONFIG = {
    whatsapp: "5493760000000",                       // [Completar] número con código de país, sin + ni espacios
    email: "contacto@clientia.com.ar",               // [Completar] email que recibe los avisos
    formEndpoint: ""                                 // [Completar] URL de Formspree / backend / CRM. Vacío = abre el correo del usuario
  };

  document.documentElement.classList.remove("no-js");

  /* ===== Idiomas ===== */
  var LANGS = { es: { html: "es-AR", og: "es_AR" }, pt: { html: "pt-BR", og: "pt_BR" }, en: { html: "en", og: "en_US" } };
  var I18N = window.CLIENTIA_I18N || { es: {} };
  var STORE_KEY = "clientia-lang";
  var lang = "es";

  // El español sale del propio HTML: se guarda antes de traducir para poder volver.
  var base = {};
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    base[el.getAttribute("data-i18n")] = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
    el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
      var p = pair.split(":");
      if (!(p[1] in base)) base[p[1]] = el.getAttribute(p[0]);
    });
  });

  function t(key) {
    var d = I18N[lang] || {};
    if (key in d) return d[key];
    if (key in I18N.es) return I18N.es[key];
    return key in base ? base[key] : key;
  }

  function setMeta(sel, attr, val) {
    var m = document.querySelector(sel);
    if (m) m.setAttribute(attr, val);
  }

  function applyLang(next, save) {
    lang = LANGS[next] ? next : "es";
    var root = document.documentElement;
    root.lang = LANGS[lang].html;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var p = pair.split(":");
        el.setAttribute(p[0], t(p[1]));
      });
    });

    document.title = t("meta.title");
    setMeta('meta[name="description"]', "content", t("meta.desc"));
    setMeta('meta[property="og:locale"]', "content", LANGS[lang].og);

    // Selector de idioma
    document.getElementById("lang-cur").textContent = lang.toUpperCase();
    document.querySelectorAll(".js-lang").forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute(b.getAttribute("role") === "menuitemradio" ? "aria-checked" : "aria-pressed", String(on));
    });

    // Textos que dependen del idioma fuera del HTML
    updateWhatsApp();
    setMenu(nav.classList.contains("is-open"));
    clearFormErrors();

    if (save) {
      try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
      try {
        var url = new URL(window.location.href);
        if (lang === "es") url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (e) {}
      track("language_change", { idioma: lang });
    }
    root.removeAttribute("data-i18n-pending");
  }

  /* Analítica: GA4 y píxel de Meta (si están cargados) */
  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    if (typeof window.fbq === "function" && name !== "language_change") {
      window.fbq("track", name === "generate_lead" ? "Lead" : "Contact", params || {});
    }
  }

  /* WhatsApp */
  function updateWhatsApp() {
    var waUrl = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(t("wa.msg"));
    document.querySelectorAll(".js-wa").forEach(function (a) { a.href = waUrl; });
  }
  document.querySelectorAll(".js-wa").forEach(function (a) {
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", function () {
      track("whatsapp_click", { ubicacion: a.dataset.track || "whatsapp", idioma: lang });
    });
  });
  document.querySelectorAll(".js-mail").forEach(function (a) {
    a.href = "mailto:" + CONFIG.email;
    a.textContent = CONFIG.email;
  });
  document.querySelectorAll("[data-track^='cta_']").forEach(function (a) {
    a.addEventListener("click", function () { track("cta_click", { ubicacion: a.dataset.track, idioma: lang }); });
  });

  /* Año */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Header al hacer scroll */
  var header = document.querySelector(".header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menú hamburguesa */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
  }
  burger.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* Selector de idioma (desplegable en escritorio, botones en el menú del celular) */
  var langBtn = document.getElementById("lang-btn");
  var langMenu = document.getElementById("lang-menu");
  function setLangMenu(open) {
    langMenu.hidden = !open;
    langBtn.setAttribute("aria-expanded", String(open));
  }
  langBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    setLangMenu(langMenu.hidden);
    if (!langMenu.hidden) langMenu.querySelector(".is-active, button").focus();
  });
  langMenu.addEventListener("keydown", function (e) {
    var items = Array.prototype.slice.call(langMenu.querySelectorAll("button"));
    var i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  });
  document.addEventListener("click", function (e) {
    if (!langMenu.hidden && !e.target.closest("#lang")) setLangMenu(false);
  });
  document.querySelectorAll(".js-lang").forEach(function (b) {
    b.addEventListener("click", function () {
      applyLang(b.dataset.lang, true);
      if (!langMenu.hidden) { setLangMenu(false); langBtn.focus(); }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    setMenu(false);
    if (!langMenu.hidden) { setLangMenu(false); langBtn.focus(); }
  });

  /* Sección activa en el menú */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) spy.observe(s); });

    /* Animación de entrada */
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); rev.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      rev.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Política de privacidad (delegado: los enlaces se regeneran al cambiar de idioma) */
  var modal = document.getElementById("privacy");
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".js-privacy")) return;
    e.preventDefault();
    if (modal && typeof modal.showModal === "function") modal.showModal();
  });

  /* Formulario */
  var form = document.getElementById("form");
  var ok = document.getElementById("form-ok");
  var privErr = document.getElementById("err-priv");
  var submitBtn = form.querySelector("button[type=submit]");
  var fields = form.querySelectorAll("input:not([type=checkbox]), textarea");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[+()\d\s-]{7,20}$/;

  function setError(input, msg) {
    var field = input.closest(".field");
    if (!field) return;
    field.classList.toggle("is-invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    var err = field.querySelector(".field__err");
    if (err) err.textContent = msg || "";
  }

  function clearFormErrors() {
    fields.forEach(function (inp) { setError(inp, ""); });
    privErr.textContent = "";
  }

  function validate(input) {
    var v = input.value.trim();
    if (input.required && !v) return t("err.required");
    if (input.type === "email" && v && !emailRe.test(v)) return t("err.email");
    if (input.type === "tel" && v && !phoneRe.test(v)) return t("err.phone");
    return "";
  }

  fields.forEach(function (inp) {
    inp.addEventListener("blur", function () { setError(inp, validate(inp)); });
    inp.addEventListener("input", function () {
      if (inp.closest(".field").classList.contains("is-invalid")) setError(inp, validate(inp));
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var first = null;
    fields.forEach(function (inp) {
      var msg = validate(inp);
      setError(inp, msg);
      if (msg && !first) first = inp;
    });
    var priv = document.getElementById("f-priv");
    privErr.textContent = priv.checked ? "" : t("err.privacy");
    if (!priv.checked && !first) first = priv;
    if (first) { first.focus(); return; }

    var data = { idioma: lang };
    new FormData(form).forEach(function (v, k) { data[k] = v; });

    function resetButton() {
      submitBtn.disabled = false;
      submitBtn.textContent = t("form.submit");
    }

    function done() {
      track("generate_lead", { rubro: data.rubro, idioma: lang });
      form.reset();
      ok.hidden = false;
      resetButton();
    }

    if (CONFIG.formEndpoint) {
      submitBtn.disabled = true;
      submitBtn.textContent = t("form.sending");
      fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        done();
      }).catch(function () {
        resetButton();
        privErr.textContent = t("err.send");
      });
    } else {
      var body = t("mail.name") + ": " + data.nombre + "\n" + t("mail.company") + ": " + data.empresa +
        "\n" + t("mail.industry") + ": " + data.rubro + "\n" + t("mail.email") + ": " + data.email +
        "\n" + t("mail.phone") + ": " + data.telefono + "\n\n" + (data.mensaje || "");
      window.location.href = "mailto:" + CONFIG.email + "?subject=" +
        encodeURIComponent(t("mail.subject") + " · " + data.empresa) + "&body=" + encodeURIComponent(body);
      done();
    }
  });

  /* Idioma inicial: ?lang=, elección guardada o idioma del navegador (resuelto en el <head>) */
  applyLang(window.__CLIENTIA_LANG || "es", false);
})();
