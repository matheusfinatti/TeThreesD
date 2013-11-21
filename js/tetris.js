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
    var viewAngle = 30;
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
        width: 100,
        height: 220,
        depth: 20,
        splitX: 10,
        splitY: 22,
        splitZ: 0
    };

    Tetris.boundingBoxConfig = boundingBoxConfig;
    Tetris.blockSize = boundingBoxConfig.width / boundingBoxConfig.splitX;

    var boundingBox = new THREE.Mesh(
        new THREE.CubeGeometry(
            boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth,
            boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ
        ),
        new THREE.MeshBasicMaterial({color: 0x666666, wireframe: true})
    );

    var boundingBox2 = new THREE.Mesh(
        new THREE.CubeGeometry(
            boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth-10,
            boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ
        ),
            new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true})
    );


    /* Move the second boundingbox */
    boundingBox2.position.x = boundingBoxConfig.width/2 + boundingBoxConfig.depth/4;
    boundingBox2.position.z = -boundingBoxConfig.width/2 - boundingBoxConfig.depth/4;
    boundingBox2.rotation.y = 1.57;

    var boundingBox3 = new THREE.Mesh(
        new THREE.CubeGeometry(
            boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth-10,
            boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ
        ),
            new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true})
    );

    /* Move the third boundingbox */
    boundingBox3.position.x = -boundingBoxConfig.width/2 - boundingBoxConfig.depth/4;
    boundingBox3.position.z = -boundingBoxConfig.width/2 - boundingBoxConfig.depth/4;
    boundingBox3.rotation.y = 1.57;

    var boundingBox4 = new THREE.Mesh(
        new THREE.CubeGeometry(
            boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth,
            boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ
        ),
            new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true})
    );

    /* Move the fourth boundingbox */
    boundingBox4.position.z = -boundingBoxConfig.width - boundingBoxConfig.width/2;

    /* Add all the boundingboxes to the scene */
    Tetris.scene.add(boundingBox);
    Tetris.scene.add(boundingBox2);
    Tetris.scene.add(boundingBox3);
    Tetris.scene.add(boundingBox4);

    /* First render */
    Tetris.renderer.render(Tetris.scene, Tetris.camera);

    /* Create Stats */
    Tetris.stats = new Stats();
    Tetris.stats.domElement.style.position = 'absolute';
    Tetris.stats.domElement.style.top = '10px';
    Tetris.stats.domElement.style.left = '10px';
    document.body.appendChild(Tetris.stats.domElement);

    document.getElementById('play_button').addEventListener('click', function(event){
        event.preventDefault();
        Tetris.start();
    });
};


Tetris.start = function() {
    /* Makes menu invisible */
    document.getElementById('menu').style.display = "none";
    Tetris.pointsDOM = document.getElementById('points');
    Tetris.pointsDOM.style.display = "block";
    Tetris.Block.generate();

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
        Tetris.Block.move(0, -1, 0);
    }

    Tetris.renderer.render(Tetris.scene, Tetris.camera);
    Tetris.stats.update();

    if(!Tetris.gameOver)
        window.requestAnimationFrame(Tetris.animate);
};

Tetris.staticBlocks = [];
Tetris.colors = [0x00ffff, 0xff0000, 0x00ff00, 0xffff00, 0xff00ff, 0x0000ff, 0xff5500]

/* Add Piece global ?
 * with its own color and shape ?
 * Keep track of pieces ?
 */

Tetris.addStaticBlock = function(x,y,z) {
    /* Adds a static block to (X,Y) position and P plane */
    if(Tetris.staticBlocks[x] === undefined)
        Tetris.staticBlocks[x] = [];
    if(Tetris.staticBlocks[x][y] === undefined)
        Tetris.staticBlocks[x][y] = [];

    var mesh = THREE.SceneUtils.createMultiMaterialObject(new THREE.CubeGeometry(
        Tetris.blockSize, Tetris.blockSize, Tetris.blockSize),
            [new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
            new THREE.MeshBasicMaterial({color: Tetris.colors[z]})]);

    mesh.position.x = (x - Tetris.boundingBoxConfig.splitX/2) * Tetris.blockSize + Tetris.blockSize/2;
    mesh.position.y = (y - Tetris.boundingBoxConfig.splitY/2) * Tetris.blockSize + Tetris.blockSize/2;
    mesh.position.z = (z - Tetris.boundingBoxConfig.splitZ/2) * Tetris.blockSize + Tetris.blockSize/2;

    mesh.overdraw = true;

    Tetris.scene.add(mesh);
    Tetris.staticBlocks[x][y][z] = mesh;
};

/* Function to keep score */
Tetris.currentPoints = 0;
Tetris.addPoints = function(n) {
    Tetris.currentPoints += n;
    Tetris.pointsDOM.innerHTML = Tetris.currentPoints;
};

window.addEventListener("load", Tetris.init);

window.addEventListener('keydown', function(event){
    var key = event.which ? event.which : event.keyCode;

    switch(key){
        case 38: // up arrow
            Tetris.Block.move(0, 1, 0);
            break;
        case 40: // down arrow
            Tetris.Block.move(0, -1, 0);
            break;
        case 37: // left arrow
            Tetris.Block.move(-1, 0, 0);
            break;
        case 39: // right arrow
            Tetris.Block.move(1, 0, 0);
            break;
        case 88: // x
            Tetris.Block.rotate(90);
            break;
        case 90: // z
            Tetris.Block.rotate(-90);
            break;
    }
}, false);
