
class Enemy
{
    constructor(position)
    {
        this.position = position;
        this.rotation = 0;
        this.scale = 1;
        
        var rng = Math.round(randomBetween(0, 9));
        if      (rng < 3)
        {
            this.life = 1;
            this.img = graphicAssets.invader1.image;
        } 
        else if (rng < 6)
        {
            this.life = 2;
            this.img = graphicAssets.invader2.image;
        } 
        else if (rng < 9)
        {
            this.life = 3;
            this.img = graphicAssets.invader3.image;
        } 
        else 
        {
            this.life = 4;
            this.img = graphicAssets.invader4.image;
        }
        //console.log("RNG: " + rng);
        //console.log("Life: " + this.life);

        this.level = this.life;

        this.speed = 125 + this.level * 30 / 100 * 125;

        this.width = this.img.width;
        this.height = this.img.height;
        this.halfWidth = this.img.width / 2;
        this.halfHeight = this.img.height / 2;

        if (Math.random() >= 0.5) this.sentido = 1;
        else this.sentido = -1;
        
        this.pivot = new Vector2(this.halfWidth, this.halfHeight);

        this.scoreValue = this.level * 2 + 3;

        this.collider = {
            originalPolygon : [
                {x: 0, y: -20},
                {x: 20, y: -20},
                {x: 30, y: 0},
                {x: 30, y: 16},
                {x: 10, y: 20},
                {x: -10, y: 20},
                {x: -30, y: 16},
                {x: -30, y: 0},
                {x: -20, y: -20}
            ],
            transformedPolygon : []
        };

    }

    Start()
    {
        for (let i = 0; i < this.collider.originalPolygon.length; i++)
            this.collider.transformedPolygon[i] = {x: 0, y: 0};

           /* this.ball = CreateBall(world, this.position.x/100, this.position.y/100, 0.2, {
                friction: 0.2,
                restitution: 0.5,
                type : b2Body.b2_kinematicBody
                });*/
    }

    Update(deltaTime)
    {
        // move towards the player
        let playerEnemyVector;
        if(this.position.x < 0 + this.width - 20) this.sentido = 1;
        else if(this.position.x > canvas.width -  this.width + 20) this.sentido = -1;

        switch (this.level)
        {
            case 1: 
            playerEnemyVector = new Vector2(0, 1);
                break;
            
            case 2: 
            playerEnemyVector = new Vector2(1 * this.sentido, 1);
                break;
            
            case 3: 
            playerEnemyVector = new Vector2(3 * this.sentido, 1);
                break;
                    
            case 4: playerEnemyVector = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
                break;
        }
        
        this.rotation = Math.atan2(playerEnemyVector.y, playerEnemyVector.x);

        this.position.x += Math.cos(this.rotation) * this.speed * deltaTime; 
        this.position.y += Math.sin(this.rotation) * this.speed * deltaTime;
        
        // update the collider
        // update the positions of every vexter of the polygon 
        for (let i = 0; i < this.collider.originalPolygon.length; i++)
        {
            // 1: update the vertex position regarding the polygon position
            this.collider.transformedPolygon[i].x =
                this.position.x + this.collider.originalPolygon[i].x;
            this.collider.transformedPolygon[i].y =
                this.position.y + this.collider.originalPolygon[i].y;

            // 2: update the vertex position regarding the polygon rotation
           // this.collider.transformedPolygon[i] = RotatePointAroundPoint(this.position, this.collider.transformedPolygon[i], -this.rotation);// + PIH);
        }

        if(currentFramesCounter == 59)
        {
            playerEnemyVector = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
            this.rotation = Math.atan2(playerEnemyVector.y, playerEnemyVector.x);
            let bullet = game.enemyBullets.Activate(this.position.x, this.position.y, this.rotation, 300, 1);
        }
       //this.bulletPool.Update(deltaTime);
    }

    Draw(ctx)
    {
        // draw the enemy sprite
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(Math.atan2(this.rotation) + PIH);
        ctx.drawImage(this.img, -this.pivot.x, -this.pivot.y, this.width, this.height);

        ctx.restore();

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

    

    CheckBulletCollision(bulletPosition)
    {
        return CheckCollisionPolygon(bulletPosition, this.collider.transformedPolygon);
    }

    CheckPlayerCollision(playerPosition)
    {
        return CheckCollisionPolygon(playerPosition, this.collider.transformedPolygon);
    }

    Damage(damage)
    {
        this.life -= damage;
        
        return this.life <= 0;
    }
}
