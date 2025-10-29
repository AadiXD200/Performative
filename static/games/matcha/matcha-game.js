// Music function for celebration
let celebrationAudio = null;

function playCelebrationMusic() {
    if (!celebrationAudio) {
        celebrationAudio = new Audio('/static/perfectpair.mp3');
        celebrationAudio.loop = true;
        celebrationAudio.volume = 1.0;
        celebrationAudio.preload = 'auto';
        
        // Handle errors
        celebrationAudio.addEventListener('error', (e) => {
            console.error('Music error:', e, celebrationAudio.error);
        });
        
        // Log when playing starts
        celebrationAudio.addEventListener('play', () => {
            console.log('🎵 Matcha celebration music started!');
        });
    }
    
    // Force load and play
    celebrationAudio.load();
    const playPromise = celebrationAudio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('🎵 Matcha music playing successfully!');
                celebrationAudio.volume = 1.0; // Ensure max volume
            })
            .catch(err => {
                console.warn('🎵 Music autoplay blocked, but that\'s okay!', err);
                // Try again on next user interaction
                const playOnInteraction = () => {
                    celebrationAudio.play().catch(() => {});
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
            });
    }
    
    // Visual celebration effect
    document.body.style.animation = 'none';
    setTimeout(() => {
        document.body.style.animation = 'gradientShift 3s ease infinite';
    }, 10);
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matchaCanvas');
    const ctx = canvas.getContext('2d');
    const instructionText = document.getElementById('instructionText');
    const stopMeasuringButton = document.getElementById('stopMeasuringButton');

    // Game state
    let gameState = 'START'; // START, TUB_OPEN, SCOOPING, SIFTING, POURING_WATER, WHISKING, POURING_CUP, DONE
    let mouse = { x: 0, y: 0, down: false };
    let lastMouse = { x: 0, y: 0 };

    // Game objects
    const tub = { x: 100, y: 150, radius: 40, open: false, lid: { x: 100, y: 230, radius: 42 } };
    const spoon = { x: 120, y: 300, width: 20, height: 100, holding: false, matchaAmount: 0 };
    const bowl = { x: 400, y: 200, radius: 80, frothLevel: 0 }; // Added frothLevel
    const strainer = { x: 400, y: 200, radius: 50 };
    const scale = { x: 650, y: 200, width: 120, height: 60, reading: 0.0, isPouring: false };
    const kettle = { x: 650, y: 450, width: 150, height: 120, holding: false, rotation: 0, pourProgress: 0 };
    const whisk = { x: 250, y: 450, width: 90, height: 110, holding: false };
    const starbucksCup = { x: 400, y: 450, width: 80, height: 120, filled: false };

    let siftProgress = 0;
    const TARGET_MATCHA = 3.0;
    const SIFT_THRESHOLD = 50; // Pixels of movement needed to sift

    // --- Image Loading ---
    const logoImage = new Image();
    logoImage.src = '/static/games/matcha/assets/starbucks_logo.svg';

    const kettleImage = new Image();
    kettleImage.src = '/static/games/matcha/assets/kettle.png';

    const whiskImage = new Image();
    whiskImage.src = '/static/games/matcha/assets/whisk.png';

    let imagesToLoad = 3; // The number of images we need to load
    function onImageLoad() {
        imagesToLoad--;
        if (imagesToLoad === 0) {
            draw(); // Start the game loop when all images are loaded
        }
    }

    logoImage.onload = onImageLoad;
    kettleImage.onload = onImageLoad;
    whiskImage.onload = onImageLoad;
    // --- Event Listeners ---
    canvas.addEventListener('mousedown', (e) => {
        mouse.down = true;
        handleMouseDown();
    });

    canvas.addEventListener('mouseup', (e) => {
        mouse.down = false;
        handleMouseUp();
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        handleMouseMove();
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
    });

    stopMeasuringButton.addEventListener('click', () => {
        gameState = 'POURING_WATER';
        updateInstruction('Great! Now, pick up the kettle and pour hot water into the bowl.');
        stopMeasuringButton.disabled = true;
    });

    function handleMouseDown() {
        // Allow picking up the spoon at any relevant stage before pouring water.
        if (['TUB_OPEN', 'SCOOPING', 'SIFTING'].includes(gameState) && isMouseIn(spoon)) {
            spoon.holding = true;
            if (gameState === 'TUB_OPEN') {
                gameState = 'SCOOPING';
                updateInstruction('Move the spoon into the tub to scoop some matcha.');
            }
            return; // Exit early to prevent other switch cases from running
        }

        // Allow picking up the kettle when it's time to pour water.
        if (['POURING_WATER', 'WHISKING'].includes(gameState) && isMouseIn(kettle)) {
            kettle.holding = true;
            return; // Exit early
        }

        // Allow picking up the whisk.
        if (gameState === 'WHISKING' && isMouseIn(whisk)) {
            whisk.holding = true;
            return; // Exit early
        }

        switch (gameState) {
            case 'START':
                if (isMouseIn(tub)) {
                    tub.open = true;
                    gameState = 'TUB_OPEN';
                    updateInstruction('Now, pick up the bamboo spoon (chashaku).');
                }
                break;
            case 'TUB_OPEN':
                // Spoon logic is now handled above the switch
                break;
            case 'SIFTING':
                if (scale.reading > TARGET_MATCHA + 0.05 && isMouseIn(tub)) {
                    scale.reading = 0;
                    updateInstruction(`Good, you emptied the excess. Now get exactly ${TARGET_MATCHA.toFixed(2)}g.`);
                }
                break;
            case 'POURING_WATER':
                // Kettle logic is now handled above the switch
                break;
            case 'WHISKING':
                // Whisk logic is now handled above the switch
                break;
        }
    }

    function handleMouseUp() {
        if (spoon.holding) {
            spoon.holding = false;
            if (gameState === 'SCOOPING' && spoon.matchaAmount > 0) {
                gameState = 'SIFTING';
                updateInstruction(`Sift the matcha onto the scale. Click 'Done Measuring' when you're ready.`);
            } else if (gameState === 'SCOOPING') {
                // If spoon is released without matcha, go back to TUB_OPEN state
                gameState = 'TUB_OPEN';
                updateInstruction('Pick up the bamboo spoon (chashaku).');
            }
        }
        if (kettle.holding) {
            kettle.holding = false;
            kettle.isPouring = false;
            kettle.rotation = 0; // Reset rotation when dropped
            kettle.pourProgress = 0;
        }
        if (whisk.holding) {
            whisk.holding = false;
        }
    }

    function handleMouseMove() {
        if (spoon.holding) {
            spoon.x = mouse.x - spoon.width / 2;
            spoon.y = mouse.y - spoon.height / 2;
            // Scoop matcha if spoon is over the open tub
            if ((gameState === 'SCOOPING' || gameState === 'SIFTING') && isMouseIn(tub)) {
                // Give a random amount per scoop for more challenge
                spoon.matchaAmount = Math.random() * (2.5 - 1) + 1;
            }
            // Sift matcha if spoon is over the strainer
            if (gameState === 'SIFTING' && spoon.matchaAmount > 0 && isMouseIn(strainer)) {
                const moveDistance = Math.sqrt((mouse.x - lastMouse.x)**2 + (mouse.y - lastMouse.y)**2);
                siftProgress += moveDistance;

                if (siftProgress > SIFT_THRESHOLD) {
                    const amountToSift = 0.05; // Sift in smaller increments for more precision
                    const actualSiftAmount = Math.min(spoon.matchaAmount, amountToSift);

                    scale.reading += actualSiftAmount;
                    spoon.matchaAmount -= actualSiftAmount;
                    siftProgress = 0; // Reset for the next shake

                    checkSiftedAmount();
                }
            }
        }
        if (kettle.holding) {
            kettle.x = mouse.x - kettle.width / 2;
            kettle.y = mouse.y - kettle.height / 2;

            // Check if pouring
            if (gameState === 'POURING_WATER' && isMouseIn(bowl)) {
                kettle.isPouring = true; // Signal that we are in a pouring state
                // Smoothly tilt the kettle
                kettle.rotation = Math.max(kettle.rotation - 0.02, -0.35); // Negative for counter-clockwise
                // Animate water stream
                kettle.pourProgress = Math.min(kettle.pourProgress + 0.02, 1);

                // Once fully poured, transition state
                if (kettle.pourProgress >= 1 && gameState === 'POURING_WATER') {
                    setTimeout(() => {
                        if (gameState === 'POURING_WATER') {
                            gameState = 'WHISKING';
                            updateInstruction('Pick up the whisk and move your mouse over the bowl to whisk.');
                        }
                    }, 500); // Wait half a second before transitioning
                }
            } else {
                kettle.isPouring = false;
                // Smoothly return kettle to upright position
                kettle.rotation = Math.min(kettle.rotation + 0.05, 0);
                kettle.pourProgress = Math.max(kettle.pourProgress - 0.05, 0);
            }
        }
        if (whisk.holding && gameState === 'WHISKING') {
            const moveDistance = Math.sqrt((mouse.x - lastMouse.x)**2 + (mouse.y - lastMouse.y)**2);
            if (moveDistance > 0 && isMouseIn(bowl)) { // Only increase froth if moving inside the bowl
                bowl.frothLevel = Math.min(100, bowl.frothLevel + moveDistance * 0.1); // Slower froth increase
            }
            whisk.x = mouse.x - whisk.width / 2;
            whisk.y = mouse.y - whisk.height / 2;
            if (bowl.frothLevel >= 100) { // Complete when froth reaches max
                gameState = 'POURING_CUP';
                updateInstruction('Whisking complete! Time for the final step.');
            }
        }
    }

    function checkSiftedAmount() {
        // This function is now only for potential future feedback, not for state changes.
    }

    function isMouseIn(obj) {
        if (obj.radius) { // Circle collision
            const dist = Math.sqrt((mouse.x - obj.x) ** 2 + (mouse.y - obj.y) ** 2);
            return dist < obj.radius;
        } else { // Rectangle collision
            return mouse.x > obj.x && mouse.x < obj.x + obj.width &&
                   mouse.y > obj.y && mouse.y < obj.y + obj.height;
        }
    }

    function updateInstruction(text) {
        instructionText.textContent = text;
    }

    // --- Drawing Functions ---
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all items
        drawTub();
        drawScale();
        drawBowl();
        if (gameState === 'SIFTING' || gameState === 'SCOOPING') {
            drawStrainer();
        }
        drawSpoon();
        if (gameState === 'POURING_WATER') {
            drawKettle();
        }
        if (gameState === 'WHISKING') {
            drawKettle(); // Keep it on screen
            if (kettle.isPouring) {
                drawWaterStream();
            }
            drawWhisk();
        }
        if (gameState === 'POURING_CUP') {
            drawStarbucksCup();
            // Simulate pouring
            if (mouse.down && isMouseIn(bowl)) {
                starbucksCup.filled = true;
                gameState = 'DONE';

                // Blast the music when matcha is completed (regardless of quality)!
                playCelebrationMusic();

                // Provide final feedback based on the amount of matcha used.
                let finalMessage = '';
                if (scale.reading < 2.0) {
                    finalMessage = `You used ${scale.reading.toFixed(2)}g. It's a bit tasteless, maybe add more next time!`;
                } else if (scale.reading > 4.0) {
                    finalMessage = `You used ${scale.reading.toFixed(2)}g. Whoa, that's a lot of matcha! A bit too strong.`;
                } else {
                    finalMessage = `You used ${scale.reading.toFixed(2)}g. Delicious! You've made a perfect matcha latte. ✨`;
                }
                updateInstruction(finalMessage);
            }
        }
        if (gameState === 'DONE') {
            drawStarbucksCup();
        }

        requestAnimationFrame(draw);
    }

    function drawTub() {
        // Draw lid if tub is open
        if (tub.open) {
            // Lid side
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(tub.lid.x, tub.lid.y, tub.lid.radius, tub.lid.radius / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Lid top
            const lidTopGradient = ctx.createLinearGradient(tub.lid.x - tub.lid.radius, tub.lid.y, tub.lid.x + tub.lid.radius, tub.lid.y);
            lidTopGradient.addColorStop(0, '#333');
            lidTopGradient.addColorStop(0.5, '#111');
            lidTopGradient.addColorStop(1, '#333');
            ctx.fillStyle = lidTopGradient;
            ctx.beginPath();
            ctx.ellipse(tub.lid.x, tub.lid.y - 5, tub.lid.radius, tub.lid.radius / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Tub body
        const tubGradient = ctx.createRadialGradient(tub.x - 10, tub.y - 10, 5, tub.x, tub.y, tub.radius);
        tubGradient.addColorStop(0, '#444');
        tubGradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = tubGradient;
        ctx.beginPath();
        ctx.arc(tub.x, tub.y, tub.radius, 0, Math.PI * 2);
        ctx.fill();

        // Matcha powder inside
        if (tub.open) {
            ctx.fillStyle = '#3a5a40';
            ctx.beginPath();
            ctx.arc(tub.x, tub.y, tub.radius - 8, 0, Math.PI * 2);
            ctx.fill();
        } else { // Draw closed lid on top
            const lidTopGradient = ctx.createLinearGradient(tub.x - tub.radius, tub.y, tub.x + tub.radius, tub.y);
            lidTopGradient.addColorStop(0, '#333');
            lidTopGradient.addColorStop(0.5, '#111');
            lidTopGradient.addColorStop(1, '#333');
            ctx.fillStyle = lidTopGradient;
            ctx.beginPath();
            ctx.ellipse(tub.x, tub.y - 5, tub.radius, tub.radius / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawSpoon() {
        // Spoon handle
        const handleGradient = ctx.createLinearGradient(spoon.x, spoon.y, spoon.x + spoon.width, spoon.y);
        handleGradient.addColorStop(0, '#c19a6b');
        handleGradient.addColorStop(0.5, '#e0b98a');
        handleGradient.addColorStop(1, '#c19a6b');
        ctx.fillStyle = handleGradient;
        ctx.beginPath();
        ctx.roundRect(spoon.x, spoon.y, spoon.width, spoon.height, 10);
        ctx.fill();

        // Scoop part
        ctx.beginPath();
        ctx.ellipse(spoon.x + spoon.width / 2, spoon.y + 10, spoon.width * 0.8, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Matcha on spoon
        if (spoon.matchaAmount > 0) {
            ctx.fillStyle = '#55a630';
            ctx.beginPath();
            ctx.arc(spoon.x + spoon.width / 2, spoon.y + 10, spoon.width * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawBowl() {
        // Outer shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 10;

        // Bowl body
        const bowlGradient = ctx.createRadialGradient(bowl.x - 20, bowl.y - 20, 10, bowl.x, bowl.y, bowl.radius);
        bowlGradient.addColorStop(0, '#ffffff');
        bowlGradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = bowlGradient;
        ctx.beginPath();
        ctx.arc(bowl.x, bowl.y, bowl.radius, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Bowl rim
        ctx.strokeStyle = '#d0d0d0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(bowl.x, bowl.y, bowl.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Bowl interior
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        ctx.arc(bowl.x, bowl.y, bowl.radius - 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw matcha powder in bowl
        if (scale.reading > 0 && gameState !== 'SCOOPING' && gameState !== 'SIFTING') {
            const powderAmount = Math.min(scale.reading / TARGET_MATCHA, 1);
            ctx.fillStyle = '#55a630';
            ctx.beginPath();
            ctx.arc(bowl.x, bowl.y, bowl.radius * 0.3 * powderAmount, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw matcha liquid
        if (gameState === 'WHISKING' || gameState === 'POURING_CUP' || gameState === 'DONE' && !starbucksCup.filled) {
            const { light, dark } = getMatchaColor(scale.reading);
            const liquidGradient = ctx.createRadialGradient(bowl.x, bowl.y, 5, bowl.x, bowl.y, bowl.radius * 0.8);
            liquidGradient.addColorStop(0, light);
            liquidGradient.addColorStop(1, dark);
            ctx.fillStyle = liquidGradient;
            ctx.beginPath();
            ctx.arc(bowl.x, bowl.y, bowl.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Draw froth
            if (bowl.frothLevel > 0) {
                const frothRadius = bowl.radius * 0.8 * (bowl.frothLevel / 100); // Froth grows up to liquid size
                const frothGradient = ctx.createRadialGradient(bowl.x, bowl.y, 5, bowl.x, bowl.y, frothRadius);
                frothGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // White-ish center
                frothGradient.addColorStop(0.5, 'rgba(170, 255, 170, 0.6)'); // Light green
                frothGradient.addColorStop(1, 'rgba(107, 191, 89, 0.4)'); // Matcha green edge
                ctx.fillStyle = frothGradient;
                ctx.beginPath();
                ctx.arc(bowl.x, bowl.y, frothRadius, 0, Math.PI * 2);
                ctx.fill();
            }


        }
    }

    function drawStrainer() {
        // Strainer rim
        const rimGradient = ctx.createLinearGradient(strainer.x - strainer.radius, strainer.y, strainer.x + strainer.radius, strainer.y);
        rimGradient.addColorStop(0, '#d4d4d4');
        rimGradient.addColorStop(0.5, '#f0f0f0');
        rimGradient.addColorStop(1, '#d4d4d4');
        ctx.strokeStyle = rimGradient;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(strainer.x, strainer.y, strainer.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Mesh lines
        ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < 5; i++) {
            const offset = i * strainer.radius * 2 / 5;
            ctx.moveTo(strainer.x - strainer.radius, strainer.y - strainer.radius + offset);
            ctx.lineTo(strainer.x + strainer.radius, strainer.y - strainer.radius + offset);
            ctx.moveTo(strainer.x - strainer.radius + offset, strainer.y - strainer.radius);
            ctx.lineTo(strainer.x - strainer.radius + offset, strainer.y + strainer.radius);
        }
        ctx.stroke();
    }

    function drawScale() {
        // Scale body
        ctx.fillStyle = '#f0f0f0';
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(scale.x, scale.y, scale.width, scale.height, 8);
        ctx.fill();
        ctx.stroke();

        // LCD Screen
        ctx.fillStyle = '#c1d1c6'; // LCD green background
        ctx.fillRect(scale.x + 10, scale.y + 10, scale.width - 20, scale.height - 20);

        // Text
        ctx.fillStyle = '#3a3f3b';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${scale.reading.toFixed(2)}g`, scale.x + scale.width / 2, scale.y + 40);
    }

    function drawKettle() {
        ctx.save();
        // Translate to a pivot point for rotation (e.g., bottom center)
        const pivotX = kettle.x + kettle.width / 2;
        const pivotY = kettle.y + kettle.height;
        ctx.translate(pivotX, pivotY);
        ctx.rotate(kettle.rotation); // Apply rotation
        ctx.translate(-pivotX, -pivotY);

        try {
            ctx.drawImage(kettleImage, kettle.x, kettle.y, kettle.width, kettle.height);
        } catch (e) {
            // Fallback rectangle if image fails to load
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(kettle.x, kettle.y, kettle.width, kettle.height);
            console.error("Error drawing kettle image:", e);
        }
        ctx.restore();
    }

    function drawWhisk() {
        try {
            ctx.drawImage(whiskImage, whisk.x, whisk.y, whisk.width, whisk.height);
        } catch (e) {
            // Fallback rectangle if image fails to load
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(whisk.x, whisk.y, whisk.width, whisk.height);
            console.error("Error drawing whisk image:", e);
        }
    }

    function drawStarbucksCup() {
        // Transparent cup
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(starbucksCup.x - starbucksCup.width / 2, starbucksCup.y);
        ctx.lineTo(starbucksCup.x - starbucksCup.width / 2 + 10, starbucksCup.y + starbucksCup.height);
        ctx.lineTo(starbucksCup.x + starbucksCup.width / 2 - 10, starbucksCup.y + starbucksCup.height);
        ctx.lineTo(starbucksCup.x + starbucksCup.width / 2, starbucksCup.y);
        ctx.stroke();
        ctx.fill();

        if (starbucksCup.filled) {
            const { light, dark } = getMatchaColor(scale.reading);
            // Matcha liquid
            const liquidGradient = ctx.createLinearGradient(starbucksCup.x, starbucksCup.y + 20, starbucksCup.x, starbucksCup.y + starbucksCup.height);
            liquidGradient.addColorStop(0, light); // Lighter top
            liquidGradient.addColorStop(1, dark); // Darker bottom
            ctx.fillStyle = liquidGradient;
            ctx.beginPath();
            ctx.moveTo(starbucksCup.x - starbucksCup.width / 2 + 5, starbucksCup.y + 20);
            ctx.lineTo(starbucksCup.x - starbucksCup.width / 2 + 10, starbucksCup.y + starbucksCup.height);
            ctx.lineTo(starbucksCup.x + starbucksCup.width / 2 - 10, starbucksCup.y + starbucksCup.height);
            ctx.lineTo(starbucksCup.x + starbucksCup.width / 2 - 5, starbucksCup.y + 20);
            ctx.closePath();
            ctx.fill();

            // Starbucks Logo (from local image)
            const logoCenterX = starbucksCup.x;
            const logoCenterY = starbucksCup.y + starbucksCup.height / 2;
            const logoRadius = 25;

            // Draw the loaded image, wrapped in a try-catch for safety
            try {
                ctx.drawImage(logoImage, logoCenterX - logoRadius, logoCenterY - logoRadius, logoRadius * 2, logoRadius * 2);
            } catch (e) {
                console.error("Error drawing the logo image:", e);
            }

            // Draw lid and straw only when the process is fully done
            if (gameState === 'DONE') {
                const lidY = starbucksCup.y;
                const lidWidth = starbucksCup.width / 2 + 5;

                // Lid
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(starbucksCup.x, lidY, lidWidth, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Straw
                ctx.fillStyle = '#007042'; // Starbucks green
                ctx.save(); // Save context state
                // Position the straw to go through a virtual hole
                ctx.translate(starbucksCup.x + 15, lidY - 60);
                ctx.rotate(-0.25); // Rotate straw slightly
                ctx.beginPath();
                ctx.roundRect(0, 0, 8, 120, 4); // Draw a rounded rectangle for the straw
                ctx.fill();
                ctx.restore(); // Restore context state
            }
        }
    }

    function drawWaterStream() {
        if (kettle.pourProgress <= 0) return; // Don't draw if there's no progress

        // Approximate spout tip position on the new image
        const spoutOriginX = kettle.x + kettle.width * 0.05; // Moved to the left side
        const spoutOriginY = kettle.y + kettle.height * 0.4; // Adjusted Y position

        // Calculate the end point of the stream based on progress
        const endX = spoutOriginX + (bowl.x - spoutOriginX) * kettle.pourProgress;
        const endY = spoutOriginY + (bowl.y - spoutOriginY) * kettle.pourProgress;

        ctx.strokeStyle = 'rgba(173, 216, 230, 0.7)'; // Light blue, semi-transparent
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(spoutOriginX, spoutOriginY);
        // Draw a line to the animated end point
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    /**
     * Calculates the matcha color based on the amount of powder used.
     * @param {number} amount The grams of matcha from the scale.
     * @returns {{light: string, dark: string}} An object with light and dark color strings.
     */
    function getMatchaColor(amount) {
        const tasteless = { light: { r: 200, g: 220, b: 150 }, dark: { r: 150, g: 170, b: 100 } };
        const delicious = { light: { r: 107, g: 191, b: 89 }, dark: { r: 74, g: 124, b: 58 } };
        const strong = { light: { r: 80, g: 140, b: 70 }, dark: { r: 46, g: 125, b: 50 } };

        let lightColor, darkColor;

        const lerp = (start, end, t) => start + t * (end - start);

        if (amount < 2.0) {
            const t = Math.max(0, amount / 2.0); // 0 to 1 as we approach the 'delicious' lower bound
            lightColor = { r: lerp(tasteless.light.r, delicious.light.r, t), g: lerp(tasteless.light.g, delicious.light.g, t), b: lerp(tasteless.light.b, delicious.light.b, t) };
            darkColor = { r: lerp(tasteless.dark.r, delicious.dark.r, t), g: lerp(tasteless.dark.g, delicious.dark.g, t), b: lerp(tasteless.dark.b, delicious.dark.b, t) };
        } else if (amount > 4.0) {
            const t = Math.min(1, (amount - 4.0) / 2.0); // 0 to 1 for amounts > 4.0g
            lightColor = { r: lerp(delicious.light.r, strong.light.r, t), g: lerp(delicious.light.g, strong.light.g, t), b: lerp(delicious.light.b, strong.light.b, t) };
            darkColor = { r: lerp(delicious.dark.r, strong.dark.r, t), g: lerp(delicious.dark.g, strong.dark.g, t), b: lerp(delicious.dark.b, strong.dark.b, t) };
        } else {
            lightColor = delicious.light;
            darkColor = delicious.dark;
        }

        const toRgb = (c) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

        return { light: toRgb(lightColor), dark: toRgb(darkColor) };
    }

    // Start the game loop
    // Error handling for robust loading
    logoImage.onerror = onImageLoad;
    kettleImage.onerror = onImageLoad;
    whiskImage.onerror = onImageLoad;
    // If images are already cached, they might not fire 'onload', so we check
    if (logoImage.complete) onImageLoad();
    if (kettleImage.complete) imagesToLoad--; // Decrement here to avoid double-counting if both are cached
    if (whiskImage.complete) imagesToLoad--;
});