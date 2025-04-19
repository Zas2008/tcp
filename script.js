// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 800;

// Game state
const state = {
    circle: null,
    balls: [],
    gravity: 0.5,
    rotationSpeed: 1
};

// Circle class
class Circle {
    constructor(x, y, radius, gapSize) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.gapSize = gapSize; // in radians
        this.gapPosition = Math.PI; // gap starts at the bottom
        this.rotationSpeed = state.rotationSpeed;
        this.color = '#3498db';
    }

    update() {
        this.gapPosition += 0.01 * this.rotationSpeed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.stroke();

        // Draw the gap (invisible part)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.gapPosition, this.gapPosition + this.gapSize);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
        ctx.stroke();
    }
}

// Ball class
class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityY = 0;
        this.color = '#e74c3c';
        this.hasPassed = false; // Track if ball has passed through the gap
    }

    update() {
        this.velocityY += state.gravity;
        this.y += this.velocityY;

        // Check collision with circle
        if (state.circle) {
            const distance = Math.sqrt((this.x - state.circle.x) ** 2 + (this.y - state.circle.y) ** 2);
            const isInsideCircle = distance < state.circle.radius - this.radius;

            if (isInsideCircle && !this.hasPassed) {
                // Calculate angle from center of circle to ball
                const angle = Math.atan2(this.y - state.circle.y, this.x - state.circle.x);
                
                // Normalize angle to match gapPosition
                let normalizedAngle = (angle - state.circle.gapPosition + Math.PI * 2) % (Math.PI * 2);
                
                // Check if ball is in the gap
                if (normalizedAngle >= 0 && normalizedAngle <= state.circle.gapSize) {
                    this.hasPassed = true;
                } else {
                    // Bounce off the circle
                    this.y = state.circle.y + (state.circle.radius - this.radius) * Math.sin(angle);
                    this.velocityY *= -0.7; // Bounce with energy loss
                }
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    isOutOfBounds() {
        return this.y > canvas.height + this.radius;
    }
}

// Initialize game
function init() {
    state.circle = new Circle(canvas.width / 2, canvas.height / 2, 200, Math.PI / 3);
    state.balls = [new Ball(canvas.width / 2, 100, 20)];
}

function spawnNewBalls() {
    // Remove the old ball
    state.balls = state.balls.filter(ball => !ball.hasPassed);
    
    // Spawn two new balls in the center
    state.balls.push(
        new Ball(canvas.width / 2 - 15, state.circle.y, 15),
        new Ball(canvas.width / 2 + 15, state.circle.y, 15)
    );
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw circle
    state.circle.update();
    state.circle.draw();
    
    // Update and draw balls
    state.balls.forEach(ball => {
        ball.update();
        ball.draw();
        
        // Check if ball passed through and is below the circle
        if (ball.hasPassed && ball.y > state.circle.y + state.circle.radius) {
            spawnNewBalls();
        }
    });
    
    // Remove balls that are out of bounds
    state.balls = state.balls.filter(ball => !ball.isOutOfBounds());
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('addBall').addEventListener('click', () => {
    state.balls.push(new Ball(canvas.width / 2, 100, 15 + Math.random() * 10));
});

document.getElementById('reset').addEventListener('click', init);

document.getElementById('speedControl').addEventListener('input', (e) => {
    state.rotationSpeed = parseFloat(e.target.value);
    state.circle.rotationSpeed = state.rotationSpeed;
});

// Start the game
init();
gameLoop();
