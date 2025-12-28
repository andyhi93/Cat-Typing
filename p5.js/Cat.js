class Cat {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = [255, 180, 0]; // 初始顏色
        this.state = CatState.RUN;   // 初始狀態為 RUN
      
        //處理跳躍
        this.baseY = y;
        this.vy = -14;
        this.gravity = 0.6;
        this.lowGravity = 0.15;
        this.isJumping = false;

    }

    setState(newState, newColor) {
        this.state = newState;

        // 防呆：確保 newColor 是合法陣列
        if (Array.isArray(newColor) && newColor.length >= 3) {
            this.color = newColor;
        } else {
            console.warn("Invalid color passed to Cat:", newColor);
            this.color = [255, 180, 0]; // fallback
        }
    }
    jump() {
        if (this.isJumping) return;

        this.vy = -12;      // 跳躍初速度（可調）
        this.isJumping = true;
    }

    display() {
        if (this.isJumping) {

          const gravityToUse =
              this.vy > -2 && this.vy < 2
                  ? this.lowGravity
                  : this.gravity;

          this.vy += gravityToUse;
          this.y += this.vy;

          // 落地
          if (this.y >= this.baseY) {
              this.y = this.baseY;
              this.vy = 0;
              this.isJumping = false;
              this.state = CatState.RUN;
          }
      }


        push();
        if (!Array.isArray(this.color)) this.color = [255, 180, 0];
        fill(...this.color);
        translate(this.x, this.y);

        if (this.state === CatState.RUN) {
            ellipse(0, 0, this.size, this.size);
        } else if (this.state === CatState.JUMP) {
            rectMode(CENTER);
            rect(0, 0, this.size, this.size);
        } else if (this.state === CatState.NAP) {
            triangle(
                -this.size / 2, this.size / 2,
                this.size / 2, this.size / 2,
                0, -this.size / 2
            );
        } else if (this.state === CatState.DIAMOND) {
            rectMode(CENTER);
            rotate(PI / 4);
            rect(0, 0, this.size * 0.8, this.size * 0.2);
            rotate(-PI / 2);
            rect(0, 0, this.size * 0.8, this.size * 0.2);
        }
      else {
        // 所有其他狀態至少畫一個形狀
        rectMode(CENTER);
        rect(0, 0, this.size, this.size);
    }
      

        pop();
    }
}
