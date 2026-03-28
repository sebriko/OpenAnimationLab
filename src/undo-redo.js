/**
 * Undo/Redo for the CodeMirror editor
 */

function performUndo() {
  if (window.editor) {
    window.editor.undo();
    updateUndoRedoButtons();
  }
}

function performRedo() {
  if (window.editor) {
    window.editor.redo();
    updateUndoRedoButtons();
  }
}

function updateUndoRedoButtons() {
  if (!window.editor) return;
  const history = window.editor.historySize();
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  if (undoBtn) undoBtn.disabled = history.undo === 0;
  if (redoBtn) redoBtn.disabled = history.redo === 0;
}

document.addEventListener("DOMContentLoaded", function () {
  // Update button states whenever the editor content changes
  function onEditorReady() {
    if (window.editor) {
      window.editor.on("change", updateUndoRedoButtons);
      updateUndoRedoButtons();
    } else {
      setTimeout(onEditorReady, 100);
    }
  }
  onEditorReady();
});
