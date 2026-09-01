# Backwards-compatible adapter to the newer sudoku package.
# Keeps starter/app.py unchanged while delegating puzzle generation to
# starter/sudoku/generator.py which implements unique-solution generation.
from .sudoku.generator import generate_puzzle

# Export names expected by app.py
# generate_puzzle is imported above and will be used by app.py
