
    const galleryGrid = document.getElementById("gallery-grid");
    const trendingGrid = document.getElementById("trending-grid");
    const pageVeil = document.getElementById("page-veil");
    const contactForm = document.getElementById("contact-form");
    const contactStatus = document.getElementById("contact-status");
    const contactSubmit = document.getElementById("contact-submit");
    let galleryImages = [];

    // API Base URL - uses localhost for development, production URL for deployment
    const BASE_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://portfolio-backend-750g.onrender.com";

    function cloudinaryOptimizedUrl(url) {
      if (!url || typeof url !== "string") return url;
      if (!url.includes("res.cloudinary.com")) return url;
      const marker = "/upload/";
      const i = url.indexOf(marker);
      if (i === -1) return url;
      const rest = url.slice(i + marker.length);
      if (rest.startsWith("f_auto,q_auto,w_800/")) return url;
      return url.slice(0, i + marker.length) + "f_auto,q_auto,w_800/" + rest;
    }

    function onReady(fn) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
      } else {
        fn();
      }
    }

    async function getAnalytics() {
      try {
        const res = await fetch(`${BASE_URL}/api/analytics`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Analytics:", data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    }

    async function updateVisits() {
      try {
        const res = await fetch(`${BASE_URL}/api/analytics`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        document.querySelector("#visit-counter span").textContent =
          `${data.visits ?? data.totalVisits ?? 0} visits`;
      } catch (err) {
        console.error("Failed to update visits:", err);
      }
    }

    function runAnalytics() {
      void (async () => {
        try {
          await fetch(`${BASE_URL}/api/analytics/visit`, {
            method: "POST",
          });
          await getAnalytics();
          await updateVisits();
        } catch (err) {
          console.log("Analytics error:", err);
        }
      })();
    }

    // ── Cursor ──
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function animCursor() {
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animCursor);
    }
    animCursor();

    document.querySelectorAll("a, button, .strip-item").forEach((el) => {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("hovering"),
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("hovering"),
      );
    });
    document.addEventListener("mouseover", (event) => {
      if (event.target.closest(".g-item"))
        document.body.classList.add("hovering");
    });
    document.addEventListener("mouseout", (event) => {
      if (event.target.closest(".g-item"))
        document.body.classList.remove("hovering");
    });

    // ── Scroll Reveal ──
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "50px" },
    );

    function observeRevealElements(elements) {
      elements.forEach((el) => observer.observe(el));
    }
    observeRevealElements(document.querySelectorAll(".reveal"));

    // ── Smooth anchor scrolling with softer easing ──
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
      const toggleMenu = () => navLinks.classList.toggle("active");
      menuToggle.addEventListener("click", toggleMenu);
      menuToggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleMenu();
        }
      });
      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () =>
          navLinks.classList.remove("active"),
        );
      });
    }

    if (galleryGrid) {
      galleryGrid.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault();
          galleryGrid.scrollLeft += event.deltaY;
        },
        { passive: false },
      );
    }

    // Handle image load for premium fade-in effect
    document.addEventListener(
      "load",
      (event) => {
        if (event.target.classList) {
          // Handle gallery/trending images
          if (event.target.classList.contains("gallery-img")) {
            event.target.classList.add("loaded");
          }
          // Handle lazy loaded static images
          if (event.target.classList.contains("lazy-img")) {
            event.target.classList.add("loaded");
          }
        }
      },
      true,
    );

    // Handle image errors with fallback
    document.addEventListener(
      "error",
      (event) => {
        if (event.target.classList && event.target.tagName === "IMG") {
          // Add error class for styling
          event.target.classList.add("error");

          // Fallback for gallery/trending images without inline onerror
          if (
            event.target.classList.contains("gallery-img") &&
            !event.target.onerror
          ) {
            const alt = event.target.alt || "Image";
            event.target.src = `https://via.placeholder.com/400x300/2a0a3f/ffffff?text=${encodeURIComponent(alt)}`;
          }
        }
      },
      true,
    );

    function renderGallery(imageList, isLoading = false) {
      if (!galleryGrid) return;
      galleryGrid.innerHTML = "";

      if (isLoading) {
        // Show skeleton placeholders
        const skeletonCount = 6;
        const skeletons = Array(skeletonCount)
          .fill(0)
          .map(
            (_, index) => `
                    <div class="skeleton-card" style="--index: ${index}">
                        <div class="skeleton-inner"></div>
                    </div>
                `,
          )
          .join("");
        galleryGrid.innerHTML = skeletons;
        return;
      }

      if (!imageList.length) {
        galleryGrid.innerHTML =
          '<p class="gallery-desc reveal visible">No gallery images found yet.</p>';
        return;
      }

      const cards = imageList
        .filter((_, index) => index !== 18)
        .map((img, index) => {
          const displayUrl = cloudinaryOptimizedUrl(img.url);
          const frameNum = index < 18 ? index + 1 : index + 2;
          return `
        <div class="g-item gallery-item reveal card" data-image-id="${img._id}">
          <div class="image-container">
            <img src="${displayUrl}" data-id="${img._id}" alt="Gallery image ${frameNum}" loading="lazy" decoding="async" class="gallery-img" onerror="this.src='https://via.placeholder.com/400x300/2a0a3f/ffffff?text=Gallery+Image'"/>
            <button class="preview-icon" aria-label="View image preview" data-preview-src="${displayUrl}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <div class="frame-overlay">FRAME ${String(frameNum).padStart(2, "0")}</div>
            <div class="like-overlay">
              <button class="like-btn" data-id="${img._id}" aria-label="Like photo">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <span class="like-count">${img.likes || 0}</span>
            </div>
          </div>
        </div>
      `;
        })
        .join("");

      galleryGrid.innerHTML = cards;
      observeRevealElements(galleryGrid.querySelectorAll(".reveal"));
      applyLikedStates();
    }

    function renderTrending(imageList, isLoading = false) {
      if (!trendingGrid) return;

      if (isLoading) {
        // Show skeleton placeholders
        const skeletonCount = 4;
        const skeletons = Array(skeletonCount)
          .fill(0)
          .map(
            (_, index) => `
                    <div class="skeleton-card" style="--index: ${index}">
                        <div class="skeleton-inner"></div>
                    </div>
                `,
          )
          .join("");
        trendingGrid.innerHTML = skeletons;
        return;
      }

      if (!imageList.length) {
        trendingGrid.innerHTML = "";
        return;
      }

      const trending = [...imageList]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 4);
      const cards = trending
        .map((img, index) => {
          const displayUrl = cloudinaryOptimizedUrl(img.url);
          const rank = index + 1;
          // Masonry classes: 0=wide, 1=normal, 2=tall, 3=normal
          const masonryClass =
            index === 0 ? "wide" : index === 2 ? "tall" : "";
          return `
        <div class="trending-item reveal card ${masonryClass}" data-image-id="${img._id}" style="--index: ${index}">
          <span class="trending-rank">#${rank}</span>
          <div class="image-container">
            <img src="${displayUrl}" data-id="${img._id}" alt="Trending image ${rank}" loading="lazy" decoding="async" class="gallery-img" onerror="this.src='https://via.placeholder.com/400x300/2a0a3f/ffffff?text=Trending'"/>
            <button class="preview-icon" aria-label="View image preview" data-preview-src="${displayUrl}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <div class="card-content">
            <div class="g-item-caption">Frame ${String(img.frameNum || index + 1).padStart(2, "0")}</div>
            <div class="like-container">
              <button class="like-btn" data-id="${img._id}" aria-label="Like photo">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <span class="like-count">${img.likes || 0}</span>
            </div>
          </div>
        </div>
      `;
        })
        .join("");

      trendingGrid.innerHTML = cards;
      observeRevealElements(trendingGrid.querySelectorAll(".reveal"));
      applyLikedStates();
    }

    function showContactStatus(message, type) {
      contactStatus.textContent = message;
      contactStatus.className = `contact-status ${type || ""} show`;
    }

    function setupLightbox() {
      const lightbox = document.createElement("div");
      lightbox.className = "gallery-lightbox";
      lightbox.innerHTML = `
                <button class="lightbox-close" aria-label="Close image preview">&times;</button>
                <img src="" alt="Expanded gallery image" />
            `;
      document.body.appendChild(lightbox);

      const lightboxImage = lightbox.querySelector("img");
      const closeButton = lightbox.querySelector(".lightbox-close");

      function openLightbox(imageSrc) {
        lightboxImage.src = imageSrc;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      }

      function closeLightbox() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
        lightboxImage.src = "";
      }

      closeButton.addEventListener("click", closeLightbox);
      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox.classList.contains("open"))
          closeLightbox();
      });

      return { openLightbox };
    }

    // Helper to manage liked images in localStorage
    function getLikedImages() {
      try {
        return JSON.parse(localStorage.getItem("likedImages") || "[]");
      } catch {
        return [];
      }
    }

    function addLikedImage(imageId) {
      const liked = getLikedImages();
      if (!liked.includes(imageId)) {
        liked.push(imageId);
        localStorage.setItem("likedImages", JSON.stringify(liked));
      }
    }

    function isImageLiked(imageId) {
      return getLikedImages().includes(imageId);
    }

    // Apply liked state to buttons on render
    function applyLikedStates() {
      const likedImages = getLikedImages();
      document.querySelectorAll(".like-btn").forEach((btn) => {
        const imageId = btn.dataset.id;
        if (imageId && likedImages.includes(imageId)) {
          btn.classList.add("liked");
          btn.disabled = true;
        }
      });
    }

    function setupGalleryLikes() {
      // Apply liked states to existing buttons
      applyLikedStates();

      document.addEventListener("click", async (event) => {
        const likeBtn = event.target.closest(".like-btn");
        if (!likeBtn) return;

        const imageId = likeBtn.dataset.id;
        if (!imageId) return;

        // Prevent spam: check if already liked or disabled
        if (likeBtn.disabled || isImageLiked(imageId)) {
          return;
        }

        // Disable button immediately
        likeBtn.disabled = true;

        // Trigger premium animation immediately
        likeBtn.classList.remove("animate-like");
        void likeBtn.offsetWidth; // Force reflow to restart animation
        likeBtn.classList.add("animate-like", "liked");

        // Remove animation class after it completes
        setTimeout(() => {
          likeBtn.classList.remove("animate-like");
        }, 350);

        try {
          const response = await fetch(
            `${BASE_URL}/api/images/like/${imageId}`,
            {
              method: "POST",
            },
          );

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const data = await response.json();
          if (data.likes !== undefined) {
            const countEl = likeBtn.nextElementSibling;
            if (countEl) countEl.textContent = data.likes;
          }

          // Store in localStorage to prevent future likes
          addLikedImage(imageId);

          galleryImages = galleryImages.map((img) =>
            img._id === imageId ? { ...img, likes: data.likes } : img,
          );
        } catch (error) {
          console.error("Failed to like image:", error);
          // Re-enable button on error so user can retry
          likeBtn.disabled = false;
          likeBtn.classList.remove("liked");
        }
      });

      // Add double-click support for trending cards
    }

    // Unified single/double tap handler for gallery images
    function setupGalleryTapHandler(lightboxOpener) {
      const tapDelay = 200; // Faster for mobile responsiveness
      const tapMap = new Map();

      function createHeartOverlay(gItem) {
        const heart = document.createElement("div");
        heart.className = "double-tap-heart";
        heart.innerHTML = `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                `;
        gItem.appendChild(heart);
        return heart;
      }

      function showHeartAnimation(gItem) {
        let heart = gItem.querySelector(".double-tap-heart");
        if (!heart) {
          heart = createHeartOverlay(gItem);
        }

        heart.classList.remove("animate");
        void heart.offsetWidth;
        heart.classList.add("animate");

        setTimeout(() => {
          heart.classList.remove("animate");
        }, 700);
      }

      async function triggerLike(gItem) {
        const likeBtn = gItem.querySelector(".like-btn");
        if (!likeBtn) return;

        const imageId = likeBtn.dataset.id;
        if (!imageId) return;

        // Prevent spam: check if already liked or disabled
        if (likeBtn.disabled || isImageLiked(imageId)) {
          return;
        }

        // Disable button immediately
        likeBtn.disabled = true;

        // Animate the like button
        likeBtn.classList.remove("animate-like");
        void likeBtn.offsetWidth;
        likeBtn.classList.add("animate-like", "liked");

        setTimeout(() => {
          likeBtn.classList.remove("animate-like");
        }, 350);

        try {
          const response = await fetch(
            `${BASE_URL}/api/images/like/${imageId}`,
            {
              method: "POST",
            },
          );

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const data = await response.json();
          if (data.likes !== undefined) {
            const countEl = likeBtn.nextElementSibling;
            if (countEl) countEl.textContent = data.likes;
          }

          // Store in localStorage to prevent future likes
          addLikedImage(imageId);

          galleryImages = galleryImages.map((img) =>
            img._id === imageId ? { ...img, likes: data.likes } : img,
          );
        } catch (error) {
          console.error("Failed to like image:", error);
          // Re-enable button on error so user can retry
          likeBtn.disabled = false;
          likeBtn.classList.remove("liked");
        }
      }

      function handleTap(event) {
        // Handle double-click like immediately
        if (event.type === "dblclick") {
          const item = event.target.closest(".g-item, .trending-item");
          if (!item) return;
          event.preventDefault();
          showHeartAnimation(item);
          triggerLike(item);
          return;
        }

        // Ignore taps on skeleton cards
        if (event.target.closest(".skeleton-card")) return;

        const item = event.target.closest(
          ".g-item.gallery-item, .trending-item",
        );
        if (!item) return;

        // Ignore taps on like button and preview icon
        if (event.target.closest(".like-btn")) return;
        if (event.target.closest(".preview-icon")) return;

        const imageId = item.dataset.imageId;
        if (!imageId) return;

        const now = Date.now();
        const lastTap = tapMap.get(imageId);

        if (lastTap && now - lastTap < tapDelay) {
          // Double tap detected
          event.preventDefault();
          clearTimeout(item._singleTapTimer);
          tapMap.delete(imageId);
          showHeartAnimation(item);
          triggerLike(item);
        }
      }

      // Listen on both gallery and trending grids - touch for mobile, click for desktop
      galleryGrid.addEventListener("click", handleTap);
      galleryGrid.addEventListener("dblclick", handleTap);
      if (trendingGrid) {
        trendingGrid.addEventListener("click", handleTap);
        trendingGrid.addEventListener("dblclick", handleTap);
      }

      // Click handler for preview icons (opens lightbox)
      function handlePreviewClick(event) {
        const previewBtn = event.target.closest(".preview-icon");
        if (!previewBtn) return;

        const imageSrc = previewBtn.dataset.previewSrc;
        if (imageSrc && lightboxOpener) {
          lightboxOpener.openLightbox(imageSrc);
        }
      }

      galleryGrid.addEventListener("click", handlePreviewClick);
      if (trendingGrid)
        trendingGrid.addEventListener("click", handlePreviewClick);

      // Touch events for smoother mobile experience
      let touchStartTime = 0;
      let touchItem = null;

      function handleTouchStart(event) {
        touchItem = event.target.closest(
          ".g-item.gallery-item, .trending-item",
        );
        touchStartTime = Date.now();
      }

      function handleTouchEnd(event) {
        if (!touchItem) return;

        const touchDuration = Date.now() - touchStartTime;
        const isQuickTap = touchDuration < 300; // Quick tap threshold

        // Create synthetic click event for our handler
        if (isQuickTap) {
          // Small delay to allow double-tap detection
          setTimeout(() => {
            handleTap(event);
          }, 10);
        }

        touchItem = null;
      }

      galleryGrid.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      galleryGrid.addEventListener("touchend", handleTouchEnd, {
        passive: true,
      });
      if (trendingGrid) {
        trendingGrid.addEventListener("touchstart", handleTouchStart, {
          passive: true,
        });
        trendingGrid.addEventListener("touchend", handleTouchEnd, {
          passive: true,
        });
      }
    }

    function loadImages() {
      fetch(`${BASE_URL}/api/images`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) return;
          galleryImages = data;
          renderGallery(galleryImages, false);
          renderTrending(galleryImages, false);
        })
        .catch((error) => {
          console.error("Failed to fetch gallery images:", error);
          galleryImages = [];
          if (galleryGrid)
            galleryGrid.innerHTML =
              '<p class="gallery-error">Failed to load images. Please try again later.</p>';
          if (trendingGrid)
            trendingGrid.innerHTML =
              '<p class="gallery-error">Failed to load trending images.</p>';
        });
    }

    renderGallery([], true);
    renderTrending([], true);
    onReady(() => {
      document.body.classList.add("page-ready");
      if (pageVeil) pageVeil.classList.add("hide");
      loadImages();
      setTimeout(runAnalytics, 0);
    });

    const lightbox = setupLightbox();
    setupGalleryLikes();
    setupGalleryTapHandler(lightbox);

    if (contactForm) {
      contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const message = contactForm.message.value.trim();

        if (!name || !email || !message) {
          showContactStatus("Please fill out all fields.", "error");
          return;
        }

        try {
          contactSubmit.disabled = true;
          contactSubmit.textContent = "Sending...";

          const response = await fetch(`${BASE_URL}/api/contact`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, message }),
          });

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          contactForm.reset();
          showContactStatus("Message sent successfully", "success");
        } catch (error) {
          console.error("Failed to submit contact form:", error);
          showContactStatus("Failed to send message", "error");
        } finally {
          contactSubmit.disabled = false;
          contactSubmit.textContent = "Send Message";
        }
      });
    }

    // ── Subtle hero parallax ──
    const heroFrame = document.querySelector(".hero-img-frame");
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (heroFrame) heroFrame.style.transform = `translateY(${y * 0.1}px)`;
    });

    // ── Nav hide/show on scroll ──
    let lastY = 0;
    const navEl = document.querySelector("nav");
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      navEl.style.transform =
        y > lastY && y > 80 ? "translateY(-100%)" : "translateY(0)";
      navEl.style.transition = "transform 0.4s ease";
      lastY = y;
    });
  