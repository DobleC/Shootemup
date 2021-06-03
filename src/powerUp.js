class PowerUp
{
    constructor(position)
    {
        this.position = position;
        this.rotation = 0;
        this.scale = 1;
        this.speed = 125;

        this.effect = 1; //////////////////////////////////////////////////////////////////////////////////////////
        this.img = graphicAssets.pulife.image; ///////////////////////////////////////////////////////////////////

        this.width = this.img.width;
        this.height = this.img.height;
        this.halfWidth = this.img.width / 2;
        this.halfHeight = this.img.height / 2;

        this.pivot = new Vector2(this.halfWidth, this.halfHeight);


        this.collider = {
            originalPolygon : [
                {x: -30, y: -30},
                {x: -30, y: 30},
                {x: 30, y: 30},
                {x: 30, y: -30},
            ],
            transformedPolygon : []
        };

    }

    Start()
    {
        for (let i = 0; i < this.collider.originalPolygon.length; i++)
            this.collider.transformedPolygon[i] = {x: 0, y: 0};
    }

    Update(deltaTime)
    {
        // move towards the player
        let movementVector = new Vector2(0, 1);;
        
        
        this.rotation = Math.atan2(movementVector.y, movementVector.x);

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
    }

    Draw(ctx)
    {
        // draw the enemy sprite
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(Math.atan2(this.rotation) + PIH);
        ctx.drawImage(this.img, -this.pivot.x, -this.pivot.y, this.width, this.height);

        ctx.restore();

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
    }

    CheckCollision(Position)
    {
        return CheckCollisionPolygon(Position, this.collider.transformedPolygon);
    }

    doEffect(Player)
    {
        switch (this.effect)
        {
            case 1: 
            Player.PowerUpLife();
                break;
            
            case 2: 
            Player.PowerUpSpeed();
                break;
            
            case 3: 
            Player.PowerUpShootRate();
                break;
                    
            case 4: 
            Player.PowerUpShieldBullet();
                break;
            
            case 5: 
            Player.PowerUpTripleShot();
                break;
                
            case 6: 
            Player.PowerUpBackShot();
                break;
                
            case 7: 
            Player.PowerUpInvencible();
                break;
        }
    }
}
