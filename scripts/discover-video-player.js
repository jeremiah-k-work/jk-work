const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};

const isWifi = connection.type === 'wifi' || (connection.effectiveType === '4g' && !connection.saveData);
const isDesktop = window.innerWidth >= 1024;

if (isDesktop && isWifi) {
  const video = document.getElementById('background-video');
  if (video) {
    video.style.display = 'block'; // optional if you're hiding by default
    video.play().catch(() => {
      // autoplay may still be blocked if not muted
      console.warn("Autoplay blocked");
    });
  }
} else {
  // Remove or disable video if not on Wi-Fi
  const video = document.getElementById('background-video');
  if (video) {
    video.pause();
    video.removeAttribute('src'); // unload
    video.load(); // reset
    video.parentNode.removeChild(video); // fully remove (optional)
  }
}