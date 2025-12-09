class NetworkManager {
    constructor(serverUrl) {
        this.socket = null;
        this.serverUrl = serverUrl;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket(this.serverUrl);
        
        this.socket.onopen = () => {
            console.log('✅ Connected to Server');
        };

        this.socket.onerror = (e) => {
            console.log('❌ WS Error', e);
        };

        this.socket.onmessage = (event) => {
            // 收到伺服器訊息時的處理
            this.handleMessage(event.data);
        };
        
        this.socket.onclose = () => {
             console.log('🚪 Disconnected from Server');
             // 可選：嘗試重新連線
        };
    }

    // 處理接收到的資料
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            // 這裡可以根據訊息類型 (message.type) 將資料分發給其他系統
            // 例如：
            // if (message.type === 'player_update') {
            //     gameManager.updatePlayerState(message.payload);
            // }
            // 由於 NetworkManager 不知道 GameManager 的細節，通常會使用回調函數 (Callbacks) 或事件系統來通知。
            console.log('Received:', message);
            
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    }

    // 提供給外部系統傳送資料的方法
    sendData(payload) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(payload));
        } else {
            // console.warn('Socket not open, data not sent.');
        }
    }
}