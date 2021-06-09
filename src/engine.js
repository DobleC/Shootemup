var debug = false; // <- Modo Debug

var canvas = null;
var ctx = null;

var currentFramesCounter = 0;
var lastFramesCounter = 0;
var targetDT = 1/30;
var acumDelta = 0;
var time = 0;
var lastTimeUpdate = 0;
var deltaTime = 0;

var pause = false;

// graphic assets references
var graphicAssets = {
    invader1: {
        path: "assets/invader1.png",
        image: null
    },
    invader2: {
        path: "assets/invader2.png",
        image: null
    },
    invader3: {
        path: "assets/invader3.png",
        image: null
    },
    invader4: {
        path: "assets/invader4.png",
        image: null
    },
    heart: {
        path: "assets/heart.png",
        image: null
    },
    halfheart: {
        path: "assets/halfheart.png",
        image: null
    },
    emptyheart: {
        path: "assets/emptyheart.png",
        image: null
    },
    nave: {
        path: "assets/nave.png",
        image: null
    },
    bullet: {
        path: "assets/bullet.png",
        image: null
    },
    shieldbullet: {
        path: "assets/holybullet.png",
        image: null
    },
    energy: {
        path: "assets/energy.png",
        image: null
    },
    bg: {
        path: "assets/bg.png",
        image: null
    },
    pulife: {
        path: "assets/PULife.png",
        image: null
    },
    puspeed: {
        path: "assets/PUSpeed.png",
        image: null
    },
    pushield: {
        path: "assets/PUShield.png",
        image: null
    },
    putriple: {
        path: "assets/PUTriple.png",
        image: null
    },
    puinvencible: {
        path: "assets/PUInvencible.png",
        image: null
    },
    puback: {
        path: "assets/PUBack.png",
        image: null
    },
    purate: {
        path: "assets/PURate.png",
        image: null
    },
    aim: {
        path: "assets/aim.png",
        image: null
    }
};

// audio assets references
var audio = {}

window.onload = BodyLoaded;

function LoadImages(assets, onloaded)
{
    let imagesToLoad = 0;
    
    const onload = () => --imagesToLoad === 0 && onloaded();

    // iterate through the object of assets and load every image
    for (let asset in assets)
    {
        if (assets.hasOwnProperty(asset))
        {
            imagesToLoad++; // one more image to load

            // create the new image and set its path and onload event
            const img = assets[asset].image = new Image;
            img.src = assets[asset].path;
            img.onload = onload;
        }
     }
    return assets;
}

function BodyLoaded()
{
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    // Setupead los eventos e inicia los menús de CSS
    SetupKeyboardEvents();
    SetupMouseEvents();
    InitMainMenu();
    InitGameOver();

}

// Inicia el menú inicial y asocia funciones a sus botones
function InitMainMenu() {
    const menuStartButton = document.getElementById("startButton");
    const menuCreditsButton = document.getElementById("creditsButton");
    const menu = document.getElementById("menu");

    //HideMenuAndStart();
    menuStartButton.onclick  = function() {
        HideMenuAndStart();
    };

    menuCreditsButton.onclick = function() {
        // hide the buttons
        menuStartButton.style.display = "none";
        menuCreditsButton.style.display = "none";

        // start the credits animation
        const creditsCont = document.querySelector("#credits > div");
        creditsCont.classList.add("creditsAnimation");

        //currentState = EngineState.Credits;

        creditsCont.addEventListener("animationend", function() {
            // animation end, show the buttons
            menuStartButton.style.display = "block";
            menuCreditsButton.style.display = "block";

            // reset animation
            creditsCont.classList.remove("creditsAnimation");

            //currentState = EngineState.MainMenu;
        }, false);
    }
}

// Inicia el menú de gameover y asocia recargar la página a su botón de retry
function InitGameOver() {
    const retryButton = document.getElementById("retryButton");
    const gameover = document.getElementById("gameover");
    
    gameover.style.left = "+" + menu.clientWidth + "px";

    retryButton.onclick  = function() {
        window.location.reload();
    };
    
}

// Esconde el menú al pulsar play y carga las imágenes
function HideMenuAndStart()
{
    menu.style.left = "-" + menu.clientWidth + "px";

    LoadImages(graphicAssets, function() {
        // load audio
        audio.laser = document.getElementById("laser");
        
        //Explosiones
        audio.expl1 = document.getElementById("expl1");
        audio.expl2 = document.getElementById("expl2");
        audio.expl3 = document.getElementById("expl3");

        audio.hurt = document.getElementById("hurt");

        audio.powerup = document.getElementById("powerup");

        // Start the game
        game.Start();

        // first loop call
        time = Date.now();
        Loop();
    })
}

// Invoca el menú de gameover
function GameOver()
{
    gameover.style.left = 0;
}

function Loop()
{
    window.requestAnimationFrame(Loop);

    let now = Date.now();

    deltaTime = (now - time) / 1000;
    // si el tiempo es mayor a 1 seg: se descarta
    if (deltaTime > 1)
        deltaTime = 0;

    time = now;

    lastTimeUpdate = now;

    currentFramesCounter++;
    
    acumDelta += deltaTime;

    if (acumDelta >= 1)
    {
        lastFramesCounter = currentFramesCounter;
        currentFramesCounter = 0;
        acumDelta = acumDelta - 1;
    }
    
    if (lastPress == KEY_PAUSE || lastPress == KEY_ESCAPE)
    {
        pause = !pause;
        lastPress = -1;
    }

    if (pause)
    {
        ctx.font = "120px sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', 240, 400);
        ctx.textAlign = 'left';
        return;
    }

    // update the game level
    game.Update(deltaTime);

    Draw(ctx);
}

function Draw(ctx)
{
    // draw the game level
   game.Draw(ctx);

   // Si está en modo debug, muestra datos de desarrollo
    if(debug)
    {
        // draw FPS data
        ctx.fillStyle = "white";
        ctx.font = "12px Comic Sans MS"
        ctx.fillText("frames=" + currentFramesCounter, 10, 630+20);
        ctx.fillText("deltaTime=" + deltaTime, 10, 630+36);
        ctx.fillText("current FPS=" + (1 / deltaTime).toFixed(2), 10, 630+52);
        ctx.fillText("last second FPS=" + lastFramesCounter, 10, 630+68);
    }
}
