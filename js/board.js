window.Tetris = window.Tetris || {};
Tetris.Board = {};

Tetris.Board.COLLISION = {NONE: 0, WALL: 1, GROUND: 2};
Object.freeze(Tetris.Board.COLLISION);

Tetris.Board.FIELD = {EMPTY: 0, ACTIVE: 1, PETRIFIED: 2};
Object.freeze(Tetris.Board.FIELD);

Tetris.Board.fields = [];
Tetris.Board.currentField = 0;

Tetris.Board.init = function(_x, _y, _p){
    for(var p = 0; p < _p; p++) {
        Tetris.Board.fields[p] = [];
        for(var x = 0; x < _x; x++) {
            Tetris.Board.fields[p][x] = [];
            for(var y = 0; y < _y; y++) {
                Tetris.Board.fields[p][x][y] = Tetris.Board.FIELD.EMPTY;
            }
        }
    }
}

Tetris.Board.testCollision = function(ground_check) {
    var x,y,p,i;

    var fields = Tetris.Board.fields;
    var posx = Tetris.Block.position.x;
    var posy = Tetris.Block.position.y;
    var shape = Tetris.Block.shape;

    for(i = 0; i < shape.length; i++){
        //Detecção nas 2 paredes
        if((shape[i].x + posx) < 0 ||
           (shape[i].x + posx) >= fields[0].length)
            return Tetris.Board.COLLISION.WALL;


        if(fields[Tetris.Board.currentField][shape[i].x + posx][shape[i].y + posy -1] === Tetris.Board.FIELD.PETRIFIED)
            return ground_check ? Tetris.Board.COLLISION.GROUND : Tetris.Board.COLLISION.WALL;

        if((shape[i].y + posy) < 0) {
            return Tetris.Board.COLLISION.GROUND;
        }
    }
};
