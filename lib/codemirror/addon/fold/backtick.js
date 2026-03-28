// Backtick Code Block Fold-Erweiterung für CodeMirror
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  // Funktion zum Erkennen und Falten von Backtick-Codeblöcken
  function findBacktickRange(cm, start) {
    var line = cm.getLine(start.line);
    
    // Prüfen, ob Zeile mit ``` beginnt
    if (line.trim() === "```" || line.trim().startsWith("```")) {
      var startLine = start.line;
      var endLine = startLine + 1;
      var lastLine = cm.lastLine();
      
      // Nach dem schließenden ``` suchen
      while (endLine <= lastLine) {
        if (cm.getLine(endLine).trim() === "```") {
          return {
            from: CodeMirror.Pos(startLine, 0),
            to: CodeMirror.Pos(endLine, cm.getLine(endLine).length)
          };
        }
        endLine++;
      }
    }
    return null;
  }

  // Registrieren der Backtick-Faltung als Helper
  CodeMirror.registerHelper("fold", "backtick", findBacktickRange);

  // Diese Funktion als globalen Helfer registrieren, damit sie für alle Modi verfügbar ist
  CodeMirror.registerGlobalHelper("fold", "backtick", 
    function(mode) { return true; }, // Für alle Modi aktivieren
    findBacktickRange
  );

  // Die Standard-Faltungs-Funktion erweitern/modifizieren
  var origFoldCode = CodeMirror.commands.foldCode;
  CodeMirror.commands.foldCode = function(cm, options) {
    if (!options) options = {};
    if (!options.rangeFinder) {
      // Standardmäßig zuerst unsere Backtick-Faltung versuchen
      var backtickResult = findBacktickRange(cm, cm.getCursor());
      if (backtickResult) {
        cm.foldCode(cm.getCursor(), {rangeFinder: findBacktickRange});
        return;
      }
    }
    // Sonst die Original-Faltfunktion verwenden
    origFoldCode.call(this, cm, options);
  };

  // CodeMirror.fold Kombinationsfunktion
  if (!CodeMirror.fold) CodeMirror.fold = {};
  
  // Kombinierte Faltungsfunktion zur Verfügung stellen
  CodeMirror.fold.combine = function() {
    var funcs = Array.prototype.slice.call(arguments, 0);
    return function(cm, start) {
      for (var i = 0; i < funcs.length; i++) {
        var found = funcs[i](cm, start);
        if (found) return found;
      }
    };
  };

  // Standard Faltfunktion erweitern, wenn vorhanden
  if (CodeMirror.fold.auto) {
    var origAuto = CodeMirror.fold.auto;
    CodeMirror.fold.auto = CodeMirror.fold.combine(findBacktickRange, origAuto);
  } else {
    // Auto-Faltung definieren, falls noch nicht vorhanden
    CodeMirror.fold.auto = CodeMirror.fold.combine(findBacktickRange, 
      function(cm, start) {
        // Fallback auf andere Faltfunktionen
        if (CodeMirror.fold.brace && cm.getMode().name.indexOf("javascript") >= 0)
          return CodeMirror.fold.brace(cm, start);
        return null;
      });
  }
});