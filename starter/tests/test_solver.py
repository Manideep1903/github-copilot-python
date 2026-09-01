import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from starter.sudoku.solver import count_solutions, fill_board
from starter.sudoku.board import create_empty_board, deep_copy


def test_count_solutions_on_full_board():
    board = create_empty_board()
    # Fill the board to make a complete solution
    assert fill_board(board) is True
    # A full board should have exactly one solution
    assert count_solutions(board, limit=2) == 1


def test_count_solutions_on_generated_puzzle():
    # Create a full board and remove a cell to ensure solver works
    board = create_empty_board()
    assert fill_board(board) is True
    solution = deep_copy(board)
    # Remove one cell and ensure at least one solution exists
    board[0][0] = 0
    assert count_solutions(board, limit=2) >= 1
