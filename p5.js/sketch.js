//(主程式)
// 宣告全域變數來持有主要系統的實例
let gameManager;
let networkManager;

function setup() {
  createCanvas(400, 400);

  // 1. 初始化網路連線系統
  // 伺服器連線邏輯全部放在 NetworkManager 類別中
  networkManager = new NetworkManager('ws://localhost:9980');

  // 2. 初始化遊戲管理系統
  // 遊戲狀態、玩家、物件等邏輯全部放在 GameManager 類別中
  gameManager = new GameManager(networkManager);
}

function draw() {
  background(220);

  // 3. 更新遊戲狀態 (處理輸入、物理計算等)
  gameManager.update();
  
  // 4. 繪製遊戲畫面
  gameManager.display();
}

// 可選：將使用者輸入事件也委託給 GameManager 處理
function mousePressed() {
    gameManager.handleMousePressed();
}
// ... 其他事件 (keyPressed, mouseReleased 等)