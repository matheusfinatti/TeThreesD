/* Compatibility code */
if(!window.requestAnimationFrame) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000/60);
        };
    })();
}

/* Main variable. All objects, functions and variables will be a member of Tetris */
var Tetris = {};

Tetris.init = function() {
    /* Scene size */
    var width = window.innerWidth;
    var height = window.innerHeight - 100;

    /* Camera attributes */
    var viewAngle = 45;
    var aspect = width/height;
    var near = 0.1;
    var far = 10000;

    /* Create WebGL renderer, camera and a scene */
    Tetris.renderer = new THREE.WebGLRenderer();
    Tetris.camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
    Tetris.scene = new THREE.Scene();

    /* Camera starts at 0,0,0 so pull it back */
    Tetris.camera.position.z = 600;
    Tetris.scene.add(Tetris.camera);

    /* Start the renderer */
    Tetris.renderer.setSize(width, height);

    /* Attach the render-supplied DOM element */
    document.body.appendChild(Tetris.renderer.domElement);

    /* Configuration object */
    var boundingBoxConfig = {
        width: 360,
        height: 360,
        depth: 1200,
        splitX: 6,
        splitY: 6,
        splitZ: 20
    };

    Tetris.boundingBoxConfig = boundingBoxConfig;
    Tetris.blockSize = boundingBoxConfig.width / boundingBoxConfig.splitX;

    var boundingBox = new THREE.Mesh(
        new THREE.CubeGeometry(
            boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth,
            boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ
        ),
        new THREE.MeshBasicMaterial({color: 0xffaa00, wireframe: true, })
    );

    Tetris.scene.add(boundingBox);

    /* First render */
    Tetris.renderer.render(Tetris.scene, Tetris.camera);

    /* Create Stats */
    Tetris.stats = new Stats();
    Tetris.stats.domElement.style.position = 'absolute';
    Tetris.stats.domElement.style.top = '10px';
    Tetris.stats.domElement.style.left = '10px';
    document.body.appendChild(Tetris.stats.domElement);

    document.getElementById('play_button'.addEventListener('click', function(event){
        event.preventDefault();
        Tetris.start();
    });
};


Tetris.start = function() {
    /* Makes menu invisible */
    document.getElementById('menu').style.display = "none";
    Tetris.pointsDOM = document.getElementById('points');
    Tetris.pointsDOM.style.display = "block";

    Tetris.animate();
}


Tetris.gameStepTime = 1000;
Tetris.frameTime = 0;
Tetris.cumulatedFrameTime = 0;
Tetris._lastFrameTime = Date.now();

Tetris.gameOver = false;

Tetris.animate = function() {
    var time = Date.now();
    Tetris.frameTime = time - Tetris._lastFrameTime;
    Tetris._lastFrameTime = time;
    Tetris.cumulatedFrameTime += Tetris.frameTime;

    while(Tetris.cumulatedFrameTime > Tetris.gameStepTime) {
        /* Block movement goes here */
        Tetris.cumulatedFrameTime -= Tetris.gameStepTime;
    }

    Tetris.renderer.render(Tetris.scene, Tetris.camera);
    Tetris.stats.update();

    if(!Tetris.gameOver)
        window.requestAnimationFrame(Tetris.animate);
}

window.addEventListener("load", Tetris.init);
