let systemMessages = [];
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let activeWindow = null;

// Rate-limiting and throttling state for message system
let messageDisplayScheduled = false;
let suppressedCount = 0;
const MAX_MESSAGES = 10;
const MESSAGE_THROTTLE_MS = 200;

// Public API for logging messages from eval context
window.logEvalMessage = function (message, type = "log", lineNumber = null) {
  const messageEntry = {
    id: Date.now() + Math.random(),
    message: message,
    type: type, // 'log', 'error', 'info'
    lineNumber: lineNumber,
    timestamp: new Date().toISOString(),
  };

  systemMessages.push(messageEntry);

  if (systemMessages.length > MAX_MESSAGES) {
    suppressedCount += systemMessages.length - MAX_MESSAGES;
    systemMessages = systemMessages.slice(-MAX_MESSAGES);
  }

  if (!messageDisplayScheduled) {
    messageDisplayScheduled = true;
    setTimeout(() => {
      messageDisplayScheduled = false;
      updateMessageDisplay();
    }, MESSAGE_THROTTLE_MS);
  }
};

function updateMessageDisplay() {
  const messageLog = document.getElementById("messageLog");
  if (!messageLog) return;

  if (systemMessages.length === 0) {
    const noMessagesText = window.i18n
      ? window.i18n.t("no_messages_info")
      : 'Per console.log("Hallo Welt") können Sie hier Meldungen anzeigen lassen. Achtung: Meldungen werden in den Arbeitsspeicher geschrieben und velangsamen die Animation';
    messageLog.innerHTML = `<div class="no-messages">${noMessagesText}</div>`;
    return;
  }

  let html = "";

  if (suppressedCount > 0) {
    const suppressedText = window.i18n
      ? window.i18n.t("messages_suppressed", { count: suppressedCount })
      : `${suppressedCount} ältere Meldung(en) wurden verworfen. Es werden nur die letzten ${MAX_MESSAGES} angezeigt.`;
    html += `<div class="message-entry console-info" style="opacity:0.6; font-style:italic;">
            <div class="message-text">${suppressedText}</div>
        </div>`;
  }

  systemMessages.forEach((msg) => {
    const timestamp = new Date(msg.timestamp).toLocaleTimeString("de-DE");
    const lineText = window.i18n ? window.i18n.t("line") : "Zeile";
    const messageClass = msg.type === "error" ? "console-error" : "console-log";
    const signalText =
      msg.type === "error" ? "ERROR" : msg.type === "info" ? "INFO" : "LOG";

    html += `
            <div class="message-entry ${messageClass}">
                <div class="message-header">
                    <span class="message-signal">${signalText}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${escapeHtml(msg.message)}</div>
                ${msg.lineNumber ? `<div class="message-line">${lineText} ${msg.lineNumber}</div>` : ""}
            </div>
        `;
  });

  messageLog.innerHTML = html;
  messageLog.scrollTop = messageLog.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function centerWindow(windowElement) {
  const windowWidth = windowElement.offsetWidth;
  const windowHeight = windowElement.offsetHeight;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const left = Math.max(0, (screenWidth - windowWidth) / 2);
  const top = Math.max(0, (screenHeight - windowHeight) / 2);

  windowElement.style.transform = "none";
  windowElement.style.left = left + "px";
  windowElement.style.top = top + "px";
}

window.openMessageWindow = function () {
  closeAllWindows();
  const messageWindow = document.getElementById("messageWindow");
  messageWindow.classList.add("visible");
  activeWindow = messageWindow;
  updateMessageDisplay();

  setTimeout(() => {
    centerWindow(messageWindow);
  }, 0);
};

window.closeMessageWindow = function () {
  const messageWindow = document.getElementById("messageWindow");
  messageWindow.classList.remove("visible");
  activeWindow = null;
};

window.clearMessageLog = function () {
  systemMessages = [];
  suppressedCount = 0;
  updateMessageDisplay();
};

window.openInfoWindow = function () {
  closeAllWindows();
  const infoWindow = document.getElementById("infoWindow");
  infoWindow.classList.add("visible");
  activeWindow = infoWindow;

  setTimeout(() => {
    centerWindow(infoWindow);
  }, 0);
};

window.closeInfoWindow = function () {
  const infoWindow = document.getElementById("infoWindow");
  infoWindow.classList.remove("visible");
  activeWindow = null;
};

function closeAllWindows() {
  closeMessageWindow();
  closeInfoWindow();
}

function setupDragFunctionality() {
  const windows = ["messageWindow", "infoWindow"];
  const headers = ["messageWindowHeader", "infoWindowHeader"];

  windows.forEach((windowId, index) => {
    const modalWindow = document.getElementById(windowId);
    const header = document.getElementById(headers[index]);

    if (!modalWindow || !header) return;

    header.addEventListener("mousedown", function (e) {
      isDragging = true;
      activeWindow = modalWindow;

      const computedStyle = window.getComputedStyle(modalWindow);
      const currentLeft = parseInt(computedStyle.left) || 0;
      const currentTop = parseInt(computedStyle.top) || 0;

      if (computedStyle.transform !== "none") {
        const rect = modalWindow.getBoundingClientRect();
        modalWindow.style.transform = "none";
        modalWindow.style.left = rect.left + "px";
        modalWindow.style.top = rect.top + "px";
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
      } else {
        dragOffset.x = e.clientX - currentLeft;
        dragOffset.y = e.clientY - currentTop;
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      e.preventDefault();
    });
  });

  function onMouseMove(e) {
    if (!isDragging || !activeWindow) return;

    const newLeft = e.clientX - dragOffset.x;
    const newTop = e.clientY - dragOffset.y;

    const maxLeft = window.innerWidth - activeWindow.offsetWidth;
    const maxTop = window.innerHeight - activeWindow.offsetHeight;

    activeWindow.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px";
    activeWindow.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeAllWindows();
  }
});

document.addEventListener("languageChanged", function (e) {
  updateMessageDisplay();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setupDragFunctionality();
  });
} else {
  setupDragFunctionality();
}
