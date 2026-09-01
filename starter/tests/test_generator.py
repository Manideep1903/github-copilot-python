import os
import random
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from starter.sudoku.constants import DIFFICULTY_RANGES
from starter.sudoku.generator import generate_puzzle
from starter.sudoku.solver import count_solutions


def nonzero_count(board):
    return sum(1 for row in board for value in row if value != 0)


def test_generate_puzzle_has_exactly_one_solution():
    random.seed(0)
    puzzle, solution = generate_puzzle(clues=35)
    assert all(value != 0 for row in solution for value in row)
    assert count_solutions(puzzle, limit=2) == 1


def test_generate_puzzle_with_expected_clue_counts():
    for clues in (40, 35, 30):
        random.seed(clues)
        puzzle, _ = generate_puzzle(clues=clues)
        assert nonzero_count(puzzle) == clues
        assert count_solutions(puzzle, limit=2) == 1


def test_generate_puzzle_for_each_difficulty_range():
    for level, rng in DIFFICULTY_RANGES.items():
        random.seed(7)
        clues = random.randint(rng[0], rng[1])
        puzzle, _ = generate_puzzle(clues=clues)
        assert rng[0] <= nonzero_count(puzzle) <= rng[1]
        assert count_solutions(puzzle, limit=2) == 1


def test_difficulty_ranges_are_well_defined():
    assert DIFFICULTY_RANGES['easy'][0] <= DIFFICULTY_RANGES['easy'][1]
    assert DIFFICULTY_RANGES['medium'][0] <= DIFFICULTY_RANGES['medium'][1]
    assert DIFFICULTY_RANGES['hard'][0] <= DIFFICULTY_RANGES['hard'][1]
