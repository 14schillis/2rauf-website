// app.js – 2rauf acoustic
// -------------------------------------------------------------
// Inhalte:
// 1) Hero-Slideshow mit adaptivem Overlay
// 2) Mobiles Menü
// 3) Back-to-top Button
// 4) Barriereärmere Lightbox für die Galerie
// 5) Videos: nie zwei gleichzeitig abspielen
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }


  // ==============================
  // 1) HERO-SLIDESHOW + ADAPTIVES OVERLAY
  // ==============================

  const hero = document.querySelector(".hero");
  const slides = document.querySelectorAll(".hero .slide");

  let slideIdx = 0;


  function measureBrightnessFromURL(url, onResult) {
    if (!url || typeof onResult !== "function") return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext(
          "2d",
          { willReadFrequently: true }
        );

        const w = 32;
        const h = 32;

        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);

        let sum = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const brightness =
            0.2126 * r +
            0.7152 * g +
            0.0722 * b;

          sum += brightness;
          count++;
        }

        onResult(sum / count);

      } catch (_) {
        onResult(170);
      }
    };

    img.onerror = () => onResult(170);

    img.src = url;
  }


  function getActiveSlide() {
    return (
      document.querySelector(".hero .slide.active") ||
      slides[slideIdx] ||
      null
    );
  }


  function updateOverlayForActiveSlide() {
    if (!hero || !slides.length) return;

    const active = getActiveSlide();

    if (!active) return;

    const bg = getComputedStyle(active).backgroundImage;

    const match =
      bg &&
      bg.match(/url\((['"]?)(.*?)\1\)/);

    const url = match && match[2];

    if (!url) return;


    measureBrightnessFromURL(url, (bright) => {

      let top;
      let mid;
      let bot;

      if (bright < 120) {

        top = 0.06;
        mid = 0.12;
        bot = 0.32;

      } else if (bright < 170) {

        top = 0.10;
        mid = 0.18;
        bot = 0.46;

      } else {

        top = 0.15;
        mid = 0.24;
        bot = 0.60;
      }

      hero.style.setProperty(
        "--ov-top",
        String(top)
      );

      hero.style.setProperty(
        "--ov-mid",
        String(mid)
      );

      hero.style.setProperty(
        "--ov-bot",
        String(bot)
      );
    });
  }


  function showSlide(i) {
    if (!slides.length) return;

    slides.forEach((slide, index) => {
      slide.classList.toggle(
        "active",
        index === i
      );
    });

    updateOverlayForActiveSlide();
  }


  function nextSlide() {
    if (!slides.length) return;

    slideIdx =
      (slideIdx + 1) %
      slides.length;

    showSlide(slideIdx);
  }


  if (slides.length) {

    showSlide(0);

    if (!prefersReducedMotion) {
      window.setInterval(
        nextSlide,
        5000
      );
    }

    window.addEventListener(
      "resize",
      () => {

        window.clearTimeout(
          window.__heroResizeTimer
        );

        window.__heroResizeTimer =
          window.setTimeout(
            updateOverlayForActiveSlide,
            150
          );
      }
    );
  }


  // ==============================
  // 2) MOBIL-MENÜ
  // ==============================

  const nav =
    document.querySelector(".nav");

  const menuToggle =
    document.getElementById("menu-toggle");


  function closeMenu() {

    if (!nav || !menuToggle) return;

    nav.classList.remove("show");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Menü öffnen"
    );
  }


  if (menuToggle && nav) {

    menuToggle.addEventListener(
      "click",
      () => {

        const isOpen =
          nav.classList.toggle("show");

        menuToggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        menuToggle.setAttribute(
          "aria-label",
          isOpen
            ? "Menü schließen"
            : "Menü öffnen"
        );
      }
    );


    nav.querySelectorAll("a")
      .forEach((link) => {

        link.addEventListener(
          "click",
          closeMenu
        );
      });


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          nav.classList.contains("show")
        ) {

          closeMenu();
          menuToggle.focus();
        }
      }
    );


    document.addEventListener(
      "click",
      (event) => {

        if (
          !nav.classList.contains("show")
        ) {
          return;
        }

        if (
          nav.contains(event.target) ||
          menuToggle.contains(event.target)
        ) {
          return;
        }

        closeMenu();
      }
    );
  }


  // ==============================
  // 3) BACK-TO-TOP BUTTON
  // ==============================

  const backBtn =
    document.getElementById("backToTop");


  if (backBtn) {

    const toggleBackBtn = () => {

      backBtn.classList.toggle(
        "show",
        window.scrollY > 500
      );
    };


    toggleBackBtn();


    window.addEventListener(
      "scroll",
      toggleBackBtn,
      { passive: true }
    );


    backBtn.addEventListener(
      "click",
      () => {

        window.scrollTo({
          top: 0,
          behavior:
            prefersReducedMotion
              ? "auto"
              : "smooth"
        });
      }
    );
  }


  // ==============================
  // 4) LIGHTBOX FÜR GALERIE
  // ==============================

  const galleryImages =
    document.querySelectorAll(
      ".gallery img"
    );


  if (galleryImages.length) {

    const lightbox =
      document.getElementById(
        "lightbox"
      );

    const lightboxImg =
      lightbox
        ? lightbox.querySelector("img")
        : null;

    const prevBtn =
      lightbox
        ? lightbox.querySelector(
            ".lb-prev"
          )
        : null;

    const nextBtn =
      lightbox
        ? lightbox.querySelector(
            ".lb-next"
          )
        : null;

    const closeBtn =
      lightbox
        ? lightbox.querySelector(
            ".lb-close"
          )
        : null;


    let current = 0;
    let previousFocus = null;


    function setLightboxImage(index) {

      if (!lightboxImg) return;

      const img =
        galleryImages[index];

      lightboxImg.src =
        img.dataset.full ||
        img.src;

      lightboxImg.alt =
        img.alt ||
        "Vergrößerte Galerieansicht";
    }


    function openLightbox(index) {

      if (
        !lightbox ||
        !lightboxImg ||
        !closeBtn
      ) {
        return;
      }

      current = index;

      previousFocus =
        document.activeElement;

      setLightboxImage(current);

      lightbox.classList.add(
        "show"
      );

      lightbox.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.style.overflow =
        "hidden";

      closeBtn.focus();
    }


    function closeLightbox() {

      if (!lightbox) return;

      lightbox.classList.remove(
        "show"
      );

      lightbox.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.style.overflow =
        "";

      lightboxImg.removeAttribute(
        "src"
      );

      if (
        previousFocus &&
        typeof previousFocus.focus ===
          "function"
      ) {
        previousFocus.focus();
      }
    }


    function showPrevious() {

      current =
        (
          current -
          1 +
          galleryImages.length
        ) %
        galleryImages.length;

      setLightboxImage(current);
    }


    function showNext() {

      current =
        (current + 1) %
        galleryImages.length;

      setLightboxImage(current);
    }


    galleryImages.forEach(
      (img, index) => {

        img.tabIndex = 0;

        img.setAttribute(
          "role",
          "button"
        );

        img.setAttribute(
          "aria-label",
          `${
            img.alt ||
            "Galeriebild"
          } vergrößern`
        );


        img.addEventListener(
          "click",
          () =>
            openLightbox(index)
        );


        img.addEventListener(
          "keydown",
          (event) => {

            if (
              event.key === "Enter" ||
              event.key === " "
            ) {

              event.preventDefault();

              openLightbox(index);
            }
          }
        );
      }
    );


    if (
      lightbox &&
      closeBtn &&
      prevBtn &&
      nextBtn
    ) {

      lightbox.addEventListener(
        "click",
        (event) => {

          if (
            event.target === lightbox
          ) {
            closeLightbox();
          }
        }
      );


      closeBtn.addEventListener(
        "click",
        closeLightbox
      );


      prevBtn.addEventListener(
        "click",
        showPrevious
      );


      nextBtn.addEventListener(
        "click",
        showNext
      );


      document.addEventListener(
        "keydown",
        (event) => {

          if (
            !lightbox.classList.contains(
              "show"
            )
          ) {
            return;
          }

          if (
            event.key === "Escape"
          ) {
            closeLightbox();
          }

          if (
            event.key === "ArrowLeft"
          ) {
            showPrevious();
          }

          if (
            event.key === "ArrowRight"
          ) {
            showNext();
          }
        }
      );
    }
  }


  // ==============================
  // 5) VIDEOS:
  // NIE ZWEI GLEICHZEITIG
  // ==============================

  const videos =
    document.querySelectorAll(
      "video"
    );


  const youtubeSelector =
    'iframe[src*="youtube.com"], ' +
    'iframe[src*="youtube-nocookie.com"]';


  const youtubeFrames =
    Array.from(
      document.querySelectorAll(
        youtubeSelector
      )
    );


  function postToYouTube(
    iframe,
    command
  ) {

    try {

      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
          args: []
        }),
        "*"
      );

    } catch (_) {}
  }


  function pauseAllYouTubeIframes(
    except = null
  ) {

    youtubeFrames.forEach(
      (frame) => {

        if (frame === except) {
          return;
        }

        postToYouTube(
          frame,
          "pauseVideo"
        );
      }
    );
  }


  videos.forEach((video) => {

    video.addEventListener(
      "play",
      () => {

        videos.forEach(
          (other) => {

            if (
              other !== video &&
              !other.paused
            ) {
              other.pause();
            }
          }
        );

        pauseAllYouTubeIframes();
      }
    );
  });


  window.addEventListener(
    "message",
    (event) => {

      let data = event.data;


      if (typeof data === "string") {

        try {

          data =
            JSON.parse(data);

        } catch (_) {

          return;
        }
      }


      if (
        !data ||
        data.event !==
          "infoDelivery" ||
        !data.info ||
        data.info.playerState !== 1
      ) {
        return;
      }


      const activeFrame =
        youtubeFrames.find(
          (frame) =>
            frame.contentWindow ===
            event.source
        ) || null;


      if (!activeFrame) {
        return;
      }


      pauseAllYouTubeIframes(
        activeFrame
      );


      videos.forEach(
        (video) => {

          if (!video.paused) {
            video.pause();
          }
        }
      );
    }
  );
});
