# Open Animation Lab

**Build small interactive animations for teaching – in the browser, with a few lines of JavaScript.**

The Open Animation Lab (OAL) is the authoring tool behind [educational-animation.org](https://www.educational-animation.org), a free collection of interactive animations and learning games on physics and engineering. It runs entirely in the browser: no installation, no account, no tracking.

▶ **Try it now:** [Open Animation Lab (English)](https://www.educational-animation.org/oal/index.html?lang=en) · [Deutsch](https://www.educational-animation.org/oal/index.html?lang=de)

## Your first animation in three steps

1. **Open a template** – click *Templates*, then e.g. *Slider (ButtonSlider)* or *Ball follows slider*.
2. **Change something** – a colour, a text, a number. Press **▶** (or Ctrl + Enter) to see the result.
3. **Export** – *Publish ▾ → HTML* gives you a single file you can open anywhere, embed in Moodle or ILIAS, or share. *H5P* is available for learning platforms.

```js
let board = new Board(1280, 720);

let ball = new Circle(40);
ball.x = 200;
ball.y = 360;

let slider = new ButtonSlider(0, 800, 200, 1, 40, 400);
slider.x = 200;
slider.y = 600;
slider.onChange((e) => { ball.x = e.value; });
```

Stuck? The green **i** next to an object opens a form with all its settings, and the [reference](https://www.educational-animation.org/en/editor-reference/) lists every class and method.

## What is in this repository

| Folder / file | Contents |
|---|---|
| `index.html` | The tool (user interface) |
| `src/core/` | Graphics and UI classes (`SvgJSEdu.js`, `PixiJSEdu.js`, `HtmlSvgEdu.js`), editor and export functions. **Exported animations load these files live** from educational-animation.org. |
| `src/` | Interface: languages (`i18n.js`), templates, messages, themes |
| `custom/` | Project templates in German and English |
| `lib/` | Self-hosted third-party libraries with fixed versions |
| `tests/` | Small Node tests (`node tests/<file>.js`) |
| `Release-notes.txt` | What changed in each version (in German) |

## Join in

- **Made an animation?** We would love to see it – submit it via [educational-animation.org](https://www.educational-animation.org/en/submit-animation/).
- **Found a bug or have an idea?** Open an issue here or write to webmaster@educational-animation.org.
- **Teaching in another language?** Animations are plain text – translate the labels and export your own version (please keep the licence notice).

## Licence

MIT – see [LICENSE](LICENSE). Animations on educational-animation.org state their own licence in each post.

---

### Auf Deutsch

Das **Open Animation Lab** ist das Werkzeug hinter [educational-animation.org](https://www.educational-animation.org): Mit wenigen Zeilen JavaScript entstehen interaktive Animationen für den Technik- und Physikunterricht – direkt im Browser, ohne Installation und ohne Anmeldung. Am schnellsten geht der Einstieg über eine Vorlage: öffnen, eine Farbe oder Zahl ändern, ▶ drücken, als HTML exportieren. [Jetzt ausprobieren](https://www.educational-animation.org/oal/index.html?lang=de).
