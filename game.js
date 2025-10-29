document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');

    // Game Constants
    const TILE_SIZE = 24; // Each tile is 24x24 pixels
    const WALL_COLOR = '#00008f'; // Classic blue for walls (corrected to brighter blue)
    const DOT_COLOR = '#FFBF7F'; // Orange-ish for dots
    const POWER_PELLET_COLOR = '#FFFF00'; // Yellow for power pellets
    const PACMAN_COLOR = '#FFFF00'; // Yellow for Pac-Man
    const PACMAN_RADIUS = TILE_SIZE / 2 - 2; // Pac-Man radius, slightly smaller than tile
    const PACMAN_SPEED = 2; // Pixels per frame
    const SCORE_DOT = 10;
    const SCORE_POWER_PELLET = 50;

    // Game State Variables
    let score = 0;
    let lives = 3;
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

    /**
     * Updates the game state (Pac-Man's position, score, etc.).
     */
    function update() {
        // Animate Pac-Man's mouth
        pacman.mouthOpen += pacman.mouthSpeed;
        if (pacman.mouthOpen > Math.PI / 2 || pacman.mouthOpen < 0) {
            pacman.mouthSpeed *= -1; // Reverse mouth animation
        }

        // Try to change direction if a new one is requested
        if (pacman.nextDirection && pacman.nextDirection !== pacman.direction) {
            const newGridX = Math.floor((pacman.x + pacman.nextDirection.dx * PACMAN_RADIUS) / TILE_SIZE);
            const newGridY = Math.floor((pacman.y + pacman.nextDirection.dy * PACMAN_RADIUS) / TILE_SIZE);
            if (!isWall(newGridX, newGridY)) {
                pacman.direction = pacman.nextDirection;
                pacman.dx = pacman.direction.dx * PACMAN_SPEED;
                pacman.dy = pacman.direction.dy * PACMAN_SPEED;
            }
        }

        // Calculate potential new position
        let newX = pacman.x + pacman.dx;
        let newY = pacman.y + pacman.dy;

        // Check for wall collisions before moving
        const currentGridX = Math.floor(pacman.x / TILE_SIZE);
        const currentGridY = Math.floor(pacman.y / TILE_SIZE);
        const targetGridX = Math.floor(newX / TILE_SIZE);
        const targetGridY = Math.floor(newY / TILE_SIZE);

        if (isWall(targetGridX, targetGridY) && (targetGridX !== currentGridX || targetGridY !== currentGridY)) {
            // If moving into a new tile and it's a wall, stop movement
            pacman.dx = 0;
            pacman.dy = 0;
            pacman.direction = DIRECTIONS.STOP;
            // Snap Pac-Man to the center of the current tile
            pacman.x = currentGridX * TILE_SIZE + TILE_SIZE / 2;
            pacman.y = currentGridY * TILE_SIZE + TILE_SIZE / 2;
        } else {
            pacman.x = newX;
            pacman.y = newY;
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
    function initGame() {
        // Set initial Pac-Man position (e.g., center of tile 13, 23)
        pacman.x = 13 * TILE_SIZE + TILE_SIZE / 2;
        pacman.y = 23 * TILE_SIZE + TILE_SIZE / 2;
        pacman.direction = DIRECTIONS.RIGHT; // Start facing right
        pacman.dx = pacman.direction.dx * PACMAN_SPEED;
        pacman.dy = pacman.direction.dy * PACMAN_SPEED;
        score = 0;
        lives = 3;
        scoreElement.textContent = score;
        livesElement.textContent = lives;
    }

    /**
     * The main game loop.
     */
    function gameLoop() {
        update();
        drawMap();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    initGame();
    gameLoop();
});