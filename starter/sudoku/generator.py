from .board import create_empty_board, deep_copy
from .solver import fill_board
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


def generate_puzzle(clues=DEFAULT_CLUES):
    """Generate a puzzle and its full solution.

    Returns (puzzle, solution) where both are SIZE x SIZE lists of ints.
    Behavior matches the original starter/sudoku_logic.py: randomness and
    no uniqueness checks for the resulting puzzle.
    """
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
