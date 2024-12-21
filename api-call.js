const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const result = document.getElementById('result');

let detector;

async function loadModel() {
    detector = await handPoseDetection.createDetector(handPoseDetection.SupportedModels.MediaPipeHands, {
        runtime: 'tfjs',
    });
    console.log('Model loaded');
}

imageInput.addEventListener('change', async (event) => {
    result.textContent = "";
    result.className = ""; // Clear previous styles
    canvas.style.display = "none"; // Hide canvas initially

    if (!detector) {
        result.textContent = "Model is still loading. Please wait.";
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

            // Detect hands in the image
            const predictions = await detector.estimateHands(img);

            if (predictions.length > 0) {
                // Draw the image on canvas
                canvas.style.display = "block";
                ctx.drawImage(img, 0, 0);

                // Draw bounding boxes for detected hands
                predictions.forEach(hand => {
                    const keypoints = hand.keypoints;

                    // Find the bounding box
                    const xMin = Math.min(...keypoints.map(p => p.x));
                    const xMax = Math.max(...keypoints.map(p => p.x));
                    const yMin = Math.min(...keypoints.map(p => p.y));
                    const yMax = Math.max(...keypoints.map(p => p.y));

                    // Draw the bounding box
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);
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

// Load the model when the page loads
loadModel();