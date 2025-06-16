const videoList = [
  'assets/videos/canopy-break-vert-5300kbs.mp4',
  'assets/videos/fountain-storm-vert-5300kbs.mp4',
  'assets/videos/clover-rain-vert-5300kbs.mp4',
  'assets/videos/fall-branches-vert-5300kbs.mp4',
  'assets/videos/bambi-forest-vert-5300kbs.mp4',
  'assets/videos/spiky-blooms-vert-5300kbs.mp4'
];

let currentIndex = 0;
const videoA = document.getElementById('Mask-Video-Element-1');
const videoB = document.getElementById('Mask-Video-Element-2');

let current = videoA;
let next = videoB;

let switching = false;
const SWITCH_BUFFER = 1.0; // seconds before end

function playVideo(index) {
  switching = false;

  // Load new video into 'next'
  next.src = videoList[index];
  next.load();

  next.oncanplay = () => {
    next.classList.add('active');
    next.play();
    current.classList.remove('active');

    // 🧹 Clean up memory by unloading previous video
    current.pause();
    current.removeAttribute('src');
    current.load();

    // Remove previous listener
    current.ontimeupdate = null;

    // Set up new listener on next
    next.ontimeupdate = () => {
      const remaining = next.duration - next.currentTime;
      if (!switching && remaining <= SWITCH_BUFFER) {
        switching = true;
        currentIndex = (currentIndex + 1) % videoList.length;
        [current, next] = [next, current];
        playVideo(currentIndex);
      }
    };
  };
}

// Initial load
current.src = videoList[currentIndex];
current.classList.add('active');
current.load();
current.play();

current.ontimeupdate = () => {
  const remaining = current.duration - current.currentTime;
  if (!switching && remaining <= SWITCH_BUFFER) {
    switching = true;
    currentIndex = (currentIndex + 1) % videoList.length;
    [current, next] = [next, current];
    playVideo(currentIndex);
  }
};