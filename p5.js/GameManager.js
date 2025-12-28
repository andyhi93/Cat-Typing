class GameManager {
    constructor(networkManager) {
        this.network = networkManager;

        // 速度
        this.worldSpeed = 0;
        this.maxWorldSpeed = 5;
        this.baseGameSpeed = 2;
        this.gameSpeed = this.baseGameSpeed;

        this.baseSpawnInterval = 1800;
        this.intervalStep = 300;
        this.pointsPerLevel = 3;

        // 角色
        this.baseY = 240;
        this.cat = new Cat(100, this.baseY, 40);
        this.pendingAction = null;

        // 障礙物
        this.obstacleManager = new ObstacleManager(this.gameSpeed, this.baseY);

        // 狀態
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;

        // 碰撞
        this.collision = false;
        this.collisionTimer = 0;
        this.collisionDuration = 500;

        // 輸入
        this.currentWord = null;
        this.inputDisplay = null;
        this.inputMode = "GAME"; // GAME | RESTART
        this.questionStartTime = 0;
        this.questionTimeLimit = 5000;

        // 網路
        this.sendRate = 6;
        // this.gameOverSent = false; // 這行可以移除了，因為我們要持續傳送

        // 跳躍
        this.jumpTriggerDistance = 60;
    }

    setInputDisplay(displayInstance) {
        this.inputDisplay = displayInstance;
    }

    /* =========================
       Update (邏輯核心修改)
    ========================= */
    update() {
        if (!this.inputDisplay) return;

        // 1. 碰撞旗標自動復原 (通用邏輯)
        if (this.collision && millis() - this.collisionTimer > this.collisionDuration) {
            this.collision = false;
        }

        // 2. 區分狀態：如果是 Game Over，只處理靜止邏輯；如果是遊戲中，處理物理邏輯
        if (this.isGameOver) {
            // --- [Game Over 狀態] ---
            this.gameSpeed = 0;
            this.worldSpeed = 0;
            // 這裡不再 return，程式會繼續往下跑去發送網路訊號

        } else {
            // --- [正在遊玩狀態] --- (原本的物理邏輯搬到這裡)
            
            // 速度計算
            const level = Math.floor(this.score / this.pointsPerLevel);
            this.worldSpeed = Math.min(level, this.maxWorldSpeed);
            this.gameSpeed = this.baseGameSpeed + this.worldSpeed;

            const spawnInterval =
                this.baseSpawnInterval - this.worldSpeed * this.intervalStep;

            this.obstacleManager.setSpawnInterval(spawnInterval);
            this.obstacleManager.setGameSpeed(this.gameSpeed);
            this.obstacleManager.update();

            const q = this.obstacleManager.currentQuestion;

            // 延遲跳躍
            if (
                q &&
                q.isPassed &&
                this.pendingAction === "jump" &&
                q.x < this.cat.x + this.jumpTriggerDistance
            ) {
                this.cat.jump();
                this.pendingAction = null;
                this.obstacleManager.clearCurrentQuestion();
            }

            // 碰撞檢測
            if (this.obstacleManager.checkCollision(this.cat.x)) {
                this.loseLife();
                // 這裡的 return 可以保留，因為 loseLife 會改變狀態，下一幀就會進入 Game Over 邏輯
                // 但為了確保這一幀也能傳送 "HIT"，建議不要 return，或者確保 loseLife 裡有發送
                // 這裡暫時保留 return 避免邏輯衝突，反正 loseLife 裡面有 handleNetworkSend("HIT")
                return; 
            }

            // 題目更新
            if (q && !q.isPassed && this.currentWord !== q.data.word) {
                this.currentWord = q.data.word;
                this.inputDisplay.setWord(this.currentWord);
                this.inputMode = "GAME";
                this.questionStartTime = millis();
            }

            // 超時
            if (this.currentWord && !q?.isPassed) {
                const elapsed = millis() - this.questionStartTime;
                if (elapsed > this.questionTimeLimit) {
                    this.loseLife();
                }
            }
        }

        // 3. 統一發送網路訊號 (無論是 PLAYING 還是 GAME_OVER 這裡都會執行)
        // 根據狀態決定發送的字串
        const currentStatus = this.isGameOver ? "GAME_OVER" : "PLAYING";
        this.handleNetworkSend(currentStatus);
    }

    /* =========================
       Input
    ========================= */
    handleKey(key) {
        if (!this.inputDisplay) return;
        if (!key || !/[a-zA-Z]/.test(key)) return;

        const correct = this.inputDisplay.tryInput(key.toUpperCase());

        // 遊戲中打錯才送 MISTAKE，Game Over 打錯就不送了以免干擾
        if (!correct && this.inputMode === "GAME") {
            this.handleNetworkSend("MISTAKE");
        }

        if (this.inputDisplay.isCompleted()) {
            if (this.inputMode === "GAME") {
                this.onWordSuccess();
            } else if (this.inputMode === "RESTART") {
                this.restartGame();
            }
        }
    }

    /* =========================
       題目成功
    ========================= */
    onWordSuccess() {
        const q = this.obstacleManager.currentQuestion;
        if (!q) return;

        this.score++;
        this.currentWord = null;

        if (q.data.type === "action" && q.data.action === "jump") {
            this.cat.setState(CatState.JUMP, q.data.color);
            this.pendingAction = "jump";
            q.isPassed = true;
        } else {
            this.cat.setState(q.data.state, q.data.color);
            q.isPassed = true;
            this.obstacleManager.currentQuestion = null;
        }

        this.handleNetworkSend("PASS");
    }

    /* =========================
       失敗 / Game Over
    ========================= */
    loseLife() {
        this.lives--;
        this.cat.setState(CatState.CROUCH, [200, 50, 50]);

        this.obstacleManager.resolveCollision();
        this.currentWord = null;

        this.collision = true;
        this.collisionTimer = millis();

        this.handleNetworkSend("HIT");

        if (this.lives <= 0) {
            this.isGameOver = true;
            this.inputMode = "RESTART";
            
            // 設定 RESTART 讓玩家打字
            this.inputDisplay.setWord("RESTART");
            this.inputDisplay.resetProgress();

            this.inputDisplay.x = width / 2;
            this.inputDisplay.y = height / 2 + 40;
            
            // 這裡發送一次 GAME_OVER 通知狀態切換
            this.handleNetworkSend("GAME_OVER");
        }
    }

    /* =========================
       Restart
    ========================= */
    restartGame() {
        this.isGameOver = false;
        // this.gameOverSent = false; // 移除
        this.inputMode = "GAME";

        this.score = 0;
        this.lives = 3;
        this.worldSpeed = 0;
        this.gameSpeed = this.baseGameSpeed;

        this.currentWord = null;
        this.pendingAction = null;

        this.cat.y = this.baseY;
        this.cat.vy = 0;
        this.cat.isJumping = false;
        this.cat.setState(CatState.RUN, [255, 180, 0]);

        this.obstacleManager.reset();

        this.inputDisplay.x = width / 2;
        this.inputDisplay.y = 80;
        this.inputDisplay.clear();

        this.handleNetworkSend("RESTART");
    }

    /* =========================
       Render
    ========================= */
    display() {
        this.drawGround();
        this.obstacleManager.display();
        this.cat.display();

        fill(50);
        textSize(20);
        text(`Score: ${this.score}`, 10, 30);
        text(`Lives: ${this.lives}`, 10, 55);

        if (this.isGameOver) {
            push();
            textAlign(CENTER, CENTER);
            textSize(48);
            fill(255, 0, 0);
            text("GAME OVER", width / 2, height / 2 - 60);

            textSize(24);
            fill(50);
            text(`Final Score: ${this.score}`, width / 2, height / 2 - 20);
            pop();
        }

        if (this.inputDisplay) this.inputDisplay.display();
    }

    drawGround() {
        const groundY = this.baseY + this.cat.size / 2;
        stroke(100);
        line(0, groundY, width, groundY);

        const spacing = 40;
        const offset = (frameCount * this.gameSpeed) % spacing;

        for (let i = -offset; i < width; i += spacing) {
            line(i, groundY - 5, i + 10, groundY);
        }
    }

    /* =========================
       Network
    ========================= */
    handleNetworkSend(status = "PLAYING") {
        // 修改判斷：只要是這幾個狀態，都要允許傳送
        // 這樣在 GAME_OVER 期間打字，TD 才能收到更新的 typedText
        const allowedStatuses = ["PLAYING", "GAME_OVER", "HIT", "PASS", "MISTAKE", "RESTART"];
        
        if (frameCount % this.sendRate !== 0 && !allowedStatuses.includes(status)) {
             // 如果不是定期發送，且狀態不在允許列表內，才擋掉
             if (status === "PLAYING" || status === "GAME_OVER") return;
        }
        
        // 為了效能，你可以考慮在這裡加回上一題提到的 CatStateReverseMap
        // 這裡暫時維持你原本的寫法
        const q = this.obstacleManager.getReportableObstacle();

        const payload = {
            status,

            catState:
                Object.keys(CatState).find(k => CatState[k] === this.cat.state) || "RUN",

            inputMode: this.inputMode,             
            
            // 確保這兩個欄位有值
            targetWord: this.inputDisplay?.word ?? "",
            typedText: this.inputDisplay?.word
                ? this.inputDisplay.word.slice(0, this.inputDisplay.progress)
                : "",
            
            // [建議] 把上一題的 nextChar 加回來，這樣 TD 提示會更完整
            //nextChar: this.inputDisplay ? this.inputDisplay.getNextChar() : "",

            obstacleX: q ? q.x / width : -1,
            obstacleY: q ? q.y / height : -1,
            obstacleName: q?.obstacleName ?? "",

            worldSpeed: this.worldSpeed / this.maxWorldSpeed,
            gameSpeed: this.gameSpeed,
            catY: this.cat.y / height,
            score: this.score,
            lives: this.lives,
            collision: this.collision
        };

        if (this.network && this.network.socket?.readyState === WebSocket.OPEN) {
            this.network.sendData(payload);
        }
    }
}