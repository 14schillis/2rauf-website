// 2rauf acoustic – Skripte
// ---------------------------------------------------------------------------
// TERMINE HIER PFLEGEN: einfach eine Zeile ergänzen. Datum als JJJJ-MM-TT.
// Die Seite sortiert selbst: kommende Termine oben, vergangene darunter.
// ---------------------------------------------------------------------------
const EVENTS = [
  {
    date: "2026-11-21",
    time: "ab 17 Uhr",
    title: "Christkindlmarkt bei Zweirad Holbl",
    place: "Blainöd bei Taufkirchen (Vils)",
    note: "Akustische Livemusik zum Start in die Vorweihnachtszeit."
  },
  {
    date: "2026-10-17",
    time: "19–23 Uhr",
    title: "Mühldorfer Musiknacht",
    place: "Bangkok am Inn, Mühldorf am Inn",
    note: "Vier Sets live im Rahmen der Mühldorfer Musiknacht."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const year = $("#currentYear");
  if (year) year.textContent = String(new Date().getFullYear());

  // 1) Kopfzeile: Linie beim Scrollen, Zurück-nach-oben
  const header = $(".site-header");
  const toTop = $("#backToTop");
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 700);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // 2) Mobiles Menü
  const nav = $("#main-nav");
  const toggle = $("#menu-toggle");
  const closeMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menü öffnen");
  };
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("show");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("show") && !nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  // 3) Hero-Bilder wechseln
  const slides = $$(".arch .slide");
  if (slides.length > 1 && !reduceMotion) {
    let idx = 0;
    window.setInterval(() => {
      if (document.hidden) return;
      slides[idx].classList.remove("active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("active");
    }, 7000);
  }

  // 4) Termine
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const parts = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return {
      day: String(d),
      mon: dt.toLocaleDateString("de-DE", { month: "short" }).replace(".", ""),
      yr: String(y),
      long: dt.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })
    };
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const eventHTML = (ev, past) => {
    const p = parts(ev.date);
    return `<article class="event${past ? " past" : ""}">
      <div class="date"><span class="day">${p.day}</span><span class="mon">${esc(p.mon)}</span><span class="yr">${p.yr}</span></div>
      <div><h3>${esc(ev.title)}</h3><p class="meta">${esc(ev.place)} · ${esc(ev.time)}</p><p>${esc(ev.note || "")}</p></div>
    </article>`;
  };
  const upcoming = EVENTS.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = EVENTS.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const upBox = $("#events-upcoming");
  if (upBox) {
    upBox.innerHTML = upcoming.length
      ? upcoming.map((e) => eventHTML(e, false)).join("")
      : '<p class="events-empty">Aktuell sind keine öffentlichen Termine eingetragen. Neue Auftritte stehen hier und auf Instagram.</p>';
  }
  const pastBox = $("#events-past");
  if (pastBox && past.length) {
    pastBox.innerHTML = past.map((e) => eventHTML(e, true)).join("");
    $("#events-past-wrap").hidden = false;
  }
  if (upcoming.length) {
    const n = upcoming[0];
    const badge = $("#next-badge");
    if (badge) {
      $("#next-title").textContent = n.title;
      $("#next-meta").textContent = `${parts(n.date).long} · ${n.time}`;
      badge.hidden = false;
    }
  }

  // Strukturierte Daten für Google (Veranstaltungen + FAQ), aus dem sichtbaren Inhalt erzeugt
  const addLd = (obj) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  };
  if (upcoming.length) {
    addLd(upcoming.map((e) => ({
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: e.title,
      startDate: e.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: e.place, address: e.place },
      performer: { "@type": "MusicGroup", name: "2rauf acoustic" },
      description: e.note || ""
    })));
  }
  const faq = $$("#faq-list details").map((d) => ({
    "@type": "Question",
    name: $("summary", d).textContent.trim(),
    acceptedAnswer: { "@type": "Answer", text: $("p", d).textContent.trim() }
  }));
  if (faq.length) addLd({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq });

  // 5) Songs filtern
  const chips = $$("#song-filter .chip");
  const songs = $$("#songs li");
const apply = (f) => songs.forEach((li) => { li.hidden = f === "alle" ? !li.hasAttribute("data-all") : !li.dataset.tags.split(" ").includes(f); });
  apply("alle");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      apply(f);
    });
  });

  // 6) Galerie mit Lightbox
  const thumbs = $$("#gallery img");
  const lb = $("#lightbox");
  if (thumbs.length && lb) {
    const lbImg = $("#lightbox-img");
    const count = $("#lb-count");
    const btnPrev = $(".lb-prev", lb);
    const btnNext = $(".lb-next", lb);
    const btnClose = $(".lb-close", lb);
    let cur = 0;
    let lastFocus = null;

    const show = (i) => {
      cur = (i + thumbs.length) % thumbs.length;
      const t = thumbs[cur];
      lbImg.src = t.dataset.full || t.src;
      lbImg.alt = t.alt;
      count.textContent = `${cur + 1} / ${thumbs.length}`;
    };
    const open = (i) => {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("show");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      btnClose.focus();
    };
    const close = () => {
      lb.classList.remove("show");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lbImg.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    thumbs.forEach((t, i) => t.parentElement.addEventListener("click", () => open(i)));
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => show(cur - 1));
    btnNext.addEventListener("click", () => show(cur + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("show")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "Tab") {
        const f = [btnPrev, btnNext, btnClose];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // 7) Videos: YouTube erst nach Klick laden (Zwei-Klick-Lösung)
  const figs = $$(".video[data-yt]");
  const resets = new Map();
  figs.forEach((fig) => {
    const id = fig.dataset.yt;
    const frame = $(".video-frame", fig);
    const btn = $(".play", fig);
    if (window.__PREVIEW__) {
      const a = document.createElement("a");
      a.className = "play";
      a.href = `https://www.youtube.com/watch?v=${id}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", btn.getAttribute("aria-label") + " (YouTube)");
      a.innerHTML = btn.innerHTML;
      btn.replaceWith(a);
      return;
    }
    resets.set(fig, frame.innerHTML);
    frame.addEventListener("click", (e) => {
      if (!e.target.closest(".play")) return;
      figs.forEach((other) => {
        if (other !== fig && resets.has(other) && $("iframe", other)) {
          $(".video-frame", other).innerHTML = resets.get(other);
        }
      });
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      f.title = fig.dataset.title || "Video";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      frame.innerHTML = "";
      frame.appendChild(f);
    });
  });

  // 8) Anfrage vorbereiten (kein Server, nur Text für die eigene E-Mail)
  const form = $("#request-form");
  if (form) {
    const draftBox = $("#draft");
    const draft = $("#f-draft");
    const link = $("#mail-link");
    const status = $("#copy-status");
    const fmtDate = (v) => (v ? parts(v).long : "");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#f-name").value.trim();
      const anlass = $("#f-anlass").value;
      const datum = fmtDate($("#f-datum").value);
      const ort = $("#f-ort").value.trim();
      const text = $("#f-text").value.trim();
      const lines = [
        "Hallo Sabine und Michael,",
        "",
        "wir interessieren uns für euch als Akustikduo.",
        "",
        `Anlass: ${anlass}`,
        datum ? `Datum: ${datum}` : "",
        ort ? `Ort: ${ort}` : "",
        text ? `\nUnsere Wünsche:\n${text}` : "",
        "",
        "Viele Grüße",
        name
      ].filter((l, i, a) => !(l === "" && a[i - 1] === ""));
      const body = lines.join("\n");
      const subject = `Anfrage: ${anlass}${datum ? " am " + datum : ""}`;
      draft.value = body;
      link.href = `mailto:kontakt@2rauf.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      draftBox.classList.add("show");
      status.textContent = "";
      draft.focus();
    });

    $("#copy-draft").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(draft.value);
        status.textContent = "Text kopiert. Ihr könnt ihn jetzt in eine E-Mail an kontakt@2rauf.de einfügen.";
      } catch (_) {
        draft.select();
        status.textContent = "Text markiert. Bitte mit Strg+C bzw. Cmd+C kopieren.";
      }
    });
  }

  // 9) Sanftes Einblenden
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }
});
