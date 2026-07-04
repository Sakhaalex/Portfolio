const portfolioApp = (() => {
  const benchmark = 7.75;
  const semesters = [
    { label: "Sem 1", sgpa: 8.5 },
    { label: "Sem 2", sgpa: 8.66 },
    { label: "Sem 3", sgpa: 8.64 },
    { label: "Sem 4", sgpa: 8.68 },
    { label: "Sem 5", sgpa: 8.52 },
    { label: "Sem 6", sgpa: 8.33 },
  ];

  const svgNamespace = "http://www.w3.org/2000/svg";

  const createSvgElement = (tagName, attributes = {}) => {
    const element = document.createElementNS(svgNamespace, tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });

    return element;
  };

  const initCurrentYear = () => {
    const currentYear = document.querySelector("[data-current-year]");

    if (currentYear) {
      currentYear.textContent = String(new Date().getFullYear());
    }
  };

  const initNavigation = () => {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const siteNav = document.querySelector("[data-site-nav]");

    if (!navToggle || !siteNav) {
      return;
    }

    const closeNavigation = () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";

      navToggle.setAttribute("aria-expanded", String(!isOpen));
      siteNav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        closeNavigation();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNavigation();
      }
    });
  };

  const initProfilePhoto = () => {
    const frame = document.querySelector("[data-profile-frame]");
    const photo = document.querySelector("[data-profile-photo]");

    if (!(frame instanceof HTMLElement) || !(photo instanceof HTMLImageElement)) {
      return;
    }

    photo.addEventListener("load", () => {
      frame.hidden = false;
    });

    photo.addEventListener("error", () => {
      frame.hidden = true;
    });
  };

  const initSgpaChart = () => {
    const chart = document.querySelector("[data-sgpa-chart]");
    const grid = chart?.querySelector(".chart-grid");
    const axis = chart?.querySelector(".chart-axis");
    const line = chart?.querySelector("[data-sgpa-line]");
    const pointsGroup = chart?.querySelector("[data-sgpa-points]");
    const benchmarkLine = chart?.querySelector("[data-benchmark-line]");
    const benchmarkLabel = chart?.querySelector("[data-benchmark-label]");
    const tooltip = document.querySelector("[data-chart-tooltip]");

    if (!chart || !grid || !axis || !line || !pointsGroup || !benchmarkLine || !benchmarkLabel || !tooltip) {
      return;
    }

    const bounds = {
      left: 72,
      right: 672,
      top: 44,
      bottom: 292,
    };

    const min = 7.5;
    const max = 9;
    const range = max - min;
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const xForIndex = (index) => bounds.left + (width / (semesters.length - 1)) * index;
    const yForSgpa = (sgpa) => bounds.bottom - ((sgpa - min) / range) * height;

    [7.5, 7.75, 8, 8.5, 9].forEach((value) => {
      const y = yForSgpa(value);
      grid.appendChild(createSvgElement("line", {
        class: "grid-line",
        x1: bounds.left,
        x2: bounds.right,
        y1: y,
        y2: y,
      }));

      axis.appendChild(createSvgElement("text", {
        class: "axis-label",
        x: 24,
        y: y + 4,
      })).textContent = value.toFixed(value % 1 === 0 ? 0 : 2);
    });

    benchmarkLine.setAttribute("y1", yForSgpa(benchmark));
    benchmarkLine.setAttribute("y2", yForSgpa(benchmark));
    benchmarkLabel.setAttribute("y", yForSgpa(benchmark) - 10);

    const pointCoordinates = semesters.map((semester, index) => ({
      ...semester,
      x: xForIndex(index),
      y: yForSgpa(semester.sgpa),
    }));

    line.setAttribute("points", pointCoordinates.map((point) => `${point.x},${point.y}`).join(" "));

    pointCoordinates.forEach((point, index) => {
      const group = createSvgElement("g", {
        class: "sgpa-point",
        tabindex: "0",
        role: "button",
        "aria-label": `${point.label}, SGPA ${point.sgpa.toFixed(2)}, ${(point.sgpa - benchmark).toFixed(2)} above benchmark`,
        transform: `translate(${point.x} ${point.y})`,
      });

      group.style.transitionDelay = `${index * 90}ms`;
      group.appendChild(createSvgElement("circle", { r: 7 }));

      const label = createSvgElement("text", {
        class: "point-label",
        x: -18,
        y: 28,
      });
      label.textContent = point.label;
      group.appendChild(label);

      const showTooltip = () => {
        tooltip.hidden = false;
        tooltip.innerHTML = `<strong>${point.label}</strong>SGPA: ${point.sgpa.toFixed(2)}<br>Difference above benchmark: ${(point.sgpa - benchmark).toFixed(2)}`;
      };

      group.addEventListener("mouseenter", showTooltip);
      group.addEventListener("focus", showTooltip);
      group.addEventListener("mouseleave", () => {
        tooltip.hidden = true;
      });
      group.addEventListener("blur", () => {
        tooltip.hidden = true;
      });

      pointsGroup.appendChild(group);
    });

    const revealPoints = () => {
      chart.querySelectorAll(".sgpa-point").forEach((point) => {
        point.classList.add("is-visible");
      });
    };

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealPoints();
      return;
    }

    // The chart draws only when it becomes relevant in the viewport, keeping initial page work minimal.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealPoints();
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });

    observer.observe(chart);
  };

  const init = () => {
    initCurrentYear();
    initNavigation();
    initProfilePhoto();
    initSgpaChart();
  };

  return { init };
})();

portfolioApp.init();
