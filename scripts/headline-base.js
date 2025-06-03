const adjectives = [
  
  { text: "ORGANIZED & ROBUST", font: "'Actay-Wide-Bold-Italic', monospace", color: "#cc6600" },
    { text: "ORGANIZED & ROBUST", font: "'Actay-Wide-Bold-Italic', sans-serif", color: "#e856e8" },
  { text: "PRECISE & EFFICIENT", font: "'Actay-Wide-Bold-Italic', monospace", color: "#007acc" },
  { text: "PRECISE & EFFICIENT", font: "'Actay-Wide-Bold-Italic', serif", color: "#b30059" },
  { text: "INTUITIVE & POWERFUL", font: "'Actay-Wide-Bold-Italic', sans-serif", color: "#008060" },
  { text: "INTUITIVE & POWERFUL", font: "'Actay-Wide-Bold-Italic', sans-serif", color: "#efa136" }
];

const nouns = [
  
  { text: "DATA", font: "'Actay-Wide-Bold-Italic', monospace", color: "#cc6600" },
    { text: "SYSTEMS", font: "'Actay-Wide-Bold-Italic', sans-serif", color: "#e856e8" },
  { text: "DESIGN", font: "'Actay-Wide-Bold-Italic', serif", color: "#b30059" }
];

const titles = [
    
    { text: "DRONE PILOT"},
    { text: "VIDEOGRAPHER"},
    { text: "GRAPHIC ARTIST"},
    { text: "MUSICIAN"},
    { text: "UI DESIGNER"},
    { text: "GAME DEV"},
    { text: "PHOTOGRAPHER"},
    { text: "DATA ANALYST"},
    
];

let adjectivesIndex = 0;
let nounsIndex = 0;
let titlesIndex = 0;

const headlineA = document.getElementById("headline-a");
const headlineB = document.getElementById("headline-b");
const titleCycler = document.getElementById("title-cycler");

function updateHeadline() {
    
    const currentAdjectives = adjectives[adjectivesIndex];
    headlineA.textContent = currentAdjectives.text;
    headlineA.style.fontFamily = currentAdjectives.font;
    headlineA.style.color = currentAdjectives.color;
    
    adjectivesIndex = (adjectivesIndex + 1) % adjectives.length;
    
    
    const currentNoun = nouns[nounsIndex];
    headlineB.textContent = currentNoun.text;
    headlineB.style.fontFamily = currentNoun.font;
    headlineB.style.color = currentNoun.color;
    
    nounsIndex = (nounsIndex + 1) % nouns.length;
}

function updateTitle() {
    
    const currentTitle = titles[titlesIndex];
    titleCycler.textContent = currentTitle.text;
    
    titlesIndex = (titlesIndex + 1) % titles.length;
    
}

// Initial set
updateHeadline();
setInterval(updateHeadline, 1300); // Change update speed


// Initial set
updateTitle();
setInterval(updateTitle, 300); // Change update speed