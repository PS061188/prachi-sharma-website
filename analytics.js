(function () {
  const measurementId = window.SITE_ANALYTICS && window.SITE_ANALYTICS.gaMeasurementId;

  if (!measurementId || measurementId === "G-XXXXXXXXXX") {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", measurementId);

  const isArticlePage = !!document.querySelector(".article-page");

  setupOutboundClicks();
  setupDownloadClicks();

  if (isArticlePage) {
    setupArticleReadTracking();
  }

  function setupOutboundClicks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("./") || href.startsWith("/")) {
        return;
      }

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin === window.location.origin) return;

      gtag("event", "outbound_click", {
        destination: url.href,
        link_text: (link.textContent || "").trim().slice(0, 120),
        page_path: window.location.pathname,
      });
    });
  }

  function setupDownloadClicks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[download]");
      if (!link) return;

      const fileName = link.getAttribute("href");
      const linkText = (link.textContent || "").trim().slice(0, 120);

      gtag("event", "file_download", {
        file_name: fileName,
        link_text: linkText,
        page_path: window.location.pathname,
      });

      if (fileName && fileName.includes("free-ai-portfolio-starter-kit")) {
        gtag("event", "free_kit_download", {
          file_name: fileName,
          link_text: linkText,
          page_path: window.location.pathname,
          resource_name: "Free AI Portfolio Starter Kit",
          resource_type: "free_kit",
        });
      }
    });
  }

  function setupArticleReadTracking() {
    const milestones = [25, 50, 75, 90, 100];
    const fired = new Set();
    let ticking = false;

    function getScrollPercent() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const viewport = window.innerHeight || doc.clientHeight || 1;
      const fullHeight = Math.max(doc.scrollHeight, document.body.scrollHeight || 0);
      const scrollable = Math.max(fullHeight - viewport, 1);
      return Math.min(100, Math.round((scrollTop / scrollable) * 100));
    }

    function emitMilestones() {
      ticking = false;
      const percent = getScrollPercent();

      milestones.forEach((milestone) => {
        if (percent >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          gtag("event", "article_scroll_depth", {
            page_path: window.location.pathname,
            article_title: document.title,
            percent_scrolled: milestone,
          });

          if (milestone === 90) {
            gtag("event", "article_read_complete", {
              page_path: window.location.pathname,
              article_title: document.title,
            });
          }
        }
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(emitMilestones);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", emitMilestones);
    emitMilestones();
  }
})();
