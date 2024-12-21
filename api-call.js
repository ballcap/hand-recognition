const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const result = document.getElementById('result');
const loading = document.getElementById('loading');

let detector;

async function loadModel() {
    detector = await handPoseDetection.createDetector(handPoseDetection.SupportedModels.MediaPipeHands, {
        runtime: 'tfjs',
    });
    console.log('Model loaded');
}

function invertColors(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]; // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
    }
    ctx.putImageData(imageData, 0, 0);
}

function calculateLength(start, end) {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

function drawPalmLines(ctx, keypoints) {
    const lines = [
        { start: keypoints[9], end: keypoints[12], label: "Heart" },
        { start: keypoints[5], end: keypoints[9], label: "Head" },
        { start: keypoints[5], end: { x: keypoints[0].x, y: keypoints[0].y + 40 }, label: "Life" }
    ];

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";

    lines.forEach(line => {
        // Draw the line
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();

        // Calculate the length
        const length = calculateLength(line.start, line.end);

        // Apply the formula (example: sqrt(length) * 10)
        const result = Math.sqrt(length) * 10;

        // Display the result near the line
        const labelX = (line.start.x + line.end.x) / 2;
        const labelY = (line.start.y + line.end.y) / 2;
        ctx.fillText(`${line.label}: ${result.toFixed(2)}`, labelX, labelY);
    });
}

imageInput.addEventListener('change', async (event) => {
    result.textContent = "";
    result.className = ""; // Clear previous styles
    canvas.style.display = "none"; // Hide canvas initially
    loading.style.display = "block"; // Show loading indicator

    if (!detector) {
        result.textContent = "Model is still loading. Please wait.";
        loading.style.display = "none";
        return;
    }

    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            const width = img.width;
            const height = img.height;
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0);
            invertColors(ctx, width, height); // Invert colors for better visibility

            const predictions = await detector.estimateHands(img);

            invertColors(ctx, width, height); // Revert colors to original
            loading.style.display = "none"; // Hide loading indicator

            if (predictions.length > 0) {
                canvas.style.display = "block";

                predictions.forEach(hand => {
                    drawPalmLines(ctx, hand.keypoints);
                });

                result.textContent = "Hand detected!";
                result.className = "success";
            } else {
                result.textContent = "No hand detected.";
                result.className = "error";
            }
        };
    }
});

loadModel();
