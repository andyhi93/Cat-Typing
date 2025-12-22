class Cat {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = [255, 180, 0]; // 初始顏色
        this.state = CatState.RUN;   // 初始狀態為 RUN
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

    display() {
        push();
        if (!Array.isArray(this.color)) this.color = [255, 180, 0];
        fill(...this.color);
        translate(this.x, this.y);

        if (this.state === CatState.RUN) {
            ellipse(0, 0, this.size, this.size);
        } else if (this.state === CatState.JUMP) {
            rectMode(CENTER);
            rect(0, 0, this.size, this.size);
        } else if (this.state === CatState.CROUCH) {
            triangle(
                -this.size / 2, this.size / 2,
                this.size / 2, this.size / 2,
                0, -this.size / 2
            );
        } else if (this.state === CatState.POSE) {
            rectMode(CENTER);
            rotate(PI / 4);
            rect(0, 0, this.size * 0.8, this.size * 0.2);
            rotate(-PI / 2);
            rect(0, 0, this.size * 0.8, this.size * 0.2);
        }

        pop();
    }
}
