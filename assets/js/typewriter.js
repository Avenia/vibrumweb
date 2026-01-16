const typwritingSpeed = Object.freeze({
    SLOW: 'slow',
    NORMAL: 'normal',
    FAST: 'fast'
});

const typedTextElement = document.getElementById('typed-text');
const vibrumHeaderElement = document.getElementById('vibrum-header');

// Ensure newlines render as line breaks
typedTextElement.style.whiteSpace = 'pre-line';
vibrumHeaderElement.style.whiteSpace = 'pre-line';

window.addEventListener('load', () => {
    setTimeout(async () => {
        await typewrite("VIBRUM", vibrumHeaderElement, typwritingSpeed.NORMAL, 1500);
        await typewrite("wood.", typedTextElement, typwritingSpeed.SLOW, 360);
        await typewrite(" vibration.", typedTextElement, typwritingSpeed.NORMAL, 300);
        await typewrite(" tone.", typedTextElement, typwritingSpeed.NORMAL, 320);
        await typewrite("\n", typedTextElement, typwritingSpeed.NORMAL, 600);
        await typewrite("handcrafted to resonate.", typedTextElement, typwritingSpeed.FAST, 350);
        await typewrite("\n", typedTextElement, typwritingSpeed.NORMAL, 600);
        await typewrite("belgrade.", typedTextElement, typwritingSpeed.NORMAL, 500);
        await typewrite(" serbia.", typedTextElement, typwritingSpeed.SLOW, 700);
        await typewrite("\n", typedTextElement, typwritingSpeed.NORMAL, 600);
        await typewrite("\n", typedTextElement, typwritingSpeed.SLOW, 200);
        await typewrite("coming soon.", typedTextElement, typwritingSpeed.NORMAL, 800);
        await typewrite("\n", typedTextElement, typwritingSpeed.SLOW, 420);
        await typewrite("stay", typedTextElement, typwritingSpeed.SLOW, 200);
        await typewrite(" tuned.", typedTextElement, typwritingSpeed.NORMAL, 220);
        window.showIconsAfterTypewriter();
    }, 500);
});

async function typewrite(str, element, speed, delayAfter) {
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        if (char === '\n') {
            // Append a newline character as a text node
            element.appendChild(document.createTextNode('\n'));
        } else {
            // Append a text node for normal characters
            const textNode = document.createTextNode(char);
            element.appendChild(textNode);
        }

        if (i === str.length - 1) {
            break;
        }

        if (element === vibrumHeaderElement) {
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 50) + 150));
        } else if (element === typedTextElement) {
            switch (speed) {
                case typwritingSpeed.SLOW:
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 30) + 120));
                    break;
                case typwritingSpeed.NORMAL:
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 20) + 80));
                    break;
                case typwritingSpeed.FAST:
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 10) + 62));
                    break;
                default:
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 20) + 80));
                    break;
            }
        }
    }
    await new Promise(resolve => setTimeout(resolve, delayAfter));
}

function fadeInIcons(id, delay) {
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            el.style.transition = "opacity 1.0s";
            el.style.opacity = 1;
        }
    }, delay);
}

function showIconsAfterTypewriter() {
    const ids = ["icon-instagram", "icon-facebook", "icon-email"];
    ids.forEach((id, i) => fadeInIcons(id, 500 + i * 500));
}