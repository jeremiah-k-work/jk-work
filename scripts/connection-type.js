(function () {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  function isSafeConnection() {
    if (!connection) return false; // If unknown, block video
    const type = connection.type || connection.effectiveType || '';
    return type === 'wifi' || type === 'ethernet';
  }

  if (isSafeConnection()) {
    document.querySelectorAll('.video-data').forEach(video => {
      const source = document.createElement('source');
      source.src = video.dataset.src;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.load();
    });
  }
})();