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

            //console.log('Received:', message);
            
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