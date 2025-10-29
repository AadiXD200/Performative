document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');

    // Game Constants
    const TILE_SIZE = 24; // Each tile is 24x24 pixels
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
    const PACMAN_RADIUS = TILE_SIZE / 2 - 2; // Pac-Man radius, slightly smaller than tile
    const PACMAN_SPEED = 2; // Pixels per frame
    const GHOST_SPEED = 1.5; // Ghosts are slightly slower
    const SCORE_DOT = 10;
    const SCORE_POWER_PELLET = 50;

    // Game State Variables
    let score = 0;
    let lives = 3;
    let ghosts = [];
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
    const gameOverScreen = document.getElementById('gameOverScreen');
    let animationFrameId;
    let lastFrameTime = 0;
    const FPS = 60;
    const FRAME_INTERVAL = 1000 / FPS;

    // Maze layout: 1=wall, 2=dot, 3=power pellet, 0=empty
    const map = [
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
        ctx.fillStyle = DOT_COLOR;
        ctx.beginPath();
        ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draws a single power pellet.
     * @param {number} x - The x-coordinate in the map grid.
     * @param {number} y - The y-coordinate in the map grid.
     */
    function drawPowerPellet(x, y) {
        ctx.fillStyle = POWER_PELLET_COLOR;
        ctx.beginPath();
        ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draws Pac-Man on the canvas.
     */
    function drawPacman() {
        ctx.fillStyle = PACMAN_COLOR;
        ctx.beginPath();
        let startAngle, endAngle;

        // Determine mouth orientation based on direction
        switch (pacman.direction) {
            case DIRECTIONS.RIGHT:
                startAngle = pacman.mouthOpen;
                endAngle = Math.PI * 2 - pacman.mouthOpen;
                break;
            case DIRECTIONS.LEFT:
                startAngle = Math.PI + pacman.mouthOpen;
                endAngle = Math.PI - pacman.mouthOpen;
                break;
            case DIRECTIONS.UP:
                startAngle = Math.PI * 1.5 + pacman.mouthOpen;
                endAngle = Math.PI * 0.5 - pacman.mouthOpen;
                break;
            case DIRECTIONS.DOWN:
                startAngle = Math.PI * 0.5 + pacman.mouthOpen;
                endAngle = Math.PI * 1.5 - pacman.mouthOpen;
                break;
            default: // STOP or initial state, face right
                startAngle = pacman.mouthOpen;
                endAngle = Math.PI * 2 - pacman.mouthOpen;
                break;
        }

        ctx.arc(pacman.x, pacman.y, pacman.radius, startAngle, endAngle);
        ctx.lineTo(pacman.x, pacman.y); // Draw line to center to close mouth
        ctx.fill();
    }

    /**
     * Draws a single ghost on the canvas.
     * @param {object} ghost - The ghost object to draw.
     */
    function drawGhost(ghost) {
        const bodyHeight = TILE_SIZE * 0.8;
        const bodyWidth = TILE_SIZE * 0.9;
        const footRadius = bodyWidth / 6;
        const eyeRadius = TILE_SIZE / 8;
        const pupilRadius = TILE_SIZE / 16;

        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        // Main body
        ctx.arc(ghost.x, ghost.y - bodyHeight / 4, bodyWidth / 2, Math.PI, 0);
        ctx.rect(ghost.x - bodyWidth / 2, ghost.y - bodyHeight / 4, bodyWidth, bodyHeight);
        ctx.fill();

        // Feet
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(ghost.x - bodyWidth / 2 + (i * 2 + 1) * footRadius, ghost.y + bodyHeight / 2 - footRadius, footRadius, 0, Math.PI);
            ctx.fill();
        }

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ghost.x - bodyWidth / 4, ghost.y - bodyHeight / 4, eyeRadius, 0, Math.PI * 2);
        ctx.arc(ghost.x + bodyWidth / 4, ghost.y - bodyHeight / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
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

            if (distance < pacman.radius + TILE_SIZE / 2 - 4) { // Collision
                handlePlayerDeath();
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
        cancelAnimationFrame(animationFrameId);
        gameOverScreen.style.display = 'flex';
    }

    function updateGhosts() {
        ghosts.forEach(ghost => {
            moveGhost(ghost);
        });
    }

    function moveGhost(ghost) {
        const onGridCenter = (ghost.x % TILE_SIZE === TILE_SIZE / 2) && (ghost.y % TILE_SIZE === TILE_SIZE / 2);

        if (onGridCenter) {
            const currentGridX = Math.floor(ghost.x / TILE_SIZE);
            const currentGridY = Math.floor(ghost.y / TILE_SIZE);

            // Simple AI: Try to move towards Pac-Man
            const targetX = pacman.x;
            const targetY = pacman.y;

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
                    // Choose the direction that minimizes distance to target
                    for (const move of possibleDirections) {
                        const nextX = ghost.x + move.dir.dx * TILE_SIZE;
                        const nextY = ghost.y + move.dir.dy * TILE_SIZE;
                        const distance = Math.sqrt(Math.pow(nextX - targetX, 2) + Math.pow(nextY - targetY, 2));

                        if (distance < minDistance) {
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
                ghost.dx = ghost.direction.dx * GHOST_SPEED;
                ghost.dy = ghost.direction.dy * GHOST_SPEED;
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
        } else if (map[pacmanGridY][pacmanGridX] === 3) { // Power Pellet
            map[pacmanGridY][pacmanGridX] = 0; // Remove power pellet
            score += SCORE_POWER_PELLET;
            scoreElement.textContent = score;
            // TODO: Implement ghost frightening logic here
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
        ghosts.forEach(ghost => {
            ghost.x = ghost.startX * TILE_SIZE + TILE_SIZE / 2;
            ghost.y = ghost.startY * TILE_SIZE + TILE_SIZE / 2;
            ghost.direction = DIRECTIONS.STOP;
            ghost.directionName = 'STOP';
            ghost.dx = 0;
            ghost.dy = 0;
        });
    }

    function initGame() {
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
        gameOverScreen.style.display = 'none';

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        gameLoop();
    }

    /**
     * The main game loop.
     */
    function gameLoop() {
        update();
        // Clear canvas and redraw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(); // This also calls drawPacman
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    initGame();
    gameLoop();
});