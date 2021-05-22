
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
    player_ship: {
        path: "assets/baoyzx.png",
        image: null
    },
    misil: {
        path: "assets/misil.png",
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

    SetupKeyboardEvents();
    SetupMouseEvents();

    LoadImages(graphicAssets, function() {
        // load audio
        audio.laser = document.getElementById("laserSound");

        // Start the game
        game.Start();

        // first loop call
        time = Date.now();
        Loop();
    })
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

    // draw FPS data
    ctx.fillStyle = "white";
    ctx.font = "12px Comic Sans MS"
    ctx.fillText("frames=" + currentFramesCounter, 10, 20);
    ctx.fillText("deltaTime=" + deltaTime, 10, 36);
    ctx.fillText("current FPS=" + (1 / deltaTime).toFixed(2), 10, 52);
    ctx.fillText("last second FPS=" + lastFramesCounter, 10, 68);
}
