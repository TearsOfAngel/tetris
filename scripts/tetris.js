let score = 0;
let lines = 0;

const tetrominos = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const colors = {
  I: "#B5EAEA", // голубой
  O: "#FFF4E3", // кремовый
  T: "#FFE5D9", // светло-розовый
  S: "#D0E1F9", // голубой
  Z: "#F4DCC9", // персиковый
  J: "#F8EDD3", // бежевый
  L: "#D7ECD9", // светло-зеленый
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
  const sequence = ["I", "J", "L", "O", "S", "T", "Z"];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }

  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];

  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === "I" ? -1 : -2;

  return {
    name: name, // название фигуры (L, O и т. д.)
    matrix: matrix, // текущая матрица поворота
    row: row, // текущая строка (начинается за пределами экрана)
    col: col, // текущий столбец
  };
}

function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));

  return result;
}

function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (
        matrix[row][col] &&
        (cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          playfield[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }

  return true;
}

function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        if (tetromino.row + row < 0) {
          return showGameOver();
        }
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  let linesCleared = 0;
  for (let row = playfield.length - 1; row >= 0; row--) {
    if (playfield[row].every((cell) => cell !== 0)) {
      playfield.splice(row, 1);
      playfield.unshift(Array(10).fill(0));
      linesCleared++;
    }
  }

  if (linesCleared > 0) {
    score += linesCleared * 10; // Увеличиваем счет на 10 за каждую сгоревшую линию
    lines += linesCleared;
    updateScore(); // Обновляем отображение счета
  }

  tetromino = getNextTetromino();
}

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;
  alert("Игра окончена");
}

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const grid = 32;
const tetrominoSequence = [];


const playfield = [];

for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}



let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;

// основной цикл игры
function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];
        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  let dropInterval = 35; // Изначальный интервал падения фигур

  // Изменение скорости в зависимости от счета
  switch (true) {
    case score >= 100:
      dropInterval = 20;
      break;
    case score >= 75:
      dropInterval = 25;
      break;
    case score >= 50:
      dropInterval = 30;
      break;
    case score >= 25:
      dropInterval = 32;
      break;
    default:
      dropInterval = 35;
      break;
  }

  if (tetromino) {
    // фигура падает каждые dropInterval кадров
    if (++count > dropInterval) {
      tetromino.row++;
      count = 0;

      // помещаем фигуру, если она сталкивается с чем-то
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    context.fillStyle = colors[tetromino.name];

    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect(
            (tetromino.col + col) * grid,
            (tetromino.row + row) * grid,
            grid - 1,
            grid - 1
          );
        }
      }
    }
  }
}

// слушаем события клавиатуры для перемещения активной фигуры
document.addEventListener("keydown", function (e) {
  if (gameOver) return;

  // изменение положения лево/право
  if (e.which === 37 || e.which === 39) {
    const col = e.which === 37 ? tetromino.col - 1 : tetromino.col + 1;

    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }

  // обработчик клавиши вверх для изменения положения
  if (e.which === 38) {
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }

  // обработчик клавиши вниз для дропа фигуры
  if (e.which === 40) {
    const row = tetromino.row + 1;

    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;

      placeTetromino();
      return;
    }

    tetromino.row = row;
  }
});

function updateScore() {
  const scoreElement = document.getElementById("score");
  const linesElement = document.getElementById("lines");
  scoreElement.textContent = score;
  linesElement.textContent = lines;
}

// запускаем игру
rAF = requestAnimationFrame(loop);
