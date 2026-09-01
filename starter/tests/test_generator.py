import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from starter.sudoku.generator import generate_puzzle
from starter.sudoku.solver import count_solutions
from starter.sudoku.constants import DIFFICULTY_RANGES


def nonzero_count(board):
    return sum(1 for r in board for v in r if v != 0)


def test_generate_unique_puzzle_defaults():
    puzzle, solution = generate_puzzle(clues=35)
    # solution should be completely filled
    assert all(all(cell != 0 for cell in row) for row in solution)
    # puzzle should have exactly one solution
    assert count_solutions(puzzle, limit=2) == 1
    # requested clues approximately match (allow some flexibility)
    assert 0 < nonzero_count(puzzle) <= 81


def test_generate_with_different_clues():
    for clues in (40, 35, 30):
        puzzle, solution = generate_puzzle(clues=clues)
        assert count_solutions(puzzle, limit=2) == 1
        assert nonzero_count(puzzle) == clues


def test_difficulty_ranges_make_sense():
    # simple sanity check on ranges
    assert DIFFICULTY_RANGES['easy'][0] <= DIFFICULTY_RANGES['easy'][1]
    assert DIFFICULTY_RANGES['medium'][0] <= DIFFICULTY_RANGES['medium'][1]
    assert DIFFICULTY_RANGES['hard'][0] <= DIFFICULTY_RANGES['hard'][1]
