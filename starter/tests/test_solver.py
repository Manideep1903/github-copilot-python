import os
import random
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from starter.sudoku.board import create_empty_board, deep_copy
from starter.sudoku.solver import count_solutions, fill_board


def test_fill_board_solves_a_blank_board():
    board = create_empty_board()
    assert fill_board(board) is True
    assert all(value != 0 for row in board for value in row)


def test_count_solutions_for_valid_board_is_one():
    random.seed(42)
    board = create_empty_board()
    assert fill_board(board) is True
    assert count_solutions(board, limit=2) == 1


def test_count_solutions_early_stop_limit_two():
    empty = create_empty_board()
    assert count_solutions(empty, limit=2) >= 2


def test_solver_rejects_unsolvable_board():
    board = create_empty_board()
    for j in range(1, 9):
        board[0][j] = j
    for i in range(1, 9):
        board[i][0] = 9
    assert count_solutions(board, limit=2) == 0


def test_solver_rejects_invalid_board_with_duplicate_conflict():
    random.seed(2)
    board = create_empty_board()
    assert fill_board(board) is True
    invalid = deep_copy(board)
    invalid[0][1] = invalid[0][0]
    assert count_solutions(invalid, limit=2) == 0
