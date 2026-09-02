// =========================
// Game state
// =========================

let puzzle = [];

let solution = [];

let difficulty = "medium";

let elapsedSeconds = 0;

let timerInterval = null;

let hintsUsed = 0;

let gameCompleted = false;

let gameLoading = false;


const LEADERBOARD_KEY =
  "sudokuLeaderboard";

const DARK_MODE_KEY =
  "sudokuDarkMode";


// =========================
// DOM elements
// =========================

const boardElement =
  document.getElementById(
    "sudoku-board"
  );

const difficultyElement =
  document.getElementById(
    "difficulty"
  );

const timerElement =
  document.getElementById(
    "timer"
  );

const hintsElement =
  document.getElementById(
    "hints-used"
  );

const messageElement =
  document.getElementById(
    "message"
  );


// =========================
// Utility
// =========================

function capitalize(value) {

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


function formatTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    seconds % 60;

  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(remaining).padStart(2, "0")}`
  );
}


function showMessage(
  message,
  type = "info"
) {

  messageElement.textContent =
    message;

  messageElement.className =
    `message ${type}`;
}


// =========================
// Timer
// =========================

function startTimer() {

  stopTimer();

  elapsedSeconds = 0;

  timerElement.textContent =
    "00:00";

  timerInterval =
    setInterval(() => {

      if (!gameCompleted) {

        elapsedSeconds++;

        timerElement.textContent =
          formatTime(
            elapsedSeconds
          );
      }

    }, 1000);
}


function stopTimer() {

  if (timerInterval !== null) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;
  }
}


// =========================
// Create board
// =========================

function createBoardElement() {

  boardElement.innerHTML = "";


  for (let row = 0; row < 9; row++) {

    for (let col = 0; col < 9; col++) {

      const input =
        document.createElement(
          "input"
        );


      input.type = "text";

      input.inputMode = "numeric";

      input.maxLength = 1;

      input.className =
        "sudoku-cell";


      // Accessibility

      input.setAttribute(
        "aria-label",
        `Row ${row + 1}, column ${col + 1}`
      );


      input.setAttribute(
        "role",
        "gridcell"
      );


      input.dataset.row =
        row;

      input.dataset.col =
        col;


      // Alternating 3x3 boxes

      const boxRow =
        Math.floor(row / 3);

      const boxCol =
        Math.floor(col / 3);


      if (
        (boxRow + boxCol) % 2 === 0
      ) {

        input.classList.add(
          "box-light"
        );

      } else {

        input.classList.add(
          "box-dark"
        );
      }


      boardElement.appendChild(
        input
      );
    }
  }
}


// =========================
// Render puzzle
// =========================

function renderPuzzle(board) {

  puzzle = board.map(
    row => [...row]
  );


  createBoardElement();


  const cells =
    boardElement.querySelectorAll(
      ".sudoku-cell"
    );


  for (let row = 0; row < 9; row++) {

    for (let col = 0; col < 9; col++) {

      const index =
        row * 9 + col;

      const cell =
        cells[index];

      const value =
        board[row][col];


      if (value !== 0) {

        cell.value =
          value;

        cell.disabled =
          true;

        cell.classList.add(
          "prefilled"
        );

      } else {

        cell.value =
          "";

        cell.disabled =
          false;
      }
    }
  }
}


// =========================
// New game
// =========================

async function newGame() {

  if (gameLoading) {
    return;
  }


  gameLoading = true;

  gameCompleted = false;

  hintsUsed = 0;

  hintsElement.textContent =
    "0";


  stopTimer();


  showMessage(
    "Generating a new puzzle...",
    "info"
  );


  difficulty =
    difficultyElement.value;


  try {

    const response =
      await fetch(
        `/new?difficulty=${encodeURIComponent(difficulty)}`
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Unable to create puzzle"
      );
    }


    puzzle =
      data.puzzle;


    difficulty =
      data.difficulty;


    // The solution is deliberately
    // not sent by Flask.
    //
    // We use Check/Hint endpoints
    // through the server state.


    renderPuzzle(
      puzzle
    );


    startTimer();


    showMessage(
      `${capitalize(difficulty)} puzzle ready!`,
      "success"
    );

  } catch (error) {

    showMessage(
      error.message,
      "error"
    );

  } finally {

    gameLoading = false;
  }
}


// =========================
// Get current board
// =========================

function getCurrentBoard() {

  const board =
    Array.from(
      { length: 9 },
      () => Array(9).fill(0)
    );


  const cells =
    boardElement.querySelectorAll(
      ".sudoku-cell"
    );


  cells.forEach(cell => {

    const row =
      Number(cell.dataset.row);

    const col =
      Number(cell.dataset.col);


    if (cell.value) {

      board[row][col] =
        Number(cell.value);
    }
  });


  return board;
}


// =========================
// Immediate conflict check
// =========================

function hasImmediateConflict(
  row,
  col,
  number
) {

  const board =
    getCurrentBoard();


  // Row

  for (let c = 0; c < 9; c++) {

    if (
      c !== col &&
      board[row][c] === number
    ) {

      return true;
    }
  }


  // Column

  for (let r = 0; r < 9; r++) {

    if (
      r !== row &&
      board[r][col] === number
    ) {

      return true;
    }
  }


  // Box

  const startRow =
    Math.floor(row / 3) * 3;

  const startCol =
    Math.floor(col / 3) * 3;


  for (
    let r = startRow;
    r < startRow + 3;
    r++
  ) {

    for (
      let c = startCol;
      c < startCol + 3;
      c++
    ) {

      if (
        (r !== row || c !== col) &&
        board[r][c] === number
      ) {

        return true;
      }
    }
  }


  return false;
}


// =========================
// Event delegation
// =========================
//
// One listener on the board handles
// all dynamically-created cells.
// =========================

boardElement.addEventListener(
  "input",
  event => {

    if (
      !event.target.classList.contains(
        "sudoku-cell"
      )
    ) {
      return;
    }


    const cell =
      event.target;


    const row =
      Number(cell.dataset.row);

    const col =
      Number(cell.dataset.col);


    cell.classList.remove(
      "incorrect"
    );


    // Only allow 1-9.

    cell.value =
      cell.value.replace(
        /[^1-9]/g,
        ""
      );


    if (!cell.value) {

      return;
    }


    const number =
      Number(cell.value);


    // Immediate row/column/box validation.

    if (
      hasImmediateConflict(
        row,
        col,
        number
      )
    ) {

      cell.classList.add(
        "incorrect"
      );


      showMessage(
        "Invalid move: that number already exists in the row, column, or 3x3 box.",
        "error"
      );

      return;
    }


    showMessage(
      "Valid move.",
      "success"
    );
  }
);


// =========================
// Check solution
// =========================

async function checkSolution() {

  if (gameCompleted) {
    return;
  }


  const board =
    getCurrentBoard();


  try {

    const response =
      await fetch(
        "/check",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              board: board
            })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Unable to check solution"
      );
    }


    // Remove previous highlights.

    const cells =
      boardElement.querySelectorAll(
        ".sudoku-cell"
      );


    cells.forEach(cell => {

      cell.classList.remove(
        "incorrect"
      );
    });


    // Highlight incorrect cells.

    data.incorrect.forEach(
      position => {

        const index =
          position.row * 9 +
          position.col;


        cells[index].classList.add(
          "incorrect"
        );
      }
    );


    if (
      data.incorrect.length > 0
    ) {

      showMessage(
        `${data.incorrect.length} incorrect cell(s) highlighted.`,
        "error"
      );

      return;
    }


    if (!data.complete) {

      showMessage(
        "The puzzle is not complete yet. Keep solving!",
        "info"
      );

      return;
    }


    completeGame();

  } catch (error) {

    showMessage(
      error.message,
      "error"
    );
  }
}


// =========================
// Hint
// =========================

async function useHint() {

  if (gameCompleted) {
    return;
  }


  const board =
    getCurrentBoard();


  try {

    const response =
      await fetch(
        "/hint",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              board: board
            })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Unable to provide hint"
      );
    }


    const cells =
      boardElement.querySelectorAll(
        ".sudoku-cell"
      );


    const index =
      data.row * 9 +
      data.col;


    const cell =
      cells[index];


    cell.value =
      data.value;


    cell.disabled =
      true;


    cell.classList.add(
      "hinted"
    );


    hintsUsed =
      data.hints_used;


    hintsElement.textContent =
      hintsUsed;


    showMessage(
      "Hint added! The cell has been locked.",
      "success"
    );


    if (data.complete) {

      completeGame();
    }

  } catch (error) {

    showMessage(
      error.message,
      "error"
    );
  }
}


// =========================
// Completion
// =========================

function completeGame() {

  if (gameCompleted) {
    return;
  }


  gameCompleted = true;

  stopTimer();


  showMessage(
    `🎉 Congratulations! You solved the ${capitalize(difficulty)} puzzle in ${formatTime(elapsedSeconds)} with ${hintsUsed} hint(s).`,
    "success"
  );


  saveScore();
}


// =========================
// Leaderboard
// =========================

function getLeaderboard() {

  try {

    const data =
      localStorage.getItem(
        LEADERBOARD_KEY
      );


    return data
      ? JSON.parse(data)
      : [];

  } catch {

    return [];
  }
}


function saveScore() {

  const name =
    window.prompt(
      "You solved it! Enter your name for the Top 10:"
    );


  const cleanName =
    name && name.trim()
      ? name.trim()
      : "Anonymous";


  const scores =
    getLeaderboard();


  scores.push({

    name:
      cleanName,

    seconds:
      elapsedSeconds,

    difficulty:
      difficulty,

    hints:
      hintsUsed
  });


  scores.sort(
    (a, b) =>
      a.seconds - b.seconds
  );


  const topTen =
    scores.slice(0, 10);


  localStorage.setItem(
    LEADERBOARD_KEY,
    JSON.stringify(topTen)
  );


  renderLeaderboard();
}


function renderLeaderboard() {

  const body =
    document.getElementById(
      "leaderboard-body"
    );


  const empty =
    document.getElementById(
      "empty-leaderboard"
    );


  const scores =
    getLeaderboard();


  body.innerHTML = "";


  if (
    scores.length === 0
  ) {

    empty.style.display =
      "block";

    return;
  }


  empty.style.display =
    "none";


  scores.forEach(
    (score, index) => {

      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(score.name)}</td>
        <td>${formatTime(score.seconds)}</td>
        <td>${capitalize(score.difficulty)}</td>
        <td>${score.hints}</td>
      `;


      body.appendChild(row);
    }
  );
}


function escapeHtml(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value;


  return div.innerHTML;
}


// =========================
// Dark mode
// =========================

function setupDarkMode() {

  const button =
    document.getElementById(
      "dark-mode"
    );


  const dark =
    localStorage.getItem(
      DARK_MODE_KEY
    ) === "true";


  if (dark) {

    document.body.classList.add(
      "dark"
    );


    button.textContent =
      "☀️ Light Mode";
  }


  button.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "dark"
      );


      const enabled =
        document.body.classList.contains(
          "dark"
        );


      localStorage.setItem(
        DARK_MODE_KEY,
        enabled
      );


      button.textContent =
        enabled
          ? "☀️ Light Mode"
          : "🌙 Dark Mode";
    }
  );
}


// =========================
// Difficulty
// =========================

difficultyElement.addEventListener(
  "change",
  () => {

    newGame();
  }
);


// =========================
// Buttons
// =========================

document
  .getElementById("new-game")
  .addEventListener(
    "click",
    newGame
  );


document
  .getElementById("check-solution")
  .addEventListener(
    "click",
    checkSolution
  );


document
  .getElementById("hint")
  .addEventListener(
    "click",
    useHint
  );


// =========================
// Start
// =========================

setupDarkMode();

renderLeaderboard();

newGame();