
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

let leftTouchPosition = 1;
let touchpad = 2;
let rightTouchPosition = 3;


let handMode = 2;




/*
function changeHand(hand) {
    
    
    // Hand Mode 2 means that the Touchpad is in the middle.
    if (handMode == 2) {
        
        console.log("Was center.")
        
        // If the left area is tapped, swap it with the touchpad.
        if (hand == 'left') {
            
            console.log("Now left.")
            
            handMode = 1;
            
            $('#Touch-Area-Left').css('order', '2');
            $('#Touchpad').css('order', '1');
            
        }
        
        // If the right area is tapped, swap it with the touchpad.
        if (hand == 'right') {
            
            console.log("Now right.")
            
            handMode = 3;
            
            $('#Touchpad').css('order', '3');
            $('#Touch-Area-Right').css('order', '2');
            
        }
        
    // Hand Mode 1 means that the Touchpad is to the left.
    } else if (handMode == 1) {
        
        console.log("Was left.")
        
        // If the left area is tapped, swap it back with the touchpad.
        if (hand == 'left') {
            
            console.log("Now center.")
            
            handMode = 2;
            
            $('#Touch-Area-Left').css('order', '1');
            $('#Touchpad').css('order', '2');
            
        }
        
        // If the right area is tapped, swap it with the touchpad, and put the left area back.
        if (hand == 'right') {
            
            console.log("Now right.")
            
            handMode = 3;
            
            $('#Touch-Area-Left').css('order', '1');
            $('#Touchpad').css('order', '3');
            $('#Touch-Area-Right').css('order', '2');
            
        }
        
    // Hand Mode 3 means that the Touchpad is to the right.
    } else if (handMode == 3) {
        
        console.log("Was right.")
        
        // If the left area is tapped, swap it with the touchpad, and put the right area back.
        if (hand == 'left') {
            
            console.log("Now left.")
            
            handMode = 1;
            
            $('#Touch-Area-Left').css('order', '2');
            $('#Touchpad').css('order', '1');
            $('#Touch-Area-Right').css('order', '3');
            
        }
        
        // If the right area is tapped, swap it back with the touchpad.
        if (hand == 'right') {
            
            console.log("Now center.")
            
            handMode = 2;
            
            $('#Touchpad').css('order', '2');
            $('#Touch-Area-Right').css('order', '3');
            
        }
        
    }
    
}

*/


function changeHand(hand) {
    
    
    // Hand Mode 2 means that the Touchpad is in the middle.
    if (handMode == 2) {
        
        console.log("Was center.")
        
        // If the left area is tapped, swap it with the touchpad.
        if (hand == 'left') {
            
            console.log("Now left.")
            
            handMode = 1;
            
            // Deflate L
            $('#Touch-Area-Left').css('flex-basis', '0%');
            // Smoke L
            $('#Touch-Area-Left').css('display', 'none');
            
            // Smoke LC
            $('#Touch-Area-Left-Center').css('display', 'none');
            
            
            // Inflate RC
            $('#Touch-Area-Right-Center').css('flex-basis', '30%');
            // Desmoke RC
            $('#Touch-Area-Right-Center').css('display', 'flex');
            
            
            // Shift C left
            $('#Touchpad').css('justify-content', 'flex-start');
            // Restore C
            //$('#Touchpad').css('flex-basis', '30%');
            
        }
        
        // If the right area is tapped, swap it with the touchpad.
        if (hand == 'right') {
            
            console.log("Now right.")
            
            handMode = 3;
            
            // Deflate R
            $('#Touch-Area-Right').css('flex-basis', '0%');
            // Smoke R
            $('#Touch-Area-Right').css('display', 'none');
            
            // Smoke RC
            $('#Touch-Area-Right-Center').css('display', 'none');
            
            
            // Inflate LC
            $('#Touch-Area-Left-Center').css('flex-basis', '30%');
            // Desmoke LC
            $('#Touch-Area-Left-Center').css('display', 'flex');
            
            
            // Shift C right
            $('#Touchpad').css('justify-content', 'flex-end');
            // Reduce C
            //$('#Touchpad').css('flex-basis', '20%');
            
        }
        
    // Hand Mode 1 means that the Touchpad is to the left.
    } else if (handMode == 1) {
        
        console.log("Was left.")
        
        // If the left area is tapped, swap it back with the touchpad.
        if (hand == 'left') {
            
            console.log("Now center.")
            
            handMode = 2;
            
            // Deflate RC
            $('#Touch-Area-Right-Center').css('flex-basis', '0%');
            // Smoke RC
            $('#Touch-Area-Right-Center').css('display', 'none');
            
            // Deflate LC
            $('#Touch-Area-Left-Center').css('flex-basis', '0%');
            // Smoke LC
            $('#Touch-Area-Left-Center').css('display', 'none');
            
            // Inflate L
            $('#Touch-Area-Left').css('flex-basis', '30%');
            // Desmoke L
            $('#Touch-Area-Left').css('display', 'flex');
            
            // Shift C right, returning it to center
            $('#Touchpad').css('justify-content', 'center');
            // Restore C
            //$('#Touchpad').css('flex-basis', '30%');
            
        }
        
        // If the right area is tapped, swap it with the touchpad, and put the left area back.
        if (hand == 'right') {
            
            console.log("Now right.")
            
            handMode = 3;
            
            // Deflate R
            $('#Touch-Area-Right').css('flex-basis', '0%');
            // Smoke R
            $('#Touch-Area-Right').css('display', 'none');
            
            // Deflate RC
            $('#Touch-Area-Right-Center').css('flex-basis', '0%');
            // Smoke RC
            $('#Touch-Area-Right-Center').css('display', 'none');
            
            
            // Inflate L
            $('#Touch-Area-Left').css('flex-basis', '30%');
            // Desmoke L
            $('#Touch-Area-Left').css('display', 'flex');
            
            // Inflate LC
            $('#Touch-Area-Left-Center').css('flex-basis', '30%');
            // Desmoke LC
            $('#Touch-Area-Left-Center').css('display', 'flex');
            
            
            // Shift C right
            $('#Touchpad').css('justify-content', 'flex-end');
            // Reduce C
           // $('#Touchpad').css('flex-basis', '20%');
            
        }
        
    // Hand Mode 3 means that the Touchpad is to the right.
    } else if (handMode == 3) {
        
        console.log("Was right.")
        
        // If the left area is tapped, swap it with the touchpad, and put the right area back.
        if (hand == 'left') {
            
            console.log("Now left.")
            
            handMode = 1;
            
            // Deflate L
            $('#Touch-Area-Left').css('flex-basis', '0%');
            // Smoke L
            $('#Touch-Area-Left').css('display', 'none');
            
            // Deflate LC
            $('#Touch-Area-Left-Center').css('flex-basis', '0%');
            // Smoke LC
            $('#Touch-Area-Left-Center').css('display', 'none');
            
            
            // Inflate R
            $('#Touch-Area-Right').css('flex-basis', '30%');
            // Desmoke R
            $('#Touch-Area-Right').css('display', 'flex');
            
            // Inflate RC
            $('#Touch-Area-Right-Center').css('flex-basis', '30%');
            // Desmoke RC
            $('#Touch-Area-Right-Center').css('display', 'flex');
            
            
            // Shift C right
            $('#Touchpad').css('justify-content', 'flex-start');
            // Reduce C
            //$('#Touchpad').css('flex-basis', '20%');
            
        }
        
        // If the right area is tapped, swap it back with the touchpad.
        if (hand == 'right') {
            
            console.log("Now center.")
            
            handMode = 2;
            
            // Deflate LC
            $('#Touch-Area-Left-Center').css('flex-basis', '0%');
            // Smoke LC
            $('#Touch-Area-Left-Center').css('display', 'none');
            
            // Deflate RC
            $('#Touch-Area-Right-Center').css('flex-basis', '0%');
            // Smoke RC
            $('#Touch-Area-Right-Center').css('display', 'none');
            
            
            // Inflate R
            $('#Touch-Area-Right').css('flex-basis', '30%');
            // Desmoke R
            $('#Touch-Area-Right').css('display', 'flex');
            
            
            // Shift C left, returning it to center
            $('#Touchpad').css('justify-content', 'center');
            // Restore C
            //$('#Touchpad').css('flex-basis', '30%');
            
        }
        
    }
    
}