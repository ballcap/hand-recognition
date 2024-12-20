document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById("imageFile");
    if (!fileInput.files.length) {
        alert("Please select an image file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function() {
        const imageBase64 = reader.result.split(",")[1];
        try {
            const response = await fetch("https://detect.roboflow.com/hand-gesture-recognition-y5827/2?api_key=4UvlBs9S1ryZ057JVPnR&confidence=11&overlap=50", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: imageBase64
            });

            const result = await response.json();
            const canvas = document.getElementById("imageCanvas");
            const ctx = canvas.getContext("2d");

            if (result.predictions.length === 0) {
                alert("No hand detected in the image. Please try again.");
                canvas.style.display = "none";
                return;
            }

            // Display the uploaded image and adjust canvas size
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Draw detected points
                result.predictions.forEach(prediction => {
                    const { x, y, width, height, class: detectedClass } = prediction;
                    ctx.strokeStyle = "#4141de";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

                    ctx.fillStyle = "#44d";
                    ctx.font = "22px Arial";
                    ctx.fillText(detectedClass, x - width / 2, y - height / 2 - 5);
                });
                canvas.style.display = "block";
            };
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to detect hand gesture.");
        }
    };

    reader.readAsDataURL(file);
});