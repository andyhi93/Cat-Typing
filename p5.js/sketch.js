// sketch.js (主程式)

let gameManager;
let networkManager;
let inputDisplay;

function setup() {
  createCanvas(600, 400);

  networkManager = new NetworkManager('ws://localhost:9980'); 
  gameManager = new GameManager(networkManager);

  inputDisplay = new InputDisplay(width / 2, height - 50);
  gameManager.setInputDisplay(inputDisplay);

}

function draw() {
  background(220);

  gameManager.update();
  gameManager.display();
}


function keyTyped() {

    gameManager.handleKey(key);

    return false;
}


function keyPressed() {
    if (keyCode === BACKSPACE) {
        gameManager.handleKey(null); // 傳遞 null 或其他標誌給 handleKey 處理
    }
}

