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
Tetris.swap = {};

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
    Tetris.renderer.setClearColorHex( 0x000000, 1);

    /* Attach the render-supplied DOM element */
    document.body.appendChild(Tetris.renderer.domElement);

    /* Configuration object */
    var boundingBoxConfig = {
        width: 100,
        height: 220,
        depth: 10,
        splitX: 10,
        splitY: 22,
        splitZ: 0
    };

    var meshMaterial1 = new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true});
    var meshMaterial2 = new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true});
    var meshMaterial3 = new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true});
    var meshMaterial4 = new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true});
    var boxCube = new THREE.CubeGeometry(
        boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth,
        boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ
    );

    Tetris.boundingBoxConfig = boundingBoxConfig;
    Tetris.blockSize = boundingBoxConfig.width / boundingBoxConfig.splitX;

    //Init the board
    Tetris.Board.init(boundingBoxConfig.splitX, boundingBoxConfig.splitY, 4);

    var boundingBox = new THREE.Mesh(boxCube, meshMaterial1);
    var boundingBox2 = new THREE.Mesh(boxCube, meshMaterial2);
    var boundingBox3 = new THREE.Mesh(boxCube, meshMaterial3);
    var boundingBox4 = new THREE.Mesh(boxCube, meshMaterial4);

    /* Paint the first boundingbox */
    boundingBox.material.color = new THREE.Color(0x888888);
    boundingBox2.material.color = new THREE.Color(0x222222);

    /* Move the second boundingbox */
    boundingBox2.position.x = boundingBoxConfig.width/2 + boundingBoxConfig.depth;
    boundingBox2.position.z = -boundingBoxConfig.width/2 - boundingBoxConfig.depth;
    boundingBox2.rotation.y = 1.57;


    /* Move the third boundingbox */
    boundingBox3.position.x = -boundingBoxConfig.width/2 - boundingBoxConfig.depth;
    boundingBox3.position.z = -boundingBoxConfig.width/2 - boundingBoxConfig.depth;
    boundingBox3.rotation.y = 1.57;

    /* Move the fourth boundingbox */
    boundingBox4.position.z = -boundingBoxConfig.width - boundingBoxConfig.depth*2;

    /* Add all the boundingboxes to the scene */
    Tetris.box1 = boundingBox;
    Tetris.box2 = boundingBox2;
    Tetris.box3 = boundingBox4;
    Tetris.box4 = boundingBox3;
    Tetris.scene.add(boundingBox);
    Tetris.scene.add(boundingBox2);
    Tetris.scene.add(boundingBox3);
    Tetris.scene.add(boundingBox4);

    /* Game configuration */
    Tetris.swap.swapped = false;

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
        Tetris.Block.move(0, 1, 0);
    }

    Tetris.renderer.render(Tetris.scene, Tetris.camera);
    Tetris.stats.update();

    if(!Tetris.gameOver)
        window.requestAnimationFrame(Tetris.animate);
};

Tetris.staticBlocks = [];
for(var i = 0; i < 4; i++){
    Tetris.staticBlocks[i] = [];
    for(var j = 0; j < 22; j++){
        Tetris.staticBlocks[i][j] = [];
        for(var k = 0; k < 10; k++)
            Tetris.staticBlocks[i][j][k] = [];
    }
}
Tetris.colors = [0x00ffff, 0xff0000, 0x00ff00, 0xffff00, 0xff00ff, 0x0000ff, 0xff5500]

Tetris.addStaticBlock = function(x,y,p) {
    /* Adds a static block to (X,Y) position and P plane */
    if(Tetris.staticBlocks[p][x] === undefined)
        Tetris.staticBlocks[p][x] = [];
    if(Tetris.staticBlocks[p][x][y] === undefined)
        Tetris.staticBlocks[p][x][y] = [];

    var mesh = THREE.SceneUtils.createMultiMaterialObject(new THREE.CubeGeometry(
        Tetris.blockSize, Tetris.blockSize, Tetris.blockSize),
            [new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
            new THREE.MeshBasicMaterial({color: Tetris.Block.color})]);

    mesh.position.x = (x - Tetris.boundingBoxConfig.splitX/2) * Tetris.blockSize + Tetris.blockSize/2;
    mesh.position.y = (y - Tetris.boundingBoxConfig.splitY/2) * Tetris.blockSize + Tetris.blockSize/2;
    mesh.position.z = 0;

    mesh.overdraw = true;

    Tetris.scene.add(mesh);
    Tetris.staticBlocks[p][x][y] = mesh;
};

/* Function to keep score */
Tetris.currentPoints = 0;
Tetris.addPoints = function(n) {
    Tetris.currentPoints += n;
    Tetris.pointsDOM.innerHTML = Tetris.currentPoints;
};

Tetris.rotateCamera = function(alpha){
    switch(Tetris.Board.currentField){
        case 0:
            if(alpha > 0){ // Goes to board 1
                Tetris.camera.position.x = 600 + Tetris.boundingBoxConfig.depth + Tetris.boundingBoxConfig.width/2;
                Tetris.camera.position.z = -Tetris.boundingBoxConfig.width/2 -Tetris.boundingBoxConfig.depth;
                Tetris.camera.rotation.y = alpha * Math.PI/180;
                Tetris.Board.currentField = 1;
                Tetris.Block.mesh.position.z = Tetris.Block.position.x * -1 - Tetris.boundingBoxConfig.width/2 - 1;
                Tetris.Block.mesh.position.x = Tetris.boundingBoxConfig.width/2 + Tetris.boundingBoxConfig.depth;
                Tetris.Block.mesh.rotation.y = alpha * Math.PI/180;
                Tetris.box1.material.color = new THREE.Color(0x222222);
                Tetris.box2.material.color = new THREE.Color(0x888888);
                break;
            } else { // Goes to board 3
                Tetris.camera.position.x = -600 - Tetris.boundingBoxConfig.depth - Tetris.boundingBoxConfig.width/2;
                Tetris.camera.position.z = -Tetris.boundingBoxConfig.width/2 -Tetris.boundingBoxConfig.depth;
                Tetris.camera.rotation.y = -3*alpha * Math.PI/180;
                Tetris.Board.currentField = 3;
                Tetris.Block.mesh.position.z = -Tetris.Block.position.x - Tetris.boundingBoxConfig.width/2 - 11;
                Tetris.Block.mesh.position.x = -Tetris.boundingBoxConfig.width/2 - Tetris.boundingBoxConfig.depth;
                Tetris.Block.mesh.rotation.y += alpha * Math.PI/180;
                Tetris.box1.material.color = new THREE.Color(0x222222);
                Tetris.box4.material.color = new THREE.Color(0x888888);
                break;
            }
        case 1:
            if(alpha > 0){ // Goes to board 2
                Tetris.camera.position.x = 0;
                Tetris.camera.position.z = -600 - Tetris.boundingBoxConfig.width - Tetris.boundingBoxConfig.depth*2;
                Tetris.camera.rotation.y = 2*alpha * Math.PI/180;
                Tetris.Board.currentField = 2;
                Tetris.Block.mesh.position.x = Tetris.Block.position.x + 1;
                Tetris.Block.mesh.position.z = -Tetris.boundingBoxConfig.width - 2*Tetris.boundingBoxConfig.depth;
                Tetris.Block.mesh.rotation.y += alpha * Math.PI/180;
                Tetris.box2.material.color = new THREE.Color(0x222222);
                Tetris.box3.material.color = new THREE.Color(0x888888);
                break;
            } else { // Goest to board 0
                Tetris.camera.position.x = 0;
                Tetris.camera.position.z = 600;
                Tetris.camera.rotation.y = 0;
                Tetris.Board.currentField = 0;
                Tetris.Block.mesh.position.x = -Tetris.Block.position.x - 1;
                Tetris.Block.mesh.position.z = 0;
                Tetris.Block.mesh.rotation.y = 0;
                Tetris.box2.material.color = new THREE.Color(0x222222);
                Tetris.box1.material.color = new THREE.Color(0x888888);
                break;
            }
        case 2:
            if(alpha > 0){ //Goes to board 3
                Tetris.camera.position.x = -600 - Tetris.boundingBoxConfig.depth - Tetris.boundingBoxConfig.width/2;
                Tetris.camera.position.z = -Tetris.boundingBoxConfig.width/2 -Tetris.boundingBoxConfig.depth;
                Tetris.camera.rotation.y = 3*alpha * Math.PI/180;
                Tetris.Board.currentField = 3;
                Tetris.Block.mesh.position.z = -Tetris.Block.position.x - Tetris.boundingBoxConfig.width/2 - 11;
                Tetris.Block.mesh.position.x = -Tetris.boundingBoxConfig.width/2 - Tetris.boundingBoxConfig.depth;
                Tetris.Block.mesh.rotation.y += alpha * Math.PI/180;
                Tetris.box3.material.color = new THREE.Color(0x222222);
                Tetris.box4.material.color = new THREE.Color(0x888888);
                break;
            } else { // Goes to board 1
                Tetris.camera.position.x = 600 + Tetris.boundingBoxConfig.depth + Tetris.boundingBoxConfig.width/2;
                Tetris.camera.position.z = -Tetris.boundingBoxConfig.width/2 -Tetris.boundingBoxConfig.depth;
                Tetris.camera.rotation.y = -alpha * Math.PI/180;
                Tetris.Board.currentField = 1;
                Tetris.Block.mesh.position.z = Tetris.Block.position.x * -1 - Tetris.boundingBoxConfig.width/2 - 1;
                Tetris.Block.mesh.position.x = Tetris.boundingBoxConfig.width/2 + Tetris.boundingBoxConfig.depth;
                Tetris.Block.mesh.rotation.y = -alpha * Math.PI/180;
                Tetris.box3.material.color = new THREE.Color(0x222222);
                Tetris.box2.material.color = new THREE.Color(0x888888);
                break;
            }
        case 3:
            if(alpha > 0){ // Goes to board 0
                Tetris.camera.position.x = 0;
                Tetris.camera.position.z = 600;
                Tetris.camera.rotation.y = 0;
                Tetris.Board.currentField = 0;
                Tetris.Block.mesh.position.x = -Tetris.Block.position.x - 1;
                Tetris.Block.mesh.position.z = 0;
                Tetris.Block.mesh.rotation.y = 0;
                Tetris.box4.material.color = new THREE.Color(0x222222);
                Tetris.box1.material.color = new THREE.Color(0x888888);
                break;
            } else { //Goes to board 2
                Tetris.camera.position.x = 0;
                Tetris.camera.position.z = -600 - Tetris.boundingBoxConfig.width - Tetris.boundingBoxConfig.depth*2;
                Tetris.camera.rotation.y = 2*alpha * Math.PI/180;
                Tetris.Board.currentField = 2;
                Tetris.Block.mesh.position.x = Tetris.Block.position.x + 1;
                Tetris.Block.mesh.position.z = -Tetris.boundingBoxConfig.width - 2*Tetris.boundingBoxConfig.depth;
                Tetris.Block.mesh.rotation.y += alpha * Math.PI/180;
                Tetris.box4.material.color = new THREE.Color(0x222222);
                Tetris.box3.material.color = new THREE.Color(0x888888);
                break;
            }
    }
}

window.addEventListener("load", Tetris.init);

window.addEventListener('keydown', function(event){
    var key = event.which ? event.which : event.keyCode;

    switch(key){
        case 32: // Space
            for(var i = 0; i < 22; i++){
                if(Tetris.Block.hit){
                    Tetris.Block.hit = false;
                    break;
                }
                Tetris.Block.move(0, 1, 0);
            }
            break;
        case 40: // down arrow
            Tetris.Block.move(0, 1, 0);
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
        case 83:
//            Tetris.rotateBoard(-1);
            Tetris.rotateCamera(-90);
            break;
        case 65:
            Tetris.rotateCamera(90);
            break;
    }
}, false);

