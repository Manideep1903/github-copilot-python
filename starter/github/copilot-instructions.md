# Copilot Instructions for Sudoku Flask Application

## Project Overview

This project is a Sudoku game built with Python and Flask.

The application must remain a Python/Flask application and should use the existing
project architecture rather than introducing a different framework.

The main goals are:

- Generate valid Sudoku puzzles.
- Ensure every generated puzzle has exactly one solution.
- Provide Easy, Medium, and Hard difficulty levels.
- Allow users to enter Sudoku values interactively.
- Provide immediate feedback for invalid moves.
- Provide Check and Hint functionality.
- Track elapsed solving time.
- Support Light and Dark modes.
- Maintain a persistent Top 10 leaderboard using localStorage.
- Keep the application accessible and responsive on desktop and mobile devices.
- Maintain automated test coverage for important application and Sudoku logic behavior.

---

## Project Architecture

### `app.py`

`app.py` is the Flask route layer.

Responsibilities:

- Start the Flask application.
- Render the main page.
- Create and manage game sessions.
- Generate new Sudoku games through `sudoku_logic.py`.
- Provide the `/new` endpoint.
- Provide the `/check` endpoint.
- Provide the `/hint` endpoint.
- Validate all incoming query parameters and JSON request data.
- Return consistent JSON error responses for invalid requests.
- Maintain game state separately for different browser sessions.
- Track server-side hint usage for the current game.

Do not move Sudoku generation logic into Flask routes.

Do not use one global `CURRENT` game shared by all users.

Use the existing session/game-ID approach.

---

## `sudoku_logic.py`

`sudoku_logic.py` contains reusable Sudoku logic.

Responsibilities:

- Generate complete valid Sudoku boards.
- Generate puzzles with the requested clue count.
- Remove cells while preserving exactly one unique solution.
- Validate Sudoku boards.
- Count solutions when necessary to verify uniqueness.
- Solve Sudoku boards.
- Validate board shape and values.
- Provide reusable Sudoku functions to the Flask application and tests.

Puzzle generation must preserve Sudoku validity and must produce exactly one
solution.

When removing clues, a candidate removal must only be kept if the resulting
puzzle has exactly one solution.

Avoid putting Flask-specific code in this module.

---

## `static/main.js`

`static/main.js` contains the browser-side game behavior.

Responsibilities:

- Request new games from the Flask `/new` endpoint.
- Pass the selected difficulty to the server.
- Render the Sudoku board.
- Lock prefilled cells.
- Allow users to enter values in editable cells.
- Provide immediate row, column, and 3x3-box conflict feedback.
- Call `/check` when the Check button is used.
- Call `/hint` when the Hint button is used.
- Lock cells filled by hints.
- Track and display the hint count.
- Start, update, reset, and stop the timer.
- Detect successful completion.
- Ask the player for a name after successful completion.
- Save completed scores to browser localStorage.
- Keep only the fastest ten scores.
- Render the Top 10 leaderboard.
- Support the Light/Dark mode toggle.
- Persist the selected theme when appropriate.
- Prevent duplicate score submissions.
- Handle cancelled or blank player names gracefully.

Dynamically created Sudoku inputs must have meaningful accessible labels.

Example:

```javascript
input.setAttribute(
    'aria-label',
    `Row ${i + 1}, column ${j + 1}`
);