// Clase Power Up, funciona de forma similar a un enemigo de Lv1, pero este no puede ser destruido excepto por contacto
// Si es destruído el jugador recibe una mejora asociada al PU
class PowerUp
{
    constructor(position)
    {
        this.position = position;
        this.rotation = 0;
        this.scale = 1;
        this.speed = 125;
        this.effect = Math.round(randomBetween(0.51, 7.49));
        this.img = null;

        //En función del effect se selecciona una de las 7 posibles imágenes que puede tener un PU
        switch (this.effect)
        {
            case 1: 
            this.img = graphicAssets.pulife.image; 
                break;
            
            case 2: 
            this.img = graphicAssets.puspeed.image; 
                break;
            
            case 3: 
            this.img = graphicAssets.purate.image;
                break;
                    
            case 4: 
            this.img = graphicAssets.pushield.image; 
                break;
            
            case 5: 
            this.img = graphicAssets.putriple.image;
                break;
                
            case 6: 
            this.img = graphicAssets.puback.image;
                break;
                
            case 7: 
            this.img = graphicAssets.puinvencible.image;
                break;
        }
        
        this.width = this.img.width;
        this.height = this.img.height;
        this.halfWidth = this.img.width / 2;
        this.halfHeight = this.img.height / 2;

        this.pivot = new Vector2(this.halfWidth, this.halfHeight);

        // Colisión cuadrada
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

    // Rellena el collider
    Start()
    {
        for (let i = 0; i < this.collider.originalPolygon.length; i++)
            this.collider.transformedPolygon[i] = {x: 0, y: 0};
    }

    Update(deltaTime)
    {
        // Se mueve en dirección Y positiva
        let movementVector = new Vector2(0, 1);
        
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

        // Muestra el collider si está en modo debug
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

    // Checkea si colisiona con algo
    CheckCollision(Position)
    {
        return CheckCollisionPolygon(Position, this.collider.transformedPolygon);
    }

    // Aplica el efecto que tenga al player si ha colisionado con él
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
