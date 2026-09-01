from .constants import SIZE


def is_safe(board, row, col, num):
    """Return True if placing num at (row, col) does not violate Sudoku rules."""
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check BOX_SIZE x BOX_SIZE box (3x3)
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True
