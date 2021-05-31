var game = {
    bgGradient: null,
    player: null,
    enemies: [],
    score: 0,
    gameover: false,

    Start: function()
    {
        // prepare the bg gradient
        this.bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        this.bgGradient.addColorStop(1, "rgb(112, 162, 218)");
        this.bgGradient.addColorStop(0.9494949494949495, "rgb(0, 122, 255)");
        this.bgGradient.addColorStop(0.4292929292929293, "rgb(38, 71, 108)");
        this.bgGradient.addColorStop(0.16161616161616163, "rgb(0, 0, 0)");
        this.bgGradient.addColorStop(0, "rgb(1, 1, 1)");
    
        // player is a global variable
        this.player = player;
        this.player.start(new Vector2(canvas.width / 2, canvas.height - 60));

        // init the enemies
        this.enemies.push(new Enemy(new Vector2(canvas.width / 2, 100)));

        this.enemies.forEach(enemy => enemy.Start());
    },

    Update: function(deltaTime)
    {
        if(!this.gameover)
        {
            if(currentFramesCounter == 59) this.score++;

            // Update
            this.player.update(deltaTime);

            this.enemies.forEach(enemy => {
                enemy.Update(deltaTime);
            });

            // check bullets-enemies or player-enemies collisions
            for (let i = 0; i < this.enemies.length; i++)
            {
                if(this.enemies[i].position.y > canvas.height + 15)
                {
                    this.enemies[i].Damage(100);
                    this.GenerateEnemies(i);
                    return;
                }


                let collision = this.enemies[i].CheckPlayerCollision(player.position);

                if (collision)
                {
            
                    let enemyDead = this.enemies[i].Damage(this.player.damageOnCollision);
                    if (enemyDead)
                    {
                        --this.player.life;
                        console.log("Impacto player, vida = " + this.player.life);
                        
                        if (this.player.life == 0)
                        {
                            document.getElementById("gamescore").innerText = this.score;
                            this.gameover = true;
                            GameOver();
                        }
                        
                        this.GenerateEnemies(i);
                        
                        return;
                    }
                }

                for (let j = 0; j < this.player.bulletPool.bullets.length; j++)
                {
                    let bullet = this.player.bulletPool.bullets[j];

                    if (bullet.active)
                    {
                        let collision = this.enemies[i].CheckBulletCollision(bullet.position);

                        if (collision)
                        {
                            // bullet 'j' has collide with enemy 'i'
                            // damage the enemy
                            let enemyDead = this.enemies[i].Damage(bullet.power);

                            // disable the bullet
                            this.player.bulletPool.Deactivate(bullet);
                            console.log("Impacto bala");
                            
                            // kill enemies, spawn more if enemies list = 0
                            if (enemyDead)
                            {
                                this.score += this.enemies[i].scoreValue;
                                this.GenerateEnemies(i);
                                return;
                            }
                        }
                    }
                }  
            }
        }
    },

    GenerateEnemies: function(i)
    {
        
        RemoveElementAt(this.enemies, i);
        console.log("N enemigos: " + this.enemies.length);
        if (this.enemies.length == 0)
        {
            var rng = Math.round(randomBetween(2, 4)) + Math.round(this.score/200);
            var rngX;
            var rngY;
            

            console.log("Generando enemigos: " + rng)

            for (let i = 0; i < rng; i++)
            {
                rngX = randomBetween(50, canvas.width - 50);
                rngY = randomBetween(-20, -130);

                console.log("Posicion enemigo" + i + " " + rngX + "," + rngY);

                this.enemies.push(new Enemy(new Vector2(rngX, rngY)));
            }
            this.enemies.forEach(enemy => enemy.Start());
        }
    },

    Draw: function(ctx)
    {
        // Draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // background gradient
        ctx.fillStyle = this.bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if(!this.gameover)
        {
            // draw the player
            this.player.draw(ctx);

            // draw the enemies
            this.enemies.forEach(enemy => {
                enemy.Draw(ctx);
            });

            // draw the aiming point
            ctx.drawImage(graphicAssets.aim.image, Input.mouse.x - graphicAssets.aim.image.width / 2, Input.mouse.y - graphicAssets.aim.image.height / 2);

            // draw life
            for(let i = 0, anchor = graphicAssets.heart.image.width + 5; i < this.player.life / 2; i++)
            {
                if (Math.trunc(this.player.life / 2) >= i + 1)
                ctx.drawImage(graphicAssets.heart.image, 15 + anchor * i, 10);
                else
                ctx.drawImage(graphicAssets.halfheart.image, 15 + anchor * i, 10);
            }

            // Corazones vacios hardcodeados, no me gusta este approach
            if (this.player.life < 5) ctx.drawImage(graphicAssets.emptyheart.image, 15 + (graphicAssets.heart.image.width + 5) * 2, 10);
            if (this.player.life < 3) ctx.drawImage(graphicAssets.emptyheart.image, 15 + graphicAssets.heart.image.width + 5, 10);
            if (this.player.life < 1) ctx.drawImage(graphicAssets.emptyheart.image, 15, 10);

            ctx.fillStyle = "white";
            ctx.font = "24px Courier"
            ctx.fillText("Score: " + this.score, canvas.width/2 + 50, 42);
        }
    }

}