<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nameless Shoot'em Up</title>
    <script src="src/utils.js"></script>
    <script src="src/input.js"></script>
    <script src="src/engine.js"></script>
    <script src="src/game.js"></script>
    <script src="src/bulletPool.js"></script>
    <script src="src/player.js"></script>
    <script src="src/enemy.js"></script>
    <script src="src/powerUp.js"></script>
    <script src="src/ssanimation.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="container">
        <canvas id="myCanvas" width="500" height="720"></canvas>
        <div id="gameover">
            <div id="finalScore">
                <div>
                    <p>Final Score: <span id="gamescore">0</span></p>
                    <p> </p>
                </div>
            </div>
            <div class="menuButton" id="retryButton">Retry?</div>
            
        </div>
        <div id="menu">
            <div class="menuButton" id="startButton">Start</div>
            <div class="menuButton" id="creditsButton">Credits</div>
            <div id="credits">
                <div>
                    <p>Carlos DobleC</p>
                    <p>- Programmer</p>
                    <p>- Designer</p>
                    <p> </p>
                    <p>Maximiliano Miranda</p>
                    <p>- Engine</p>
                </div>
            </div>
        </div>
        
    </div>
    <audio id="laser"   src="assets/laser.wav"      style="display: none;"></audio>
    <audio id="expl1"   src="assets/explosion1.wav" style="display: none;"></audio>
    <audio id="expl2"   src="assets/explosion2.wav" style="display: none;"></audio>
    <audio id="expl3"   src="assets/explosion3.wav" style="display: none;"></audio>
    <audio id="hurt"    src="assets/hurt.wav"       style="display: none;"></audio>
    <audio id="powerup" src="assets/powerup.wav"    style="display: none;"></audio>
    <audio id="music"   src="assets/music.wav"      style="display: none;"></audio>
</body>
</html>