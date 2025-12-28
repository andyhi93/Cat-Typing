class InputDisplay {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.word = '';
        this.progress = 0; // 已正確輸入的字母數
    }

    // 設定新題目
    setWord(word) {
        this.word = word;
        this.progress = 0;
    }

    // 嘗試輸入一個字母
    tryInput(key) {
        if (!this.word) return false;

        const expectedChar = this.word[this.progress];
        if (key === expectedChar) {
            this.progress++;
            return true; // 打對
        }
        return false; // 打錯（不懲罰）
    }

    // 是否完成整個單字
    isCompleted() {
        return this.word && this.progress >= this.word.length;
    }

    display() {
        if (!this.word) return;

        push();
        textAlign(CENTER, CENTER);
        textSize(40);
        strokeWeight(2);

        // 計算置中顯示
        const letterSpacing = 28;
        const startX = this.x - (this.word.length - 1) * letterSpacing / 2;

        for (let i = 0; i < this.word.length; i++) {
            const charX = startX + i * letterSpacing;

            if (i < this.progress) {
                // ✅ 已完成字母：填色
                noStroke();
                fill(50, 150, 255);
            } else {
                // ⭕ 未完成字母：只有外框（簍空）
                noFill();
                stroke(120);
            }

            text(this.word[i], charX, this.y);
        }

        pop();
    }
  resetProgress() {
    this.progress = 0;
}

clear() {
    this.word = "";
    this.progress = 0;
}

}
