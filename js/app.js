// -------------------------------
// 2rauf acoustic – app.js v4.6A
// -------------------------------

// === HERO SLIDESHOW ===
const slides = document.querySelectorAll(".slide");
let idx = 0;

function showSlide(i) {
  slides.forEach((s, n) => s.classList.toggle("active", n === i));
}
function nextSlide() {
  idx = (idx + 1) % slides.length;
  showSlide(idx);
}
showSlide(0);
setInterval(nextSlide, 5000); // alle 5 Sekunden Wechsel

// === SCROLL-TO-TOP BUTTON ===
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  toTop.style.display = window.scrollY > 300 ? "block" : "none";
});
toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// === LIGHTBOX FÜR GALLERIE ===
const galleryImgs = Array.from(document.querySelectorAll(".gallery img"));
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const btnPrev = document.querySelector(".lb-prev");
const btnNext = document.querySelector(".lb-next");
const btnClose = document.querySelector(".lb-close");
let current = 0;

function openLightbox(index) {
  current = index;
  lbImg.src = galleryImgs[current].src;
  lightbox.classList.add("show");
}
function closeLightbox() {
  lightbox.classList.remove("show");
}
function showPrev() {
  current = (current - 1 + galleryImgs.length) % galleryImgs.length;
  lbImg.src = galleryImgs[current].src;
}
function showNext() {
  current = (current + 1) % galleryImgs.length;
  lbImg.src = galleryImgs[current].src;
}

// Klick-Events
galleryImgs.forEach((img, i) => img.addEventListener("click", () => openLightbox(i)));
btnPrev.addEventListener("click", e => { e.stopPropagation(); showPrev(); });
btnNext.addEventListener("click", e => { e.stopPropagation(); showNext(); });
btnClose.addEventListener("click", e => { e.stopPropagation(); closeLightbox(); });
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

// Tastatursteuerung
document.addEventListener("keydown", e => {
  if (lightbox.classList.contains("show")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  }
});

// === RESPONSIVES MENÜ ===
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("show");
});

// Menü automatisch schließen nach Klick
document.querySelectorAll(".nav a").forEach(link =>
  link.addEventListener("click", () => {
    nav.classList.remove("show");
  })
);

// Menü automatisch schließen nach Klick
document.querySelectorAll(".nav a").forEach(link =>
  link.addEventListener("click", () => {
    nav.classList.remove("show");
  })
);

// === Stoppt andere YouTube-Videos, wenn eines gestartet wird ===
document.addEventListener("DOMContentLoaded", function() {
  const iframes = document.querySelectorAll('iframe[src*="youtube-nocookie.com"]');

  // Lausche auf Nachrichten von den eingebetteten YouTube-Playern
  window.addEventListener("message", function(event) {
    if (typeof event.data === "string" && event.data.includes('"event":"infoDelivery"')) {
      try {
        const data = JSON.parse(event.data);
        if (data.info && data.info.playerState === 1) { // Wenn ein Video gestartet wurde
          iframes.forEach((iframe) => {
            if (iframe.contentWindow !== event.source) {
              iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
          });
        }
      } catch (err) {
        // Fängt ungültige JSON-Nachrichten ab, verhindert Fehlermeldungen
      }
    }
  });
});
