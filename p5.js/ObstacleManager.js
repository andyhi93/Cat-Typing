const WORD_LIST = [
    { word: "FISH", answer: "Cat snack", color: [255, 0, 0], state: CatState.JUMP },
    { word: "NAP", answer: "Favorite activity", color: [0, 0, 255], state: CatState.CROUCH },
    { word: "YARN", answer: "A round toy", color: [0, 255, 0], state: CatState.RUN },
    { word: "JUMP", answer: "Cross an obstacle", color: [255, 255, 0], state: CatState.POSE },
];

class ObstacleManager {
    constructor(gameSpeed, catY) {
        this.gameSpeed = gameSpeed;
        this.catY = catY;
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1800;
        this.currentQuestion = null;
        this.lastWord = null;
        this.questionPool = WORD_LIST;
    }

    update() {
        // 生成新題目
        if (!this.currentQuestion && millis() - this.lastSpawnTime > this.spawnInterval) {
            this.spawnNewQuestion();
        }

        // 移動障礙物
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            if (obs.x < -100) this.obstacles.splice(i, 1);
        }
    }

    display() {
        for (const obs of this.obstacles) this.drawObstacle(obs);
    }

    spawnNewQuestion() {
        let q;
        do {
            q = random(this.questionPool);
        } while (q.word === this.lastWord);
        this.lastWord = q.word;

        const newObstacle = {
            x: width + 80,
            y: this.catY,
            data: q,
            isPassed: false
        };
        this.obstacles.push(newObstacle);
        this.currentQuestion = newObstacle;
        this.lastSpawnTime = millis();
    }

    clearCurrentQuestion() {
        if (this.currentQuestion) this.currentQuestion.isPassed = true;
        this.currentQuestion = null;
        this.lastSpawnTime = millis(); // 重置計時，拉長下一題間隔
    }

    checkCollision(catX) {
        if (!this.currentQuestion) return false;

        const hitMargin = 40;
        if (this.currentQuestion.x < catX - hitMargin && !this.currentQuestion.isPassed) {
            return true;
        }
        return false;
    }

    drawObstacle(obs) {
        push();
        fill(obs.data.color);
        textSize(24);
        textAlign(CENTER);
        text(obs.data.word, obs.x, obs.y - 10);

        rectMode(CENTER);
        noFill();
        stroke(obs.data.color);
        if (obs.isPassed) stroke(120, 120);
        rect(obs.x, obs.y, 70, 45);
        pop();
    }
}
