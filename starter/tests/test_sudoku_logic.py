from sudoku_logic import (
    fill_board,
    generate_puzzle,
    count_clues,
    count_solutions,
    is_valid_board_shape
)


def test_fill_board_creates_valid_board():

    board = fill_board()

    assert is_valid_board_shape(board)

    assert all(
        value != 0
        for row in board
        for value in row
    )

    assert count_solutions(board) == 1


def test_easy_puzzle_has_correct_clue_count():

    puzzle, solution = generate_puzzle(45)

    assert count_clues(puzzle) == 45

    assert count_solutions(puzzle, limit=2) == 1


def test_medium_puzzle_has_correct_clue_count():

    puzzle, solution = generate_puzzle(36)

    assert count_clues(puzzle) == 36

    assert count_solutions(puzzle, limit=2) == 1


def test_hard_puzzle_has_correct_clue_count():

    puzzle, solution = generate_puzzle(30)

    assert count_clues(puzzle) == 30

    assert count_solutions(puzzle, limit=2) == 1


def test_invalid_clue_count():

    import pytest

    with pytest.raises(ValueError):
        generate_puzzle(10)


def test_invalid_high_clue_count():

    import pytest

    with pytest.raises(ValueError):
        generate_puzzle(82)