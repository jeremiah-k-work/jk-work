// --- 1. Generate the base path based on viewport size
function updateBasePath() {
    const svg = document.getElementById("mainSvg");
    const path = document.getElementById("basePath");

    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const margin = 40;
    const radius = 40;

    const left = margin;
    const top = margin;
    const right = width - margin;
    const bottom = height - margin;

    const d = `
        M ${left + radius},${top}
        H ${right - radius}
        Q ${right},${top} ${right},${top + radius}
        V ${bottom - radius}
        Q ${right},${bottom} ${right - radius},${bottom}
        H ${left + radius}
        Q ${left},${bottom} ${left},${bottom - radius}
        V ${top + radius}
        Q ${left},${top} ${left + radius},${top}
        Z`;
    path.setAttribute("d", d);
}

// --- 2. Build the animated paths and start animation
function startAnimation() {
    
    const sentence = "JEREMIAH" + "\u00A0".repeat(2) + "KNEFEL" + "\u00A0".repeat(40);
    const repeatCount = 1;
    const phrase = sentence.repeat(repeatCount);
    const duration = 19000;

    const basePath = document.getElementById("basePath");
    const pathLength = basePath.getTotalLength();
    const svgNS = "http://www.w3.org/2000/svg";
    const group = document.getElementById("text-group");

    group.innerHTML = ""; // Clear old elements

    const numCopies = 4;
    const textPaths = [];

    function createOffsetPath(id, offsetLength) {
        const clone = document.createElementNS(svgNS, "path");
        clone.setAttribute("id", id);

        const numPoints = 500;
        const points = [];

        for (let i = -1; i <= numPoints + 2; i++) {
            const length = ((i / numPoints) * pathLength + offsetLength + pathLength) % pathLength;
            const pt = basePath.getPointAtLength(length);
            points.push({ x: pt.x, y: pt.y });
        }

        let d = `M ${points[1].x},${points[1].y}`;
        for (let i = 1; i < points.length - 2; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2];

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }

        clone.setAttribute("d", d);
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
}

function rebuild() {
    updateBasePath();

    // Wait for the DOM to apply the new path before measuring it
    setTimeout(() => {
        // Remove any old cloned paths
        const basePath = document.getElementById("basePath");
        const svg = basePath.parentNode;
        const allClones = [...svg.querySelectorAll("path")].filter(p => p !== basePath);
        allClones.forEach(p => svg.removeChild(p));

        // Clear old texts
        const group = document.getElementById("text-group");
        group.innerHTML = "";

        // Start fresh animation
        startAnimation();
    }, 20); // 1 frame delay
}

window.addEventListener("resize", rebuild);
window.addEventListener("DOMContentLoaded", rebuild);

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(rebuild, 100);
});