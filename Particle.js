class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.lifetime = 0;
        this.color = "white";
        this.active = false;
    }

    init(x, y, color = "white") {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3; // faster spread
        this.vy = (Math.random() - 0.5) * 3;
        this.lifetime = 40;
        this.color = color;
        this.active = true;
    }

    update() {
        if (!this.active) return;
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime--;
        if (this.lifetime <= 0) this.active = false;
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.lifetime / 40;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1 + Math.random() * 2, 0, Math.PI * 2); // varied size
        ctx.fill();
        ctx.restore();
    }
}

class ParticlePool {
    constructor(size) {
        this.pool = Array.from({ length: size }, () => new Particle());
    }

    spawn(x, y, color = "white") {
        for (let p of this.pool) {
            if (!p.active) {
                p.init(x, y, color);
                break;
            }
        }
    }

    updateAll() {
        for (let p of this.pool) p.update();
    }

    drawAll(ctx) {
        for (let p of this.pool) p.draw(ctx);
    }
}

