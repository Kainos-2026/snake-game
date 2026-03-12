// Get canvas element and 2D rendering context for drawing
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Get references to HTML elements for score and start button
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

// Game constants
const gridSize = 20; // Size of each grid cell in pixels
const tileCount = canvas.width / gridSize; // Number of tiles in each dimension (20x20)

// Game state variables
let snake = [
    {x: 10, y: 10} // Snake starts as single segment at center
];
let food = {}; // Current food position
let obstacles = []; // Array to store obstacle positions
let powerUps = []; // Array to store power-up positions
let dx = 0; // Direction change in x-axis (-1, 0, or 1)
let dy = 0; // Direction change in y-axis (-1, 0, or 1)
let score = 0; // Current game score
let highScore = localStorage.getItem('snakeHighScore') || 0; // High score from localStorage
let gameRunning = false; // Flag to track if game is active
let paused = false; // Flag to track if game is paused
let level = 1; // Current game level
let speedBoost = false; // Flag for speed boost power-up
let speedBoostTimer = 0; // Timer for speed boost duration

/**
 * Generate random tile coordinates within the game grid
 * @returns {number} Random tile position (0-19)
 */
function randomTile() {
    return Math.floor(Math.random() * tileCount);
}

/**
 * Place food at a random position on the grid
 */
function generateFood() {
    food = {
        x: randomTile(),
        y: randomTile()
    };
}

/**
 * Generate obstacles at random positions on the grid
 * Creates 5 obstacles that don't overlap with snake or food
 */
function generateObstacles() {
    obstacles = [];
    const numObstacles = 5;
    
    while (obstacles.length < numObstacles) {
        const obstacle = {
            x: randomTile(),
            y: randomTile()
        };
        
        // Check if obstacle overlaps with snake
        let overlapsSnake = snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y);
        
        // Check if obstacle overlaps with food
        let overlapsFood = food.x === obstacle.x && food.y === obstacle.y;
        
        // Check if obstacle overlaps with existing obstacles
        let overlapsObstacle = obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y);
        
        // Only add obstacle if it doesn't overlap
        if (!overlapsSnake && !overlapsFood && !overlapsObstacle) {
            obstacles.push(obstacle);
        }
    }
}

/**
 * Generate power-ups at random positions on the grid
 * Creates 3 power-ups that don't overlap with snake, food, or obstacles
 */
function generatePowerUps() {
    powerUps = [];
    const numPowerUps = 3;
    
    while (powerUps.length < numPowerUps) {
        const powerUp = {
            x: randomTile(),
            y: randomTile()
        };
        
        // Check if power-up overlaps with snake
        let overlapsSnake = snake.some(segment => segment.x === powerUp.x && segment.y === powerUp.y);
        
        // Check if power-up overlaps with food
        let overlapsFood = food.x === powerUp.x && food.y === powerUp.y;
        
        // Check if power-up overlaps with obstacles
        let overlapsObstacle = obstacles.some(obs => obs.x === powerUp.x && obs.y === powerUp.y);
        
        // Only add power-up if it doesn't overlap
        if (!overlapsSnake && !overlapsFood && !overlapsObstacle) {
            powerUps.push(powerUp);
        }
    }
}

/**
 * Draw the game board, snake, food, and obstacles on the canvas
 */
function drawGame() {
    // Clear canvas with black background
    ctx.fillStyle = '##FFFFF0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake in green
    ctx.fillStyle = '#f00';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw food in red
    ctx.fillStyle = '#0f0';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    
    // Draw obstacles in blue
    ctx.fillStyle = '#a9a9a9';
    for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw power-ups in yellow
    ctx.fillStyle = '#ff0';
    for (let powerUp of powerUps) {
        ctx.fillRect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize - 2, gridSize - 2);
    }
}

/**
 * Update snake position and handle collision/food detection
 */
function moveSnake() {
    // Calculate new head position based on current direction
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Check collision with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check collision with snake body (self-collision)
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    // Check collision with obstacles
    for (let obstacle of obstacles) {
        if (head.x === obstacle.x && head.y === obstacle.y) {
            gameOver();
            return;
        }
    }

    // Add new head to the front of snake
    snake.unshift(head);

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        score += 10; // Increase score
        scoreElement.textContent = score; // Update score display
        generateFood(); // Place new food
    } else {
        // Remove tail if food wasn't eaten (keeps snake same length)
        snake.pop();
    }

    // Check if snake collected a power-up
    for (let i = 0; i < powerUps.length; i++) {
        const powerUp = powerUps[i];
        if (head.x === powerUp.x && head.y === powerUp.y) {
            // Activate speed boost for 5 seconds
            speedBoost = true;
            speedBoostTimer = 50; // 50 frames at 10 FPS = 5 seconds
            powerUps.splice(i, 1); // Remove power-up after collection
            break;
        }
    }

    // Handle speed boost timer
    if (speedBoost) {
        speedBoostTimer--;
        if (speedBoostTimer === 0) {
            speedBoost = false;
        }
    }
}

/**
 * Handle game over condition
 */
function gameOver() {
    gameRunning = false;
    alert('Game Over! Score: ' + score);
    resetGame();
}

/**
 * Reset game to initial state
 */
function resetGame() {
    snake = [{x: 10, y: 10}]; // Reset snake to single segment
    dx = 1; // Start moving right
    dy = 0;
    score = 0; // Reset score
    scoreElement.textContent = score; // Update score display
    generateFood(); // Generate new food
    generateObstacles(); // Generate new obstacles
    generatePowerUps(); // Generate new power-ups
}

/**
 * Main game loop - called repeatedly to update and draw game state
 */
function gameLoop() {
    if (!gameRunning) return;

    moveSnake();
    drawGame();
}

/**
 * Handle arrow key input to change snake direction
 * @param {KeyboardEvent} event - Keyboard event object
 */
function changeDirection(event) {
    if (!gameRunning) return;

    // Key codes for arrow keys
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    // Check current direction to prevent illegal moves (e.g., going left when going right)
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    // Update direction based on key pressed and current direction
    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// Start button click handler
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        resetGame();
        gameLoop(); // Draw initial state
        // Set game loop to run every 200ms (controls snake speed)
        setInterval(gameLoop, 250);
    }
});

// Add keyboard listener for direction changes
document.addEventListener('keydown', changeDirection);

// Initialize game
generateFood();
drawGame();
