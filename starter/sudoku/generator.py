from .board import create_empty_board, deep_copy
from .solver import fill_board, count_solutions
from .constants import SIZE, EMPTY, DEFAULT_CLUES
import random


def remove_cells(board, clues):
    """Remove SIZE*SIZE - clues cells at random from board (in place)."""
    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1


def generate_unique_puzzle(clues=DEFAULT_CLUES, max_attempts=10000):
    """Generate a puzzle with exactly one solution and return (puzzle, solution).

    Approach:
    - Create a fully filled board (solution).
    - Try removing cells in random order; after each removal, check uniqueness
      with count_solutions(puzzle, limit=2). If uniqueness is broken (count >= 2),
      undo the removal.
    - Continue until desired number of clues remain or attempts exhausted.

    max_attempts guards against long-running loops.
    """
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)

    # Start with full solution and attempt removals
    positions = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(positions)
    attempts = 0
    # Currentboard will be mutated; start from full solution
    current = deep_copy(solution)
    cells_to_remove = SIZE * SIZE - clues
    idx = 0
    while cells_to_remove > 0 and attempts < max_attempts and idx < len(positions):
        r, c = positions[idx]
        idx += 1
        if current[r][c] == EMPTY:
            continue
        # Try removing
        saved = current[r][c]
        current[r][c] = EMPTY
        attempts += 1
        # Check uniqueness (early stop at 2)
        count = count_solutions(current, limit=2)
        if count != 1:
            # restore
            current[r][c] = saved
        else:
            cells_to_remove -= 1
        # If we've reached end of positions and still need to remove, reshuffle and continue
        if idx >= len(positions) and cells_to_remove > 0:
            positions = [p for p in positions if current[p[0]][p[1]] != EMPTY]
            if not positions:
                break
            random.shuffle(positions)
            idx = 0
    puzzle = deep_copy(current)
    return puzzle, solution


def generate_puzzle(clues=DEFAULT_CLUES):
    """Generate a puzzle and its full solution.

    By default this uses the uniqueness-aware generator implemented above so
    generated puzzles have exactly one solution.
    """
    return generate_unique_puzzle(clues)
