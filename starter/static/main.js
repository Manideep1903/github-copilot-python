const SIZE = 9;
const LEADERBOARD_KEY = "sudokuLeaderboard";

let puzzle = [];
let solution = [];
let timerSeconds = 0;
let timerInterval = null;
let hintsUsed = 0;
let gameCompleted = false;


// -------------------------
// Timer
// -------------------------

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateTimer() {
  document.getElementById("timer").innerText = formatTime(timerSeconds);
}

function startTimer() {
  stopTimer();

  timerSeconds = 0;
  updateTimer();

  timerInterval = setInterval(() => {
    if (!gameCompleted) {
      timerSeconds += 1;
      updateTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}


// -------------------------
// Board
// -------------------------

function createBoardElement() {
  const boardDiv = document.getElementById("sudoku-board");
  boardDiv.innerHTML = "";

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const input = document.createElement("input");

      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.className = "sudoku-cell";

      input.dataset.row = row;
      input.dataset.col = col;

      input.setAttribute(
        "aria-label",
        `Row ${row + 1}, Column ${col + 1}`
      );

      // --------------------------------
      // Alternating 3x3 box colors
      // --------------------------------

      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);

      if ((boxRow + boxCol) % 2 === 0) {
        input.classList.add("box-light");
      } else {
        input.classList.add("box-dark");
      }

      // --------------------------------
      // Immediate invalid-move feedback
      // --------------------------------

      input.addEventListener("input", (event) => {
        const value = event.target.value.replace(/[^1-9]/g, "");

        event.target.value = value;

        event.target.classList.remove("incorrect");

        if (!value) {
          showMessage("", "");
          return;
        }

        const row = Number(event.target.dataset.row);
        const col = Number(event.target.dataset.col);
        const number = Number(value);

        const board = [];

        for (let r = 0; r < SIZE; r++) {
          board[r] = [];

          for (let c = 0; c < SIZE; c++) {
            const cell = document.querySelector(
              `.sudoku-cell[data-row="${r}"][data-col="${c}"]`
            );

            board[r][c] = cell.value ? Number(cell.value) : 0;
          }
        }

        // Check if the number already exists
        // in the same row, column or 3x3 box.
        if (hasConflict(board, row, col, number)) {
          event.target.classList.add("incorrect");

          showMessage(
            "Invalid move: number already exists in this row, column, or box.",
            "error"
          );
        } else {
          showMessage("", "");
        }
      });

      boardDiv.appendChild(input);
    }
  }
}


function renderPuzzle(puz) {
  puzzle = puz.map(row => [...row]);

  createBoardElement();

  const inputs = document.querySelectorAll(".sudoku-cell");

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const index = row * SIZE + col;
      const input = inputs[index];
      const value = puzzle[row][col];

      input.classList.remove(
        "prefilled",
        "hinted",
        "incorrect"
      );

      if (value !== 0) {
        input.value = value;
        input.disabled = true;
        input.classList.add("prefilled");
      } else {
        input.value = "";
        input.disabled = false;
      }
    }
  }
}


// -------------------------
// New Game
// -------------------------

async function newGame() {
  try {
    const difficulty =
      document.getElementById("difficulty").value;

    const response = await fetch(
      `/new?difficulty=${encodeURIComponent(difficulty)}`
    );

    if (!response.ok) {
      throw new Error("Unable to create a new game.");
    }

    const data = await response.json();

    // --------------------------------
    // Unique solution validation
    // --------------------------------

    const solutionCount = countSolutions(data.puzzle);

    if (solutionCount !== 1) {
      showMessage(
        "Generated puzzle does not have a unique solution. Please try again.",
        "error"
      );
      return;
    }

    renderPuzzle(data.puzzle);

    // Try to use solution returned by backend if available.
    if (data.solution) {
      solution = data.solution.map(row => [...row]);
    } else {
      solution = solveSudoku(puzzle);
    }

    // Make sure a valid solution exists.
    if (!solution) {
      throw new Error("Unable to solve the generated puzzle.");
    }

    hintsUsed = 0;
    gameCompleted = false;

    document.getElementById("hints-used").innerText = "0";
    document.getElementById("message").innerText = "";

    startTimer();

  } catch (error) {
    showMessage(error.message, "error");
  }
}


// -------------------------
// Sudoku Validation
// -------------------------

function isValid(board, row, col, number) {
  // Check row
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] === number) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < SIZE; i++) {
    if (board[i][col] === number) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c] === number) {
        return false;
      }
    }
  }

  return true;
}


// -------------------------
// Immediate Conflict Check
// -------------------------

function hasConflict(board, row, col, number) {

  // Check row
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i] === number) {
      return true;
    }
  }

  // Check column
  for (let i = 0; i < SIZE; i++) {
    if (i !== row && board[i][col] === number) {
      return true;
    }
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {

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


// -------------------------
// Sudoku Solver
// Used for hints
// -------------------------

function solveSudoku(board) {
  const working = board.map(row => [...row]);

  function solve() {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {

        if (working[row][col] === 0) {

          for (let number = 1; number <= 9; number++) {

            if (isValid(working, row, col, number)) {

              working[row][col] = number;

              if (solve()) {
                return true;
              }

              working[row][col] = 0;
            }
          }

          return false;
        }
      }
    }

    return true;
  }

  return solve() ? working : null;
}


// -------------------------
// Unique Solution Counter
// -------------------------

function countSolutions(board, limit = 2) {
  const working = board.map(row => [...row]);

  let count = 0;

  function solve() {

    // Stop as soon as we know there are
    // at least two solutions.
    if (count >= limit) {
      return;
    }

    let emptyRow = -1;
    let emptyCol = -1;

    // Find an empty cell.
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {

        if (working[row][col] === 0) {
          emptyRow = row;
          emptyCol = col;
          break;
        }
      }

      if (emptyRow !== -1) {
        break;
      }
    }

    // No empty cells = one complete solution found.
    if (emptyRow === -1) {
      count++;
      return;
    }

    // Try every possible number.
    for (let number = 1; number <= 9; number++) {

      if (
        isValid(
          working,
          emptyRow,
          emptyCol,
          number
        )
      ) {

        working[emptyRow][emptyCol] = number;

        solve();

        working[emptyRow][emptyCol] = 0;

        // Stop after finding two solutions.
        if (count >= limit) {
          return;
        }
      }
    }
  }

  solve();

  return count;
}


// -------------------------
// Hint
// -------------------------

function useHint() {
  if (gameCompleted) {
    return;
  }

  if (!solution || !solution.length) {
    solution = solveSudoku(puzzle);
  }

  if (!solution) {
    showMessage(
      "Unable to generate a hint.",
      "error"
    );
    return;
  }

  const inputs =
    document.querySelectorAll(".sudoku-cell");

  const emptyCells = [];

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {

      if (
        puzzle[row][col] === 0 &&
        !inputs[row * SIZE + col].disabled &&
        !inputs[row * SIZE + col].value
      ) {
        emptyCells.push([row, col]);
      }
    }
  }

  if (emptyCells.length === 0) {
    showMessage(
      "There are no empty cells for a hint.",
      "info"
    );
    return;
  }

  const [row, col] =
    emptyCells[
      Math.floor(Math.random() * emptyCells.length)
    ];

  const index = row * SIZE + col;
  const input = inputs[index];

  input.value = solution[row][col];

  // Lock hinted cell.
  input.disabled = true;

  input.classList.add("hinted");

  hintsUsed += 1;

  document.getElementById("hints-used").innerText =
    hintsUsed;

  showMessage(
    "Hint added! This cell is now locked.",
    "success"
  );
}


// -------------------------
// Check Solution
// -------------------------

async function checkSolution() {
  const inputs =
    document.querySelectorAll(".sudoku-cell");

  const board = [];

  for (let row = 0; row < SIZE; row++) {
    board[row] = [];

    for (let col = 0; col < SIZE; col++) {
      const value =
        inputs[row * SIZE + col].value;

      board[row][col] =
        value ? parseInt(value, 10) : 0;
    }
  }

  try {
    const response = await fetch("/check", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ board })
    });

    const data = await response.json();

    if (data.error) {
      showMessage(data.error, "error");
      return;
    }

    // Remove old incorrect highlights.
    inputs.forEach(input => {
      input.classList.remove("incorrect");
    });

    const incorrect = new Set(
      data.incorrect.map(
        cell => cell[0] * SIZE + cell[1]
      )
    );

    incorrect.forEach(index => {
      if (!inputs[index].disabled) {
        inputs[index].classList.add("incorrect");
      }
    });

    if (incorrect.size === 0) {

      gameCompleted = true;

      stopTimer();

      showMessage(
        "🎉 Congratulations! You solved the puzzle!",
        "success"
      );

      saveScore();

    } else {

      showMessage(
        `${incorrect.size} incorrect cell(s) highlighted.`,
        "error"
      );
    }

  } catch (error) {
    showMessage(
      "Unable to check the puzzle.",
      "error"
    );
  }
}


// -------------------------
// Leaderboard
// -------------------------

function getLeaderboard() {
  try {
    return JSON.parse(
      localStorage.getItem(
        LEADERBOARD_KEY
      ) || "[]"
    );
  } catch {
    return [];
  }
}


function saveScore() {
  const name = prompt(
    "Congratulations! Enter your name for the leaderboard:"
  );

  const playerName =
    name && name.trim()
      ? name.trim()
      : "Anonymous";

  const difficulty =
    document.getElementById("difficulty").value;

  const scores = getLeaderboard();

  scores.push({
    name: playerName,
    time: timerSeconds,
    difficulty: difficulty,
    hints: hintsUsed,
    date: new Date().toISOString()
  });

  // Fastest time first.
  scores.sort(
    (a, b) => a.time - b.time
  );

  // Keep only top 10.
  const topTen = scores.slice(0, 10);

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

  const scores = getLeaderboard();

  body.innerHTML = "";

  if (scores.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  scores.forEach((score, index) => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(score.name)}</td>
      <td>${formatTime(score.time)}</td>
      <td>${capitalize(score.difficulty)}</td>
      <td>${score.hints}</td>
    `;

    body.appendChild(row);
  });
}


function escapeHtml(value) {
  const div =
    document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}


function capitalize(value) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


// -------------------------
// Messages
// -------------------------

function showMessage(message, type) {
  const element =
    document.getElementById("message");

  element.innerText = message;

  element.className =
    type
      ? `message ${type}`
      : "message";
}


// -------------------------
// Dark Mode
// -------------------------

function setupDarkMode() {
  const button =
    document.getElementById("dark-mode");

  const enabled =
    localStorage.getItem(
      "sudokuDarkMode"
    ) === "true";

  if (enabled) {
    document.body.classList.add("dark");

    button.innerText =
      "☀️ Light Mode";
  }

  button.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const dark =
      document.body.classList.contains("dark");

    localStorage.setItem(
      "sudokuDarkMode",
      dark.toString()
    );

    button.innerText =
      dark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
  });
}


// -------------------------
// Start application
// -------------------------

window.addEventListener("load", () => {

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

  setupDarkMode();

  renderLeaderboard();

  newGame();
});