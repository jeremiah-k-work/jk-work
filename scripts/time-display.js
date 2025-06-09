function parseRgb(color) {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
        return [
            parseInt(hexMatch[1], 16),
            parseInt(hexMatch[2], 16),
            parseInt(hexMatch[3], 16)
        ];
    }
    return [0, 0, 0]; // fallback black
}

function rgbToCss([r, g, b]) {
    return `rgb(${r}, ${g}, ${b})`;
}

function interpolateColor(color1, color2, t) {
    const c1 = parseRgb(color1);
    const c2 = parseRgb(color2);
    return rgbToCss(c1.map((v, i) => Math.round(v + (c2[i] - v) * t)));
}

function updateTime() {
    
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const year = now.getFullYear();

    const meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    document.getElementById('current-time-hour').textContent = String(hours).padStart(2, '0');
    document.getElementById('current-time-minute').textContent = String(minutes).padStart(2, '0');
    document.getElementById('current-time-meridiem').textContent = meridiem;
    document.getElementById('current-time-year').textContent = year;

    const rootStyles = getComputedStyle(document.documentElement);
    const beachNight = rootStyles.getPropertyValue('--color-beach-night').trim();
    const moonieBlue = rootStyles.getPropertyValue('--color-moonie-blue').trim();

    const minuteProgress = seconds / 59;
    const hourProgress = minutes / 59;

    const hourColor = interpolateColor(moonieBlue, beachNight, hourProgress);
    const minuteColor = interpolateColor(moonieBlue, beachNight, minuteProgress);

    document.getElementById('current-time-hour').style.color = hourColor;
    document.getElementById('current-time-minute').style.color = minuteColor;
    
}

document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
});