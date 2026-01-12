# 🐱 Cat Typing | 貓咪打字跑酷遊戲

> **結合 p5.js 遊戲邏輯與 TouchDesigner 視覺特效的互動打字遊戲。**
> 扮演一隻在家裡搗亂的「液體」貓咪，透過輸入單字避開障礙物，盡情破壞吧！

[![English](https://img.shields.io/badge/Language-English-gray)](README.md) [![Chinese](https://img.shields.io/badge/Language-繁體中文-blue)](#)

![Game Play Demo](mdImages/game_play.gif)

## 🎮 試玩連結 (Live Demo)

本專案核心邏輯運行於 p5.js，可於下方連結直接體驗網頁版原型：
👉 **[Cat Typing - p5.js Web Editor](https://editor.p5js.org/LoulouChan/sketches/oabdM3CcS)**

*(註：網頁版僅包含 p5.js 前端邏輯與基礎畫面，完整的粒子特效與動態美術需配合 TouchDesigner 本地端執行)*

> 🎬 **觀看完整 Demo 影片 (含音效)**: [YouTube Link](https://youtu.be/dUylrMOgpwo)

---

## 📖 專案簡介 (Overview)

**Cat Typing** 的靈感來自於 Google Chrome 的小恐龍遊戲，並結合了貓咪「液體化」的特性。
玩家需要觀察畫面上的單字提示，正確輸入字母來控制貓咪跳躍或做出動作（如 `JUMP`, `NAP`, `POSE`），以避開家中的各種障礙物。

### 核心玩法
* **打字互動**：輸入畫面顯示的單字來控制貓咪。
* **障礙閃避**：貓咪撞到障礙物會扣除生命值，生命歸零則遊戲結束（被主人抓到）。
* **雙平台整合**：利用 **WebSocket** 串聯網頁邏輯與生成式藝術視覺。

---

## 🛠️ 技術架構 (Tech Stack)

本專案採用 **前後端分離** 的概念進行開發：

| 元件 | 技術工具 | 負責功能 |
| :--- | :--- | :--- |
| **Game Logic** | **p5.js** | 遊戲迴圈、物理碰撞、輸入偵測、難度調整。 |
| **Visuals & Audio** | **TouchDesigner** | 粒子特效、美術合成、場景動態、音效控制。 |
| **Communication** | **WebSocket** | 傳送分數、生命值、貓咪狀態、輸入字串等。 |

### 資料傳輸流程
1.  **p5.js** 處理玩家輸入與物理碰撞，並將數據打包。
2.  透過 **WebSocket** 傳送 JSON 資料至本地伺服器。
3.  **TouchDesigner** 接收數據並驅動美術素材：
    * `serverData`: 接收分數、生命值、位置座標。
    * `game_status`: 接收貓咪狀態（跳躍/受傷）、輸入文字字串。

---

## 🎨 視覺與特效 (Visuals & Effects)

本專案的視覺核心由 **TouchDesigner** 驅動，重點特色包含：

### 1. 動態文字粒子
輸入的文字在 TD 中會轉化為粒子特效，隨著打字聚合與消散。

### 2. 貓咪狀態機與受傷回饋
當 p5.js 偵測到碰撞時，TD 會即時觸發貓咪「受傷」效果，並觸發畫面震動與音效。

![Hurt Effect](mdImages/hurt.gif)

### 3. 場景合成
* **Background**: 處理場景移動與晃動特效。
* **CatBox**: 處理貓咪動畫切換（Liquid animations）。
* **Obstacles**: 處理障礙物的圖片切換與移動。

---

## 📂 檔案結構 (File Structure)

### p5.js 端 (Game Physics)
* `GameManager.js`: 遊戲核心控制（Game Loop、狀態切換、整體邏輯）。
* `Cat.js`: 玩家角色物件（狀態管理、跳躍物理）。
* `ObstacleManager.js`: 障礙物生成、移動與碰撞判斷。
* `InputDisplay.js`: 輸入字串的顯示與驗證邏輯。
* `NetworkManager.js`: 處理 WebSocket 數據傳送。

### TouchDesigner 端 (Visual Engine)
* `WebServer`: 負責接收 p5.js 傳來的資料並解析。
* `TypeDetect`: 處理輸入邏輯來控制字體特效。
* `AudioController`: 處理背景音樂與音效播放。
* `Compositing`: 最終畫面整合與輸出。

---

## 👥 製作團隊 (Team)

| 姓名 | GitHub | 負責項目 |
| :--- | :--- | :--- |
| **謝博任** | [![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/andyhi93) | **TouchDesigner Visuals, Art & Audio**<br>TD 系統架構、美術素材繪製、粒子特效、畫面合成、WebSocket 資料串接接收。 |
| **陳昭瑄** | [![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/Kelu73) | **p5.js Programming & Physics**<br>主程式架構、遊戲物理機制、WebSocket 資料串接發送。 |

---

## 🚀 如何執行 (How to Run)

1.  Clone 此專案：
    ```bash
    git clone [https://github.com/andyhi93/Cat-Typing.git](https://github.com/andyhi93/Cat-Typing.git)
    ```
2.  **開啟 TouchDesigner**：打開 `.toe` 專案檔，確保 WebSocket Server 狀態為 Active。
3.  **執行 p5.js**：使用[Cat Typing - p5.js Web Editor](https://editor.p5js.org/LoulouChan/sketches/oabdM3CcS)或 VS Code (配合 Live Server) 開啟網頁。
4.  確保兩者連線成功，即可開始遊戲！

---

## ⚖️ 版權與授權 (License & Credits)

### 🎵 音樂與音效 (Audio Assets)
本專案為學術研究與教育用途，無任何商業行為。
* **背景音樂 (BGM)**: *Subway Surfers* Main Theme.
* **音效 (SFX)**: *Minecraft* Sound Effects.

### 🎨 美術素材授權 (Art License)
本專案之原創美術素材（包含角色動畫、場景圖）由 **謝博任 (Po-Jen Hsieh)** 繪製與設計。
採開源分享，歡迎使用或修改，唯需遵守以下規則：
* **姓名標示 (Attribution)**: 使用時請標註作者姓名與來源連結。

如果你使用了我的素材製作了有趣的專案，歡迎讓我知道！ 我會很開心看到這些圖被賦予新生命。你可以透過 GitHub Issue 或 Email 聯絡我。