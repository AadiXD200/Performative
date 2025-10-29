document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const highScoreElement = document.getElementById('highScore');

    const TILE_SIZE = 30; // Each tile is 30x30 pixels
    const WALL_COLOR = '#F7A8B8'; // Soft Pink
    const DOT_COLOR = '#E597A8'; // Darker Pink
    const POWER_PELLET_COLOR = '#FFFFFF'; // White
    const PACMAN_COLOR = '#FFFFFF'; // White
    const GHOST_COLORS = {
        BLINKY: '#FF69B4', // Hot Pink
        PINKY: '#FFB6C1',  // Light Pink
        INKY: '#C7C7C7',   // Light Grey
        CLYDE: '#A0A0A0'   // Medium Grey
    };
    const FRIGHTENED_GHOST_COLOR = '#2121DE'; // Blue
    const EYES_COLOR = '#FFFFFF';
    const PACMAN_RADIUS = TILE_SIZE / 2 - 2; // Pac-Man radius, slightly smaller than tile
    const PACMAN_SPEED = 5; // Scaled up for larger tiles
    const GHOST_SPEED = 3.75; // Scaled up for larger tiles
    const FRIGHTENED_GHOST_SPEED = 1.875; // Scaled up for larger tiles
    const SCORE_DOT = 10;
    const SCORE_POWER_PELLET = 50;
    const SCORE_GHOST = 200;

    // Image for Pac-Man
    const pacmanImage = new Image();
    const appleImage = new Image();
    const ghostImage = new Image();
    const matchaImage = new Image();
    const scaredImage = new Image();
    let imagesAreLoaded = false;

    pacmanImage.src = 'assets/profile.png';
    appleImage.src = 'assets/apple.png';
    ghostImage.src = 'assets/ghost.png';
    matchaImage.src = 'assets/matcha.png';
    scaredImage.src = 'assets/scared.png';

    // Game State Variables
    let score = 0;
    let lives = 3;
    let highScore = 0;
    let ghosts = [];
    let map = []; // The game's current map state, will be modified
    let pacman = {
        x: 0, // Will be initialized to starting tile center
        y: 0, // Will be initialized to starting tile center
        dx: 0, // Current horizontal movement direction (pixels)
        dy: 0, // Current vertical movement direction (pixels)
        radius: PACMAN_RADIUS,
        mouthOpen: 0.75, // Angle in radians (0.75 * PI)
        mouthSpeed: 0.05, // How fast the mouth opens/closes
        direction: null, // Current grid direction (UP, DOWN, LEFT, RIGHT)
        nextDirection: null // Next desired grid direction
    };
    let ghostsEatenInFrightenedMode = 0; // To track consecutive ghosts eaten for combo points
    let frightenedTimer = 0;
    const FRIGHTENED_DURATION = 7000; // 7 seconds in milliseconds
    const gameOverScreen = document.getElementById('gameOverScreen');
    const winScreen = document.getElementById('winScreen');
    const restartButton = document.getElementById('restartButton');
    const restartButtonWin = document.getElementById('restartButtonWin');
    let animationFrameId;
    let lastFrameTime = 0;
    const FPS = 60;
    const FRAME_INTERVAL = 1000 / FPS;

    // Original maze layout, will not be modified
    const ORIGINAL_MAP = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,0,0,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,2,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,2,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Directions mapping
    const DIRECTIONS = {
        STOP: { dx: 0, dy: 0 },
        UP: { dx: 0, dy: -1 },
        DOWN: { dx: 0, dy: 1 },
        LEFT: { dx: -1, dy: 0 },
        RIGHT: { dx: 1, dy: 0 }
    };

    /**
     * Draws the entire game map based on the map layout array.
     */
    function drawMap() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                if (tile === 1) { // Draw Wall
                    drawWall(x, y);
                } else if (tile === 2) { // Draw Dot
                    drawDot(x, y);
                } else if (tile === 3) { // Draw Power Pellet
                    drawPowerPellet(x, y);
                }
            }
        }
        // Draw Pac-Man after the map so he's on top
        drawPacman();
        // Draw ghosts
        ghosts.forEach(drawGhost);
    }

    /**
     * Draws a single wall tile.
     * For simplicity, we draw solid rectangles. For a more authentic look,
     * one could analyze neighbors to draw curves and specific shapes.
     * @param {number} x - The x-coordinate in the map grid.
     * @param {number} y - The y-coordinate in the map grid.
     */
    function drawWall(x, y) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    /**
     * Draws a single dot.
     * @param {number} x - The x-coordinate in the map grid.
     * @param {number} y - The y-coordinate in the map grid.
     */
    function drawDot(x, y) {
        if (imagesAreLoaded) {
            const size = TILE_SIZE / 3; // Proportional to original pellet size
            const drawX = x * TILE_SIZE + (TILE_SIZE - size) / 2;
            const drawY = y * TILE_SIZE + (TILE_SIZE - size) / 2;
            ctx.drawImage(appleImage, drawX, drawY, size, size);
        } else {
            ctx.fillStyle = DOT_COLOR;
            ctx.beginPath();
            ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draws a single power pellet.
     * @param {number} x - The x-coordinate in the map grid.
     * @param {number} y - The y-coordinate in the map grid.
     */
    function drawPowerPellet(x, y) {
        if (imagesAreLoaded) {
            const size = TILE_SIZE * 0.8; // Keep size similar to original big pellets
            const drawX = x * TILE_SIZE + (TILE_SIZE - size) / 2;
            const drawY = y * TILE_SIZE + (TILE_SIZE - size) / 2;
            ctx.drawImage(matchaImage, drawX, drawY, size, size);
        } else {
            // Fallback drawing if image fails to load
            ctx.fillStyle = POWER_PELLET_COLOR;
            ctx.beginPath();
            ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draws Pac-Man on the canvas.
     */
    function drawPacman() {
        ctx.save(); // Save the current canvas state
        ctx.translate(pacman.x, pacman.y); // Move the origin to pacman's position
        
        // Draw the image centered on the new origin
        const size = pacman.radius * 2;
        ctx.drawImage(pacmanImage, -pacman.radius, -pacman.radius, size, size);

        ctx.restore(); // Restore the canvas to its original state
    }

    /**
     * Draws a single ghost on the canvas.
     * @param {object} ghost - The ghost object to draw.
     */
    function drawGhost(ghost) {
        const size = TILE_SIZE;
        if (ghost.mode === 'FRIGHTENED') {
            // Draw the scared ghost image
            ctx.drawImage(scaredImage, ghost.x - size / 2, ghost.y - size / 2, size, size);
        } else {
            // Draw the ghost image
            ctx.drawImage(ghostImage, ghost.x - size / 2, ghost.y - size / 2, size, size);
        }
    }

    /**
     * Checks if a given grid position (x, y) is a wall.
     * @param {number} gridX - The x-coordinate in the map grid.
     * @param {number} gridY - The y-coordinate in the map grid.
     * @returns {boolean} True if it's a wall, false otherwise.
     */
    function isWall(gridX, gridY) {
        if (gridY < 0 || gridY >= map.length || gridX < 0 || gridX >= map[0].length) {
            return true; // Treat out of bounds as walls
        }
        return map[gridY][gridX] === 1;
    }

    function checkGhostCollision() {
        for (const ghost of ghosts) {
            const dx = pacman.x - ghost.x;
            const dy = pacman.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < pacman.radius + TILE_SIZE / 2 - 4) { 
                if (ghost.mode === 'FRIGHTENED') {
                    // Eat the ghost and get combo points!
                    const points = SCORE_GHOST * Math.pow(2, ghostsEatenInFrightenedMode);
                    score += points;
                    ghostsEatenInFrightenedMode++;
                    scoreElement.textContent = score;
                    ghost.mode = 'EATEN';
                    resetSingleGhost(ghost);
                } else if (ghost.mode !== 'EATEN') {
                    handlePlayerDeath();
                }
                break; // Only handle one death per frame
            }
        }
    }

    function handlePlayerDeath() {
        lives--;
        livesElement.textContent = lives;

        if (lives <= 0) {
            gameOver();
        } else {
            // Reset positions for another try
            resetCharacterPositions();
        }
    }

    function gameOver() {
        updateHighScore();
        cancelAnimationFrame(animationFrameId);
        gameOverScreen.style.display = 'flex';
    }

    function gameWon() {
        updateHighScore();
        cancelAnimationFrame(animationFrameId);
        winScreen.style.display = 'flex';
    }

    function checkWinCondition() {
        // Check if any dots (2) or power pellets (3) are left
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 2 || map[y][x] === 3) {
                    return; // Found a pellet, game is not over
                }
            }
        }
        // If we get here, no pellets are left
        gameWon();
    }

    function updateGhosts() {
        ghosts.forEach(ghost => {
            moveGhost(ghost);
        });
    }

    function moveGhost(ghost) {
        if (ghost.mode === 'EATEN') {
            // Ghost is heading back to the box, can be made to move faster
            // For now, it just reappears. A better implementation would pathfind back.
        }
        const onGridCenter = (ghost.x % TILE_SIZE === TILE_SIZE / 2) && (ghost.y % TILE_SIZE === TILE_SIZE / 2);

        if (onGridCenter) {
            const currentGridX = Math.floor(ghost.x / TILE_SIZE);
            const currentGridY = Math.floor(ghost.y / TILE_SIZE);

            // Simple AI: Try to move towards Pac-Man
            let targetX = pacman.x;
            let targetY = pacman.y;

            if (ghost.mode === 'FRIGHTENED') {
                // When frightened, run away (target a far corner)
                targetX = TILE_SIZE;
                targetY = TILE_SIZE;
            }

            const possibleDirections = [];
            const opposites = {
                'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT'
            };

            // Check all four directions
            for (const dirName in DIRECTIONS) {
                if (dirName === 'STOP') continue;

                const dir = DIRECTIONS[dirName];
                // Don't allow the ghost to reverse direction unless it's a dead end
                if (dirName === opposites[ghost.directionName]) {
                    continue;
                }

                if (!isWall(currentGridX + dir.dx, currentGridY + dir.dy)) {
                    possibleDirections.push({ name: dirName, dir: dir });
                }
            }

            let bestDirection = null;
            let minDistance = Infinity;

            // If there are possible moves, find the one that gets closest to Pac-Man
            if (possibleDirections.length > 0) {
                if (possibleDirections.length === 1) {
                    bestDirection = possibleDirections[0];
                } else {
                    // Choose the direction that minimizes/maximizes distance to target
                    for (const move of possibleDirections) {
                        const nextX = ghost.x + move.dir.dx * TILE_SIZE;
                        const nextY = ghost.y + move.dir.dy * TILE_SIZE;
                        const distance = Math.sqrt(Math.pow(nextX - targetX, 2) + Math.pow(nextY - targetY, 2));

                        // If frightened, we want to maximize distance (run away)
                        // But a simpler approach is to just pick a random valid direction
                        if (ghost.mode === 'FRIGHTENED') {
                            // Simple random movement when frightened
                            bestDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                            break; // Exit loop once a random direction is chosen
                        }

                        if (distance < minDistance) { // For CHASE mode
                            minDistance = distance;
                            bestDirection = move;
                        }
                    }
                }
            } else { // Dead end, must reverse
                const reverseDirName = opposites[ghost.directionName];
                if (reverseDirName) {
                    bestDirection = { name: reverseDirName, dir: DIRECTIONS[reverseDirName] };
                }
            }

            if (bestDirection) {
                ghost.direction = bestDirection.dir;
                ghost.directionName = bestDirection.name;
                const speed = (ghost.mode === 'FRIGHTENED') ? FRIGHTENED_GHOST_SPEED : GHOST_SPEED;
                ghost.dx = ghost.direction.dx * speed;
                ghost.dy = ghost.direction.dy * speed;
            }
        }

        ghost.x += ghost.dx;
        ghost.y += ghost.dy;

        // Handle wrapping through the side tunnels
        if (ghost.x < 0) ghost.x = canvas.width;
        else if (ghost.x > canvas.width) ghost.x = 0;
    }

    /**
     * Updates the game state (Pac-Man's position, score, etc.).
     */
    function update() {
        const now = performance.now();
        const delta = now - (lastFrameTime || now);
        lastFrameTime = now;

        // Handle frightened mode timer
        if (frightenedTimer > 0) {
            frightenedTimer -= delta;
            if (frightenedTimer <= 0) {
                ghosts.forEach(ghost => {
                    if (ghost.mode === 'FRIGHTENED') ghost.mode = 'CHASE';
                });
            }
        }

        // Animate Pac-Man's mouth
        pacman.mouthOpen += pacman.mouthSpeed;
        if (pacman.mouthOpen > Math.PI / 2 || pacman.mouthOpen < 0) {
            pacman.mouthSpeed *= -1; // Reverse mouth animation
        }

        // Check if Pac-Man is at the center of a tile, which is the point where a turn is possible.
        const onGridCenter = (pacman.x % TILE_SIZE === TILE_SIZE / 2) && (pacman.y % TILE_SIZE === TILE_SIZE / 2);

        // Try to change direction if a new one is requested
        if (onGridCenter && pacman.nextDirection) {
            const currentGridX = Math.floor(pacman.x / TILE_SIZE);
            const currentGridY = Math.floor(pacman.y / TILE_SIZE);
            const nextGridX = currentGridX + pacman.nextDirection.dx;
            const nextGridY = currentGridY + pacman.nextDirection.dy;

            if (!isWall(nextGridX, nextGridY)) {
                pacman.direction = pacman.nextDirection;
                pacman.dx = pacman.direction.dx * PACMAN_SPEED;
                pacman.dy = pacman.direction.dy * PACMAN_SPEED;
                pacman.nextDirection = null; // Clear the requested direction
            }
        }

        // Calculate potential new position
        let newX = pacman.x + pacman.dx;
        let newY = pacman.y + pacman.dy;
        
        const currentGridX = Math.floor(pacman.x / TILE_SIZE);
        const currentGridY = Math.floor(pacman.y / TILE_SIZE);

        // Check for wall collisions. We only need to check when Pac-Man is at the center of a tile
        // and about to enter a new one.
        if (onGridCenter) {
            const nextGridX = currentGridX + pacman.direction.dx;
            const nextGridY = currentGridY + pacman.direction.dy;

            if (isWall(nextGridX, nextGridY)) {
                // It's a wall, stop movement
                pacman.dx = 0;
                pacman.dy = 0;
                // We don't set direction to STOP, so the mouth still faces the wall
            }
        }

        // Update position if moving
        pacman.x += pacman.dx;
        pacman.y += pacman.dy;

        // Handle wrapping through the side tunnels
        if (pacman.x < 0) {
            pacman.x = canvas.width;
        } else if (pacman.x > canvas.width) {
            pacman.x = 0;
        }

        // Check for eating dots/power pellets
        const pacmanGridX = Math.floor(pacman.x / TILE_SIZE);
        const pacmanGridY = Math.floor(pacman.y / TILE_SIZE);

        if (map[pacmanGridY][pacmanGridX] === 2) { // Dot
            map[pacmanGridY][pacmanGridX] = 0; // Remove dot
            score += SCORE_DOT;
            scoreElement.textContent = score;
            checkWinCondition();
        } else if (map[pacmanGridY][pacmanGridX] === 3) { // Power Pellet
            map[pacmanGridY][pacmanGridX] = 0; // Remove power pellet
            score += SCORE_POWER_PELLET;
            scoreElement.textContent = score;
            ghostsEatenInFrightenedMode = 0; // Reset the combo counter for the new power pellet
            frightenedTimer = FRIGHTENED_DURATION;
            ghosts.forEach(ghost => {
                // Only frighten ghosts that aren't already eaten and heading home
                if (ghost.mode !== 'EATEN') ghost.mode = 'FRIGHTENED';
            });
            checkWinCondition();
        }

        // Update ghosts and check for collisions
        updateGhosts();
        checkGhostCollision();

        // Update UI elements
        livesElement.textContent = lives;
    }

    // Prevent arrow keys from scrolling the page
    window.addEventListener('keydown', (e) => {
        // Check if the pressed key is an arrow key
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault(); // Stop the default browser action (e.g., scrolling)
        }

        // Set next desired direction
        switch (e.key) {
            case 'ArrowUp':
                pacman.nextDirection = DIRECTIONS.UP;
                break;
            case 'ArrowDown':
                pacman.nextDirection = DIRECTIONS.DOWN;
                break;
            case 'ArrowLeft':
                pacman.nextDirection = DIRECTIONS.LEFT;
                break;
            case 'ArrowRight':
                pacman.nextDirection = DIRECTIONS.RIGHT;
                break;
        }
    });

    restartButton.addEventListener('click', () => {
        initGame();
    });

    restartButtonWin.addEventListener('click', () => {
        initGame();
    });

    /**
     * Cookie helper functions
     */
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /**
     * Updates the high score if the current score is greater.
     */
    function updateHighScore() {
        if (score > highScore) {
            highScore = score;
            setCookie('pacmanHighScore', highScore, 365);
            highScoreElement.textContent = highScore;
        }
    }

    /**
     * Initializes the game state.
     */
    function resetCharacterPositions() {
        pacman.x = 13 * TILE_SIZE + TILE_SIZE / 2;
        pacman.y = 22 * TILE_SIZE + TILE_SIZE / 2; // Corrected starting Y position to be on the path
        pacman.direction = DIRECTIONS.STOP; // Start standing still
        pacman.dx = 0;
        pacman.dy = 0;
        pacman.nextDirection = null;

        // Reset ghost positions and states
        ghosts.forEach(resetSingleGhost);
    }

    /**
     * Resets a single ghost to its starting position and state.
     * @param {object} ghost - The ghost to reset.
     */
    function resetSingleGhost(ghost) {
        ghost.x = ghost.startX * TILE_SIZE + TILE_SIZE / 2;
        ghost.y = ghost.startY * TILE_SIZE + TILE_SIZE / 2;
        ghost.direction = DIRECTIONS.STOP;
        ghost.directionName = 'STOP';
        ghost.dx = 0;
        ghost.dy = 0;
        ghost.mode = 'CHASE'; // Default mode
    }

    function initGame() {
        // Create a fresh copy of the map for the new game
        map = ORIGINAL_MAP.map(row => [...row]);

        // Create ghosts
        ghosts = [
            { name: 'Blinky', color: GHOST_COLORS.BLINKY, startX: 13, startY: 11 },
            { name: 'Pinky', color: GHOST_COLORS.PINKY, startX: 14, startY: 11 },
            { name: 'Inky', color: GHOST_COLORS.INKY, startX: 12, startY: 13 },
            { name: 'Clyde', color: GHOST_COLORS.CLYDE, startX: 15, startY: 13 }
        ];

        resetCharacterPositions();

        score = 0;
        lives = 3;
        scoreElement.textContent = score;
        livesElement.textContent = lives;

        highScore = parseInt(getCookie('pacmanHighScore')) || 0;
        highScoreElement.textContent = highScore;

        gameOverScreen.style.display = 'none';
        winScreen.style.display = 'none';

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        lastFrameTime = performance.now();
        gameLoop();
    }

    /**
     * The main game loop.
     */
    function gameLoop(timestamp) {
        animationFrameId = requestAnimationFrame(gameLoop);

        if (timestamp - lastFrameTime > FRAME_INTERVAL) {
            lastFrameTime = timestamp - ((timestamp - lastFrameTime) % FRAME_INTERVAL);

            update();
            // Clear canvas and redraw everything
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawMap(); // This also calls drawPacman and drawGhost
        }
    }

    /**
     * Preloads all game images and starts the game when done.
     */
    function loadImagesAndStart() {
        const images = [pacmanImage, appleImage, ghostImage, matchaImage, scaredImage];
        let loadedCount = 0;

        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === images.length) {
                imagesAreLoaded = true;
                initGame();
            }
        };

        images.forEach(img => { img.onload = onImageLoad; img.onerror = onImageLoad; });
    }
    loadImagesAndStart();
});