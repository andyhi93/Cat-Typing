// InputDisplay.js

class InputDisplay {
    constructor(x, y) {
        this.currentInput = '';
        this.x = x;
        this.y = 100;
        this.maxLength = 15; 
    }

    addKey(key) {
        if (key.match(/[a-zA-Z]/) && this.currentInput.length < this.maxLength) {
            this.currentInput += key.toUpperCase();
        }
    }

    // 處理刪除
    backspace() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.substring(0, this.currentInput.length - 1);
        }
    }

    // 取得當前輸入的內容
    getInput() {
        return this.currentInput || '';
    }

    // 清空輸入
    clearInput() {
        this.currentInput = '';
    }

    display() {
        push();
        textSize(36);
        textAlign(CENTER);
        fill(50, 50, 200); // 輸入文字顏色
        text(this.currentInput, this.x, this.y);
        pop();
    }
}