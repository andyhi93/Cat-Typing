class GameManager {
    constructor(networkManager) {
        this.network = networkManager;
        this.gameSpeed = 3;

        this.cat = new Cat(100, 350, 40);
        this.obstacleManager = new ObstacleManager(this.gameSpeed, this.cat.y);

        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;

        this.currentWord = '';
        this.inputDisplay = null;

        this.sendRate = 6;

        this.pauseDuration = 1000; // 暫停反應時間
        this.pauseUntil = 0;
    }

    setInputDisplay(displayInstance) {
        this.inputDisplay = displayInstance;
    }

update() {
    if (!this.inputDisplay) return;

    if (this.isGameOver) return;

    this.obstacleManager.update();

    if (this.obstacleManager.checkCollision(this.cat.x)) {
        this.loseLife();
        return;
    }

    const currentQ = this.obstacleManager.currentQuestion;
    if (currentQ && this.inputDisplay.getInput().length >= currentQ.data.word.length) {
        this.processInput(this.inputDisplay.getInput());
    }

    this.handleNetworkSend('PLAYING');
}

    processInput(input) {
        const currentQ = this.obstacleManager.currentQuestion;
        if (!currentQ || !currentQ.data || typeof currentQ.data.word !== 'string') return;

        const targetWord = currentQ.data.word;

        if (input === targetWord) {
            this.score++;
            this.currentWord = targetWord;

            this.cat.setState(currentQ.data.state, currentQ.data.color);
            this.inputDisplay.clearInput();

            this.pauseUntil = millis() + this.pauseDuration;
            this.obstacleManager.clearCurrentQuestion();
            this.handleNetworkSend('PASS');
        } else {
            this.loseLife();
        }
    }

loseLife() {
    this.lives--;
    this.inputDisplay.clearInput();

    this.cat.setState(CatState.CROUCH, [200, 50, 50]);

    // 清除當前題目
    this.obstacleManager.clearCurrentQuestion();

    this.handleNetworkSend('HIT');

    if (this.lives <= 0) {
        this.isGameOver = true;
        this.handleNetworkSend('GAME_OVER');
    }
}

display() {
    this.drawGround();
    this.obstacleManager.display();
    this.cat.display();
    if (this.inputDisplay) this.inputDisplay.display();

    fill(50);
    textSize(20);
    text(`Score: ${this.score}`, 10, 30);
    text(`Lives: ${this.lives}`, 10, 55);

    // 遊戲結束畫面
    if (this.isGameOver) {
        push();
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255, 0, 0);
        text("GAME OVER", width / 2, height / 2 - 40);
        textSize(24);
        fill(0);
        text(`Final Score: ${this.score}`, width / 2, height / 2 + 20);
        pop();
    }
}


    drawGround() {
        const groundY = this.cat.y + this.cat.size / 2;
        stroke(100);
        line(0, groundY, width, groundY);

        const spacing = 40;
        const offset = (frameCount * this.gameSpeed) % spacing;

        for (let i = -offset; i < width; i += spacing) {
            line(i, groundY - 5, i + 10, groundY);
        }
    }

    handleKey(key) {
        if (this.isGameOver || !this.inputDisplay) return;

        if (keyCode === BACKSPACE) {
            this.inputDisplay.backspace();
        } else if (key && key !== '' && key !== 'Enter') {
            this.inputDisplay.addKey(key);
        }
    }

    handleNetworkSend(status = 'PLAYING') {
        if (frameCount % this.sendRate !== 0 && status === 'PLAYING') return;

        const catStateName =
            Object.keys(CatState).find(k => CatState[k] === this.cat.state) || 'UNKNOWN';

        this.network.sendData({
            status,
            catState: catStateName,
            score: this.score,
            lives: this.lives,
            collision: this.isGameOver,
            inputWord: this.currentWord
        });

        this.currentWord = '';
    }
}
