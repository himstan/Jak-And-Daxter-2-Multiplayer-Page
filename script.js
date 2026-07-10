(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") ?? false;
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(event.target) || navToggle?.contains(event.target)) return;
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });

  const renderUpdates = () => {
    const data = window.JAK2_MULTIPLAYER_UPDATES;
    const roadmapRoot = document.querySelector("[data-roadmap]");
    const versionRoot = document.querySelector("[data-version-list]");

    if (!data || !roadmapRoot || !versionRoot) return;

    const versions = Array.isArray(data.versions) ? data.versions : [];

    const roadmapVersions = versions.filter((version) => version.roadmap !== false);
    roadmapRoot.innerHTML = roadmapVersions.length
      ? roadmapVersions.map((version) => {
          const status = version.status === "released" ? "released" : "planned";
          const statusLabel = status === "released" ? "Released" : "Planned";

          return `
            <article class="roadmap-item roadmap-item--${status}">
              <div class="roadmap-topline">
                <span class="roadmap-version">${escapeHtml(version.version)}</span>
                <span class="roadmap-status">${statusLabel}</span>
              </div>
              <strong>${escapeHtml(version.title)}</strong>
              <p>${escapeHtml(version.summary)}</p>
            </article>
          `;
        }).join("")
      : '<p class="empty-state">No roadmap versions have been posted yet.</p>';

    const releases = versions.filter((version) => version.status === "released");
    versionRoot.innerHTML = releases.length
      ? releases.map((version) => `
          <article class="version-card">
            <div class="version-meta">
              <span class="version-number">${escapeHtml(version.version)}</span>
              <span class="version-date">${escapeHtml(version.date || "Released")}</span>
            </div>
            <div>
              <h3>${escapeHtml(version.title)}</h3>
              <p class="version-summary">${escapeHtml(version.summary)}</p>
              ${Array.isArray(version.changes) && version.changes.length ? `
                <ul class="version-changes">
                  ${version.changes.map((change) => `<li>${escapeHtml(change)}</li>`).join("")}
                </ul>
              ` : ""}
            </div>
          </article>
        `).join("")
      : '<p class="empty-state">No releases have been posted yet.</p>';
  };

  renderUpdates();

  const lightbox = document.querySelector("[data-lightbox-dialog]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const closeLightbox = document.querySelector("[data-lightbox-close]");

  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!(lightbox instanceof HTMLDialogElement) || !lightboxImage) return;

      const source = button.dataset.lightbox;
      const caption = button.dataset.caption || button.querySelector("img")?.alt || "Guide screenshot";

      lightboxImage.src = source;
      lightboxImage.alt = caption;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      lightbox.showModal();
    });
  });

  closeLightbox?.addEventListener("click", () => lightbox?.close());

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  const initScrollReveal = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealGroups = [
      [".hero-copy > *", "reveal-from-left"],
      [".hero-image", "reveal-from-right"],
      [".build-notice-inner", ""],
      [".section-heading", ""],
      [".updates-subheading", ""],
      [".roadmap-item", ""],
      [".version-card", ""],
      [".info-card", ""],
      [".step", ""],
      [".address-guide", ""],
      [".local-layout > *", ""],
      [".troubleshooting-card", ""],
      [".limitations-list details", ""],
      [".support-card", ""],
      [".footer-inner > *", ""],
    ];

    const elements = [];
    revealGroups.forEach(([selector, direction]) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        element.classList.add("reveal-on-scroll");
        if (direction) element.classList.add(direction);
        element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 85}ms`);
        elements.push(element);
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      document.querySelectorAll(".section").forEach((section) => section.classList.add("is-section-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    });

    elements.forEach((element) => observer.observe(element));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-section-visible", entry.isIntersecting);
      });
    }, {
      threshold: 0.08,
      rootMargin: "-15% 0px -15% 0px",
    });

    document.querySelectorAll(".section").forEach((section) => sectionObserver.observe(section));
  };

  initScrollReveal();
})();
