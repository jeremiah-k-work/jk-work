(
    let mobileVersion = false;
    
    function isMobile() {
        
        return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
    }
    
    function () {
        
        if (isMobile()) {
            
            mobileVersion = true;
            document.body.classList.add('mobile');
            
        }
        
        const sentence = "Jeremiah Knefel";
        
        if (mobileVersion) {
            
            const repeatCount = 4;
            
        } else {
            
            const repeatCount = 4;
            
        }
        
        const phrase = sentence.repeat(repeatCount);
        
        const duration = 15000;
        
        const basePath = document.getElementById("basePath");
        const pathLength = basePath.getTotalLength();
        const svgNS = "http://www.w3.org/2000/svg";
        
        const group = document.getElementById("text-group");
        
        
        if (mobileVersion) {
            
            const numCopies = 4;
            
        } else {
            
            const numCopies = 4;
            
        }
        const textPaths = [];
        
        
        function createOffsetPath(id, offsetLength) {
            
            const clone = document.createElementNS(svgNS, "path");
            clone.setAttribute("id", id);
            
            const numPoints = 400;
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
        
})();