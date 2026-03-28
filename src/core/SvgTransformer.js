// Flattens SVG transform attributes by applying them directly to child element coordinates.

class SVGTransformer {
  constructor(svgString) {
    this.parser = new DOMParser();
    this.doc = this.parser.parseFromString(svgString, "image/svg+xml");
    this.serializer = new XMLSerializer();
  }

  transform() {
    this.processTransforms(this.doc.documentElement);
    return this.serializer.serializeToString(this.doc);
  }

  processTransforms(element, parentTransform = null) {
    Array.from(element.children).forEach((child) => {
      this.processTransforms(child, parentTransform);
    });

    const elementTransform = element.getAttribute("transform");
    if (elementTransform) {
      const transform = this.parseTransform(elementTransform);
      Array.from(element.children).forEach((child) => {
        this.applyTransformToElement(child, transform);
      });
      element.removeAttribute("transform");
    }
  }

  parseTransform(transformString) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const transform = svg.createSVGMatrix();

    const transformCommands =
      transformString.match(/(\w+)\s*\(([^)]*)\)/g) || [];

    transformCommands.forEach((command) => {
      const match = command.match(/(\w+)\s*\(([^)]*)\)/);
      if (!match) return;

      const type = match[1];
      const args = match[2]
        .trim()
        .split(/[\s,]+/)
        .map(parseFloat);

      switch (type) {
        case "translate":
          if (args.length === 1) {
            transform.e += args[0];
          } else if (args.length >= 2) {
            transform.e += args[0];
            transform.f += args[1];
          }
          break;
        case "scale":
          if (args.length === 1) {
            transform.a *= args[0];
            transform.d *= args[0];
          } else if (args.length >= 2) {
            transform.a *= args[0];
            transform.d *= args[1];
          }
          break;
        // rotate, skewX, skewY are not yet implemented
      }
    });

    return transform;
  }

  transformPoint(x, y, matrix) {
    return {
      x: x * matrix.a + y * matrix.c + matrix.e,
      y: x * matrix.b + y * matrix.d + matrix.f,
    };
  }

  applyTransformToElement(element, matrix) {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case "circle":
        this.transformCircle(element, matrix);
        break;
      case "path":
        this.transformPath(element, matrix);
        break;
      default:
        // For unsupported element types, fall back to applying a matrix attribute
        this.combineTransformWithElement(element, matrix);
        break;
    }
  }

  transformCircle(circle, matrix) {
    const cx = parseFloat(circle.getAttribute("cx") || 0);
    const cy = parseFloat(circle.getAttribute("cy") || 0);
    const newPoint = this.transformPoint(cx, cy, matrix);
    circle.setAttribute("cx", newPoint.x);
    circle.setAttribute("cy", newPoint.y);
  }

  // Path data is not fully parsed; the matrix is applied as a transform attribute instead.
  transformPath(path, matrix) {
    const pathData = path.getAttribute("d");
    if (!pathData) return;
    const transformStr = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.e},${matrix.f})`;
    path.setAttribute("transform", transformStr);
  }

  combineTransformWithElement(element, matrix) {
    const currentTransform = element.getAttribute("transform") || "";
    const matrixStr = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.e},${matrix.f})`;
    if (currentTransform) {
      element.setAttribute("transform", `${currentTransform} ${matrixStr}`);
    } else {
      element.setAttribute("transform", matrixStr);
    }
  }
}

function transformSVG(svgString) {
  const transformer = new SVGTransformer(svgString);
  return transformer.transform();
}
