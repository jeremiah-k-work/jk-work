function updateTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const year = now.getFullYear();

    const meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    document.getElementById('current-time-hour').textContent = String(hours).padStart(2, '0');
    document.getElementById('current-time-minute').textContent = String(minutes).padStart(2, '0');
    document.getElementById('current-time-meridiem').textContent = meridiem;
    document.getElementById('current-time-year').textContent = year;
}

updateTime(); // initial call
setInterval(updateTime, 1000); // update every second