const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 5;

const game = {
    playerScore: 0,
    computerScore: 0,
    gameWon: false
};

const paddle1 = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const paddle2 = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5
};

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle (keyboard or mouse)
function updatePaddle1() {
    // Keyboard controls
    if (keys['ArrowUp'] && paddle1.y > 0) {
        paddle1.y -= paddle1.speed;
    }
    if (keys['ArrowDown'] && paddle1.y < canvas.height - paddle1.height) {
        paddle1.y += paddle1.speed;
    }
    
    // Mouse control (optional, can work alongside keyboard)
    const mouseThreshold = 30;
    if (mouseY < paddle1.y + mouseThreshold && paddle1.y > 0) {
        paddle1.y -= paddle1.speed * 0.7;
    }
    if (mouseY > paddle1.y + paddle1.height - mouseThreshold && paddle1.y < canvas.height - paddle1.height) {
        paddle1.y += paddle1.speed * 0.7;
    }
}

// Update computer paddle (AI)
function updatePaddle2() {
    const paddle2Center = paddle2.y + paddle2.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: follow the ball with slight delay
    if (ballCenter < paddle2Center - 20) {
        if (paddle2.y > 0) {
            paddle2.y -= paddle2.speed;
        }
    } else if (ballCenter > paddle2Center + 20) {
        if (paddle2.y < canvas.height - paddle2.height) {
            paddle2.y += paddle2.speed;
        }
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Clamp ball position to prevent it getting stuck
        if (ball.y - ball.radius < 0) ball.y = ball.radius;
        if (ball.y + ball.radius > canvas.height) ball.y = canvas.height - ball.radius;
    }
    
    // Paddle collision
    if (checkPaddleCollision(paddle1)) {
        ball.dx = -ball.dx;
        ball.x = paddle1.x + paddle1.width + ball.radius;
        // Add angle based on where ball hits paddle
        const deltaY = ball.y - (paddle1.y + paddle1.height / 2);
        ball.dy += deltaY * 0.1;
    }
    
    if (checkPaddleCollision(paddle2)) {
        ball.dx = -ball.dx;
        ball.x = paddle2.x - ball.radius;
        // Add angle based on where ball hits paddle
        const deltaY = ball.y - (paddle2.y + paddle2.height / 2);
        ball.dy += deltaY * 0.1;
    }
    
    // Scoring
    if (ball.x < 0) {
        game.computerScore++;
        resetBall();
        updateScore();
    }
    
    if (ball.x > canvas.width) {
        game.playerScore++;
        resetBall();
        updateScore();
    }
}

// Check collision between ball and paddle
function checkPaddleCollision(paddle) {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = game.playerScore;
    document.getElementById('computerScore').textContent = game.computerScore;
    
    // Check for win condition
    if (game.playerScore >= 11) {
        alert('🎉 You Win! Final Score: ' + game.playerScore + ' - ' + game.computerScore);
        resetGame();
    } else if (game.computerScore >= 11) {
        alert('💻 Computer Wins! Final Score: ' + game.playerScore + ' - ' + game.computerScore);
        resetGame();
    }
}

// Reset game
function resetGame() {
    game.playerScore = 0;
    game.computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBall();
}

// Draw functions
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.closePath();
    
    // Draw glow effect on ball
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
}

// Game loop
function gameLoop() {
    updatePaddle1();
    updatePaddle2();
    updateBall();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
