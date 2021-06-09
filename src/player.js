var player = {
    position: null,
    width: 0,
    height: 0,
    rotation: 0,

    animation: null,

    halfWidth: 0,
    halfHeight: 0,

    speed: 500,

    shotRate: 0.2,
    shotRateAux: 0.2,

    bulletPool: null,

    start: function(position) {
        this.position = position;  
        this.animation = new SSAnimation(
            graphicAssets.nave.image,
            26*2, // frameWidth
            42*2, // frameHeight
            [1,1,1], // frameCount
        );
        
        // Empieza con la animación standart
        this.animation.PlayAnimation(0);
        this.width = 52; // Hardcodeados para evitar cualquier clipeo raro
        this.height = 84;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;

        this.x = canvas.width / 2;
        this.y = canvas.height - 40;

        // Vida del jugador (2 de vida = 1 corazón)
        this.life = 6;
        
        // Daño que le hace a enemigos cuando colisiona de ellos
        this.damageOnCollision = 5;

        // BulletPool grandote para evitar que falten balas cuando disparas x6 a máxima cadencia
        this.bulletPool = new BulletPool(30, 0);

        // Contador de segundos y segundos máximos de la invulnerabilidad
        this.secs = 0;
        this.maxsecs = 3;

        // Booleano que hace parpadear al player y booleano que indica si ha recibido un impacto
        this.siono = false;
        this.hitted = false;

        // Power ups stackeables
        this.shieldbullet = false;
        this.tripleshot = false;
        this.backshot = false;

        this.collider = {
            originalPolygon : [
                {x: -15, y: -25},
                {x: -15, y: 25},
                {x: 15, y: 25},
                {x: 15, y: -25},
    
            ],
            transformedPolygon : []
        };

        for (let i = 0; i < this.collider.originalPolygon.length; i++)
        this.collider.transformedPolygon[i] = {x: 0, y: 0};
    },

    update: function(deltaTime) {
        //Aumenta la variable para impedir disparar antes de que llegue a la cantidad que debe
        this.shotRateAux += deltaTime;

        this.animation.Update(deltaTime);
        // Animación por defecto sin tener en cuenta su movimiento todavía
        this.animation.PlayAnimation(0);

        // movement
        let dir = Vector2.Zero();

        // Se mueve a la izquierda mientras no se pase de los bordes del canvas
        if ((Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A)) && this.position.x > this.width)
        {
            dir.x = -1; 
            // Altera si reproduce (o no) animación de moverse hacia la derecha o la izquierda en función de su rotación actual
            if(this.rotation > -Math.PI/4 && this.rotation < Math.PI/4) this.animation.PlayAnimation(1);
            if(this.rotation > Math.PI*3/4 && this.rotation < Math.PI*5/4) this.animation.PlayAnimation(2);
        }
        // Se mueve a la derecha mientras no se pase de los bordes del canvas
        if ((Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D)) && this.position.x < canvas.width - this.width)
        {
            dir.x = 1; 
            // Altera si reproduce (o no) animación de moverse hacia la derecha o la izquierda en función de su rotación actual
            if(this.rotation > -Math.PI/4 && this.rotation < Math.PI/4) this.animation.PlayAnimation(2);
            if(this.rotation > Math.PI*3/4 && this.rotation < Math.PI*5/4) this.animation.PlayAnimation(1);
        }
        // Se mueve arriba mientras no se pase de los bordes del canvas
        if ((Input.IsKeyPressed(KEY_UP) || Input.IsKeyPressed(KEY_W)) && this.position.y > this.height)
        {
            dir.y = -1;
            // Altera si reproduce (o no) animación de moverse hacia la derecha o la izquierda en función de su rotación actual
            if(this.rotation >= Math.PI*5/4 || this.rotation <= -Math.PI/4) this.animation.PlayAnimation(2);
            if(this.rotation >= Math.PI/4 && this.rotation <= Math.PI*3/4) this.animation.PlayAnimation(1);
                
        }
        // Se mueve abajo mientras no se pase de los bordes del canvas
        if ((Input.IsKeyPressed(KEY_DOWN) || Input.IsKeyPressed(KEY_S)) && this.position.y < canvas.height - this.height + 30)
        {
            dir.y = 1;
            // Altera si reproduce (o no) animación de moverse hacia la derecha o la izquierda en función de su rotación actual
            if(this.rotation >= Math.PI*5/4 || this.rotation <= -Math.PI/4) this.animation.PlayAnimation(1);
            if(this.rotation >= Math.PI/4 && this.rotation <= Math.PI*3/4) this.animation.PlayAnimation(2);
        }

        // Movimiento
        dir.Normalize();
        this.position.x += dir.x * this.speed * deltaTime;
        this.position.y += dir.y * this.speed * deltaTime;

        // Rotación
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

        // Tipos de disparo
        if ((Input.IsKeyPressed(KEY_SPACE) || Input.IsMousePressed()) && (this.shotRateAux >= this.shotRate))
        {
            // Si tiene tripleshot dispara en las 3 direcciones frontales
            if (this.tripleshot && !this.backshot)
            {
                // x = 1    y = 1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation - PIH/2, 800, 1);
                // x = -1   y = 1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation - Math.PI*5/7, 800, 1);
            }
            // Si tiene backshot dispara hacia atrás
            else if (!this.tripleshot && this.backshot)
            {
                // x = 0   y = -1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation + PIH, 800, 1);
            }
            // Si tiene los 2 dispara 3 disparos frontales y 3 hacia atrás (sinergia)
            else if(this.tripleshot && this.backshot)
            {
                // x = 1   y = 1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation - PIH/2, 800, 1);
                // x = -1  y = 1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation - Math.PI*5/7, 800, 1);
                
                // x = 0   y = -1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation + PIH, 800, 1);

                // x = 1   y = -1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation + PIH/2, 800, 1);
                // x = -1  y = -1
                this.bulletPool.Activate(this.position.x, this.position.y, this.rotation + Math.PI*5/7, 800, 1);

            }
            
            //Disparo estandar, recto hacia arriba
            // x = 0  y = 1
            this.bulletPool.Activate(this.position.x, this.position.y, this.rotation - PIH, 800, 1);
            
            // Activa un sonido de laser y vuelve el shotRateAux a 0
            audio.laser.currentTime = 0.005;
            audio.laser.play(); 
            this.shotRateAux = 0;
           
        }

        // Cuenta los segundos de invulnerabilidad del player
        if(this.hitted)
        {
            this.secs += deltaTime;
            if (this.secs >= this.maxsecs) 
            {
                this.hitted = false;
                this.secs = 0;
                this.maxsecs = 3;
            }
        }

        // update bullets
        this.bulletPool.Update(deltaTime);
    },

    // Checkea las colisiones
    CheckCollision(Position)
    {
        return CheckCollisionPolygon(Position, this.collider.transformedPolygon);
    },

    GetHitted()
    {
        // Recibe daño si no ha recibido daño x segundos antes de recibir el nuevo ataque
        if(!this.hitted)
        {
            this.ResetStatus();
            audio.hurt.currentTime = 0.005;
            audio.hurt.play();
            this.hitted = true;
            --this.life;
        }
    },

    // Tras recibir daño pierdes todas tus mejoras
    ResetStatus()
    {
        this.speed = 500;
        this.shotRate = 0.2;
        this.shieldbullet = false;
        this.tripleshot = false;
        this.backshot = false;
    },

    // Recupera 1 corazón
    PowerUpLife()
    {
        for(let i = 0; i < 2; i++) if (this.life < 6) this.life++; 
        console.log('Power Up Recover Life');  
    },

    // Aumenta la velocidad de movimiento
    PowerUpSpeed()
    {
        if (this.speed <= 800) this.speed += 75;
        console.log('Power Up +Movement Speed');     
    },

    // Aumenta la cadencia de disparo
    PowerUpShootRate()
    {
        if (this.shotRate <= 0.1) this.shotRate -= 0.025;   
        console.log('Power Up +Shoot Rate');  
    },

    // Hace que tus balas paren las balas rivales (como Lost Contact en el Isaac)
    PowerUpShieldBullet()
    {
        if (!this.shieldbullet) this.shieldbullet = true;   
        console.log('Power Up Shield Bullets');  
    },

    // Activa el disparo triple
    PowerUpTripleShot()
    {
        if (!this.tripleshot) this.tripleshot = true; 
        console.log('Power Up Triple Shot');    
    },

    // Activa el disparo hacia atrás
    PowerUpBackShot()
    {
        if (!this.backshot) this.backshot = true;   
        console.log('Power Up Back Shot');  
    },

    // Te vuelve invencible durante 5s
    PowerUpInvencible()
    {
        if (!this.hitted) this.hitted = true;  
        this.maxsecs = 5; 
        console.log('Power Up Invencible 5s');  
    },

    draw: function(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        // Parpadea si es invulnerable, si no, dibuja la animación con normalidad
        if (this.hitted)
        {
            // Efecto cutre de parpadeo en el que se pinta durante un frame y al siguiente no
            if(this.siono)
            {
                this.animation.Draw(ctx);
                this.siono = false;
            }
            else this.siono = true;
        }
        else this.animation.Draw(ctx);

        ctx.restore();
        
        // draw the bullets
        this.bulletPool.Draw(ctx);

        // Si el programa está en modo debug pinta el collider
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