// app.js – 2rauf acoustic
// -------------------------------------------------------------
// Inhalte:
// 1) Hero-Slideshow mit adaptivem Overlay
// 2) Smooth Scrolling für Menü-Links
// 3) Mobiles Menü nach Klick schließen
// 4) Back-to-top Button
// 5) Einfache Lightbox für Galerie
// 6) Videos: nie zwei gleichzeitig abspielen
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // 1) HERO-SLIDESHOW + ADAPTIVES OVERLAY
  // ==============================
  const hero = document.querySelector(".hero");
  const slides = document.querySelectorAll(".hero .slide");
  let slideIdx = 0;
  let slideTimer = null;

  function measureBrightnessFromURL(url, onResult) {
    if (!url || typeof onResult !== "function") return;
    const img = new Image();
    // Bilder liegen lokal → kein CORS-Problem; crossOrigin schadet aber nicht
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const w = 32, h = 32;
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let sum = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // Wahrnehmungs-gewichtete Luminanz
          const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          sum += y; count++;
        }
        onResult(sum / count); // 0..255
      } catch (e) {
        onResult(170); // konservativer Mittelwert
      }
    };
    img.onerror = () => onResult(170);
    img.src = url;
  }

  function getActiveSlide() {
    return document.querySelector(".hero .slide.active") || slides[slideIdx] || null;
  }

  function updateOverlayForActiveSlide() {
    if (!hero || !slides.length) return;
    const active = getActiveSlide();
    if (!active) return;

    // Hintergrundbild-URL aus CSS holen
    const bg = getComputedStyle(active).backgroundImage;
    const m = bg && bg.match(/url\((['"]?)(.*?)\1\)/);
    const url = m && m[2];
    if (!url) return;

    measureBrightnessFromURL(url, (bright) => {
      // Schwellen fein: <120 dunkel, 120–170 mittel, >170 hell
      let top, mid, bot;
      if (bright < 120) {         // dunkel → Overlay leichter
        top = 0.06; mid = 0.12; bot = 0.32;
      } else if (bright < 170) {  // mittel
        top = 0.10; mid = 0.18; bot = 0.46;
      } else {                    // hell → Overlay stärker
        top = 0.15; mid = 0.24; bot = 0.60;
      }
      hero.style.setProperty("--ov-top", String(top));
      hero.style.setProperty("--ov-mid", String(mid));
      hero.style.setProperty("--ov-bot", String(bot));
    });
  }

  function showSlide(i) {
    if (!slides.length) return;
    slides.forEach((s, n) => s.classList.toggle("active", n === i));
    updateOverlayForActiveSlide();
  }

  function nextSlide() {
    if (!slides.length) return;
    slideIdx = (slideIdx + 1) % slides.length;
    showSlide(slideIdx);
  }

  // Slideshow starten (nur wenn Slides vorhanden)
  if (slides.length) {
    showSlide(0);
    slideTimer = setInterval(nextSlide, 5000);
    window.addEventListener("resize", () => {
      clearTimeout(window.__heroResizeTimer);
      window.__heroResizeTimer = setTimeout(updateOverlayForActiveSlide, 150);
    });
  }

  // ==============================
  // 2) SMOOTH SCROLLING FÜR MENÜ-LINKS
  // ==============================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ==============================
  // 3) MOBIL-MENÜ NACH KLICK SCHLIESSEN (falls .nav existiert)
  // ==============================
  const nav = document.querySelector(".nav");
  if (nav) {
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("show");
      });
    });
  }

  // ==============================
  // 4) BACK-TO-TOP BUTTON (#backToTop)
  // ==============================
  const backBtn = document.getElementById("backToTop");
  if (backBtn) {
    const toggleBackBtn = () => {
      if (window.scrollY > 500) backBtn.classList.add("show");
      else backBtn.classList.remove("show");
    };
    toggleBackBtn();
    window.addEventListener("scroll", toggleBackBtn);
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ==============================
  // 5) EINFACHE LIGHTBOX FÜR GALERIE (optional)
  //    Erwartet .gallery img (oder data-full)
  // ==============================
  const galleryImages = document.querySelectorAll(".gallery img");
  if (galleryImages.length) {
    let lb, lbImg, lbPrev, lbNext, lbClose, current = 0;

    function buildLightbox() {
      lb = document.createElement("div");
      lb.className = "lightbox-overlay";
      lb.innerHTML = `
        <button class="lb-close" aria-label="Schließen">×</button>
        <button class="lb-prev" aria-label="Zurück">‹</button>
        <img class="lb-img" alt="">
        <button class="lb-next" aria-label="Weiter">›</button>
      `;
      document.body.appendChild(lb);
      lbImg = lb.querySelector(".lb-img");
      lbPrev = lb.querySelector(".lb-prev");
      lbNext = lb.querySelector(".lb-next");
      lbClose = lb.querySelector(".lb-close");

      lb.addEventListener("click", (e) => {
        if (e.target === lb) closeLB();
      });
      lbClose.addEventListener("click", closeLB);
      lbPrev.addEventListener("click", prevLB);
      lbNext.addEventListener("click", nextLB);
      document.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("show")) return;
        if (e.key === "Escape") closeLB();
        if (e.key === "ArrowLeft") prevLB();
        if (e.key === "ArrowRight") nextLB();
      });
    }

    function openLB(i) {
      if (!lb) buildLightbox();
      current = i;
      const img = galleryImages[current];
      const full = img.dataset.full || img.src;
      lbImg.src = full;
      lb.classList.add("show");
      document.body.style.overflow = "hidden";
    }
    function closeLB() {
      lb.classList.remove("show");
      document.body.style.overflow = "";
    }
    function prevLB() {
      current = (current - 1 + galleryImages.length) % galleryImages.length;
      lbImg.src = galleryImages[current].dataset.full || galleryImages[current].src;
    }
    function nextLB() {
      current = (current + 1) % galleryImages.length;
      lbImg.src = galleryImages[current].dataset.full || galleryImages[current].src;
    }

    galleryImages.forEach((img, i) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openLB(i));
    });
  }

  // ==============================
  // 6) VIDEOS: NIE ZWEI GLEICHZEITIG
  // ==============================
  // HTML5 <video>:
  const videos = document.querySelectorAll("video");
  videos.forEach(v => {
    v.addEventListener("play", () => {
      videos.forEach(other => {
        if (other !== v && !other.paused) other.pause();
      });
      // auch YouTube-IFRAMES pausieren
      pauseAllYouTubeIframes();
    });
  });

  // YouTube <iframe> (erfordert enablejsapi=1 in der URL):
  function postToYouTube(iframe, command) {
    try {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: "command",
        func: command,
        args: []
      }), "*");
    } catch (e) {}
  }
  function pauseAllYouTubeIframes(except = null) {
    document.querySelectorAll('iframe[src*="youtube.com"]').forEach((f) => {
      if (f === except) return;
      postToYouTube(f, "pauseVideo");
    });
  }
  document.querySelectorAll('iframe[src*="youtube.com"]').forEach((f) => {
    // Stelle sicher: ?enablejsapi=1 ist gesetzt
    try {
      const u = new URL(f.src);
      if (u.searchParams.get("enablejsapi") !== "1") {
        u.searchParams.set("enablejsapi", "1");
        f.src = u.toString();
      }
    } catch (e) {}
    // Wenn ein YouTube-Frame „play“ empfängt, pausiere die anderen
    window.addEventListener("message", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data && data.event === "infoDelivery" && data.info && data.info.playerState === 1) {
          pauseAllYouTubeIframes(f);
          // zusätzlich HTML5-Videos pausieren
          videos.forEach(v => { if (!v.paused) v.pause(); });
        }
      } catch (_) {}
    });
  });
// 🔼 Nach-oben-Button Logik
const backToTopButton = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
});

backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

});

