window.Tetris = window.Tetris || {};

Tetris.Utils = {};

Tetris.Utils.cloneVector = function(v) {
    return{x: v.x, y: v.y, z: v.z};
};

Tetris.Block = {};
Tetris.Block.shapes = [
    [   /* T */
        {x: 0, y: 0, z: 0},
        {x: 1, y: 0, z: 0},
        {x: 1, y: 1, z: 0},
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
    Tetris.Block.position = {x: 0,
                             y: Math.floor(Tetris.boundingBoxConfig.height/6),
                             z: 0};

    Tetris.Block.mesh.position.x = (Tetris.Block.position.x - Tetris.boundingBoxConfig.splitX/2)*Tetris.blockSize/2;
    Tetris.Block.mesh.position.y = (Tetris.Block.position.y - Tetris.boundingBoxConfig.splitY/2)*Tetris.blockSize/2;
    Tetris.Block.mesh.position.z = (Tetris.Block.position.z - Tetris.boundingBoxConfig.splitZ/2)*Tetris.blockSize + Tetris.blockSize/2;
    Tetris.Block.mesh.rotation.x = 0;
    Tetris.Block.mesh.rotation.y = 0;
    Tetris.Block.mesh.rotation.z = 0;
    Tetris.Block.mesh.overdraw = true;

    Tetris.scene.add(Tetris.Block.mesh);
};

Tetris.Block.rotate = function(x) {
    Tetris.Block.mesh.rotation.x += x * Math.PI / 180;
};

Tetris.Block.move = function(x,y) {
    Tetris.Block.mesh.position.x += x * Tetris.blockSize;
    Tetris.Block.position.x += x;

    Tetris.Block.mesh.position.y += y * Tetris.blockSize;
    Tetris.Block.position.y =+ y;

    if(Tetris.Block.position.y <= -Math.floor(Tetris.boundingBoxConfig.height/6))
        Tetris.Block.hitBottom();
};

Tetris.Block.hitBottom = function() {
    Tetris.Block.petrify();
    Tetris.scene.removeObject(Tetris.Block.mesh);
    Tetris.Block.generate();
};

Tetris.Block.petrify = function() {
    var shape = Tetris.Block.shape;
    for(var i = 0; i < shape.length; i++){
        Tetris.addStaticBlock(Tetris.Block.position.x + shape[i].x, Tetris.Block.position.y + shape[i].y, 0);
    }
};
