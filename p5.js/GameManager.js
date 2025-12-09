class GameManager {
    constructor(networkManager) {
        this.network = networkManager;
        this.player = new Player(width / 2, height / 2); // 遊戲物件的實例
        this.lastSendFrame = 0;
        this.sendRate = 3; // 每 3 幀傳送一次

        // 可以在這裡設定 NetworkManager 接收訊息時的回調
        // (更複雜的系統會使用自定義事件或觀察者模式)
    }

    update() {
        // 1. 處理玩家輸入和更新玩家位置
        this.player.update(); 

        // 2. 處理遊戲邏輯 (碰撞、得分等)
        // ...

        // 3. 處理網路資料傳送
        this.handleNetworkSend();
    }

    display() {
        // 繪製所有遊戲物件
        this.player.display();
    }

    handleNetworkSend() {
        if (frameCount % this.sendRate === 0) {
            const payload = {
                x: this.player.x / width,
                y: this.player.y / height,
                click: mouseIsPressed // 使用全局變數沒關係，但更好的做法是從 Player 物件獲取狀態
            };
            this.network.sendData(payload);
        }
    }
    
    // 處理滑鼠點擊事件 (從 sketch.js 委託過來)
    handleMousePressed() {
        // ... 處理點擊遊戲邏輯
    }
}