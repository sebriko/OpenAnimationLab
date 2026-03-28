let editorSearchState = {
  query: null,
  replaceText: null,
  options: {},
  currentPos: 0,
  count: 0,
  overlay: null,
  currentMark: null,
  allMatches: [],
  replaceMode: false,
};

function searchOverlay(query, caseInsensitive) {
  if (typeof query === "string")
    query = new RegExp(
      query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
      caseInsensitive ? "gi" : "g",
    );
  else if (!query.global)
    query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");

  return {
    token: function (stream) {
      query.lastIndex = stream.pos;
      var match = query.exec(stream.string);
      if (match && match.index == stream.pos) {
        stream.pos += match[0].length || 1;
        return "searching";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
      }
    },
  };
}

function performSearch() {
  let query = document.getElementById("search-input").value;
  let caseSensitive = false;
  let regex = false;

  if (editorSearchState.overlay) {
    editor.removeOverlay(editorSearchState.overlay);
    editorSearchState.overlay = null;
  }

  if (editorSearchState.currentMark) {
    editorSearchState.currentMark.clear();
    editorSearchState.currentMark = null;
  }

  if (!query) {
    editorSearchState.query = null;
    editorSearchState.currentPos = 0;
    editorSearchState.count = 0;
    editorSearchState.allMatches = [];
    updateSearchResults(0, 0);
    return;
  }

  editorSearchState.query = query;
  editorSearchState.options = { caseSensitive, regex };

  editorSearchState.overlay = searchOverlay(query, !caseSensitive);
  editor.addOverlay(editorSearchState.overlay);

  editorSearchState.allMatches = [];
  let cursor = editor.getSearchCursor(query, null, {
    caseFold: !caseSensitive,
  });

  while (cursor.findNext()) {
    editorSearchState.allMatches.push({
      from: cursor.from(),
      to: cursor.to(),
    });
  }

  editorSearchState.count = editorSearchState.allMatches.length;

  if (editorSearchState.count > 0) {
    editorSearchState.currentPos = 1;
    highlightCurrentMatch(0);
  }

  updateSearchResults(editorSearchState.currentPos, editorSearchState.count);
}

function highlightCurrentMatch(index) {
  if (editorSearchState.currentMark) {
    editorSearchState.currentMark.clear();
    editorSearchState.currentMark = null;
  }

  if (index >= 0 && index < editorSearchState.allMatches.length) {
    const match = editorSearchState.allMatches[index];

    editor.setSelection(match.from, match.to);
    editor.scrollIntoView({ from: match.from, to: match.to }, 50);

    editorSearchState.currentMark = editor.markText(match.from, match.to, {
      className: "cm-searching-current",
      clearOnEnter: false,
      clearWhenEmpty: false,
    });
  }
}

function findNext() {
  if (
    !editorSearchState ||
    !editorSearchState.query ||
    editorSearchState.count === 0
  ) {
    return;
  }

  const newIndex = editorSearchState.currentPos % editorSearchState.count;
  editorSearchState.currentPos = newIndex + 1;

  highlightCurrentMatch(newIndex);
  updateSearchResults(editorSearchState.currentPos, editorSearchState.count);
}

function findPrev() {
  if (
    !editorSearchState ||
    !editorSearchState.query ||
    editorSearchState.count === 0
  ) {
    return;
  }

  let newIndex = editorSearchState.currentPos - 2;
  if (newIndex < 0) {
    newIndex = editorSearchState.count - 1;
  }
  editorSearchState.currentPos = newIndex + 1;

  highlightCurrentMatch(newIndex);
  updateSearchResults(editorSearchState.currentPos, editorSearchState.count);
}

function replaceCurrent() {
  if (!editorSearchState.query || editorSearchState.count === 0) {
    return;
  }

  const replaceText = document.getElementById("replace-input").value;
  const currentIndex = editorSearchState.currentPos - 1;

  if (currentIndex >= 0 && currentIndex < editorSearchState.allMatches.length) {
    const match = editorSearchState.allMatches[currentIndex];

    editor.replaceRange(replaceText, match.from, match.to);

    // Re-run search after replacement so match list stays in sync.
    setTimeout(() => {
      performSearch();
      if (editorSearchState.count > 0) {
        const newPos = Math.min(currentIndex, editorSearchState.count - 1);
        editorSearchState.currentPos = newPos + 1;
        highlightCurrentMatch(newPos);
        updateSearchResults(
          editorSearchState.currentPos,
          editorSearchState.count,
        );
      }
    }, 50);
  }
}

function replaceAll() {
  if (!editorSearchState.query || editorSearchState.count === 0) {
    return;
  }

  const replaceText = document.getElementById("replace-input").value;
  const query = editorSearchState.query;
  const caseSensitive = editorSearchState.options.caseSensitive || false;

  const count = editorSearchState.count;
  const confirmText = window.i18n
    ? window.i18n
        .t("confirm_replace_all", `Replace all ${count} occurrences?`)
        .replace("{count}", count)
    : `Replace all ${count} occurrences?`;

  if (!confirm(confirmText)) {
    return;
  }

  // Replace back-to-front so earlier match positions remain valid.
  editor.operation(() => {
    for (let i = editorSearchState.allMatches.length - 1; i >= 0; i--) {
      const match = editorSearchState.allMatches[i];
      editor.replaceRange(replaceText, match.from, match.to);
    }
  });

  setTimeout(() => {
    performSearch();
    const message = window.i18n
      ? window.i18n
          .t("replaced_occurrences", `Replaced ${count} occurrences`)
          .replace("{count}", count)
      : `Replaced ${count} occurrences`;
    updateSearchResults(0, 0, message);
  }, 50);
}

function toggleReplaceMode() {
  const replaceRow = document.getElementById("replace-row");
  const toggleBtn = document.getElementById("toggle-replace-btn");

  editorSearchState.replaceMode = !editorSearchState.replaceMode;

  if (editorSearchState.replaceMode) {
    replaceRow.style.display = "flex";
    toggleBtn.classList.add("active");
    document.getElementById("replace-input").focus();
  } else {
    replaceRow.style.display = "none";
    toggleBtn.classList.remove("active");
    document.getElementById("search-input").focus();
  }
}

function updateSearchResults(current, total, customMessage) {
  const resultsElement = document.getElementById("search-results");
  const searchInput = document.getElementById("search-input");

  if (customMessage) {
    resultsElement.innerHTML = customMessage;
    resultsElement.className = "success";
    setTimeout(() => {
      updateSearchResults(current, total);
    }, 3000);
    return;
  }

  if (!searchInput.value || searchInput.value.trim() === "") {
    resultsElement.innerHTML = "";
    resultsElement.className = "";
    return;
  }

  if (total === 0) {
    const noResultsText = window.i18n
      ? window.i18n.t("no_results_found", "No results found")
      : "No results found";
    resultsElement.innerHTML = noResultsText;
    resultsElement.className = "error";
  } else {
    const hitsText = window.i18n
      ? window.i18n.t("search_hits", "Hit {current} of {total}")
      : `Hit ${current} of ${total}`;
    const formattedText = hitsText
      .replace("{current}", current)
      .replace("{total}", total);
    resultsElement.innerHTML = formattedText;
    resultsElement.className = "success";
  }
}

function clearSearch() {
  if (editorSearchState.overlay) {
    editor.removeOverlay(editorSearchState.overlay);
    editorSearchState.overlay = null;
  }

  if (editorSearchState.currentMark) {
    editorSearchState.currentMark.clear();
    editorSearchState.currentMark = null;
  }

  editorSearchState.query = null;
  editorSearchState.currentPos = 0;
  editorSearchState.count = 0;
  editorSearchState.allMatches = [];
  editorSearchState.replaceMode = false;

  if (editor.state) {
    editor.state.search = null;
  }

  const resultsElement = document.getElementById("search-results");
  if (resultsElement) {
    resultsElement.innerHTML = "";
    resultsElement.className = "";
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
  }

  const replaceInput = document.getElementById("replace-input");
  if (replaceInput) {
    replaceInput.value = "";
  }

  const replaceRow = document.getElementById("replace-row");
  if (replaceRow) {
    replaceRow.style.display = "none";
  }

  const toggleBtn = document.getElementById("toggle-replace-btn");
  if (toggleBtn) {
    toggleBtn.classList.remove("active");
  }
}

function openSearchForm(replaceMode = false) {
  const searchForm = document.getElementById("search-form");

  const editorVisible =
    document.querySelector(".CodeMirror") !== null &&
    document.querySelector(".CodeMirror").offsetParent !== null;

  if (!editorVisible) {
    const message = window.i18n
      ? window.i18n.t(
          "search_no_editor",
          "Search function cannot be activated: No code window visible",
        )
      : "Search function cannot be activated: No code window visible";
    return;
  }

  const selectedText = editor.getSelection();

  searchForm.style.display = "block";

  if (replaceMode) {
    editorSearchState.replaceMode = true;
    document.getElementById("replace-row").style.display = "flex";
    document.getElementById("toggle-replace-btn").classList.add("active");
  }

  setTimeout(() => {
    const searchInput = document.getElementById("search-input");

    if (!searchInput) {
      return;
    }

    if (
      selectedText &&
      selectedText.trim() !== "" &&
      !selectedText.includes("\n")
    ) {
      const trimmedText = selectedText.trim();
      searchInput.value = trimmedText;
      searchInput.focus();
      searchInput.select();
      performSearch();
    } else {
      searchInput.focus();
      if (searchInput.value) {
        searchInput.select();
        performSearch();
      }
    }

    if (replaceMode) {
      setTimeout(() => {
        document.getElementById("replace-input").focus();
      }, 100);
    }
  }, 10);
}

function toggleSearchForm() {
  const searchForm = document.getElementById("search-form");
  const searchFormVisible = searchForm.style.display === "block";

  if (searchFormVisible) {
    searchForm.style.display = "none";
    clearSearch();
    const editorVisible =
      document.querySelector(".CodeMirror") !== null &&
      document.querySelector(".CodeMirror").offsetParent !== null;
    if (editorVisible) {
      editor.focus();
    }
  } else {
    openSearchForm();
  }
}

function setupSearchForm() {
  if (!editor.state) editor.state = {};
  if (!editor.state.search)
    editor.state.search = {
      query: null,
      options: {},
      currentPos: 0,
      count: 0,
    };

  if (!document.getElementById("search-highlight-styles")) {
    const styleElement = document.createElement("style");
    styleElement.id = "search-highlight-styles";
    styleElement.textContent = `
            .CodeMirror .cm-searching {
                background-color: #ffeb3b !important;
                color: #000 !important;
                border-bottom: 2px solid #ffc107 !important;
                padding: 1px 0 !important;
            }
            
            .CodeMirror .cm-searching-current {
                background-color: #ff6b00 !important;
                color: white !important;
                position: relative !important;
                z-index: 10 !important;
            }
            
            .dark-theme .CodeMirror .cm-searching {
                background-color: #ffd54f !important;
                color: #000 !important;
                border-bottom: 2px solid #ffb300 !important;
            }
            
            .dark-theme .CodeMirror .cm-searching-current {
                background-color: #ff9800 !important;
                color: #000 !important;
            }
            
            .light-theme .CodeMirror .cm-searching {
                background-color: #fff59d !important;
                color: #000 !important;
                border-bottom: 2px solid #f9a825 !important;
            }
            
            .light-theme .CodeMirror .cm-searching-current {
                background-color: #ff5722 !important;
                color: white !important;
            }
        `;
    document.head.appendChild(styleElement);
  }

  document
    .getElementById("search-next-btn")
    .addEventListener("click", findNext);
  document
    .getElementById("search-prev-btn")
    .addEventListener("click", findPrev);
  document
    .getElementById("toggle-replace-btn")
    .addEventListener("click", toggleReplaceMode);
  document
    .getElementById("replace-btn")
    .addEventListener("click", replaceCurrent);
  document
    .getElementById("replace-all-btn")
    .addEventListener("click", replaceAll);
  document
    .getElementById("close-search-btn")
    .addEventListener("click", function () {
      const searchForm = document.getElementById("search-form");
      searchForm.style.display = "none";
      clearSearch();
      const editorVisible =
        document.querySelector(".CodeMirror") !== null &&
        document.querySelector(".CodeMirror").offsetParent !== null;
      if (editorVisible) {
        editor.focus();
      }
    });

  document
    .getElementById("search-input")
    .addEventListener("input", performSearch);

  document
    .getElementById("replace-input")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        replaceCurrent();
      }
    });

  document.addEventListener(
    "keydown",
    function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        e.stopPropagation();
        openSearchForm(false);
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        e.stopPropagation();
        openSearchForm(true);
        return false;
      }

      if (
        e.key === "Escape" &&
        document.getElementById("search-form").style.display === "block"
      ) {
        e.preventDefault();
        document.getElementById("search-form").style.display = "none";
        clearSearch();
        const editorVisible =
          document.querySelector(".CodeMirror") !== null &&
          document.querySelector(".CodeMirror").offsetParent !== null;
        if (editorVisible) {
          editor.focus();
        }
      }

      if (e.key === "Enter" && document.activeElement.id === "search-input") {
        e.preventDefault();
        if (e.shiftKey) {
          findPrev();
        } else {
          findNext();
        }
      }

      if (e.key === "F3" && editorSearchState.query) {
        e.preventDefault();
        if (e.shiftKey) {
          findPrev();
        } else {
          findNext();
        }
      }
    },
    true,
  );

  if (editor && editor.getWrapperElement) {
    editor.getWrapperElement().addEventListener(
      "keydown",
      function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "f") {
          e.preventDefault();
          e.stopPropagation();
          openSearchForm(false);
          return false;
        }
      },
      true,
    );
  }

  if (editor && editor.options && editor.options.extraKeys) {
    const existingExtraKeys = editor.options.extraKeys || {};
    editor.setOption("extraKeys", {
      ...existingExtraKeys,
      "Ctrl-F": function (cm) {
        openSearchForm(false);
      },
      "Cmd-F": function (cm) {
        openSearchForm(false);
      },
      "Ctrl-H": function (cm) {
        openSearchForm(true);
      },
      "Cmd-Option-F": function (cm) {
        openSearchForm(true);
      },
      F3: function (cm) {
        if (editorSearchState.query) {
          findNext();
        }
      },
      "Shift-F3": function (cm) {
        if (editorSearchState.query) {
          findPrev();
        }
      },
    });
  }

  document.getElementById("search-form").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof editor !== "undefined") {
    setupSearchForm();
  } else {
    // Poll until the CodeMirror editor instance is ready.
    let attempts = 0;
    const maxAttempts = 20;

    const checkEditor = setInterval(function () {
      attempts++;
      if (typeof editor !== "undefined" && editor) {
        clearInterval(checkEditor);
        setupSearchForm();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkEditor);
      }
    }, 500);
  }
});

document.addEventListener("languageChanged", function (e) {
  if (editorSearchState.count !== undefined) {
    updateSearchResults(editorSearchState.currentPos, editorSearchState.count);
  }
});

window.debugSearch = function () {};
