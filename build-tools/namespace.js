// Alle Klassen aus beiden Namespaces global verfügbar machen
[PixiJSEdu, HtmlSvgEdu].forEach((ns) => {
  Object.keys(ns).forEach((key) => {
    if (typeof ns[key] === "function") {
      globalThis[key] = ns[key];
    }
  });
});
