# GitHub Copilot Instructions — Flask Sudoku

## Project Goal

Build a maintainable Sudoku web application using Python, Flask, HTML, CSS, and JavaScript.

The application must support:

* Easy, Medium, and Hard difficulty levels
* Sudoku puzzles with exactly one unique solution
* Locked prefilled cells
* Real-time invalid-entry feedback
* Check Puzzle functionality
* Hint functionality
* Timer
* Top 10 leaderboard
* LocalStorage persistence
* Dark mode
* Responsive desktop and mobile layouts
* Accessible controls and readable text

## Code Quality

Follow these principles:

* Prefer clear, readable Python.
* Use small reusable functions.
* Separate Sudoku logic from Flask routes.
* Avoid unnecessary global state.
* Use descriptive variable and function names.
* Add comments only when they explain non-obvious logic.
* Handle errors gracefully.
* Avoid duplicated code.
* Keep frontend JavaScript separate from HTML.
* Keep CSS separate from HTML.
* Prefer maintainable solutions over unnecessarily clever code.

## Python Standards

Use modern Python practices.

* Add type hints where useful.
* Use functions/classes when they improve organization.
* Follow PEP 8.
* Keep business logic independent from Flask routes.
* Write testable functions.
* Do not silently ignore exceptions.

## Sudoku Requirements

A valid completed Sudoku must:

* Contain numbers 1–9.
* Have no duplicate values in a row.
* Have no duplicate values in a column.
* Have no duplicate values in a 3×3 box.

Generated puzzles must have exactly one solution.

Difficulty should control the number of prefilled cells.

Prefilled and hint-generated cells must be locked.

## Frontend Requirements

The UI must:

* Work on desktop and mobile.
* Support light and dark modes.
* Clearly distinguish the 3×3 Sudoku boxes.
* Provide visual feedback for incorrect entries.
* Keep controls readable.
* Avoid layout shifts.
* Use accessible labels and buttons.

## Testing

Before refactoring existing functionality:

1. Establish a testing framework.
2. Run the existing tests.
3. Confirm the baseline tests pass.
4. Add tests for important new functionality where practical.
5. Run tests after significant changes.

Use pytest unless the existing project requires another testing framework.

## Git Practices

Make focused commits.

Use descriptive commit messages such as:

* Add baseline tests
* Refactor Sudoku board logic
* Add unique solution validation
* Add difficulty selection
* Add timer
* Add hints
* Add leaderboard
* Add dark mode
* Improve responsive styling

Do not make one enormous commit containing the entire project.

## GitHub Copilot Usage

Use Copilot as an assistant rather than blindly accepting generated code.

Before accepting substantial suggestions:

* Read the generated code.
* Check whether it matches the requirements.
* Ask Copilot to explain unfamiliar code.
* Reject suggestions that introduce unnecessary complexity.
* Run tests after changes.

When Copilot makes an incorrect suggestion, correct it rather than building additional code around the incorrect behavior.

## Security and Reliability

Do not trust user input.

Validate values received from the browser.

Do not expose secrets or credentials.

Do not store sensitive information in source code.

LocalStorage may be used for the game leaderboard because this is a client-side educational project.

## Documentation

Keep README.md updated with:

* Project description
* Features
* Setup instructions
* How to run the application
* How to run tests
* Project structure
* Git workflow where useful
