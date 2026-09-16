/**
 * Shared utility functions used across the application.
 * Loaded early to provide common helpers and eliminate code duplication.
 */

// ── Cookie helpers ──────────────────────────────────────────────────────────

/**
 * Reads a cookie value by name.
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
window.getCookie = function (name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// ── Board instance helper ───────────────────────────────────────────────────

/**
 * Returns the active Board or BoardSVG singleton, or null.
 * Replaces the repeated 8-line guard pattern used across the codebase.
 * @returns {object|null}
 */
window.getBoardInstance = function () {
  if (typeof Board !== "undefined" && typeof Board.getInstance === "function") {
    const instance = Board.getInstance();
    if (instance) return instance;
  }
  if (
    typeof BoardSVG !== "undefined" &&
    typeof BoardSVG.getInstance === "function"
  ) {
    const instance = BoardSVG.getInstance();
    if (instance) return instance;
  }
  return null;
};

// ── Color conversion ────────────────────────────────────────────────────────

/**
 * Converts a numeric color value to a CSS hex string.
 * If the input is already a string, it is returned unchanged.
 * @param {number|string} color
 * @returns {string}
 */
window.colorToHex = function (color) {
  if (typeof color === "string") return color;
  return "#" + ("000000" + (color & 0xffffff).toString(16)).slice(-6);
};

// ── Draggable modal helper ──────────────────────────────────────────────────

/**
 * Makes a modal element draggable by its header/handle.
 * Supports two positioning modes:
 *   - "position" (default): sets element.style.left / top
 *   - "transform": updates a translate() inside the element's CSS transform
 *
 * @param {HTMLElement} element  - The element to drag
 * @param {HTMLElement} handle   - The drag handle (e.g. the header bar)
 * @param {object}      [opts]
 * @param {"position"|"transform"} [opts.mode="position"]
 * @param {number}  [opts.margin=0]  - Minimum distance from viewport edges
 */
window.makeDraggable = function (element, handle, opts) {
  const mode = (opts && opts.mode) || "position";
  const margin = (opts && opts.margin) || 0;

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  // For transform mode
  let xOffset = 0;
  let yOffset = 0;

  handle.addEventListener("mousedown", function (e) {
    // Don't start drag when clicking close buttons etc.
    if (e.target.closest(".modal-window-close")) return;

    isDragging = true;

    if (mode === "transform") {
      // Read current transform-based offset
      const transform = window.getComputedStyle(element).transform;
      if (transform && transform !== "none") {
        const rect = element.getBoundingClientRect();
        xOffset = rect.left + rect.width / 2 - window.innerWidth / 2;
        yOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
      }
      dragOffset.x = e.clientX - xOffset;
      dragOffset.y = e.clientY - yOffset;
    } else {
      // position mode
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.transform !== "none") {
        const rect = element.getBoundingClientRect();
        element.style.transform = "none";
        element.style.left = rect.left + "px";
        element.style.top = rect.top + "px";
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
      } else {
        const currentLeft = parseInt(computedStyle.left) || 0;
        const currentTop = parseInt(computedStyle.top) || 0;
        dragOffset.x = e.clientX - currentLeft;
        dragOffset.y = e.clientY - currentTop;
      }
    }

    handle.style.cursor = "grabbing";
    e.preventDefault();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    if (mode === "transform") {
      let currentX = e.clientX - dragOffset.x;
      let currentY = e.clientY - dragOffset.y;

      const rect = element.getBoundingClientRect();
      const minX = -window.innerWidth / 2 + rect.width / 2;
      const maxX = window.innerWidth / 2 - rect.width / 2;
      const minY = -window.innerHeight / 2 + rect.height / 2;
      const maxY = window.innerHeight / 2 - rect.height / 2;

      currentX = Math.max(minX, Math.min(currentX, maxX));
      currentY = Math.max(minY, Math.min(currentY, maxY));

      xOffset = currentX;
      yOffset = currentY;

      element.style.transform =
        "translate(-50%, -50%) translate(" +
        currentX +
        "px, " +
        currentY +
        "px)";
    } else {
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;

      const maxLeft = window.innerWidth - element.offsetWidth - margin;
      const maxTop = window.innerHeight - element.offsetHeight - margin;

      element.style.left =
        Math.max(margin, Math.min(newLeft, maxLeft)) + "px";
      element.style.top =
        Math.max(margin, Math.min(newTop, maxTop)) + "px";
    }
  }

  function onMouseUp() {
    isDragging = false;
    handle.style.cursor = "move";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  handle.style.cursor = "move";
};
