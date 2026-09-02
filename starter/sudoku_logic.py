import random
from copy import deepcopy


SIZE = 9
EMPTY = 0


def is_valid(board, row, col, number):
    """Return True if number can be placed at row, col."""

    # Check row
    for c in range(SIZE):
        if c != col and board[row][c] == number:
            return False

    # Check column
    for r in range(SIZE):
        if r != row and board[r][col] == number:
            return False

    # Check 3x3 box
    start_row = (row // 3) * 3
    start_col = (col // 3) * 3

    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if (r != row or c != col) and board[r][c] == number:
                return False

    return True


def find_empty(board):
    """Find an empty cell."""

    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col

    return None


def solve_board(board):
    """Solve a Sudoku board using backtracking."""

    empty = find_empty(board)

    if empty is None:
        return True

    row, col = empty

    numbers = list(range(1, 10))
    random.shuffle(numbers)

    for number in numbers:

        if is_valid(board, row, col, number):

            board[row][col] = number

            if solve_board(board):
                return True

            board[row][col] = EMPTY

    return False


def fill_board():
    """Create a complete valid Sudoku board."""

    board = [
        [EMPTY for _ in range(SIZE)]
        for _ in range(SIZE)
    ]

    if solve_board(board):
        return board

    return None


def count_solutions(board, limit=2):
    """
    Count Sudoku solutions.

    The search stops once 'limit' solutions are found.
    For uniqueness validation, limit=2 is enough:
        0 -> no solution
        1 -> exactly one solution
        2 -> two or more solutions
    """

    board = deepcopy(board)
    count = 0

    def search():

        nonlocal count

        if count >= limit:
            return

        empty = find_empty(board)

        if empty is None:
            count += 1
            return

        row, col = empty

        for number in range(1, 10):

            if is_valid(board, row, col, number):

                board[row][col] = number

                search()

                board[row][col] = EMPTY

                if count >= limit:
                    return

    search()

    return count


def remove_cells(board, clues):
    """
    Remove values while preserving exactly one solution.

    'clues' means the number of cells that remain filled.
    """

    puzzle = deepcopy(board)

    cells_to_remove = SIZE * SIZE - clues

    positions = list(range(SIZE * SIZE))
    random.shuffle(positions)

    removed = 0

    for position in positions:

        if removed >= cells_to_remove:
            break

        row = position // SIZE
        col = position % SIZE

        if puzzle[row][col] == EMPTY:
            continue

        original_value = puzzle[row][col]

        puzzle[row][col] = EMPTY

        # Only keep the removal if the puzzle still has
        # exactly one solution.
        if count_solutions(puzzle, limit=2) == 1:
            removed += 1
        else:
            puzzle[row][col] = original_value

    return puzzle


def generate_puzzle(clues=35):
    """
    Generate a Sudoku puzzle with the requested clue count.

    The resulting puzzle has exactly one solution.
    """

    if not isinstance(clues, int):
        raise ValueError("clues must be an integer")

    if not 17 <= clues <= 81:
        raise ValueError("clues must be between 17 and 81")

    solution = fill_board()

    if solution is None:
        raise RuntimeError("Unable to generate Sudoku solution")

    puzzle = remove_cells(solution, clues)

    # Final validation.
    if count_solutions(puzzle, limit=2) != 1:
        raise RuntimeError("Generated puzzle does not have a unique solution")

    return puzzle, solution


def count_clues(board):
    """Return the number of pre-filled cells."""

    return sum(
        1
        for row in board
        for value in row
        if value != EMPTY
    )


def is_valid_board_shape(board):
    """Validate that board is a 9x9 list of integers."""

    if not isinstance(board, list):
        return False

    if len(board) != SIZE:
        return False

    for row in board:

        if not isinstance(row, list):
            return False

        if len(row) != SIZE:
            return False

        for value in row:

            if not isinstance(value, int):
                return False

            if value < 0 or value > 9:
                return False

    return True


def is_complete_and_correct(board, solution):
    """Return True when board matches the solution."""

    if not is_valid_board_shape(board):
        return False

    if not is_valid_board_shape(solution):
        return False

    return board == solution