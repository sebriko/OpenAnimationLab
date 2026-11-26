// Lokale 3D-Szenen im Open Animation Lab (v4.5.0, 25.11.2026)
//
// Lab und 3D-Scene-Editor arbeiten zusammen, ohne dass etwas auf den Server
// muss. Im Code steht eine lokale Szene so:
//
//     let modell = new Model3D("local:Getriebe", 1280, 720);
//
// Die Szene selbst (scene.json + Modelle) liegt im Browser – in der
// IndexedDB „oal-3d“, die Lab und Editor teilen (gleiche Domain). Aufbau
// eines Eintrags (gleich wie in 3d-scene-editor/js/LabBridge.js):
//
//     { name, scene: {…scene.json…}, files: { "models/a.obj": Blob }, updatedAt, onlineId? }
//
// Was dieses Skript tut:
//   1. Knopf „3D-Editor“ hinter jedem new Model3D("…") im Code: öffnet die
//      Szene im Editor (lokale Szene), bietet bei einer Szene der Website eine
//      eigene Kopie an (Gäste) bzw. Bearbeiten online oder Kopie (Admin).
//   2. Speichern: Nutzt der Code lokale Szenen, kommt ein ZIP heraus
//      (Code + Szenen). Angemeldete (Admin) wählen: online (Szene auf den
//      Server, Code als .js) oder offline (ZIP). Ohne 3D: .js wie bisher.
//   3. Öffnen: liest so ein ZIP (oder ein Szenen-ZIP aus dem Editor) ein.
//   4. Export: Szenen und ein Offline-Viewer kommen in die HTML-Datei – sie
//      läuft dann auch per Doppelklick ohne Internet.
//   5. „Zurück ins Lab“ im Editor startet die Animation hier neu.
//
// Model3D (src/core/HtmlSvgEdu.js) holt die Szene zur Laufzeit über
// window.OAL3D.getPackage(name) bzw. im Export aus <script id="oal3d-data">.

(function () {
  "use strict";

  const DB_NAME = "oal-3d";
  const DB_VERSION = 1;
  const STORE = "scenes";
  const CHANNEL = "oal-3d";
  const PREFIX = "local:";
  const VIEWER_VERSION = "20261126-2"; // bei neuem viewer.html erhöhen
  const BIG_EXPORT_MB = 25;

  // ── Texte ──────────────────────────────────────────────────────────────
  const TEXT = {
    de: {
      btn: "3D-Editor",
      btnTitleLocal: "Diese 3D-Szene im 3D-Editor bearbeiten",
      btnTitleOnline: "Diese 3D-Szene der Website im 3D-Editor öffnen",
      btnTitleNew: "Neue 3D-Szene anlegen und im 3D-Editor öffnen",
      defaultName: "Meine Szene",
      onlineTitle: "3D-Szene der Website",
      onlineText: "Diese Szene liegt auf educational-animation.org. Sie können eine eigene Kopie bearbeiten – die Szene auf der Website bleibt, wie sie ist.",
      onlineCopy: "Eigene Kopie bearbeiten",
      onlineCopyNote: "Der Code verweist danach auf Ihre Kopie (local:…). Sie bleibt in Ihrem Browser und kommt beim Speichern mit ins ZIP.",
      onlineEdit: "Online bearbeiten",
      onlineEditNote: "Sie sind angemeldet: Änderungen im Editor gelten für alle Animationen, die diese Szene nutzen.",
      cancel: "Abbrechen",
      copying: "Kopiere 3D-Szene … ({n} Modelle)",
      copyFailed: "Die Szene konnte nicht kopiert werden: {msg}",
      saveTitle: "Projekt mit 3D-Szene speichern",
      saveText: "Der Code nutzt eine 3D-Szene aus Ihrem Browser: {names}.",
      saveOnline: "Online speichern",
      saveOnlineNote: "Die Szene kommt auf den Server, der Code verweist darauf und wird als .js gespeichert.",
      saveZip: "Als ZIP speichern",
      saveZipNote: "Code und Szene zusammen in einer Datei auf diesem Rechner. Mit „Öffnen“ laden Sie beides wieder.",
      saveJs: "Nur Code (.js)",
      saveJsNote: "Ohne 3D-Szene – sie bleibt nur in diesem Browser.",
      savedZip: "Gespeichert als ZIP: Code und 3D-Szene in einer Datei. Mit „Öffnen“ laden Sie beides wieder.",
      publishing: "Lade 3D-Szene „{name}“ hoch …",
      published: "3D-Szene „{name}“ liegt jetzt online. Der Code verweist darauf.",
      publishFailed: "Hochladen fehlgeschlagen: {msg}",
      missing: "Die 3D-Szene „{name}“ ist noch leer oder fehlt in diesem Browser. Bauen Sie sie mit dem Knopf „3D-Editor“ im Code – oder öffnen Sie das Projekt-ZIP, in dem sie gespeichert ist.",
      missingExport: "Die 3D-Szene „{name}“ fehlt in diesem Browser – der Export ist nicht möglich. Öffnen Sie zuerst das Projekt-ZIP.",
      zipBad: "Dieses ZIP enthält weder ein Lab-Projekt noch eine 3D-Szene.",
      zipSceneOnly: "3D-Szene „{name}“ ist jetzt im Lab. Einbinden mit:  new Model3D(\"local:{name}\", 1280, 720)",
      zipRenamed: "Eine andere Szene hieß schon „{old}“ – die Szene aus dem ZIP heißt jetzt „{name}“ (im Code angepasst).",
      viewerFailed: "Der 3D-Viewer für den Export konnte nicht geladen werden ({msg}).",
      bigExport: "Die Datei wird etwa {mb} MB groß (3D-Modelle). Trotzdem exportieren?",
      updated: "3D-Szene „{name}“ übernommen – die Animation startet neu.",
      popupBlocked: "Der Browser hat das neue Fenster blockiert. Bitte Pop-ups für diese Seite erlauben.",
      unknownObject: "In der 3D-Szene gibt es kein Objekt „{name}“. Vorhanden: {list}. Die Namen stehen im 3D-Editor links in der Liste.",
      unknownObjectEmpty: "In der 3D-Szene gibt es kein Objekt „{name}“ – die Szene ist noch leer. Fügen Sie im 3D-Editor ein Modell hinzu.",
    },
    en: {
      btn: "3D editor",
      btnTitleLocal: "Edit this 3D scene in the 3D editor",
      btnTitleOnline: "Open this website 3D scene in the 3D editor",
      btnTitleNew: "Create a new 3D scene and open it in the 3D editor",
      defaultName: "My scene",
      onlineTitle: "3D scene from the website",
      onlineText: "This scene is stored on educational-animation.org. You can edit your own copy – the scene on the website stays as it is.",
      onlineCopy: "Edit my own copy",
      onlineCopyNote: "Your code then points to your copy (local:…). It stays in your browser and goes into the ZIP when you save.",
      onlineEdit: "Edit online",
      onlineEditNote: "You are logged in: changes in the editor apply to every animation that uses this scene.",
      cancel: "Cancel",
      copying: "Copying 3D scene … ({n} models)",
      copyFailed: "The scene could not be copied: {msg}",
      saveTitle: "Save project with 3D scene",
      saveText: "Your code uses a 3D scene from your browser: {names}.",
      saveOnline: "Save online",
      saveOnlineNote: "The scene goes to the server, the code points to it and is saved as a .js file.",
      saveZip: "Save as ZIP",
      saveZipNote: "Code and scene together in one file on this computer. Open it again with “Open”.",
      saveJs: "Code only (.js)",
      saveJsNote: "Without the 3D scene – it stays in this browser only.",
      savedZip: "Saved as ZIP: code and 3D scene in one file. Open both again with “Open”.",
      publishing: "Uploading 3D scene “{name}” …",
      published: "3D scene “{name}” is now online. The code points to it.",
      publishFailed: "Upload failed: {msg}",
      missing: "The 3D scene “{name}” is still empty or missing in this browser. Build it with the “3D editor” button in the code – or open the project ZIP it was saved in.",
      missingExport: "The 3D scene “{name}” is missing in this browser – export is not possible. Open the project ZIP first.",
      zipBad: "This ZIP contains neither a Lab project nor a 3D scene.",
      zipSceneOnly: "3D scene “{name}” is now in the Lab. Use it with:  new Model3D(\"local:{name}\", 1280, 720)",
      zipRenamed: "Another scene was already called “{old}” – the scene from the ZIP is now called “{name}” (code updated).",
      viewerFailed: "The 3D viewer for the export could not be loaded ({msg}).",
      bigExport: "The file will be about {mb} MB (3D models). Export anyway?",
      updated: "3D scene “{name}” updated – the animation restarts.",
      popupBlocked: "The browser blocked the new window. Please allow pop-ups for this site.",
      unknownObject: "The 3D scene has no object “{name}”. Available: {list}. You can find the names in the list on the left of the 3D editor.",
      unknownObjectEmpty: "The 3D scene has no object “{name}” – the scene is still empty. Add a model in the 3D editor.",
    },
  };

  function lang() {
    const l = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : "en";
    return l === "de" ? "de" : "en";
  }

  function t(key, vars) {
    const s = (TEXT[lang()] && TEXT[lang()][key]) || TEXT.en[key] || key;
    return s.replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? String(vars[k]) : m));
  }

  function say(text, type) {
    if (typeof window.logEvalMessage === "function") window.logEvalMessage(text, type || "log");
    showBanner(text, type === "error" ? "warn" : "info");
  }

  function showBanner(text, kind) {
    const area = document.getElementById("editorArea");
    if (!area) return;
    const old = document.getElementById("oal3dBanner");
    if (old) old.remove();
    const banner = document.createElement("div");
    banner.id = "oal3dBanner";
    banner.className = "sa-banner" + (kind === "warn" ? " sa-banner-warn" : " oal3d-banner-info");
    banner.setAttribute("role", "status");
    const span = document.createElement("span");
    span.textContent = text;
    const close = document.createElement("button");
    close.className = "sa-banner-close";
    close.setAttribute("aria-label", lang() === "de" ? "Schließen" : "Close");
    close.innerHTML = '<span class="material-icons" aria-hidden="true">close</span>';
    close.onclick = () => banner.remove();
    banner.appendChild(span);
    banner.appendChild(close);
    area.insertBefore(banner, area.firstChild);
    clearTimeout(showBanner._timer);
    if (kind !== "warn") showBanner._timer = setTimeout(() => banner.remove(), 9000);
  }

  // ── Speicher im Browser (IndexedDB, mit dem Editor geteilt) ────────────
  function openDb() {
    return new Promise((resolve, reject) => {
      let req;
      try {
        req = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (e) {
        reject(e);
        return;
      }
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: "name" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getScene(name) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(name);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } finally {
      db.close();
    }
  }

  async function putScene(record) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(Object.assign({}, record, { updatedAt: Date.now() }));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }

  function emptyRecord(name) {
    return {
      name,
      scene: {
        name,
        settings: { backgroundColor: "#ffffff", edgeQuality: "sharp" },
        camera: { position: [5, 4, 8], target: [0, 0, 0] },
        objects: [],
        poses: [],
      },
      files: {},
    };
  }

  // ── Namen und Verweise im Code ─────────────────────────────────────────
  function cleanName(name) {
    const n = String(name || "")
      .replace(/["'`\\<>\u0000-\u001f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60)
      .trim();
    return n || t("defaultName");
  }

  async function freeName(base) {
    let name = cleanName(base);
    let i = 2;
    while (await getScene(name)) name = cleanName(base).slice(0, 55) + " " + i++;
    return name;
  }

  // Jede Zeichenkette "local:Name" im Code gilt als Verweis (auch in Konstanten)
  function localRefs(code) {
    const names = new Set();
    const re = /(["'`])local:([^"'`\\\n]{1,80})\1/g;
    let m;
    while ((m = re.exec(String(code || "")))) names.add(m[2]);
    return [...names];
  }

  function onlineIdFrom(url) {
    const m = String(url || "").match(/3d-scene-editor\/(?:index\.html)?\?(?:[^"'`\s]*&)?scene=([0-9A-Za-z-]{8,64})/);
    return m ? m[1] : null;
  }

  function hasLocalScenes(code) {
    return localRefs(code).length > 0;
  }

  // Blanko-Szene (4.5.2): new Model3D() ohne Adresse – erstes Argument keine
  // Zeichenkette (z. B. new Model3D(1280, 720)) oder leere Zeichenkette
  function hasBlankScene(code) {
    return /new\s+Model3D\s*\(\s*(?:\)|["'`]{2}|[^"'`\s)])/.test(String(code || ""));
  }

  function siteUrl(path) {
    return new URL(path, window.location.href).href;
  }

  function editorUrl(params) {
    return siteUrl("../3d-scene-editor/index.html") + (params ? "?" + params : "");
  }

  function apiUrl(file) {
    return siteUrl("../3d-scene-editor/api/" + file);
  }

  // Code im Editor ändern, ohne den Verlauf (Rückgängig) zu verlieren
  function replaceInCode(from, to) {
    if (!window.editor || from === to) return;
    const ed = window.editor;
    if (typeof ed.getSearchCursor === "function") {
      ed.operation(() => {
        const cur = ed.getSearchCursor(from);
        while (cur.findNext()) cur.replace(to);
      });
    } else {
      ed.setValue(ed.getValue().split(from).join(to));
    }
  }

  // ── Angemeldet? (dann Admin: WordPress-Registrierung ist aus) ──────────
  let adminCache = null;
  async function isAdmin() {
    if (adminCache && Date.now() - adminCache.at < 60000) return adminCache.value;
    let value = false;
    try {
      const r = await fetch(apiUrl("auth-check.php"), { credentials: "same-origin", cache: "no-store" });
      const d = await r.json();
      value = !!(d && d.authenticated);
    } catch (e) {
      value = false;
    }
    adminCache = { at: Date.now(), value };
    return value;
  }

  // ── Kleine Dialoge im Stil der Lab-Fenster ─────────────────────────────
  // choices: [{ id, label, note, icon, primary }] → Promise<id | null>
  function ask(title, text, choices) {
    return new Promise((resolve) => {
      const old = document.getElementById("oal3dDialog");
      if (old) old.remove();
      const win = document.createElement("div");
      win.id = "oal3dDialog";
      win.className = "modal-window visible";
      win.setAttribute("role", "dialog");
      win.setAttribute("aria-modal", "true");
      win.setAttribute("aria-labelledby", "oal3dDialogTitle");

      const header = document.createElement("div");
      header.className = "modal-window-header";
      const ttl = document.createElement("div");
      ttl.className = "modal-window-title";
      ttl.id = "oal3dDialogTitle";
      ttl.innerHTML = '<span class="material-icons">view_in_ar</span>';
      const ttlText = document.createElement("span");
      ttlText.textContent = title;
      ttl.appendChild(ttlText);
      const x = document.createElement("button");
      x.className = "modal-window-close";
      x.setAttribute("aria-label", t("cancel"));
      x.innerHTML = '<span class="material-icons">close</span>';
      header.appendChild(ttl);
      header.appendChild(x);

      const content = document.createElement("div");
      content.className = "modal-window-content sa-content";
      if (text) {
        const p = document.createElement("p");
        p.textContent = text;
        content.appendChild(p);
      }
      const done = (id) => {
        document.removeEventListener("keydown", onKey, true);
        win.remove();
        resolve(id);
      };
      for (const c of choices) {
        const sec = document.createElement("div");
        sec.className = "sa-section";
        const row = document.createElement("div");
        row.className = "sa-row";
        const b = document.createElement("button");
        b.className = "sa-button" + (c.primary ? " oal3d-primary" : "");
        b.innerHTML = '<span class="material-icons">' + (c.icon || "check") + "</span>";
        const bl = document.createElement("span");
        bl.textContent = c.label;
        b.appendChild(bl);
        b.onclick = () => done(c.id);
        row.appendChild(b);
        sec.appendChild(row);
        if (c.note) {
          const n = document.createElement("p");
          n.className = "sa-note";
          n.textContent = c.note;
          sec.appendChild(n);
        }
        content.appendChild(sec);
      }
      const cancelRow = document.createElement("div");
      cancelRow.className = "sa-row oal3d-cancel-row";
      const cancel = document.createElement("button");
      cancel.className = "sa-button oal3d-cancel";
      cancel.textContent = t("cancel");
      cancel.onclick = () => done(null);
      cancelRow.appendChild(cancel);
      content.appendChild(cancelRow);
      x.onclick = () => done(null);

      const onKey = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          done(null);
        }
      };
      document.addEventListener("keydown", onKey, true);

      win.appendChild(header);
      win.appendChild(content);
      document.body.appendChild(win);
      win.style.width = "520px";
      win.style.maxWidth = "92vw";
      win.style.minHeight = "0";
      win.style.zIndex = "10050";
      setTimeout(() => {
        win.style.transform = "none";
        win.style.left = Math.max(0, (window.innerWidth - win.offsetWidth) / 2) + "px";
        win.style.top = Math.max(0, (window.innerHeight - win.offsetHeight) / 3) + "px";
        const first = win.querySelector(".oal3d-primary") || win.querySelector(".sa-button");
        if (first) first.focus();
      }, 0);
    });
  }

  // ── Editor öffnen ──────────────────────────────────────────────────────
  function openEditorTab(params, target) {
    const w = window.open(editorUrl(params + "&lang=" + lang()), target || "_blank");
    if (!w) say(t("popupBlocked"), "error");
    return w;
  }

  async function openLocal(name) {
    if (!(await getScene(name))) await putScene(emptyRecord(name));
    // Gleicher Fenstername → ein zweiter Klick holt denselben Tab nach vorn
    openEditorTab("oal=" + encodeURIComponent(name), "oal3d-" + name);
  }

  // Szene der Website als lokale Kopie in den Browser holen
  async function copyOnline(id) {
    const r = await fetch(apiUrl("scene-load.php?id=" + encodeURIComponent(id)), {
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = await r.json();
    if (!data || data.error || !data.scene) throw new Error((data && data.message) || "HTTP " + r.status);
    const src = data.scene;
    say(t("copying", { n: (src.objects || []).length }));
    const files = {};
    const map = {};
    const used = new Set();
    const objects = [];
    for (const o of src.objects || []) {
      const url = String(o.modelUrl || "");
      if (!(url in map)) {
        map[url] = null;
        const abs = new URL(url, editorUrl("")).href;
        if (abs.startsWith(window.location.origin + "/")) {
          const resp = await fetch(abs, { credentials: "same-origin" });
          if (!resp.ok) throw new Error(url.split("/").pop() + " (" + resp.status + ")");
          let base = (url.split("?")[0].split("/").pop() || "model").replace(/[^A-Za-z0-9_.\-äöüÄÖÜß ]/g, "_");
          let fileName = base;
          let i = 2;
          while (used.has(fileName.toLowerCase())) {
            const dot = base.lastIndexOf(".");
            fileName = dot > 0 ? base.slice(0, dot) + "_" + i++ + base.slice(dot) : base + "_" + i++;
          }
          used.add(fileName.toLowerCase());
          files["models/" + fileName] = await resp.blob();
          map[url] = "models/" + fileName;
        }
      }
      if (map[url]) objects.push(Object.assign({}, o, { modelUrl: map[url], modelId: "" }));
    }
    const name = await freeName(src.name || t("defaultName"));
    const scene = {
      name,
      description: src.description || "",
      settings: src.settings || {},
      camera: src.camera || null,
      objects,
      poses: src.poses || [],
    };
    await putScene({ name, scene, files, copiedFrom: id });
    return name;
  }

  // Knopf hinter new Model3D("…"): je nach Inhalt der Zeichenkette
  async function editScene(urlText, onCreated) {
    const value = String(urlText || "").trim();
    try {
      if (value.startsWith(PREFIX)) {
        await openLocal(value.slice(PREFIX.length));
        return;
      }
      const id = onlineIdFrom(value);
      if (id) {
        const admin = await isAdmin();
        const choices = [];
        if (admin) {
          choices.push({ id: "edit", label: t("onlineEdit"), note: t("onlineEditNote"), icon: "edit", primary: true });
        }
        choices.push({ id: "copy", label: t("onlineCopy"), note: t("onlineCopyNote"), icon: "content_copy", primary: !admin });
        const choice = await ask(t("onlineTitle"), admin ? "" : t("onlineText"), choices);
        if (choice === "edit") {
          openEditorTab("scene=" + encodeURIComponent(id), "oal3d-online-" + id);
        } else if (choice === "copy") {
          const name = await copyOnline(id);
          if (onCreated) onCreated(PREFIX + name);
          else replaceInCode(value, PREFIX + name);
          await openLocal(name);
        }
        return;
      }
      // Leer oder etwas anderes: neue lokale Szene
      const name = await freeName(t("defaultName"));
      await putScene(emptyRecord(name));
      if (onCreated) onCreated(PREFIX + name);
      await openLocal(name);
    } catch (e) {
      console.error("[OAL3D]", e);
      say(t("copyFailed", { msg: e.message || e }), "error");
    }
  }

  // ── Knopf im Code (hinter der Zeichenkette von new Model3D) ────────────
  // Wird von CodeEditor.js nach jeder Änderung aufgerufen; die Marken landen
  // in window.contentMarks und werden dort wieder entfernt.
  function decorateEditor(ed, marks) {
    const lines = ed.lineCount();
    const re = /new\s+Model3D\s*\(\s*(["'`])((?:(?!\1)[^\\\n])*)\1/g;
    for (let line = 0; line < lines; line++) {
      const text = ed.getLine(line);
      if (text.indexOf("Model3D") === -1) continue;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        const value = m[2];
        const quote = m[1];
        if (value === "") continue; // Blanko-Szene: nichts zu bearbeiten
        const endCh = m.index + m[0].length;
        const startCh = endCh - value.length - 1; // Position nach dem öffnenden Zeichen
        const btn = document.createElement("span");
        btn.className = "oal3d-code-btn";
        btn.setAttribute("role", "button");
        btn.tabIndex = 0;
        const isLocal = value.startsWith(PREFIX);
        const isOnline = !isLocal && !!onlineIdFrom(value);
        btn.title = isLocal ? t("btnTitleLocal") : isOnline ? t("btnTitleOnline") : t("btnTitleNew");
        btn.innerHTML = '<span class="material-icons" aria-hidden="true">view_in_ar</span>';
        const label = document.createElement("span");
        label.textContent = t("btn");
        btn.appendChild(label);
        const run = (e) => {
          e.preventDefault();
          e.stopPropagation();
          editScene(value, (newValue) => {
            // genau diese Zeichenkette in dieser Zeile ersetzen
            const cur = ed.getLine(line);
            const from = { line, ch: startCh };
            const to = { line, ch: startCh + value.length };
            if (cur.slice(startCh - 1, startCh) === quote && cur.slice(startCh, startCh + value.length) === value) {
              ed.replaceRange(newValue, from, to);
            } else {
              replaceInCode(quote + value + quote, quote + newValue + quote);
            }
          });
        };
        btn.addEventListener("mousedown", (e) => e.preventDefault());
        btn.addEventListener("click", run);
        btn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") run(e);
        });
        const mark = ed.setBookmark({ line, ch: endCh }, { widget: btn, insertLeft: true });
        marks.push(mark);
      }
    }
  }

  // ── Szenen für Laufzeit und Export ─────────────────────────────────────
  async function getPackage(name) {
    const rec = await getScene(name);
    if (!rec || !rec.scene || !(rec.scene.objects || []).length) {
      say(t("missing", { name }));
    }
    if (!rec) return { scene: emptyRecord(name).scene, files: {} };
    return { scene: rec.scene, files: rec.files || {} };
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const s = String(r.result);
        resolve(s.slice(s.indexOf(",") + 1));
      };
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob instanceof Blob ? blob : new Blob([blob]));
    });
  }

  let viewerPromise = null;
  function loadViewer() {
    if (!viewerPromise) {
      viewerPromise = fetch(siteUrl("../3d-scene-editor/viewer/viewer.html?v=" + VIEWER_VERSION), { cache: "no-cache" })
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        })
        .catch((e) => {
          viewerPromise = null;
          throw e;
        });
    }
    return viewerPromise;
  }

  // Szenen + Viewer in die Export-HTML. Rückgabe: HTML oder null (Abbruch).
  // opts.blank: Viewer auch für die Blanko-Szene einbetten (Offline-Export)
  async function embedScenes(html, code, opts) {
    const names = localRefs(code);
    const blank = !!(opts && opts.blank) && hasBlankScene(code);
    if (!names.length && !blank) return html;
    const scenes = {};
    let bytes = 0;
    for (const name of names) {
      const rec = await getScene(name);
      if (!rec) {
        alert(t("missingExport", { name }));
        return null;
      }
      const files = {};
      for (const [path, blob] of Object.entries(rec.files || {})) {
        files[path] = await blobToBase64(blob);
        bytes += files[path].length;
      }
      scenes[name] = { scene: rec.scene, files };
    }
    let viewer;
    try {
      viewer = await loadViewer();
    } catch (e) {
      alert(t("viewerFailed", { msg: e.message || e }));
      return null;
    }
    bytes += viewer.length;
    const mb = Math.round(bytes / 1048576);
    if (mb >= BIG_EXPORT_MB && !confirm(t("bigExport", { mb }))) return null;
    // "<" maskieren: nichts im JSON kann das Script-Element beenden
    const json = JSON.stringify({ v: 1, viewer, scenes }).replace(/</g, "\\u003c");
    const block = '<script type="application/json" id="oal3d-data">' + json + "</script>\n";
    const at = html.indexOf("</head>");
    if (at === -1) return block + html;
    return html.slice(0, at) + block + html.slice(at);
  }

  // ── Speichern (ZIP) und Öffnen ─────────────────────────────────────────
  function safeFileName(name) {
    return (
      String(name || "")
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^\.+|\.+$/g, "")
        .slice(0, 80) || "animation"
    );
  }

  function download(blob, fileName) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function saveZip(tabName, code) {
    if (typeof JSZip === "undefined") throw new Error("JSZip");
    const zip = new JSZip();
    const base = safeFileName(tabName);
    const names = localRefs(code);
    const project = { format: "oal-project", version: 1, code: base + ".js", scenes: [] };
    zip.file(base + ".js", code);
    const usedDirs = new Set();
    for (const name of names) {
      const rec = await getScene(name);
      if (!rec) {
        say(t("missing", { name }), "error");
        continue;
      }
      let dir = "scenes/" + safeFileName(name).replace(/\s/g, "_");
      let i = 2;
      while (usedDirs.has(dir.toLowerCase())) dir = "scenes/" + safeFileName(name).replace(/\s/g, "_") + "_" + i++;
      usedDirs.add(dir.toLowerCase());
      zip.file(dir + "/scene.json", JSON.stringify(Object.assign({}, rec.scene, { name }), null, 2));
      for (const [path, blob] of Object.entries(rec.files || {})) zip.file(dir + "/" + path, blob);
      project.scenes.push({ name, path: dir + "/" });
    }
    zip.file("oal-project.json", JSON.stringify(project, null, 2));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    download(blob, base + ".zip");
    say(t("savedZip"));
  }

  // Lokale Szene auf den Server (nur angemeldet). Gibt die Adresse für Model3D zurück.
  async function publishScene(name) {
    const rec = await getScene(name);
    if (!rec) throw new Error(t("missing", { name }));
    say(t("publishing", { name }));
    const urlOf = {};
    for (const [path, blob] of Object.entries(rec.files || {})) {
      const form = new FormData();
      form.append("model", new File([blob], path.split("/").pop()));
      const r = await fetch(apiUrl("upload.php"), { method: "POST", credentials: "same-origin", body: form });
      const d = await r.json();
      if (!d || d.error || !d.model) throw new Error((d && d.message) || "upload " + r.status);
      urlOf[path] = d.model;
    }
    const objects = (rec.scene.objects || []).map((o) => {
      const m = urlOf[o.modelUrl];
      return m ? Object.assign({}, o, { modelUrl: m.url, modelId: m.id }) : o;
    });
    const body = {
      id: rec.onlineId || null,
      name,
      description: rec.scene.description || "",
      settings: rec.scene.settings,
      camera: rec.scene.camera,
      objects,
      poses: rec.scene.poses || [],
    };
    const r = await fetch(apiUrl("scene-save.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!d || d.error || !d.scene) throw new Error((d && d.message) || "save " + r.status);
    rec.onlineId = d.scene.id;
    await putScene(rec);
    return window.location.origin + "/3d-scene-editor/index.html?scene=" + d.scene.id + "&mode=view";
  }

  // Aufgerufen von saveCode() (GuiFunctions.js), wenn der Code lokale Szenen nutzt
  async function saveProject(tabName, code) {
    try {
      const names = localRefs(code);
      if (await isAdmin()) {
        const choice = await ask(t("saveTitle"), t("saveText", { names: names.map((n) => "„" + n + "“").join(", ") }), [
          { id: "zip", label: t("saveZip"), note: t("saveZipNote"), icon: "folder_zip", primary: true },
          { id: "js", label: t("saveJs"), note: t("saveJsNote"), icon: "description" },
          { id: "online", label: t("saveOnline"), note: t("saveOnlineNote"), icon: "cloud_upload" },
        ]);
        // Angemeldet (Admin) wird immer gefragt: ZIP, nur Code oder online (Sebastian 26.11.)
        if (choice === "js") {
          download(new Blob([code], { type: "text/javascript" }), tabName + ".js");
          return;
        }
        if (choice === "online") {
          let newCode = code;
          for (const name of names) {
            const url = await publishScene(name);
            for (const q of ['"', "'", "`"]) {
              replaceInCode(q + PREFIX + name + q, q + url + q);
              newCode = newCode.split(q + PREFIX + name + q).join(q + url + q);
            }
            say(t("published", { name }));
          }
          // jetzt ohne lokale Szene: als .js wie bisher
          const blob = new Blob([newCode], { type: "text/javascript" });
          download(blob, tabName + ".js");
          return;
        }
        if (choice !== "zip") return;
      }
      await saveZip(tabName, code);
    } catch (e) {
      console.error("[OAL3D] Speichern:", e);
      say(t("publishFailed", { msg: e.message || e }), "error");
    }
  }

  function sceneSignature(scene, files) {
    const sizes = Object.keys(files || {})
      .sort()
      .map((k) => k + ":" + ((files[k] && (files[k].size != null ? files[k].size : files[k].byteLength)) || 0));
    const s = Object.assign({}, scene);
    delete s.exportedAt;
    delete s.name;
    return JSON.stringify(s) + "|" + sizes.join(",");
  }

  // Szene aus dem ZIP übernehmen; bei Namensgleichheit mit anderem Inhalt umbenennen
  async function importScene(wanted, scene, files) {
    let name = cleanName(wanted);
    const existing = await getScene(name);
    if (existing && sceneSignature(existing.scene, existing.files) !== sceneSignature(scene, files)) {
      name = await freeName(name);
    }
    await putScene({ name, scene: Object.assign({}, scene, { name }), files });
    return name;
  }

  async function readSceneFolder(zip, prefix) {
    const jsonFile = zip.file(prefix + "scene.json");
    if (!jsonFile) return null;
    const scene = JSON.parse(await jsonFile.async("string"));
    if (!scene || !Array.isArray(scene.objects)) return null;
    const files = {};
    for (const o of scene.objects) {
      const p = String(o.modelUrl || "");
      if (!p || files[p] || /^[a-z]+:|^\//i.test(p)) continue;
      const f = zip.file(prefix + p);
      if (f) files[p] = new Blob([await f.async("arraybuffer")]);
    }
    return { scene, files };
  }

  // Aufgerufen von loadCode() (TabFunctions.js) bei .zip. Rückgabe: Code oder null
  async function loadProjectZip(file) {
    try {
      const zip = await JSZip.loadAsync(file);
      const pj = zip.file("oal-project.json");
      if (pj) {
        const project = JSON.parse(await pj.async("string"));
        const codeFile = zip.file(project.code) || zip.file(/\.js$/)[0];
        let code = codeFile ? await codeFile.async("string") : "";
        for (const s of project.scenes || []) {
          const pkg = await readSceneFolder(zip, s.path);
          if (!pkg) continue;
          const name = await importScene(s.name, pkg.scene, pkg.files);
          if (name !== s.name) {
            for (const q of ['"', "'", "`"]) code = code.split(q + PREFIX + s.name + q).join(q + PREFIX + name + q);
            say(t("zipRenamed", { old: s.name, name }));
          }
        }
        return code;
      }
      // Szenen-ZIP aus dem 3D-Editor (Sandkasten): Szene ins Lab holen
      let sceneJson = zip.file("scene.json");
      let prefix = "";
      if (!sceneJson) {
        const found = zip.file(/(^|\/)scene\.json$/);
        if (found.length) {
          sceneJson = found[0];
          prefix = sceneJson.name.slice(0, -"scene.json".length);
        }
      }
      if (sceneJson) {
        const pkg = await readSceneFolder(zip, prefix);
        if (pkg) {
          const wanted = pkg.scene.name || file.name.replace(/\.zip$/i, "");
          const name = await importScene(wanted, pkg.scene, pkg.files);
          say(t("zipSceneOnly", { name }));
          return null;
        }
      }
      say(t("zipBad"), "error");
      return null;
    } catch (e) {
      console.error("[OAL3D] ZIP:", e);
      say(t("zipBad") + " (" + (e.message || e) + ")", "error");
      return null;
    }
  }

  // ── Editor meldet sich: Animation neu starten ──────────────────────────
  function listen() {
    let ch;
    try {
      ch = new BroadcastChannel(CHANNEL);
    } catch (e) {
      return;
    }
    ch.onmessage = (e) => {
      const msg = e.data || {};
      const code = window.editor ? window.editor.getValue() : "";
      let hit = false;
      if (msg.type === "sceneUpdated" && msg.name) hit = localRefs(code).includes(msg.name);
      if (msg.type === "sceneSaved" && msg.id) hit = code.indexOf(msg.id) !== -1;
      if (!hit) return;
      say(t("updated", { name: msg.name || msg.id }));
      if (typeof window.runCode === "function") window.runCode();
    };
  }

  function injectCss() {
    const css = `
.oal3d-code-btn { display:inline-flex; align-items:center; gap:3px; margin:0 2px 0 6px; padding:0 7px 0 5px;
  height:18px; line-height:18px; vertical-align:1px; border:1px solid #9a9a9a; border-radius:9px; background:#f8f8f8;
  color:#444; font:12px/18px Arial, sans-serif; cursor:pointer; user-select:none; white-space:nowrap; }
.oal3d-code-btn .material-icons { font-size:14px; color:#17A03A; }
.oal3d-code-btn:hover, .oal3d-code-btn:focus-visible { background:#eeeeee; border-color:#17A03A; outline:none; }
[data-theme="dark"] .oal3d-code-btn, body.dark-theme .oal3d-code-btn { background:#3a3a3a; color:#ddd; border-color:#666; }
.oal3d-banner-info { background:#e8f5ec; color:#14381f; border-bottom-color:#9fd3ad; }
#oal3dDialog .sa-section { gap:6px; }
#oal3dDialog .oal3d-cancel-row { justify-content:flex-end; }
#oal3dDialog .oal3d-primary { outline:2px solid #17A03A; outline-offset:1px; }
`;
    const style = document.createElement("style");
    style.id = "oal3dStyle";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Hinweis aus dem 3D-Editor: Objektname aus dem Code gibt es nicht (4.5.1)
  function unknownObject(name, available) {
    const q = lang() === "de" ? ["„", "“"] : ["“", "”"];
    const list = (available || []).map((n) => q[0] + n + q[1]).join(", ");
    say(list ? t("unknownObject", { name, list }) : t("unknownObjectEmpty", { name }), "error");
  }

  window.OAL3D = {
    PREFIX,
    unknownObject,
    localRefs,
    hasLocalScenes,
    hasBlankScene,
    getPackage,
    editorUrl,
    editScene,
    decorateEditor,
    saveProject,
    loadProjectZip,
    embedScenes,
    // für Tests und Hilfsskripte
    _getScene: getScene,
    _putScene: putScene,
    _isAdmin: isAdmin,
  };

  injectCss();
  listen();
})();
