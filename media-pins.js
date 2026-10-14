"use strict";

/*
  MEDIA PINS
  Images, videos and audio files can be linked to a location in the
  point cloud. They then appear as small icons in the viewer; clicking
  an icon opens the file.

  Setting a location:
    1. Open a media file from the library (its window must be the
       frontmost media window).
    2. Shift + Cmd-click (Mac) or Shift + Ctrl-click (Windows) on a
       point of a scan.
  Shift + Cmd/Ctrl-click on an icon removes the location set in
  this browser. The P key shows or hides all icons.

  Where locations are stored:
    - In this browser (localStorage). They are still there on the next
      visit, but only on this computer and browser.
    - In catalog.json, as "location": [x, y, z] on a media entry.
      These are visible to every visitor. "Download catalog.json" in
      the pins bar creates the file with all locations set in this
      browser, ready to upload to the repository.

  Needs from app.js: viewer, state, CONFIG, pickPointAt, setStatus,
  openImagePopup, isImageScan, isAudioScan.
  Needs from measure.js: MeasureTool.project.
*/

(function () {
  var STORAGE_KEY =
    "mediaPins:" + window.location.pathname;

  var localPins =
    readLocalPins();

  var layer = null;
  var bar = null;
  var frame = null;
  var visible = true;
  var rawCatalog = null;
  var pinElements = new Map();

  var ICONS = {
    image:
      '<svg viewBox="0 0 16 16" aria-hidden="true">' +
        '<rect x="2" y="3" width="12" height="10" rx="1"/>' +
        '<path d="M2.5 11.5 6 8l3 3 2-2 2.5 2.5"/>' +
        '<circle cx="11" cy="6" r="1"/>' +
      "</svg>",

    video:
      '<svg viewBox="0 0 16 16" aria-hidden="true">' +
        '<path class="fill" d="M5.5 3.5v9l7-4.5z"/>' +
      "</svg>",

    audio:
      '<svg viewBox="0 0 16 16" aria-hidden="true">' +
        '<path class="fill" d="M2.5 6h2.5L8.5 3v10L5 10H2.5z"/>' +
        '<path d="M10.5 5.8a3 3 0 0 1 0 4.4M12.3 4a5.5 5.5 0 0 1 0 8"/>' +
      "</svg>"
  };


  /* ------------------------------------------------------------------------ */
  /* STORAGE                                                                  */
  /* ------------------------------------------------------------------------ */

  function readLocalPins() {
    try {
      var stored =
        JSON.parse(
          window.localStorage.getItem(STORAGE_KEY) || "{}"
        );

      return stored && typeof stored === "object"
        ? stored
        : {};
    } catch (error) {
      return {};
    }
  }

  function writeLocalPins() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(localPins)
      );
    } catch (error) {
      status("Location could not be saved in this browser.", "error");
    }
  }

  function parseLocation(value) {
    if (!value) {
      return null;
    }

    var list =
      Array.isArray(value)
        ? value
        : [value.x, value.y, value.z];

    var numbers =
      list.slice(0, 3).map(Number);

    return numbers.length === 3 &&
      numbers.every(function (n) { return isFinite(n); })
      ? { x: numbers[0], y: numbers[1], z: numbers[2] }
      : null;
  }

  function round(value) {
    return Math.round(value * 1000) / 1000;
  }


  /* ------------------------------------------------------------------------ */
  /* HELPERS                                                                  */
  /* ------------------------------------------------------------------------ */

  function status(text, type) {
    if (typeof window.setStatus === "function") {
      window.setStatus(text, type || "idle");
    }
  }

  function getCatalog() {
    return window.state && Array.isArray(state.catalog)
      ? state.catalog
      : [];
  }

  function isMedia(scan) {
    return typeof window.isImageScan === "function" &&
      window.isImageScan(scan);
  }

  function mediaKind(scan) {
    if (
      typeof window.isAudioScan === "function" &&
      window.isAudioScan(scan)
    ) {
      return "audio";
    }

    var format =
      String(scan.format || "").toLowerCase();

    if (
      format === "mp4" ||
      format === "mov" ||
      format === "video" ||
      /\.(mp4|mov)(\?.*)?$/i.test(scan.url || scan.path || scan.filename || "")
    ) {
      return "video";
    }

    return "image";
  }

  function getLocation(scan) {
    if (localPins[scan.id]) {
      return parseLocation(localPins[scan.id]);
    }

    return scan.location || null;
  }

  function getViewerPanel() {
    var renderArea =
      document.getElementById("potree_render_area");

    return renderArea
      ? renderArea.parentElement
      : null;
  }

  function getCanvas() {
    return (
      window.viewer &&
      viewer.renderer &&
      viewer.renderer.domElement
    ) || null;
  }

  /* The media file whose window is in front */
  function getFrontMedia() {
    if (!window.state || !state.openImages) {
      return null;
    }

    var bestId = null;
    var bestZ = -Infinity;

    state.openImages.forEach(function (popup, id) {
      var z =
        Number(popup.style.zIndex) || 0;

      if (z >= bestZ) {
        bestZ = z;
        bestId = id;
      }
    });

    if (bestId === null) {
      return null;
    }

    return getCatalog().find(function (scan) {
      return scan.id === bestId;
    }) || null;
  }


  /* ------------------------------------------------------------------------ */
  /* PINS IN THE VIEW                                                         */
  /* ------------------------------------------------------------------------ */

  function createLayer() {
    var host =
      getViewerPanel();

    if (!host) {
      return null;
    }

    layer =
      document.createElement("div");

    layer.className =
      "media-pin-layer";

    host.appendChild(layer);

    return layer;
  }

  function createPin(scan) {
    var pin =
      document.createElement("button");

    pin.type =
      "button";

    pin.className =
      "media-pin media-pin-" + mediaKind(scan);

    pin.innerHTML =
      ICONS[mediaKind(scan)] +
      '<span class="media-pin-label"></span>';

    pin.querySelector(".media-pin-label").textContent =
      scan.name;

    pin.setAttribute(
      "aria-label",
      "Open " + scan.name
    );

    /* Do not let a click on a pin move the camera */
    pin.addEventListener(
      "pointerdown",
      function (event) {
        event.stopPropagation();
      }
    );

    pin.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        if (
          event.shiftKey &&
          (event.metaKey || event.ctrlKey)
        ) {
          removeLocalPin(scan);
          return;
        }

        if (typeof window.openImagePopup === "function") {
          window.openImagePopup(scan);
        }
      }
    );

    return pin;
  }

  function rebuild() {
    if (!layer && !createLayer()) {
      return;
    }

    var wanted =
      new Map();

    getCatalog().forEach(function (scan) {
      if (
        isMedia(scan) &&
        getLocation(scan)
      ) {
        wanted.set(scan.id, scan);
      }
    });

    pinElements.forEach(function (entry, id) {
      if (!wanted.has(id)) {
        entry.element.remove();
        pinElements.delete(id);
      }
    });

    wanted.forEach(function (scan, id) {
      var entry =
        pinElements.get(id);

      if (!entry || entry.scan !== scan) {
        if (entry) {
          entry.element.remove();
        }

        entry = {
          scan: scan,
          element: createPin(scan)
        };

        layer.appendChild(entry.element);
        pinElements.set(id, entry);
      }
    });

    updateBar();

    if (pinElements.size > 0) {
      startLoop();
    } else {
      stopLoop();
    }
  }

  function updatePins() {
    if (!layer) {
      return;
    }

    layer.style.display =
      visible ? "" : "none";

    if (!visible) {
      return;
    }

    var project =
      window.MeasureTool && window.MeasureTool.project;

    if (typeof project !== "function") {
      return;
    }

    var front =
      getFrontMedia();

    pinElements.forEach(function (entry) {
      var location =
        getLocation(entry.scan);

      var position =
        location ? project(location) : null;

      var element =
        entry.element;

      if (!position) {
        element.style.display = "none";
        return;
      }

      element.style.display = "";
      element.style.transform =
        "translate(" + position.x + "px, " + position.y + "px)";

      element.classList.toggle(
        "is-current",
        Boolean(front && front.id === entry.scan.id)
      );
    });
  }

  function loop() {
    updatePins();
    frame = window.requestAnimationFrame(loop);
  }

  function startLoop() {
    if (frame === null) {
      loop();
    }
  }

  function stopLoop() {
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
  }


  /* ------------------------------------------------------------------------ */
  /* SETTING AND REMOVING LOCATIONS                                           */
  /* ------------------------------------------------------------------------ */

  function setLocalPin(scan, point) {
    localPins[scan.id] =
      [round(point.x), round(point.y), round(point.z)];

    writeLocalPins();
    rebuild();

    var entry =
      pinElements.get(scan.id);

    if (entry) {
      entry.element.classList.remove("is-new");
      void entry.element.offsetWidth;
      entry.element.classList.add("is-new");
    }

    status("Location set for " + scan.name);
  }

  function removeLocalPin(scan) {
    if (!localPins[scan.id]) {
      status(
        scan.location
          ? scan.name + ": this location comes from catalog.json"
          : "No location to remove"
      );

      return;
    }

    delete localPins[scan.id];

    writeLocalPins();
    rebuild();

    status(
      scan.location
        ? "Local location removed, catalog location shown again"
        : "Location removed from " + scan.name
    );
  }

  /*
    Called by app.js at the start of its pointerdown handler.
    Shift + Cmd/Ctrl-click sets the location of the front media file.
  */
  function handlePointerDown(event) {
    if (
      !event.shiftKey ||
      !(event.metaKey || event.ctrlKey) ||
      event.button !== 0
    ) {
      return false;
    }

    event.preventDefault();

    var scan =
      getFrontMedia();

    if (!scan) {
      status(
        "Open an image, video or audio file from the library first.",
        "error"
      );

      return true;
    }

    var canvas =
      getCanvas();

    if (
      !canvas ||
      typeof window.pickPointAt !== "function"
    ) {
      return true;
    }

    var rect =
      canvas.getBoundingClientRect();

    var point =
      window.pickPointAt(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

    if (!point) {
      status("No point found there. Click directly on a scan.", "error");
      return true;
    }

    setLocalPin(scan, point);

    return true;
  }


  /* ------------------------------------------------------------------------ */
  /* PINS BAR: SAVE FOR ALL VISITORS                                          */
  /* ------------------------------------------------------------------------ */

  function getCatalogUrl() {
    return (
      (window.CONFIG && CONFIG.catalogUrl) ||
      (window.LOCATION_CONFIG && LOCATION_CONFIG.catalogUrl) ||
      "./catalog.json"
    );
  }

  function loadRawCatalog() {
    return fetch(
      getCatalogUrl(),
      { cache: "no-store" }
    )
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (data) {
        rawCatalog = data;
        return data;
      })
      .catch(function () {
        return null;
      });
  }

  /* Same id rule as normalizeScan() in app.js */
  function rawId(entry, index) {
    return String(
      entry.id ||
      entry.filename ||
      "scan-" + (index + 1)
    );
  }

  function downloadCatalog() {
    if (!rawCatalog) {
      status("catalog.json could not be loaded.", "error");
      return;
    }

    var copy =
      JSON.parse(JSON.stringify(rawCatalog));

    var entries =
      Array.isArray(copy)
        ? copy
        : copy.scans;

    if (!Array.isArray(entries)) {
      status("Unknown catalog.json structure.", "error");
      return;
    }

    var written = 0;

    entries.forEach(function (entry, index) {
      var pin =
        localPins[rawId(entry, index)];

      if (pin) {
        entry.location = pin;
        written++;
      }
    });

    var blob =
      new Blob(
        [JSON.stringify(copy, null, 2) + "\n"],
        { type: "application/json" }
      );

    var link =
      document.createElement("a");

    link.href =
      URL.createObjectURL(blob);

    link.download =
      "catalog.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(function () {
      URL.revokeObjectURL(link.href);
    }, 2000);

    status(
      "catalog.json downloaded with " + written +
      (written === 1 ? " location" : " locations")
    );
  }

  function createBar() {
    var host =
      getViewerPanel();

    if (!host) {
      return null;
    }

    bar =
      document.createElement("div");

    bar.className =
      "media-pin-bar hidden";

    bar.innerHTML =
      '<span class="media-pin-bar-text"></span>' +
      '<button type="button" class="measure-button" data-pins="download" ' +
        'title="Download catalog.json with these locations, then upload it to the repository">' +
        "Download catalog.json</button>";

    bar.addEventListener(
      "pointerdown",
      function (event) {
        event.stopPropagation();
      }
    );

    bar.addEventListener(
      "click",
      function (event) {
        if (event.target.closest('[data-pins="download"]')) {
          downloadCatalog();
        }
      }
    );

    host.appendChild(bar);

    return bar;
  }

  function updateBar() {
    if (!bar && !createBar()) {
      return;
    }

    var ids =
      getCatalog()
        .filter(function (scan) {
          return localPins[scan.id];
        })
        .map(function (scan) {
          return scan.id;
        });

    bar.classList.toggle(
      "hidden",
      ids.length === 0
    );

    bar.querySelector(".media-pin-bar-text").textContent =
      ids.length +
      (ids.length === 1 ? " location" : " locations") +
      " saved in this browser";
  }


  /* ------------------------------------------------------------------------ */
  /* STARTUP                                                                  */
  /* ------------------------------------------------------------------------ */

  document.addEventListener(
    "keydown",
    function (event) {
      var tag =
        String(event.target && event.target.tagName || "").toLowerCase();

      if (
        (event.key === "p" || event.key === "P") &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        tag !== "input" &&
        tag !== "textarea" &&
        tag !== "select" &&
        !(event.target && event.target.isContentEditable) &&
        pinElements.size > 0
      ) {
        visible = !visible;
        updatePins();
        status(visible ? "Media icons shown" : "Media icons hidden");
      }
    }
  );

  window.MediaPins = {
    handlePointerDown: handlePointerDown,

    /* Called by app.js whenever the catalog is (re)loaded */
    refresh: function () {
      rebuild();
      loadRawCatalog();
    },

    parseLocation: parseLocation
  };
})();
