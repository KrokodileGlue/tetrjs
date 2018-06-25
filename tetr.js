var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
document.addEventListener("keydown", keyDownHandler, false);

var RIGHT = 39, LEFT = 37, UP = 38, DOWN = 40, SPACE = 32, P = 80;
var keyDowns = [];

var field = [], score = 0, level = 0, lines = 0;
var gameOver = false, paused = false;

var levels = [53, 49, 45, 41, 37, 33, 28, 22, 17,
	      11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3];

function keyDownHandler (e) {
    keyDowns.push(e.keyCode);
    if (e.keyCode == UP || e.keyCode == DOWN
	|| e.keyCode == LEFT || e.keyCode == RIGHT)
	e.preventDefault();
}

function Piece (type) {
    this.b = [[0, 0, -1, 0, 1, 0, 0, 1],  // T piece
	      [0, 0, 0, -1, 0, 1, 1, 1],  // L piece
	      [0, 0, 1, 0, 0, 1, 1, 1],   // O piece
	      [0, 0, 0, -1, 0, 1, -1, 1], // J piece
	      [0, 0, 0, -1, 0, 1, 0, 2],  // I piece
	      [0, 0, 1, 0, 0, 1, -1, 1],  // S piece
	      [0, 0, -1, 0, 0, 1, 1, 1]   // Z piece
	     ][type].slice();
    this.col = ["#0095DD", "#1df99a", "#ffe502", "#ff011b",
		"#97ff30", "#a500ff", "#ff006e"][type];
    this.x = 4;
    this.y = 1;
    this.type = type;
    this.rotateRight = function () {
	if (this.type == 2) return;
	for (var i = 0; i < 4; i++) {
	    var temp = this.b[i * 2 + 1];
	    this.b[i * 2 + 1] = this.b[i * 2];
	    this.b[i * 2] = -temp;
	}
    }
    this.rotateLeft = function () {
	for (var i = 0; i < 3; i++) this.rotateRight();
    }
    this.draw = function () {
	ctx.beginPath();
	ctx.fillStyle = this.col;
	for (var i = 0; i < 4; i++) {
	    ctx.rect((this.x + this.b[i * 2] + 19) * pieceSize,
		     (this.y + this.b[i * 2 + 1] + 6) * pieceSize,
		     pieceSize,
		     pieceSize);
	}
	ctx.fill();
	ctx.closePath();
    }
    this.colliding = function () {
	for (var i = 0; i < 4; i++)
	    if (field[p.y + p.b[i * 2 + 1]][p.x + p.b[i * 2]] != null)
		return true;
    }
}

var pieceSize = 20, t = 0;
var p = null, nextPiece = Math.floor(Math.random() * 7);
for (var y = -5; y < 21; y++)
    field[y] = [], field[y][-1] = '#afafaf', field[y][10] = '#afafaf';
for (var i = 0; i < 10; i++)
    field[20][i] = '#afafaf';

function collision() {
    var numCleared = 0;
    for (var i = 0; i < 4; i++)
	field[p.y + p.b[i * 2 + 1]][p.x + p.b[i * 2]] = p.col;
    for (var y = 19; y >= 0; y--) {
	var full = true;
	for (var x = 0; x < 10; x++)
	    if (field[y][x] == null) full = false;
	if (!full) continue;
	for (var Y = y; Y > -5; Y--) {
	    field[Y] = field[Y - 1];
	}
	field[-5] = [], field[-5][-1] = '#afafaf', field[-5][10] = '#afafaf';
	numCleared++, y++;
    }

    switch (numCleared) {
    case 1: score += 40 * (level + 1); break;
    case 2: score += 100 * (level + 1); break;
    case 3: score += 300 * (level + 1); break;
    case 4: score += 1200 * (level + 1); break;
    }

    if (lines % 10 > (lines + numCleared) % 10) level++;
    if (level >= 20) level = 20;
    lines += numCleared;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    p.draw();
    preview.draw();

    for (var i = 0; i < 20; i++) {
	for (var j = 0; j < 10; j++) {
	    if (field[i][j] == null) continue;
	    ctx.beginPath();
	    ctx.fillStyle = field[i][j];
	    ctx.rect((19 + j) * pieceSize,
		     (i + 6) * pieceSize,
		     pieceSize,
		     pieceSize);
	    ctx.fill();
	    ctx.closePath();
	}
    }

    ctx.beginPath();
    ctx.rect(19 * pieceSize,
	     6 * pieceSize,
	     10 * pieceSize,
	     20 * pieceSize);
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "#000000";
    ctx.font = "30px Consolas";
    ctx.fillText("Score: " + score.toLocaleString(), 30 * pieceSize, 7 * pieceSize);
    ctx.fillText("Level: " + level, 30 * pieceSize, 9 * pieceSize);
    ctx.fillText("Lines: " + lines, 30 * pieceSize, 11 * pieceSize);
    if (gameOver) ctx.fillText("Game over!", 30 * pieceSize, 18 * pieceSize);
    if (paused)   ctx.fillText("Paused", 30 * pieceSize, 25.5 * pieceSize);
}

function draw () {
    if (t == 0 && !gameOver) {
	p = new Piece(nextPiece);
	nextPiece = Math.floor(Math.random() * 7);
	preview = new Piece(nextPiece);
	preview.x = 14, preview.y = 7.5;
    }
    if (keyDowns.includes(P)) paused = !paused;
    if (gameOver || paused) return keyDowns = [], render();
    if (p.colliding()) gameOver = true;
    t++;
    if (t % levels[level] == 0) p.y++;
    for (var i = 0; i < 4; i++) {
	if (field[p.y + p.b[i * 2 + 1]][p.x + p.b[i * 2]] != null) {
	    p.y--, t = 0;
	    collision(), render();
	    return;
	}
    }
    if (keyDowns.includes(SPACE)) {
	while (!p.colliding()) p.y++;
	p.y--, t = 0, keyDowns = [];
	collision(), render();
	return;
    }
    if (keyDowns.includes(LEFT))  p.x--;           if (p.colliding()) p.x++;
    if (keyDowns.includes(RIGHT)) p.x++;           if (p.colliding()) p.x--;
    if (keyDowns.includes(UP))    p.rotateRight(); if (p.colliding()) p.rotateLeft();
    if (keyDowns.includes(DOWN))  p.rotateLeft();  if (p.colliding()) p.rotateRight();
    keyDowns = [], render();
}

setInterval(draw, 16); /* About 60 times a second. */
