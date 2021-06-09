class Enemy
{
    constructor(position)
    {
        this.position = position;
        this.rotation = 0;
        this.scale = 1;
        
        var rng = Math.round(randomBetween(0, 9));
        if      (rng < 4) // 40% de ser de nivel 1, imagen de enem lv 1
        {
            this.life = 1;
            this.img = graphicAssets.invader1.image;
        } 
        else if (rng < 7) // 30% de ser de nivel 2, imagen de enem lv 2
        {
            this.life = 2;
            this.img = graphicAssets.invader2.image;
        } 
        else if (rng < 9) // 20% de ser de nivel 3, imagen de enem lv 3
        {
            this.life = 3;
            this.img = graphicAssets.invader3.image;
        } 
        else              // 10% de ser de nivel 4 , imagen de enem lv 4
        {
            this.life = 4;
            this.img = graphicAssets.invader4.image;
        }
        //console.log("RNG: " + rng);
        //console.log("Life: " + this.life);

        // Iguala la vida al nivel (la vida disminuye en 1 por cada impacto)
        this.level = this.life;

        // Altera la velocidad de movimiento en función del nivel
        this.speed = 125 + this.level * 30 / 100 * 125;

        this.width = this.img.width;
        this.height = this.img.height;
        this.halfWidth = this.img.width / 2;
        this.halfHeight = this.img.height / 2;

        // Selecciona aleatoriamente un sentido (para los enemigos de lv 2 y 3 que se mueven usando diagonales)
        if (Math.random() >= 0.5) this.sentido = 1;
        else this.sentido = -1;
        
        this.pivot = new Vector2(this.halfWidth, this.halfHeight);

        // Cambia el valor de su puntuación en base a su nivel
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
    }

    Update(deltaTime)
    {
        // Vector de movimiento
        let MovementVector;

        // Invierte el sentido al tocar los bordes del canvas
        if(this.position.x < 0 + this.width - 20) this.sentido = 1;
        else if(this.position.x > canvas.width -  this.width + 20) this.sentido = -1;

        // Altera el patrón de movimiento del enemigo en función de su nivel
        switch (this.level)
        {
            case 1: // Se mueve hacia abajo
            MovementVector = new Vector2(0, 1);
                break;
            
            case 2: // Se mueve en diagonales abiertas
            MovementVector = new Vector2(1 * this.sentido, 1);
                break;
            
            case 3: // Se mueve en diagonales más cerradas
            MovementVector = new Vector2(3 * this.sentido, 1);
                break;
                    
            case 4: // Persigue al jugador
            MovementVector = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
                break;
        }
        
        this.rotation = Math.atan2(MovementVector.y, MovementVector.x);

        // Movimiento
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
        }

        // Tira un dado de 100 caras cada frame y si sale 99 o 100 dispara (2%)
        if(Math.random() >= 0.99)
        {
            MovementVector = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
            this.rotation = Math.atan2(MovementVector.y, MovementVector.x);
            game.enemyBullets.Activate(this.position.x, this.position.y, this.rotation, 300, 1);
        }
    }

    Draw(ctx)
    {
        // draw the sprite
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(Math.atan2(this.rotation) + PIH);
        ctx.drawImage(this.img, -this.pivot.x, -this.pivot.y, this.width, this.height);

        ctx.restore();

        // Pinta el collider si el programa está en modo debug
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

    // Checkea las colisiones
    CheckCollision(Position)
    {
        return CheckCollisionPolygon(Position, this.collider.transformedPolygon);
    }

    // Recibe daño (ya sea por un impacto con el player o con una bala)
    Damage(damage)
    {
        this.life -= damage;
        
        return this.life <= 0;
    }
}
