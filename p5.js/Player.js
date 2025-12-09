// Player.js 每個遊戲中的實體（例如玩家、敵人）都應該是一個獨立的類別。
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 40;
    }

    update() {
        // 讀取 p5.js 的全局變數來更新位置
        this.x = constrain(mouseX, 0, width);
        this.y = constrain(mouseY, 0, height);
    }

    display() {
        // 繪製自己的外觀
        fill(mouseIsPressed ? 0 : 100);
        ellipse(this.x, this.y, this.size, this.size);
    }
    
    // 可選：提供一個方法來獲取要傳送的網路狀態
    getNetworkState() {
        return {
            x: this.x / width,
            y: this.y / height
        };
    }
}