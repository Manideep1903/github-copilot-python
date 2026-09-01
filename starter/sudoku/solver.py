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


def _find_empty_with_fewest_candidates(board):
    """Return (row, col, candidates) for the empty cell with fewest legal candidates.
    If no empty cells, return (None, None, None).
    """
    best = None
    best_cands = None
    for r in range(SIZE):
        for c in range(SIZE):
            if board[r][c] == EMPTY:
                cands = []
                for n in range(1, SIZE + 1):
                    if is_safe(board, r, c, n):
                        cands.append(n)
                if best is None or len(cands) < len(best_cands):
                    best = (r, c)
                    best_cands = cands
                    if len(best_cands) == 0:
                        return best[0], best[1], best_cands
    if best is None:
        return None, None, None
    return best[0], best[1], best_cands


def _has_initial_conflict(board):
    """Return True if any non-zero number is duplicated in its row, column, or box."""
    for row in range(SIZE):
        for col in range(SIZE):
            value = board[row][col]
            if value == EMPTY:
                continue
            for other_col in range(SIZE):
                if other_col != col and board[row][other_col] == value:
                    return True
            for other_row in range(SIZE):
                if other_row != row and board[other_row][col] == value:
                    return True
            start_row = row - row % 3
            start_col = col - col % 3
            for r in range(start_row, start_row + 3):
                for c in range(start_col, start_col + 3):
                    if (r != row or c != col) and board[r][c] == value:
                        return True
    return False


def count_solutions(board, limit=2):
    """Count solutions for the given board, but stop and return as soon as count >= limit.

    This mutates the board during search but restores values on backtrack.
    Returns an integer count (1 if exactly one solution, >=2 if multiple found and limit>=2).
    """
    if _has_initial_conflict(board):
        return 0

    def _search(count):
        if count >= limit:
            return count
        row, col, cands = _find_empty_with_fewest_candidates(board)
        if row is None:
            # no empty cells -> found a complete solution
            return count + 1
        # try candidates in deterministic order to keep behavior stable in tests
        for n in cands:
            board[row][col] = n
            count = _search(count)
            board[row][col] = EMPTY
            if count >= limit:
                return count
        return count

    return _search(0)
