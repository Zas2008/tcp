// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 800;

// Game state
const state = {
    circles: [],
    balls: [],
    gravity: 0.5,
    rotationSpeed: 1,
    lastCircleTime: 0,
    circleInterval: 2000 // ms between new circles
};

// Circle class
class Circle {
    constructor(x, y, radius, gapSize) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.gapSize = gapSize; // in radians
        this.gapPosition = Math.random() * Math.PI * 2; // random starting gap position
        this.rotationSpeed = state.rotationSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    update() {
        this.gapPosition += 0.01 * this.rotationSpeed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw the gap by drawing an arc with a gap
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.gapPosition, this.gapPosition + this.gapSize);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
        ctx.stroke();
    }

    contains(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance < this.radius;
    }
}

// Ball class
class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityY = 0;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.passedThrough = new Set(); // Track which circles this ball has passed through
    }

    update() {
        this.velocityY += state.gravity;
        this.y += this.velocityY;

        // Check for collisions with circles
        for (const circle of state.circles) {
            if (!this.passedThrough.has(circle)) {
                const distance = Math.sqrt((this.x - circle.x) ** 2 + (this.y - circle.y) ** 2);
                const isInsideCircle = distance < circle.radius - this.radius;
                
                if (isInsideCircle) {
                    // Calculate angle from center of circle to ball
                    const angle = Math.atan2(this.y - circle.y, this.x - circle.x);
                    
                    // Normalize angle to [0, 2π]
                    let normalizedAngle = (angle - circle.gapPosition + Math.PI * 2) % (Math.PI * 2);
                    
                    // Check if ball is in the gap
                    if (normalizedAngle >= 0 && normalizedAngle <= circle.gapSize) {
                        this.passedThrough.add(circle);
                    } else {
                        // Bounce off the circle
                        this.y = circle.y + (circle.radius - this.radius) * Math.sin(angle);
                        this.velocityY *= -0.7; // Bounce with some energy loss
                    }
                }
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.stroke();
    }

    isOutOfBounds() {
        return this.y > canvas.height + this.radius;
    }
}

// Initialize game
function init() {
    state.circles = [];
    state.balls = [];
    
    // Add initial circle
    addCircle(canvas.width / 2, 200, 150, Math.PI / 4);
    
    // Add initial ball
    addBall(canvas.width / 2, 50);
}

function addCircle(x, y, radius, gapSize) {
    state.circles.push(new Circle(x, y, radius, gapSize));
}

function addBall(x, y) {
    const radius = 15 + Math.random() * 10;
    state.balls.push(new Ball(x, y, radius));
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw circles
    state.circles.forEach(circle => {
        circle.update();
        circle.draw();
    });
    
    // Update and draw balls
    state.balls.forEach(ball => {
        ball.update();
        ball.draw();
    });
    
    // Remove balls that are out of bounds
    state.balls = state.balls.filter(ball => !ball.isOutOfBounds());
    
    // Add new circles periodically
    const now = Date.now();
    if (now - state.lastCircleTime > state.circleInterval && state.balls.length > 0) {
        const lastCircle = state.circles[state.circles.length - 1];
        addCircle(canvas.width / 2, lastCircle.y + 300, 150, Math.PI / 4);
        state.lastCircleTime = now;
    }
    
    // When a ball passes through a circle, potentially spawn more balls
    state.balls.forEach(ball => {
        if (ball.passedThrough.size === state.circles.length && state.circles.length > 0) {
            // Ball passed through all circles - spawn more balls
            if (Math.random() < 0.3) {
                addBall(canvas.width / 2 + (Math.random() - 0.5) * 50, 50);
            }
        }
    });
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('addBall').addEventListener('click', () => {
    addBall(canvas.width / 2 + (Math.random() - 0.5) * 50, 50);
});

document.getElementById('reset').addEventListener('click', init);

document.getElementById('speedControl').addEventListener('input', (e) => {
    state.rotationSpeed = parseFloat(e.target.value);
    state.circles.forEach(circle => {
        circle.rotationSpeed = state.rotationSpeed * (Math.random() > 0.5 ? 1 : -1);
    });
});

// Start the game
init();
gameLoop();
