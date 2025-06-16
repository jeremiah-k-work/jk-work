const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
const basePath = isMobile
  ? 'assets/videos/type-prefer-performance/'
  : 'assets/videos/type-prefer-performance/';

const videoFilenames = [
  'canopy-break-vert.mp4',
  'fountain-storm-vert.mp4',
  'clover-rain-vert.mp4',
  'fall-branches-vert.mp4',
  'bambi-forest-vert.mp4',
  'spiky-blooms-vert.mp4'
];

const videoList = videoFilenames.map(name => basePath + name);
const video = document.getElementById('Main-Video');
const SWITCH_BUFFER = 1.0; // seconds before end

let currentIndex = 0;
let switching = false;

function switchToNextVideo() {
  switching = false;
  currentIndex = (currentIndex + 1) % videoList.length;
  const nextSrc = videoList[currentIndex];

  console.log('Switching to video:', nextSrc);

  // Cleanup current state
  video.pause();
  video.removeAttribute('src');
  video.ontimeupdate = null;
  video.onended = null;
  video.oncanplay = null;

  // Set new event handlers
  video.ontimeupdate = () => {
    const remaining = video.duration - video.currentTime;
    if (!switching && remaining <= SWITCH_BUFFER) {
      console.log('ontimeupdate → switching to next');
      switching = true;
      switchToNextVideo();
    }
  };

  video.onended = () => {
    if (!switching) {
      console.log('onended → switching to next');
      switching = true;
      switchToNextVideo();
    }
  };

  video.oncanplay = () => {
    console.log('canplay → play', nextSrc);
    video.play();
  };

  // Set new source; do NOT call load()
  video.src = nextSrc;
}

// Initial setup
video.ontimeupdate = () => {
  const remaining = video.duration - video.currentTime;
  if (!switching && remaining <= SWITCH_BUFFER) {
    switching = true;
    switchToNextVideo();
  }
};

video.onended = () => {
  if (!switching) {
    switching = true;
    switchToNextVideo();
  }
};

video.oncanplay = () => {
  console.log('Initial canplay → play');
  video.play();
};

// Set first video; do NOT call load()
video.src = videoList[currentIndex];