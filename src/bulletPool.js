
class Bullet {
    constructor(position, rotation, speed, power, shotType) {
        this.position = position;
        this.rotation = rotation;
        this.speed = speed;
        this.power = power;
        this.shotType = shotType;
        this.active = false;

        this.collider = {
            originalPolygon : [
                {x: -12.5, y: -12.5},
                {x: -12.5, y: 12.5},
                {x: 12.5, y: 12.5},
                {x: 12.5, y: -12.5},
            ],
            transformedPolygon : []
        };
    }

    Start()
    {
        for (let i = 0; i < this.collider.originalPolygon.length; i++)
            this.collider.transformedPolygon[i] = {x: 0, y: 0};
    }

    Update (deltaTime) {
        
        if(this.active)
        {
            this.position.x += Math.cos(this.rotation) * this.speed * deltaTime;
            this.position.y += Math.sin(this.rotation) * this.speed * deltaTime;

            for (let i = 0; i < this.collider.originalPolygon.length; i++)
            {
                // 1: update the vertex position regarding the polygon position
                this.collider.transformedPolygon[i].x =
                    this.position.x + this.collider.originalPolygon[i].x;
                this.collider.transformedPolygon[i].y =
                    this.position.y + this.collider.originalPolygon[i].y;
                // 2: update the vertex position regarding the polygon rotation
                this.collider.transformedPolygon[i] = RotatePointAroundPoint(this.position, this.collider.transformedPolygon[i], -this.rotation);// + PIH);
            }
        }
    }

    Draw (ctx) {
        
        if(debug)
        {
            // draw the collider polygon
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.collider.transformedPolygon[0].x, this.collider.transformedPolygon[0].y);
            for (let i = 1; i < this.collider.transformedPolygon.length; i++)
            {
                ctx.lineTo(this.collider.transformedPolygon[i].x, this.collider.transformedPolygon[i].y);
            }
            ctx.lineTo(this.collider.transformedPolygon[0].x, this.collider.transformedPolygon[0].y);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
        }
        
        
        
        ctx.fillStyle = "yellow";
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        if(debug) ctx.fillRect(-3, -1, 6, 2);
        else switch(this.shotType)
        {
            case 0: 
                this.PlayerShot();
                break;
            
            case 1: ctx.drawImage(graphicAssets.energy.image, -graphicAssets.energy.image.width/2, -graphicAssets.energy.image.height/2);
                break;
        }

        ctx.restore();
    }

    PlayerShot()
    {
        // Bala normal o shield
        let shot = null;
        if(player.shieldbullet) shot = graphicAssets.shieldbullet.image;
        else shot = graphicAssets.bullet.image;
        
        ctx.drawImage(shot, -shot.width/2, -shot.height/2);  
    }

    CheckCollision(Position)
    {
        return CheckCollisionPolygon(Position, this.collider.transformedPolygon);
    }
}

class BulletPool {
    constructor(initialSize, shotType) {
        this.bullets = [];

        for (let i = 0; i < initialSize; i++) {
            let bullet = new Bullet(new Vector2(0, 0), 0, 0, 0, shotType);
            bullet.Start();
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
            newBullet.Start();
            this.bullets.push(newBullet);
        }

        newBullet.active = true;
        return newBullet;
    }

    Deactivate(bullet) {
        bullet.active = false;
    }

}
