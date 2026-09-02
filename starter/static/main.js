const SIZE = 9;

const LEADERBOARD_KEY =
  "sudokuLeaderboard";

const DARK_MODE_KEY =
  "sudokuDarkMode";


// =========================
// Game State
// =========================

let puzzle = [];

let solution = [];

let timerSeconds = 0;

let timerInterval = null;

let hintsUsed = 0;

let gameCompleted = false;

let generatingPuzzle = false;


// Number of pre-filled cells
// for each difficulty.

const DIFFICULTY_CLUES = {
  easy: 45,
  medium: 36,
  hard: 30
};


// =========================
// Utility Functions
// =========================

function shuffle(array) {

  const shuffled = [...array];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      shuffled[i],
      shuffled[j]
    ] =
    [
      shuffled[j],
      shuffled[i]
    ];
  }

  return shuffled;
}


function copyBoard(board) {

  return board.map(
    row => [...row]
  );
}


// =========================
// Timer
// =========================

function formatTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;

  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(secs).padStart(2, "0")}`
  );
}


function updateTimer() {

  document.getElementById(
    "timer"
  ).innerText =
    formatTime(timerSeconds);
}


function startTimer() {

  stopTimer();

  timerSeconds = 0;

  updateTimer();

  timerInterval =
    setInterval(() => {

      if (!gameCompleted) {

        timerSeconds += 1;

        updateTimer();
      }

    }, 1000);
}


function stopTimer() {

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;
  }
}


// =========================
// Sudoku Validation
// =========================

function isValid(board, row, col, number) {

  // Check row

  for (
    let c = 0;
    c < SIZE;
    c++
  ) {

    if (
      board[row][c] === number
    ) {

      return false;
    }
  }


  // Check column

  for (
    let r = 0;
    r < SIZE;
    r++
  ) {

    if (
      board[r][col] === number
    ) {

      return false;
    }
  }


  // Check 3x3 box

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
        board[r][c] === number
      ) {

        return false;
      }
    }
  }


  return true;
}


// =========================
// Immediate Conflict Check
// =========================

function hasConflict(
  board,
  row,
  col,
  number
) {

  // Row

  for (
    let c = 0;
    c < SIZE;
    c++
  ) {

    if (
      c !== col &&
      board[row][c] === number
    ) {

      return true;
    }
  }


  // Column

  for (
    let r = 0;
    r < SIZE;
    r++
  ) {

    if (
      r !== row &&
      board[r][col] === number
    ) {

      return true;
    }
  }


  // 3x3 box

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
// Sudoku Solver
// =========================

function solveSudoku(board) {

  const working =
    copyBoard(board);


  function solve() {

    // Find empty cell

    for (
      let row = 0;
      row < SIZE;
      row++
    ) {

      for (
        let col = 0;
        col < SIZE;
        col++
      ) {

        if (
          working[row][col] === 0
        ) {

          const numbers =
            shuffle([
              1, 2, 3,
              4, 5, 6,
              7, 8, 9
            ]);


          for (
            const number of numbers
          ) {

            if (
              isValid(
                working,
                row,
                col,
                number
              )
            ) {

              working[row][col] =
                number;


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


  return solve()
    ? working
    : null;
}


// =========================
// Count Solutions
// =========================
//
// This checks whether a puzzle
// has exactly one solution.
//
// We stop after finding 2 because:
// 0 = no solution
// 1 = unique solution
// 2 = multiple solutions
// =========================

function countSolutions(
  board,
  limit = 2
) {

  const working =
    copyBoard(board);

  let count = 0;


  function solve() {

    if (count >= limit) {

      return;
    }


    // Find empty cell

    let emptyRow = -1;

    let emptyCol = -1;


    for (
      let row = 0;
      row < SIZE;
      row++
    ) {

      for (
        let col = 0;
        col < SIZE;
        col++
      ) {

        if (
          working[row][col] === 0
        ) {

          emptyRow = row;

          emptyCol = col;

          break;
        }
      }


      if (
        emptyRow !== -1
      ) {

        break;
      }
    }


    // Complete board

    if (
      emptyRow === -1
    ) {

      count++;

      return;
    }


    // Try numbers

    for (
      let number = 1;
      number <= 9;
      number++
    ) {

      if (
        isValid(
          working,
          emptyRow,
          emptyCol,
          number
        )
      ) {

        working[
          emptyRow
        ][
          emptyCol
        ] = number;


        solve();


        working[
          emptyRow
        ][
          emptyCol
        ] = 0;


        if (
          count >= limit
        ) {

          return;
        }
      }
    }
  }


  solve();


  return count;
}


// =========================
// Generate Complete Board
// =========================

function generateSolvedBoard() {

  const emptyBoard =
    Array.from(
      { length: SIZE },
      () => Array(SIZE).fill(0)
    );


  return solveSudoku(
    emptyBoard
  );
}


// =========================
// Generate Puzzle
// =========================
//
// This is where the difficulty
// actually changes.
//
// Easy   = 45 clues
// Medium = 36 clues
// Hard   = 30 clues
//
// Every removal is checked to make
// sure the puzzle still has exactly
// one solution.
// =========================

function generatePuzzle(
  difficulty
) {

  const clues =
    DIFFICULTY_CLUES[
      difficulty
    ] || DIFFICULTY_CLUES.medium;


  const solvedBoard =
    generateSolvedBoard();


  if (!solvedBoard) {

    return null;
  }


  const puzzleBoard =
    copyBoard(solvedBoard);


  const cellsToRemove =
    SIZE * SIZE - clues;


  const positions =
    shuffle(
      Array.from(
        { length: SIZE * SIZE },
        (_, index) => index
      )
    );


  let removed = 0;


  for (
    const position of positions
  ) {

    if (
      removed >= cellsToRemove
    ) {

      break;
    }


    const row =
      Math.floor(
        position / SIZE
      );

    const col =
      position % SIZE;


    const backup =
      puzzleBoard[row][col];


    puzzleBoard[row][col] = 0;


    // Make sure removing this cell
    // does not create multiple solutions.

    const solutions =
      countSolutions(
        puzzleBoard,
        2
      );


    if (solutions === 1) {

      removed++;

    } else {

      // Put it back if uniqueness
      // was lost.

      puzzleBoard[row][col] =
        backup;
    }
  }


  // Final validation

  if (
    countSolutions(
      puzzleBoard,
      2
    ) !== 1
  ) {

    return null;
  }


  return {
    puzzle: puzzleBoard,

    solution: solvedBoard
  };
}


// =========================
// Board Creation
// =========================

function createBoardElement() {

  const boardDiv =
    document.getElementById(
      "sudoku-board"
    );


  boardDiv.innerHTML = "";


  for (
    let row = 0;
    row < SIZE;
    row++
  ) {

    for (
      let col = 0;
      col < SIZE;
      col++
    ) {

      const input =
        document.createElement(
          "input"
        );


      input.type = "text";

      input.inputMode = "numeric";

      input.maxLength = 1;

      input.className =
        "sudoku-cell";


      input.dataset.row = row;

      input.dataset.col = col;


      input.setAttribute(
        "aria-label",
        `Row ${row + 1}, Column ${col + 1}`
      );


      // =========================
      // Alternating 3x3 colors
      // =========================

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


      // =========================
      // User Input
      // =========================

      input.addEventListener(
        "input",
        handleCellInput
      );


      boardDiv.appendChild(
        input
      );
    }
  }
}


// =========================
// Handle Cell Input
// =========================

function handleCellInput(event) {

  const input =
    event.target;


  // Allow only numbers 1-9

  const value =
    input.value.replace(
      /[^1-9]/g,
      ""
    );


  input.value = value;


  input.classList.remove(
    "incorrect"
  );


  if (!value) {

    showMessage("", "");

    return;
  }


  const row =
    Number(input.dataset.row);

  const col =
    Number(input.dataset.col);

  const number =
    Number(value);


  const board =
    getCurrentBoard();


  // Immediate validation

  if (
    hasConflict(
      board,
      row,
      col,
      number
    )
  ) {

    input.classList.add(
      "incorrect"
    );


    showMessage(
      "Invalid move: number already exists in this row, column, or 3x3 box.",
      "error"
    );


    return;
  }


  // Also check against the actual
  // Sudoku solution.

  if (
    solution.length &&
    solution[row][col] !== number
  ) {

    input.classList.add(
      "incorrect"
    );


    showMessage(
      "Incorrect number. Try another value.",
      "error"
    );


    return;
  }


  showMessage(
    "Good move!",
    "success"
  );


  // Automatically detect completion

  if (
    isPuzzleSolved()
  ) {

    completeGame();
  }
}


// =========================
// Get Current Board
// =========================

function getCurrentBoard() {

  const inputs =
    document.querySelectorAll(
      ".sudoku-cell"
    );


  const board =
    Array.from(
      { length: SIZE },
      () => Array(SIZE).fill(0)
    );


  inputs.forEach(input => {

    const row =
      Number(input.dataset.row);

    const col =
      Number(input.dataset.col);


    board[row][col] =
      input.value
        ? Number(input.value)
        : 0;
  });


  return board;
}


// =========================
// Render Puzzle
// =========================

function renderPuzzle(
  puzzleData
) {

  puzzle =
    copyBoard(
      puzzleData
    );


  createBoardElement();


  const inputs =
    document.querySelectorAll(
      ".sudoku-cell"
    );


  for (
    let row = 0;
    row < SIZE;
    row++
  ) {

    for (
      let col = 0;
      col < SIZE;
      col++
    ) {

      const index =
        row * SIZE + col;

      const input =
        inputs[index];

      const value =
        puzzle[row][col];


      input.classList.remove(
        "prefilled",
        "hinted",
        "incorrect"
      );


      if (
        value !== 0
      ) {

        input.value =
          value;

        input.disabled =
          true;

        input.classList.add(
          "prefilled"
        );

      } else {

        input.value =
          "";

        input.disabled =
          false;
      }
    }
  }
}


// =========================
// New Game
// =========================

function newGame() {

  if (generatingPuzzle) {

    return;
  }


  generatingPuzzle = true;

  gameCompleted = false;

  hintsUsed = 0;


  stopTimer();


  document.getElementById(
    "hints-used"
  ).innerText = "0";


  showMessage(
    "Generating a unique puzzle...",
    "info"
  );


  // Use setTimeout so the browser
  // can display the message before
  // puzzle generation starts.

  setTimeout(() => {

    const difficulty =
      document.getElementById(
        "difficulty"
      ).value;


    let game = null;


    // Try a few times in case
    // generation fails.

    for (
      let attempt = 0;
      attempt < 5;
      attempt++
    ) {

      game =
        generatePuzzle(
          difficulty
        );


      if (game) {

        break;
      }
    }


    if (!game) {

      generatingPuzzle = false;

      showMessage(
        "Unable to generate a unique puzzle. Please try again.",
        "error"
      );

      return;
    }


    puzzle =
      copyBoard(
        game.puzzle
      );


    solution =
      copyBoard(
        game.solution
      );


    renderPuzzle(
      game.puzzle
    );


    hintsUsed = 0;

    gameCompleted = false;


    document.getElementById(
      "hints-used"
    ).innerText = "0";


    showMessage(
      `${capitalize(difficulty)} puzzle ready!`,
      "info"
    );


    generatingPuzzle = false;


    startTimer();

  }, 50);
}


// =========================
// Difficulty Change
// =========================
//
// IMPORTANT:
// Changing Easy/Medium/Hard
// immediately creates a NEW puzzle.
// =========================

function setupDifficulty() {

  const difficulty =
    document.getElementById(
      "difficulty"
    );


  difficulty.addEventListener(
    "change",
    () => {

      newGame();
    }
  );
}


// =========================
// Hint
// =========================

function useHint() {

  if (gameCompleted) {

    return;
  }


  const inputs =
    document.querySelectorAll(
      ".sudoku-cell"
    );


  const emptyCells = [];


  for (
    let row = 0;
    row < SIZE;
    row++
  ) {

    for (
      let col = 0;
      col < SIZE;
      col++
    ) {

      const input =
        inputs[
          row * SIZE + col
        ];


      if (
        puzzle[row][col] === 0 &&
        !input.disabled &&
        !input.value
      ) {

        emptyCells.push(
          [row, col]
        );
      }
    }
  }


  if (
    emptyCells.length === 0
  ) {

    showMessage(
      "There are no empty cells for a hint.",
      "info"
    );

    return;
  }


  // Select random empty cell

  const randomIndex =
    Math.floor(
      Math.random() *
      emptyCells.length
    );


  const [
    row,
    col
  ] =
    emptyCells[
      randomIndex
    ];


  const index =
    row * SIZE + col;


  const input =
    inputs[index];


  // Put correct answer

  input.value =
    solution[row][col];


  // LOCK the hint cell

  input.disabled =
    true;


  input.classList.add(
    "hinted"
  );


  hintsUsed++;


  document.getElementById(
    "hints-used"
  ).innerText =
    hintsUsed;


  showMessage(
    "Hint added! This cell is now locked.",
    "success"
  );


  if (
    isPuzzleSolved()
  ) {

    completeGame();
  }
}


// =========================
// Check Solution
// =========================

function checkSolution() {

  if (gameCompleted) {

    return;
  }


  const inputs =
    document.querySelectorAll(
      ".sudoku-cell"
    );


  let incorrectCount = 0;

  let emptyCount = 0;


  inputs.forEach(input => {

    const row =
      Number(input.dataset.row);

    const col =
      Number(input.dataset.col);


    input.classList.remove(
      "incorrect"
    );


    if (!input.value) {

      emptyCount++;

      return;
    }


    const number =
      Number(input.value);


    // Check actual solution

    if (
      number !==
      solution[row][col]
    ) {

      input.classList.add(
        "incorrect"
      );

      incorrectCount++;
    }
  });


  if (
    incorrectCount > 0
  ) {

    showMessage(
      `${incorrectCount} incorrect cell(s) highlighted.`,
      "error"
    );

    return;
  }


  if (
    emptyCount > 0
  ) {

    showMessage(
      "There are still empty cells. Keep solving!",
      "info"
    );

    return;
  }


  completeGame();
}


// =========================
// Check if Puzzle Solved
// =========================

function isPuzzleSolved() {

  const board =
    getCurrentBoard();


  for (
    let row = 0;
    row < SIZE;
    row++
  ) {

    for (
      let col = 0;
      col < SIZE;
      col++
    ) {

      if (
        board[row][col] === 0
      ) {

        return false;
      }


      if (
        board[row][col] !==
        solution[row][col]
      ) {

        return false;
      }
    }
  }


  return true;
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
    "🎉 Congratulations! You solved the puzzle!",
    "success"
  );


  saveScore();
}


// =========================
// Leaderboard
// =========================

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


// =========================
// Save Score
// =========================

function saveScore() {

  const name =
    prompt(
      "Congratulations! Enter your name for the leaderboard:"
    );


  const playerName =
    name &&
    name.trim()
      ? name.trim()
      : "Anonymous";


  const difficulty =
    document.getElementById(
      "difficulty"
    ).value;


  const scores =
    getLeaderboard();


  scores.push({

    name:
      playerName,

    time:
      timerSeconds,

    difficulty:
      difficulty,

    hints:
      hintsUsed,

    date:
      new Date().toISOString()

  });


  // Fastest time first

  scores.sort(
    (a, b) =>
      a.time - b.time
  );


  // Keep only top 10

  const topTen =
    scores.slice(0, 10);


  localStorage.setItem(
    LEADERBOARD_KEY,
    JSON.stringify(
      topTen
    )
  );


  renderLeaderboard();
}


// =========================
// Render Leaderboard
// =========================

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

        <td>
          ${escapeHtml(score.name)}
        </td>

        <td>
          ${formatTime(score.time)}
        </td>

        <td>
          ${capitalize(score.difficulty)}
        </td>

        <td>
          ${score.hints}
        </td>
      `;


      body.appendChild(
        row
      );
    }
  );
}


// =========================
// Prevent HTML Injection
// =========================

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
// Capitalize
// =========================

function capitalize(value) {

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


// =========================
// Messages
// =========================

function showMessage(
  message,
  type
) {

  const element =
    document.getElementById(
      "message"
    );


  element.innerText =
    message;


  element.className =
    type
      ? `message ${type}`
      : "message";
}


// =========================
// Dark Mode
// =========================

function setupDarkMode() {

  const button =
    document.getElementById(
      "dark-mode"
    );


  const enabled =
    localStorage.getItem(
      DARK_MODE_KEY
    ) === "true";


  if (enabled) {

    document.body.classList.add(
      "dark"
    );


    button.innerText =
      "☀️ Light Mode";
  }


  button.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "dark"
      );


      const dark =
        document.body.classList.contains(
          "dark"
        );


      localStorage.setItem(
        DARK_MODE_KEY,
        dark.toString()
      );


      button.innerText =
        dark
          ? "☀️ Light Mode"
          : "🌙 Dark Mode";
    }
  );
}


// =========================
// Start Application
// =========================

window.addEventListener(
  "load",
  () => {

    // New Game

    document
      .getElementById("new-game")
      .addEventListener(
        "click",
        newGame
      );


    // Check

    document
      .getElementById(
        "check-solution"
      )
      .addEventListener(
        "click",
        checkSolution
      );


    // Hint

    document
      .getElementById("hint")
      .addEventListener(
        "click",
        useHint
      );


    // Difficulty selector

    setupDifficulty();


    // Dark mode

    setupDarkMode();


    // Leaderboard

    renderLeaderboard();


    // Start first game

    newGame();

  }
);