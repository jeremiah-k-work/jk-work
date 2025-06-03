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

const injectionTexts = [
    
    {text: "DREAMER"},
    {text: "WANNABE ATHLETE"},
    {text: "PICKY EATER"},
    
]

let adjectivesIndex = 0;
let nounsIndex = 0;
let titlesIndex = 0;

const headlineA = document.getElementById("headline-a");
const headlineB = document.getElementById("headline-b");
const titleCycler = document.getElementById("title-cycler");

let injectionActive = false;
let injectionCounter = 0;
let currentInjectionText = "";




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

// Initial set
updateHeadline();
setInterval(updateHeadline, 1300); // Change update speed



function updateTitle() {
    
    // Animate out
    titleCycler.style.transform = "translateY(-1%)";
    titleCycler.style.opacity = "0";
    titleCycler.style.filter = "blur(4px)";
    
    setTimeout(() => {
        let textToShow = "";
        
        if (injectionActive) {
            
            textToShow = currentInjectionText;
            injectionCounter++;
            
            if (injectionCounter >= 3) {
                
                injectionActive = false;
                injectionCounter = 0;
            }
            
        } else {
            
            textToShow = titles[titlesIndex].text;
            titlesIndex = (titlesIndex + 1) % titles.length;
            
            // ~20% chance to trigger injection
            if (Math.random() < 0.2) {
                
                injectionActive = true;
                currentInjectionText = injectionTexts[Math.floor(Math.random() * injectionTexts.length)].text;
                injectionCounter = 0; // will start in the next cycle
                
            }
            
        }
        
        // Set new text
        titleCycler.textContent = textToShow;
        
        // Animate in
        titleCycler.style.transition = "none";
        titleCycler.style.transform = "translateY(-30%)";
        titleCycler.style.filter = "blur(4px)";
        titleCycler.style.opacity = ".5";

    requestAnimationFrame(() => {
            titleCycler.style.transition = "transform 0.1s ease-out, filter 0.1s ease-out, opacity 0.1s ease-out";
            titleCycler.style.transform = "translateY(0)";
            titleCycler.style.filter = "blur(0)";
            titleCycler.style.opacity = "1";
        });

  }, 250);
}



/*
function updateTitle() {
    
    // Implement random injection.
    
    
    // Animate up and blur out
    titleCycler.style.transform = "translateY(-1%)";
    titleCycler.style.opacity = "0";
    titleCycler.style.filter = "blur(4px)";
    
    setTimeout(() => {
        const currentTitle = titles[titlesIndex];
        titleCycler.textContent = currentTitle.text;
        
        titleCycler.style.transition = "none";
        titleCycler.style.transform = "translateY(-30%)";
        titleCycler.style.filter = "blur(4px)";
        titleCycler.style.opacity = "0";
        
        requestAnimationFrame(() => {
            titleCycler.style.transition = "transform 0.1s ease-out, filter 0.1s ease-out, opacity 0.1s ease-out";
            titleCycler.style.transform = "translateY(0)";
            titleCycler.style.filter = "blur(0)";
            titleCycler.style.opacity = "1";
        });
        
        titlesIndex = (titlesIndex + 1) % titles.length;
        
    }, 250); // Must match transition duration
    
}
*/

// Initial set
updateTitle();
setInterval(updateTitle, 700); // Change update speed