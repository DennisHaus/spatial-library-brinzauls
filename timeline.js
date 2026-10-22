"use strict";

/*
  TIMELINE
  The "Timeline" button next to the icons button shows a year slider at
  the bottom of the viewer. Moving it to a year:
    - shows every point cloud whose name contains that year
      (it is loaded first if needed),
    - hides every other point cloud whose name contains a year,
    - shows only the media icons of that year and closes open media
      windows of other years.
  Point clouds and media without a year in their name are not touched.
  "All" shows every loaded point cloud and every icon again.

  The year is the first number from 1900 to 2099 in the name, so
  "2025 Brinzauls Color" belongs to 2025.

  Needs from app.js: state, loadScan, isImageScan, closeImagePopup,
  renderLibrary, setStatus.
*/

(function () {
  var ALL = "all";

  var panel = null;
  var slider = null;
  var stops = null;
  var years = [];
  var current = ALL;
  var open = false;
  var loadTimer = null;

  function getCatalog() {
    return window.state && Array.isArray(state.catalog)
      ? state.catalog
      : [];
  }

  function yearOf(scan) {
    var match =
      String(scan && scan.name || "").match(/(?:^|\D)((?:19|20)\d{2})(?!\d)/);

    return match ? match[1] : null;
  }

  function isMedia(scan) {
    return typeof window.isImageScan === "function" &&
      window.isImageScan(scan);
  }

  function collectYears() {
    var found =
      new Set();

    getCatalog().forEach(function (scan) {
      var year =
        yearOf(scan);

      if (year) {
        found.add(year);
      }
    });

    return Array.from(found).sort();
  }

  function status(message) {
    if (typeof window.setStatus === "function") {
      window.setStatus(message, "idle");
    }
  }


  /* ------------------------------------------------------------------------ */
  /* APPLYING A YEAR                                                          */
  /* ------------------------------------------------------------------------ */

  /* Hide or show what is already loaded; returns scans still to load */
  function applyVisibility() {
    var toLoad = [];

    getCatalog().forEach(function (scan) {
      var year =
        yearOf(scan);

      if (!year) {
        return;
      }

      var match =
        current === ALL || year === current;

      if (isMedia(scan)) {
        if (
          !match &&
          state.openImages &&
          state.openImages.has(scan.id) &&
          typeof window.closeImagePopup === "function"
        ) {
          window.closeImagePopup(scan.id);
        }

        return;
      }

      var cloud =
        state.loadedClouds && state.loadedClouds.get(scan.id);

      if (cloud) {
        cloud.visible = match;
      } else if (match && current !== ALL && !scan.loading) {
        toLoad.push(scan);
      }
    });

    return toLoad;
  }

  function loadMissing(scans) {
    if (typeof window.loadScan !== "function") {
      return;
    }

    scans.forEach(function (scan) {
      /* Keep the camera where it is while scrubbing through years */
      scan.skipFitOnLoad = true;

      window.loadScan(scan).then(function () {
        /* The year may have changed while this cloud was loading */
        applyVisibility();

        if (typeof window.renderLibrary === "function") {
          window.renderLibrary();
        }
      });
    });
  }

  function setYear(year) {
    current = year;

    updateStops();

    var toLoad =
      applyVisibility();

    if (typeof window.renderLibrary === "function") {
      window.renderLibrary();
    }

    status(
      current === ALL
        ? "Timeline: all years"
        : "Timeline: " + current +
          (toLoad.length ? " (loading " + toLoad.length + ")" : "")
    );

    /* Wait until the slider stops moving before loading large files */
    window.clearTimeout(loadTimer);

    if (toLoad.length) {
      loadTimer = window.setTimeout(function () {
        loadMissing(applyVisibility());
      }, 350);
    }
  }


  /* ------------------------------------------------------------------------ */
  /* PANEL                                                                    */
  /* ------------------------------------------------------------------------ */

  function valueList() {
    return [ALL].concat(years);
  }

  function createPanel() {
    var renderArea =
      document.getElementById("potree_render_area");

    var host =
      renderArea && renderArea.parentElement;

    if (!host) {
      return null;
    }

    panel =
      document.createElement("div");

    panel.className =
      "timeline-panel hidden";

    panel.innerHTML =
      '<input class="timeline-slider" type="range" min="0" step="1" ' +
        'aria-label="Year">' +
      '<div class="timeline-stops"></div>';

    slider =
      panel.querySelector(".timeline-slider");

    stops =
      panel.querySelector(".timeline-stops");

    slider.addEventListener("input", function () {
      setYear(valueList()[Number(slider.value)]);
    });

    stops.addEventListener("click", function (event) {
      var stop =
        event.target.closest("[data-year]");

      if (stop) {
        setYear(stop.dataset.year);
      }
    });

    /* Keep clicks and drags from reaching the 3D viewer */
    ["pointerdown", "wheel", "keydown"].forEach(function (type) {
      panel.addEventListener(type, function (event) {
        event.stopPropagation();
      });
    });

    host.appendChild(panel);

    return panel;
  }

  function buildStops() {
    years =
      collectYears();

    var values =
      valueList();

    if (values.indexOf(current) < 0) {
      current = ALL;
    }

    slider.max =
      String(values.length - 1);

    stops.innerHTML = "";

    values.forEach(function (value) {
      var stop =
        document.createElement("button");

      stop.type = "button";
      stop.className = "timeline-stop";
      stop.dataset.year = value;
      stop.textContent = value === ALL ? "All" : value;

      stops.appendChild(stop);
    });

    updateStops();
  }

  function updateStops() {
    if (!panel) {
      return;
    }

    slider.value =
      String(valueList().indexOf(current));

    stops.querySelectorAll(".timeline-stop").forEach(function (stop) {
      var active =
        stop.dataset.year === current;

      stop.classList.toggle("is-active", active);
      stop.setAttribute("aria-pressed", String(active));
    });
  }

  function updateButton() {
    var button =
      document.getElementById("toggleTimeline");

    if (button) {
      button.setAttribute("aria-pressed", String(open));
    }
  }

  function setOpen(value) {
    if (!panel && !createPanel()) {
      return;
    }

    open = Boolean(value);

    if (open) {
      buildStops();
    }

    panel.classList.toggle("hidden", !open);
    updateButton();

    if (!open) {
      /* Closing releases the icon filter; point clouds stay as they are */
      window.clearTimeout(loadTimer);
      current = ALL;
      status("Timeline closed");
    } else if (years.length === 0) {
      status("Timeline: no names with a year found");
    }
  }

  function bindButton() {
    var button =
      document.getElementById("toggleTimeline");

    if (button) {
      button.addEventListener("click", function () {
        setOpen(!open);
      });
    }

    updateButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindButton, { once: true });
  } else {
    bindButton();
  }

  window.Timeline = {
    /* Used by media-pins.js: false hides the icon of this scan */
    allows: function (scan) {
      if (!open || current === ALL) {
        return true;
      }

      var year =
        yearOf(scan);

      return !year || year === current;
    },

    /* Called by app.js whenever the catalog is (re)loaded */
    refresh: function () {
      if (open) {
        buildStops();
      }
    },

    setYear: setYear,
    setOpen: setOpen
  };
})();
