from .constants import SIZE, EMPTY
from .validator import is_safe


def fill_board(board):
    """Backtracking fill for a complete, valid Sudoku board.

    This mutates the provided board and returns True on success.
    The algorithm matches the legacy implementation (randomized order).
    """
    import random

    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True
