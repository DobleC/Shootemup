
class Bullet {
    constructor(position, rotation, speed, power) {
        this.position = position;
        this.rotation = rotation;
        this.speed = speed;
        this.power = power;
        this.active = false;
    }

    Update (deltaTime) {
        this.position.x += Math.cos(this.rotation) * this.speed * deltaTime;
        this.position.y += Math.sin(this.rotation) * this.speed * deltaTime;
    }

    Draw (ctx) {
        ctx.fillStyle = "yellow";
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        ctx.fillRect(-3, -1, 6, 2);

        ctx.restore();
    }
}

class BulletPool {
    constructor(initialSize) {
        this.bullets = [];

        for (let i = 0; i < initialSize; i++) {
            let bullet = new Bullet(new Vector2(0, 0), 0, 0, 0);
            this.bullets.push(bullet);
        }
    }

    Update(deltaTime) {
        this.bullets.forEach(bullet => {
            if (bullet.active) {
                bullet.Update(deltaTime);

                // check scene bounds
                if (bullet.position.y < -3 || bullet.position.y > canvas.height + 3 ||
                    bullet.position.x < -1 || bullet.position.x > canvas.width + 1)
                    this.Deactivate(bullet);
            }
        });
    }

    Draw(ctx) {
        this.bullets.forEach(bullet => {
            if (bullet.active)
                bullet.Draw(ctx);
        });

        // debug draw
        ctx.fillStyle = "red";
        ctx.strokeStyle = "white";
        let x = canvas.width - 40;
        let y = 20;
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].active) {
                ctx.fillRect(x, (i * 20) + y, 20, 20);
            }
            ctx.strokeRect(x, (i * 20) + y, 20, 20);
        };
    }

    Activate(x, y, rotation, speed, power) {
        let newBullet = null;
        // look for the first non-active bullet of the pool
        for (let i = 0; !newBullet && i < this.bullets.length; i++) {
            if (!this.bullets[i].active) {
                // non-active bullet found
                newBullet = this.bullets[i];

                // set the new parameters
                newBullet.position.x = x;
                newBullet.position.y = y;
                newBullet.rotation = rotation;
                newBullet.speed = speed;
                newBullet.power = power;
            }
        }

        if (!newBullet) {
            // no non-active bullet found, create a new one
            newBullet = new Bullet(new Vector2(x, y), rotation, speed, power);
            this.bullets.push(newBullet);
        }

        newBullet.active = true;
        return newBullet;
    }

    Deactivate(bullet) {
        bullet.active = false;
    }
}
