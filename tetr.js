var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var spacePressed = false;
var pPressed = false;

document.addEventListener("keydown", keyDownHandler, false);

function keyDownHandler (e) {
    if (e.keyCode == 39) {
	rightPressed = true;
    } else if (e.keyCode == 37) {
	leftPressed = true;
    } else if (e.keyCode == 38) {
	upPressed = true;
    } else if (e.keyCode == 40) {
	downPressed = true;
    } else if (e.keyCode == 32) {
	spacePressed = true;
    } else if (e.keyCode == 80) {
	pPressed = true;
    }

    // Prevent arrow keys from scrolling around.
    if (rightPressed || leftPressed || upPressed || downPressed)
	e.preventDefault();
}

var field = new Array();
var score = 0;
var level = 0;
var lines = 0;

var gameOver = false;
var paused = false;

var levels = [
    53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9,
    8, 7, 6, 6, 5, 5, 4, 4, 3
];

var shapes = [
    [0, 0, -1, 0, 1, 0, 0, 1], // T piece
    [0, 0, 0, -1, 0, 1, 1, 1], // L piece
    [0, 0, 1, 0, 0, 1, 1, 1], // O piece
    [0, 0, 0, -1, 0, 1, -1, 1], // J piece
    [0, 0, 0, -1, 0, 1, 0, 2], // I piece
    [0, 0, 1, 0, 0, 1, -1, 1], // S piece
    [0, 0, -1, 0, 0, 1, 1, 1], // Z piece
];

var cols = [
    "#0095DD",
    "#1df99a",
    "#ffe502",
    "#ff011b",
    "#97ff30",
    "#a500ff",
    "#ff006e",
]

function Piece (type) {
    this.b = shapes[type].slice();
    this.col = cols[type];
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
	for (var i = 0; i < 4; i++) {
	    var x = p.x + p.b[i * 2];
	    var y = p.y + p.b[i * 2 + 1];
	    if (field[y][x] != null) return true;
	}
	return false;
    }
}

var pieceSize = 20;
var t = 0;
var p;
var nextPiece = Math.floor(Math.random() * 7);

for (var y = -5; y < 21; y++) {
    field[y] = new Array();
    field[y][-1] = '#afafaf';
    field[y][10] = '#afafaf';
}

for (var i = 0; i < 10; i++)
    field[20][i] = '#afafaf';

function collision() {
    /* Put the piece into the field. */
    for (var i = 0; i < 4; i++) {
	var x = p.x + p.b[i * 2];
	var y = p.y + p.b[i * 2 + 1];
	field[y][x] = p.col;
    }

    var numCleared = 0;

    /* Check for full lines. */
    for (var y = 19; y >= 0; y--) {
	var full = true;
	for (var x = 0; x < 10; x++) {
	    if (field[y][x] == null) {
		full = false;
		break;
	    }
	}
	if (!full) continue;
	numCleared++;
	for (var Y = y; Y > -5; Y--) {
	    field[Y] = field[Y - 1];
	}
	field[-5] = new Array();
	field[-5][-1] = '#afafaf';
	field[-5][10] = '#afafaf';
	y++;
    }

    if (numCleared == 1) {
	score += 40 * (level + 1);
    } else if (numCleared == 2) {
	score += 100 * (level + 1);
    } else if (numCleared == 3) {
	score += 300 * (level + 1);
    } else if (numCleared == 4) {
	score += 1200 * (level + 1);
    }

    if (lines % 10 > (lines + numCleared) % 10) {
	level++;
	if (level >= 20) level = 20;
    }

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
    if (gameOver)
	ctx.fillText("Game over!", 30 * pieceSize, 18 * pieceSize);
    if (paused)
	ctx.fillText("Paused", 30 * pieceSize, 25.5 * pieceSize);
}

function draw () {
    if (t == 0 && !gameOver) {
	console.log("hue");
	p = new Piece(nextPiece);
	nextPiece = Math.floor(Math.random() * 7);
	preview = new Piece(nextPiece);
	preview.x = 14;
	preview.y = 7.5;
    }

    if (pPressed) paused = !paused, pPressed = false;
    if (gameOver || paused) {
	leftPressed = rightPressed = upPressed
	    = downPressed = spacePressed = false;
	render();
	return;
    }
    if (p.colliding()) gameOver = true;

    t++;
    if (t % levels[level] == 0) p.y++;

    /* Check for collisions with the field. */
    for (var i = 0; i < 4; i++) {
	var x = p.x + p.b[i * 2];
	var y = p.y + p.b[i * 2 + 1];

	if (field[y][x] != null) {
	    p.y--;
	    collision();
	    t = 0;
	    render();
	    return;
	}
    }

    if (spacePressed) {
	while (!p.colliding()) p.y++;
	spacePressed = false;
	p.y--;
	collision();
	render();
	t = 0;
	return;
    }

    if (leftPressed)   p.x--;
    if (p.colliding()) p.x++;
    if (rightPressed)  p.x++;
    if (p.colliding()) p.x--;
    if (upPressed)     p.rotateRight();
    if (p.colliding()) p.rotateLeft();
    if (downPressed)   p.rotateLeft();
    if (p.colliding()) p.rotateLeft();

    leftPressed = rightPressed = upPressed
	= downPressed = spacePressed = false;

    render();
}

setInterval(draw, 16);
