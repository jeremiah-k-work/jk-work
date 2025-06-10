
function setTheme(themeName) {
    
    document.documentElement.setAttribute('data-theme', themeName);
    
}

// Usage
setTheme('airport');
setTheme('zapped');

function cycleTheme() {
    
    console.log("Hi.");
    
    if (document.documentElement.getAttribute('data-theme') == 'airport') {
        
        console.log("zapped.");
        setTheme('zapped');
        
    } else {
        
        console.log("airport.");
        setTheme('airport');
        
    }
    
}