
var player = {
    position: null,
    width: 0,
    height: 0,
    rotation: 0,

    img: null,
    animation: null,

    halfWidth: 0,
    halfHeight: 0,

    speed: 400,
    speedTurboMultiplier: 1.5,

    shotRate: 0.15,
    shotRateAux: 0.2,

    
    bulletPool: null,

    start: function(position) {
        this.position = position;

        this.img = graphicAssets.player_ship.image;
        
        this.animation = new SSAnimation(
            graphicAssets.nave.image,
            26*2, // frameWidth
            42*2, // frameHeight
            [1,1,1], // frameCount
        );
        
        this.animation.PlayAnimation(0);
        this.width = 26*2;
        this.height = 42*2;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;

        this.x = canvas.width / 2;
        this.y = canvas.height - 40;

        this.life = 6;
        this.damageOnCollision = 5;

        this.bulletPool = new BulletPool(5, 0);

        this.collider = {
            originalPolygon : [
                {x: -10, y: -15},
                {x: -10, y: 15},
                {x: 10, y: 15},
                {x: 10, y: -15},
    
            ],
            transformedPolygon : []
        };

        for (let i = 0; i < this.collider.originalPolygon.length; i++)
        this.collider.transformedPolygon[i] = {x: 0, y: 0};
    },

    update: function(deltaTime) {

        this.shotRateAux += deltaTime;

        this.animation.Update(deltaTime);

        this.animation.PlayAnimation(0);

        // movement
        let dir = Vector2.Zero();

        if ((Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A)) && this.position.x > this.width)
        {
            dir.x = -1; 
            if(this.rotation > -Math.PI/4 && this.rotation < Math.PI/4) this.animation.PlayAnimation(1);
            if(this.rotation > Math.PI*3/4 && this.rotation < Math.PI*5/4) this.animation.PlayAnimation(2);
        }
        if ((Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D)) && this.position.x < canvas.width - this.width)
        {
            dir.x = 1; 
            if(this.rotation > -Math.PI/4 && this.rotation < Math.PI/4) this.animation.PlayAnimation(2);
            if(this.rotation > Math.PI*3/4 && this.rotation < Math.PI*5/4) this.animation.PlayAnimation(1);
        }
        if ((Input.IsKeyPressed(KEY_UP) || Input.IsKeyPressed(KEY_W)) && this.position.y > this.height)
        {
            dir.y = -1;
            if(this.rotation >= Math.PI*5/4 || this.rotation <= -Math.PI/4) this.animation.PlayAnimation(2);
            if(this.rotation >= Math.PI/4 && this.rotation <= Math.PI*3/4) this.animation.PlayAnimation(1);
                
        }
        if ((Input.IsKeyPressed(KEY_DOWN) || Input.IsKeyPressed(KEY_S)) && this.position.y < canvas.height - this.height)
        {
            dir.y = 1;
            if(this.rotation >= Math.PI*5/4 || this.rotation <= -Math.PI/4) this.animation.PlayAnimation(1);
            if(this.rotation >= Math.PI/4 && this.rotation <= Math.PI*3/4) this.animation.PlayAnimation(2);
        }

        // turbo movement
        let currentSpeed = this.speed;
        if (Input.IsKeyPressed(KEY_LSHIFT))
            currentSpeed *= this.speedTurboMultiplier;

        //dir.x = Input.mouse.x - this.position.x;
        //dir.y = Input.mouse.y - this.position.y;
        dir.Normalize();
        this.position.x += dir.x * currentSpeed * deltaTime;
        this.position.y += dir.y * currentSpeed * deltaTime;

        // rotation
        this.rotation = Math.atan2(Input.mouse.y - this.position.y, Input.mouse.x - this.position.x) + PIH;

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

        // shot
        if ((Input.IsKeyPressed(KEY_SPACE) || Input.IsMousePressed()) && (this.shotRateAux >= this.shotRate))
        {
            let bullet = this.bulletPool.Activate(this.position.x, this.position.y, this.rotation - PIH, 800, 1);
            if (bullet) {
                audio.laser.currentTime = 0.1;
                audio.laser.play();  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                this.shotRateAux = 0;
            }
        }

        // update the bullets
        this.bulletPool.Update(deltaTime);
    },

    CheckCollision(Position)
    {
        return CheckCollisionPolygon(Position, this.collider.transformedPolygon);
    },

    draw: function(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        this.animation.Draw(ctx);

        //ctx.drawImage(this.img, -this.halfWidth, -this.halfHeight, this.width, this.height);

        ctx.restore();
        
        // draw the bullets
        this.bulletPool.Draw(ctx);

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
}


/*//idle
        //this.animation = new SSAnimation(graphicAssets.braid.image, 83, 140, [12, 11, 9, 9, 8], 1 / 12);
        this.animation = new SSAnimation(
            graphicAssets.knight.image,
            79, // frameWidth
            63, // frameHeight
            [14, 13, 14, 10, 2, 5, 6, 4, 4, 6, 4, 2, 8], // frameCount
            1/12
        );
        this.animation.PlayAnimationLoop(12);*/