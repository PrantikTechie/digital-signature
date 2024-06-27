document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    const bgColorPicker = document.getElementById('bgColor');
    const penColorPicker = document.getElementById('penColor');
    const penWidthRange = document.getElementById('penWidth');
    const clearButton = document.getElementById('clearButton');
    const undoButton = document.getElementById('undoButton');
    const downloadPNGButton = document.getElementById('downloadPNG');
    const downloadJPEGButton = document.getElementById('downloadJPEG');
    const downloadSVGButton = document.getElementById('downloadSVG');
    const toggleThemeButton = document.getElementById('toggleThemeButton');
    const resizeCanvasButton = document.getElementById('resizeCanvasButton');
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');

    let drawing = false;
    let history = [];
    let historyStep = -1;
    let darkMode = false;
    let ctrlPressed = false; // Track if Ctrl key is pressed

    function saveState() {
        if (historyStep < history.length - 1) {
            history = history.slice(0, historyStep + 1);
        }
        history.push(canvas.toDataURL());
        historyStep++;
    }

    function restoreState() {
        if (historyStep >= 0) {
            const img = new Image();
            img.src = history[historyStep];
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    }

    function startDrawing(event) {
        drawing = true;
        saveState();
        draw(event);
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }

    function draw(event) {
        if (!drawing) return;
        ctx.lineWidth = penWidthRange.value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = penColorPicker.value;

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', stopDrawing);

    // bgColorPicker.addEventListener('input', function () {
    //     ctx.save();
    //     ctx.globalCompositeOperation = 'destination-over';
    //     ctx.fillStyle = bgColorPicker.value;
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);
    //     ctx.restore();
    //     saveState();
    // });
    bgColorPicker.addEventListener('input', function () {
        ctx.fillStyle = bgColorPicker.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    });

    clearButton.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bgColorPicker.dispatchEvent(new Event('input'));
    });

    undoButton.addEventListener('click', function () {
        if (historyStep > 0) {
            historyStep--;
            restoreState();
        }
    });

    // Function to handle undo with Ctrl+Z
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Control') {
            ctrlPressed = true;
        } else if (event.key === 'z' && ctrlPressed) {
            event.preventDefault(); // Prevent default browser action (e.g., undoing text input)
            if (historyStep > 0) {
                restoreState();
                historyStep--;
            }
        }
    });

    // Reset Ctrl key state on keyup event
    document.addEventListener('keyup', function (event) {
        if (event.key === 'Control') {
            ctrlPressed = false;
        }
    });

    downloadPNGButton.addEventListener('click', function () {
        const link = document.createElement('a');
        link.download = 'signature.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    downloadJPEGButton.addEventListener('click', function () {
        const link = document.createElement('a');
        link.download = 'signature.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    });

    downloadSVGButton.addEventListener('click', function () {
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}">
                <rect width="100%" height="100%" fill="${bgColorPicker.value}"/>
                <image xlink:href="${canvas.toDataURL()}" x="0" y="0" width="${canvas.width}" height="${canvas.height}"/>
            </svg>`;
    
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
    
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = 'signature.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    

    toggleThemeButton.addEventListener('click', function () {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
    });

    resizeCanvasButton.addEventListener('click', function () {
        const width = parseInt(canvasWidthInput.value, 10);
        const height = parseInt(canvasHeightInput.value, 10);
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bgColorPicker.dispatchEvent(new Event('input'));
    });

    // Set initial background color
    bgColorPicker.dispatchEvent(new Event('input'));
});
