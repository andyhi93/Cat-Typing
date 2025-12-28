const WORD_LIST = [
    {
        word: "JUMP",
        type: "action",
        state: CatState.RUN,
        action: "jump",
        color: [255, 200, 0], // 黃色（動作提示）
        obstacles: ["sofa", "LaundryBasket"]
    },
    {
        word: "NAP",
        type: "state",
        state: CatState.NAP,
        color: [120, 120, 255], // 藍色（休息）
        obstacles: ["Table", "lamp"]
    },
    {
        word: "BOWLING",
        type: "state",
        state: CatState.BOWLING,
        color: [200, 150, 100], // 咖啡色（保齡球）
        obstacles: ["bowlingPins"]
    },
    {
        word: "SQUADE",
        type: "card",
        state: CatState.SQUADE,
        color: [0, 0, 0], // 黑色
        obstacles: ["Squade"]
    },
    {
        word: "HEART",
        type: "card",
        state: CatState.HEART,
        color: [255, 0, 0], // 紅色
        obstacles: ["Heart"]
    },
    {
        word: "DIAMOND",
        type: "card",
        state: CatState.DIAMOND,
        color: [255, 80, 80], // 淺紅
        obstacles: ["Diamond"]
    },
    {
        word: "CLUB",
        type: "card",
        state: CatState.CLUB,
        color: [0, 120, 0], // 綠色
        obstacles: ["Club"]
    }
];



class ObstacleManager {
    constructor(gameSpeed, catY) {
        this.gameSpeed = gameSpeed;
        this.catY = catY;
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.currentQuestion = null;
        this.lastWord = null;
        this.questionPool = WORD_LIST;
        this.playerScore = 0;
        
        this.cooldownTimer = 0; 
        this.spawnDelay = 500; 
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    setSpawnInterval(interval) { }

    setScore(score) {
        this.playerScore = score;
    }

    update() {
        // 1. 移動現有障礙物
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            // 只有當障礙物完全跑出地圖左側 (x < -100) 才移除
            if (obs.x < -100) {
                this.obstacles.splice(i, 1); 
                
                if (this.currentQuestion === obs) {
                    this.currentQuestion = null;
                }
                
                this.cooldownTimer = millis();
            }
        }

        // 2. 生成邏輯
        if (this.obstacles.length === 0) {
            if (millis() - this.cooldownTimer > this.spawnDelay) {
                this.spawnNewQuestion();
            }
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

        const obstacleName = q.obstacles ? random(q.obstacles) : null;

        const newObstacle = {
            x: width + 80,
            y: this.catY,
            data: q,
            obstacleName: obstacleName,
            isPassed: false, // 答對
            isHit: false     // 新增：是否已撞擊
        };

        this.obstacles.push(newObstacle);
        this.currentQuestion = newObstacle;
    }

    // [原本的方法] 答對時呼叫：變淡
    clearCurrentQuestion() {
        if (this.currentQuestion) {
            this.currentQuestion.isPassed = true;
        }
        this.currentQuestion = null; 
    }

    // [新增的方法] 撞到時呼叫：保持原樣 (不變淡)
    resolveCollision() {
        if (this.currentQuestion) {
            this.currentQuestion.isHit = true; 
            // 注意：這裡我們「不」設 isPassed = true，這樣繪圖時可以區分
        }
        this.currentQuestion = null; // 解除鎖定，讓它繼續移動，不再觸發新的檢查
    }
  getReportableObstacle() {
        // 1. 如果有正在進行的題目，優先回傳它
        if (this.currentQuestion) return this.currentQuestion;

        // 2. 如果 currentQuestion 是 null (例如已經撞到或答對)，
        // 但陣列裡還有東西 (代表障礙物還沒跑出畫面左邊)，回傳第一個障礙物
        if (this.obstacles.length > 0) {
            return this.obstacles[0];
        }

        // 3. 畫面完全空了
        return null;
    }

    checkCollision(catX) {
        if (!this.currentQuestion) return false;

        const hitMargin = 40;
        // 檢查條件：位置重疊 + 沒答對 + 沒撞過 (避免重複扣血)
        if (this.currentQuestion.x < catX - hitMargin && 
            !this.currentQuestion.isPassed && 
            !this.currentQuestion.isHit) {
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
        
        // --- 視覺邏輯修改 ---
        if (obs.isPassed) {
            // 情況A：答對 -> 變淡 (Ghost)
            stroke(120, 120); 
        } else if (obs.isHit) {
            // 情況B：撞到 -> 保持原色 (Solid)，或者你可以改成紅色 stroke(255, 0, 0)
            stroke(obs.data.color); 
            // 額外視覺提示：稍微加粗一點表示撞擊？
            strokeWeight(3);
        } else {
            // 情況C：正常過來
            stroke(obs.data.color);
            strokeWeight(1);
        }
        
        rect(obs.x, obs.y, 70, 45);
        pop();
    }
    reset() {
        this.obstacles = [];
        this.currentQuestion = null;
        this.lastWord = null;

        this.lastSpawnTime = millis();
        this.cooldownTimer = millis();
    }
}

