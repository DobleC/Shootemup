var game = {
    player: null,
    enemies: [],
    powerups: [],
    score: 0,
    gameover: false,
    bgy: 0,

    Start: function()
    {
        // player is a global variable
        this.player = player;
        this.player.start(new Vector2(canvas.width / 2, canvas.height - 60));

        // Contador de segundos, cada segundo suma 1 a la puntuacioón total
        this.secs = 0;
        this.maxsecs = 1;

        // Para evitar que las balas despawneen al morir el enemigo que las disparó, su gestión se hace en game
        this.enemyBullets = new BulletPool(14, 1);

        // init the enemies
        this.enemies.push(new Enemy(new Vector2(canvas.width / 2, 100)));
        this.enemies.forEach(enemy => enemy.Start());

        audio.music.play(); 
    },

    Update: function(deltaTime)
    {
        // Si no está en gameover, el juego continua su ejecución
        if(!this.gameover)
        {
            // +1 punto cada sec
            this.secs += deltaTime;
            if (this.secs >= this.maxsecs) 
            {
                this.score++;
                this.secs = 0;
            }

            // Updates de turno
            this.player.update(deltaTime);

            this.enemies.forEach(enemy => {
                enemy.Update(deltaTime);
            });

            this.powerups.forEach(powerup => {
                powerup.Update(deltaTime);
            });

            this.enemyBullets.Update(deltaTime);

            // Colisiones de las balas enemigas
            for (let b = 0; b < this.enemyBullets.bullets.length; b++)
            {
                let enembullet = this.enemyBullets.bullets[b];

                    // Si la bala enemiga está activa
                    if (enembullet.active)
                    {
                        // Comprueba si el player tiene el Power Up de parar balas con las suyas
                        if(player.shieldbullet)
                        {
                            for (let p = 0; p < this.player.bulletPool.bullets.length; p++)
                            {
                                let playerbullet = this.player.bulletPool.bullets[p];
                                
                                // Desactiva las 2 balas que colisionan
                                if(playerbullet.active && playerbullet.CheckCollision(enembullet.position))
                                {
                                    this.player.bulletPool.Deactivate(playerbullet);
                                    this.enemyBullets.Deactivate(enembullet);
                                    
                                }
                            }
                        }

                        let collision = this.player.CheckCollision(enembullet.position);
                        
                        // Si la bala enemiga impacta en el player se desactiva y le hace daño
                        if (collision)
                        {
                            this.enemyBullets.Deactivate(enembullet);
                            this.playerHitted();
                        }
                    }
            }  


            // Checkea las colisiones entre balas del player o el player contra enemigos
            for (let i = 0; i < this.enemies.length; i++)
            {
                // Si los enemigos se salen del mapa por abajo, mueren
                if(this.enemies[i].position.y > canvas.height + 15)
                {
                    this.enemies[i].Damage(100);
                    this.GenerateEnemies(i);
                    return;
                }


                let collision = this.enemies[i].CheckCollision(player.position);

                // Si el player choca contra un enemigo
                if (collision)
                {
                    let enemyDead = this.enemies[i].Damage(this.player.damageOnCollision);

                    // Si la colisión mata al enemigo (de momento siempre matan a enemigos, sería para evitar cheesear a bosses al chocarse)
                    if (enemyDead)
                    { 
                        this.playerHitted();
                        this.GenerateEnemies(i);
                        return;
                    }
                }

                // Comprueba si las balas del player están impactando contra algún enemigo
                for (let j = 0; j < this.player.bulletPool.bullets.length; j++)
                {
                    let bullet = this.player.bulletPool.bullets[j];

                    // Si la bala está activa
                    if (bullet.active)
                    {
                        let collision = this.enemies[i].CheckCollision(bullet.position);

                        // Y colisiona con el enemigo
                        if (collision)
                        {
                            // bullet 'j' has collide with enemy 'i'
                            // damage the enemy
                            let enemyDead = this.enemies[i].Damage(bullet.power);

                            // disable the bullet
                            this.player.bulletPool.Deactivate(bullet);
                            //console.log("Impacto a enemigo");
                            
                            // Solo cuando un enemigo muere de un balazo aumenta la puntuación,
                            if (enemyDead)
                            {
                                this.score += this.enemies[i].scoreValue;
                                this.ExplosionSound();
                                this.GeneratePUP(i);
                                this.GenerateEnemies(i);
                                return;
                            }
                        }
                    }
                }  
            }
            
            // Checkea cuando un power up colisiona con un player
            for (let i = 0; i < this.powerups.length; i++)
            {
                if(this.powerups[i].position.y > canvas.height + 10)
                {
                    RemoveElementAt(this.powerups, i);
                    return;
                }


                let collision = this.player.CheckCollision(this.powerups[i].position);

                if (collision)
                {
                    this.powerups[i].doEffect(this.player);
                    audio.powerup.currentTime = 0.005;
                    audio.powerup.play(); 
                    RemoveElementAt(this.powerups, i);
                    return;
                }
            }
        }
    },

    // Resta vida al player y cuando es igual a 0 acaba la partida
    playerHitted: function()
    { 
        this.player.GetHitted();
        //console.log("Impacto en player, vida = " + this.player.life);
        
        if (this.player.life == 0)
        {
            document.getElementById("gamescore").innerText = this.score;
            this.gameover = true;
            GameOver();
        }
    },


    // Genera un sonido de explosión entre 3 posibles al matar a un enemigo
    ExplosionSound: function()
    {
        let explType = Math.round(randomBetween(0.51, 3.49));

        switch (explType)
        {
            case 1: audio.expl1.currentTime = 0.005; audio.expl1.play(); break;
            case 2: audio.expl2.currentTime = 0.005; audio.expl2.play(); break;
            case 3: audio.expl3.currentTime = 0.005; audio.expl3.play(); break;
        }
    },

    // Genera power ups un (100 - rng*100)% de las veces que matas a un enemigo
    GeneratePUP: function(i)
    {
        let rng = 0.85;
        if(this.score > 500)
        {
            rng = 0.8;

            if (this.score > 1000)
            {
                rng = 0.75;
                
                if (this.score > 2000)
                {
                    rng = 0.7;
                }
            }
        } // rng aumenta en función de tu puntuación

        if (Math.random() >= rng)
        {
            let pUP = new PowerUp(this.enemies[i].position);
            pUP.Start();
            this.powerups.push(pUP);
        }
    },

    // Elimina al enemigo y genera más
    GenerateEnemies: function(i)
    {
        // Elimina
        RemoveElementAt(this.enemies, i);

        //console.log("N enemigos: " + this.enemies.length);

        // Si era el último enemigo, genera más
        if (this.enemies.length == 0)
        {
            // Aumenta el número de enemigos que se pueden generar por cada 200 puntos
            let masEnems = 0;
            if (this.score < 2000) masEnems = Math.round(this.score/200);
            else masEnems = 10;

            let rng = Math.round(randomBetween(2, 4)) + masEnems;
            let rngX;
            let rngY;
            

            //console.log("Generando enemigos: " + rng)

            // Dispersa a los enemigos generados por encima del canvas
            for (let i = 0; i < rng; i++)
            {
                rngX = randomBetween(50, canvas.width - 50);
                rngY = randomBetween(-20, -130);

                //console.log("Posicion enemigo" + i + " " + rngX + "," + rngY);

                this.enemies.push(new Enemy(new Vector2(rngX, rngY)));
            }
            this.enemies.forEach(enemy => enemy.Start());
        }
    },

    Draw: function(ctx)
    {
        // Draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.MoveBG();
        
        if(!this.gameover)
        {
            // draw the player
            this.player.draw(ctx);

            // draw the enemies
            this.enemies.forEach(enemy => {
                enemy.Draw(ctx);
            });

            // draw power ups
            this.powerups.forEach(powerup => {
                powerup.Draw(ctx);
            });

            // draw enemyBullets
            this.enemyBullets.Draw(ctx);

            // draw the aiming point
            ctx.drawImage(graphicAssets.aim.image, Input.mouse.x - graphicAssets.aim.image.width / 2, Input.mouse.y - graphicAssets.aim.image.height / 2);

            // Dibuja un corazón lleno cuando la vida es par, y uno a medias cuando es impar
            for(let i = 0, anchor = graphicAssets.heart.image.width + 5; i < this.player.life / 2; i++)
            {
                if (Math.trunc(this.player.life / 2) >= i + 1)
                ctx.drawImage(graphicAssets.heart.image, 15 + anchor * i, 10);
                else
                ctx.drawImage(graphicAssets.halfheart.image, 15 + anchor * i, 10);
            }

            // Corazones vacios hardcodeados, no me gusta este approach pero si no, simplemente desaparecen
            if (this.player.life < 5) ctx.drawImage(graphicAssets.emptyheart.image, 15 + (graphicAssets.heart.image.width + 5) * 2, 10);
            if (this.player.life < 3) ctx.drawImage(graphicAssets.emptyheart.image, 15 + graphicAssets.heart.image.width + 5, 10);
            if (this.player.life < 1) ctx.drawImage(graphicAssets.emptyheart.image, 15, 10);

            ctx.fillStyle = "white";
            ctx.font = "24px Courier"
            ctx.fillText("Score: " + this.score, canvas.width/2 + 50, 42);
           
        }
    },

    oneY: null,
    twoY: null,
    threeY: null,
    fourY: null,
    fiveY: null,
    sixY: null,
    oneX: null,
    twoX: null,
    threeX: null,
    fourX: null,
    fiveX: null,
    sixX: null,

    MoveBG: function()
    {
        // Mueve y loopea de forma perfecta el BG para generar una sensación de movimiento infinito
        // Solución no muy elegante
        ctx.drawImage(graphicAssets.bg.image, 0, this.bgy - graphicAssets.bg.image.height + canvas.height);
        this.CheckPlanets();

        ctx.drawImage(graphicAssets.planet1.image, this.oneX, this.oneY);
        ctx.drawImage(graphicAssets.planet2.image, this.twoX, this.twoY);
        ctx.drawImage(graphicAssets.moon1.image, this.threeX, this.threeY);
        ctx.drawImage(graphicAssets.moon2.image, this.fourX, this.fourY);
        ctx.drawImage(graphicAssets.moon3.image, this.fiveX, this.fiveY);
        ctx.drawImage(graphicAssets.moon4.image, this.sixX, this.sixY);
    },

    CheckPlanets: function()
    {
        this.bgy += 0.5;
        if(this.bgy >= graphicAssets.bg.image.height/2) this.bgy = 0;

        
        if(this.oneY == null || this.oneY > 822)
        {
            this.oneY = -randomBetween(100, 250);
            this.oneX = randomBetween(125, canvas.width - 100);
        }
        if(this.twoY == null || this.twoY > 818)
        {
            this.twoY = -randomBetween(100, 250);
            this.twoX = randomBetween(125, canvas.width - 100);
        }
        if(this.threeY == null || this.threeY > 756) 
        {
            this.threeY = -randomBetween(40, 250);
            this.threeX = randomBetween(50, canvas.width - 50);
        }
        if(this.fourY == null || this.fourY > 754)
        {
            this.fourY = -randomBetween(40, 250);
            this.fourX = randomBetween(50, canvas.width - 50);
        }
        if(this.fiveY == null || this.fiveY > 755)
        {
            this.fiveY = -randomBetween(40, 250);
            this.fiveX = randomBetween(50, canvas.width - 50);
        }
        if(this.sixY == null || this.sixY > 753)
        {
            this.sixY = -randomBetween(40, 250);
            this.sixX = randomBetween(50, canvas.width - 50);
        }

        this.oneY   += 0.75;
        this.twoY   += 1;
        this.threeY += 1.25;
        this.fourY  += 1.35;
        this.fiveY  += 1.45;
        this.sixY  += 1.55;
    },

}