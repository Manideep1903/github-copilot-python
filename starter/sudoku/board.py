import copy
from .constants import SIZE, EMPTY

def deep_copy(board):
    """Return a deep copy of the board."""
    return copy.deepcopy(board)

def create_empty_board():
    """Create an empty SIZE x SIZE board filled with EMPTY."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]
