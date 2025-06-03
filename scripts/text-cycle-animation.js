(function () {
  const sentence = "Jeremiah Knefel";
  const repeatCount = 3;
  const phrase = sentence.repeat(repeatCount);
  const duration = 15000;

  const basePath = document.getElementById("basePath");
  const pathLength = basePath.getTotalLength();
  const svgNS = "http://www.w3.org/2000/svg";
  const group = document.getElementById("text-group");

  const numCopies = 2; // 2 full text copies
  const textPaths = [];

  function createOffsetPath(id, offsetLength) {
    const clone = document.createElementNS(svgNS, "path");
    clone.setAttribute("id", id);

    const numPoints = 800;
    const points = [];

    for (let i = 0; i <= numPoints; i++) {
      const length = ((i / numPoints) * pathLength + offsetLength) % pathLength;
      const pt = basePath.getPointAtLength(length);
      points.push(`${pt.x},${pt.y}`);
    }

    clone.setAttribute("d", `M ${points.join(" L ")} Z`);
    basePath.parentNode.appendChild(clone);
    return clone;
  }

  for (let i = 0; i < numCopies; i++) {
    const offsetFraction = i / numCopies;
    const offsetLength = offsetFraction * pathLength;
    const pathId = `loopPath${i}`;

    const path = createOffsetPath(pathId, offsetLength);

    const text = document.createElementNS(svgNS, "text");
    const textPath = document.createElementNS(svgNS, "textPath");
    textPath.setAttributeNS(null, "href", `#${pathId}`);
    textPath.textContent = phrase;

    text.appendChild(textPath);
    group.appendChild(text);
    textPaths.push({ textPath, offset: offsetFraction });
  }

  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    const progress = ((time - startTime) % duration) / duration;

    for (const { textPath, offset } of textPaths) {
      const offsetValue = ((progress + offset) % 1) * pathLength;
      textPath.setAttribute("startOffset", offsetValue);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();