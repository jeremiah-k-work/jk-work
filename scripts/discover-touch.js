const myText = document.getElementById('Footer-Bubble-Email');
const copyButton = document.getElementById('Footer-Bubble-Email');

copyButton.addEventListener('click', () => {
    const textToCopy = myText.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyButton.classList.add('copied');

        // Remove class after animation finishes
        setTimeout(() => {
            copyButton.classList.remove('copied');
        }, 2000); // Match the animation duration
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});