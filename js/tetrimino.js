Tetris.Utils = {};

Tetris.Utils.cloneVector = function(v) {
    return{x: v.x, y: v.y, z: v.z};
};

Tetris.Utils.roundVector = function(v) {
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    v.z = Math.round(v.z);
}

Tetris.Block = {};
Tetris.Block.shapes = [
    [   /* T */
        {x: 0, y: 0, z: 0},
        {x: 1, y: 0, z: 0},
        {x: 1, y: -1, z: 0},
        {x: 2, y: 0, z: 0}
    ],
    [
        /* I */
        {x: 0, y: 0, z: 0},
        {x: 1, y: 0, z: 0},
        {x: 2, y: 0, z: 0},
        {x: 3, y: 0, z: 0}
    ]
];

Tetris.Block.position = {};

Tetris.Block.generate = function() {
    var geometry, tmpGeometry;
    var type = Math.floor(Math.random() * (Tetris.Block.shapes.length));
    this.blockType = type;

    Tetris.Block.shape = [];
    for(var i = 0; i < Tetris.Block.shapes[type].length; i++){
        Tetris.Block.shape[i] = Tetris.Utils.cloneVector(Tetris.Block.shapes[type][i]);
    }

    /* Creates a new geometry that is the union of single cubes as a tetrimino */
    geometry = new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize);
    for(var i = 1; i < Tetris.Block.shape.length; i++){
        tmpGeometry = new THREE.Mesh(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize));
        tmpGeometry.position.x = Tetris.blockSize * Tetris.Block.shape[i].x;
        tmpGeometry.position.y = Tetris.blockSize * Tetris.Block.shape[i].y;
        THREE.GeometryUtils.merge(geometry, tmpGeometry);
    }

    Tetris.Block.mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
        new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
        new THREE.MeshBasicMaterial({color: 0xff0000})
    ]);

    /* Sets initial position */
    Tetris.Block.position = {x: 4,
                             y: 22};

    if(Tetris.Board.testCollision(true) === Tetris.Board.COLLISION.GROUND) {
        Tetris.gameOver = true;
        Tetris.pointsDOM.innerHTML = "GAME OVER";
        //Tetris.sounds["gameover"].play();
    }

    Tetris.Block.mesh.position.x = -Tetris.blockSize/2;
    Tetris.Block.mesh.position.y = Tetris.boundingBoxConfig.height/2 + Tetris.blockSize/2 ;
    Tetris.Block.mesh.position.z = 0;
    Tetris.Block.mesh.rotation.x = 0;
    Tetris.Block.mesh.rotation.y = 0;
    Tetris.Block.mesh.rotation.z = 0;
    Tetris.Block.mesh.overdraw = true;

    Tetris.scene.add(Tetris.Block.mesh);
};

Tetris.Block.rotate = function(alpha) {
    Tetris.Block.mesh.rotation.z += alpha * Math.PI / 180;

    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.setRotationFromEuler(Tetris.Block.mesh.rotation);

    for(var i = 0; i < Tetris.Block.shape.length; i++){
        Tetris.Block.shape[i] = rotationMatrix.multiplyVector3(
            Tetris.Utils.cloneVector(Tetris.Block.shapes[this.blockType][i])
        );
        Tetris.Utils.roundVector(Tetris.Block.shape[i]);
    }

    if(Tetris.Board.testCollision(false) === Tetris.Board.COLLISION.WALL) {
        Tetris.Block.rotate(-alpha);
    }
};

Tetris.Block.normalizePosition = function(p) {
    positions = [
    ]
}

Tetris.Block.move = function(x,y) {
    Tetris.Block.mesh.position.x += x * Tetris.blockSize;
    Tetris.Block.position.x += x;

    Tetris.Block.mesh.position.y -= y * Tetris.blockSize;
    Tetris.Block.position.y -= y;

    var collision = Tetris.Board.testCollision((y != 0));
    if(collision === Tetris.Board.COLLISION.WALL) {
        Tetris.Block.move(-x, 0);
    }

    if(collision === Tetris.Board.COLLISION.GROUND) {
        Tetris.Block.hitBottom();
//        Tetris.Board.checkCompleted();
    }
};

Tetris.Block.hitBottom = function() {
    Tetris.Block.petrify();
    Tetris.scene.remove(Tetris.Block.mesh);
    Tetris.Block.generate();
};

Tetris.Block.petrify = function() {
    var shape = Tetris.Block.shape;
    for(var i = 0; i < shape.length; i++){
        Tetris.addStaticBlock(Tetris.Block.position.x + shape[i].x, Tetris.Block.position.y + shape[i].y +1, Tetris.Board.currentField);
        Tetris.Board.fields[Tetris.Board.currentField][Tetris.Block.position.x + shape[i].x][Tetris.Block.position.y + shape[i].y] = Tetris.Board.FIELD.PETRIFIED;
    }
};
