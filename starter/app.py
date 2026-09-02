from flask import Flask, render_template, request, jsonify, session
import uuid
import random

from sudoku_logic import (
    generate_puzzle,
    is_valid_board_shape,
    is_complete_and_correct
)


app = Flask(__name__)

# Used to identify a player's browser session.
app.secret_key = "sudoku-development-secret-key"


# Store games by game ID rather than using one global CURRENT game.
#
# This prevents different players from overwriting the same game.
GAMES = {}


# =========================
# Difficulty settings
# =========================

DIFFICULTY_CLUES = {
    "easy": 45,
    "medium": 36,
    "hard": 30
}


# =========================
# Helper functions
# =========================

def get_game():
    """Return the current player's game."""

    game_id = session.get("game_id")

    if not game_id:
        return None

    return GAMES.get(game_id)


def create_game(difficulty):
    """Create and store a new game."""

    clues = DIFFICULTY_CLUES[difficulty]

    puzzle, solution = generate_puzzle(clues)

    game_id = str(uuid.uuid4())

    # Store the game including the hint counter.
    GAMES[game_id] = {
        "difficulty": difficulty,
        "clues": clues,
        "puzzle": puzzle,
        "solution": solution,
        "hints_used": 0
    }

    session["game_id"] = game_id

    return GAMES[game_id]


# =========================
# Main page
# =========================

@app.route("/")
def index():
    return render_template("index.html")


# =========================
# New game
# =========================

@app.route("/new", methods=["GET"])
def new_game():

    difficulty = request.args.get(
        "difficulty",
        "medium"
    )

    # -------------------------
    # Backwards-compatible support for ?clues=
    # -------------------------

    if "clues" in request.args:

        try:
            clues = int(request.args.get("clues"))
        except (TypeError, ValueError):

            return jsonify({
                "error": "clues must be an integer"
            }), 400

        if not 17 <= clues <= 81:

            return jsonify({
                "error": "clues must be between 17 and 81"
            }), 400

        # Generate using the requested clue count.
        try:

            puzzle, solution = generate_puzzle(clues)

        except Exception:

            return jsonify({
                "error": "Unable to generate puzzle"
            }), 500

        game_id = str(uuid.uuid4())

        # Store custom game.
        GAMES[game_id] = {
            "difficulty": "custom",
            "clues": clues,
            "puzzle": puzzle,
            "solution": solution,
            "hints_used": 0
        }

        session["game_id"] = game_id

        return jsonify({
            "puzzle": puzzle,
            "difficulty": "custom",
            "clues": clues
        })

    # -------------------------
    # Validate difficulty
    # -------------------------

    if difficulty not in DIFFICULTY_CLUES:

        return jsonify({
            "error": "difficulty must be easy, medium, or hard"
        }), 400

    # -------------------------
    # Create new game
    # -------------------------

    try:

        game = create_game(difficulty)

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400

    except Exception:

        return jsonify({
            "error": "Unable to generate puzzle"
        }), 500

    return jsonify({
        "puzzle": game["puzzle"],
        "difficulty": difficulty,
        "clues": game["clues"]
    })


# =========================
# Check solution
# =========================

@app.route("/check", methods=["POST"])
def check_solution():

    # Make sure request contains JSON.
    if not request.is_json:

        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    data = request.get_json(silent=True)

    if not isinstance(data, dict):

        return jsonify({
            "error": "JSON body must be an object"
        }), 400

    board = data.get("board")

    if board is None:

        return jsonify({
            "error": "board is required"
        }), 400

    # Validate board shape BEFORE indexing it.
    if not is_valid_board_shape(board):

        return jsonify({
            "error": "board must be a 9x9 grid containing integers from 0 to 9"
        }), 400

    game = get_game()

    if game is None:

        return jsonify({
            "error": "No active game. Start a new game first."
        }), 404

    solution = game["solution"]

    incorrect = []

    for row in range(9):

        for col in range(9):

            value = board[row][col]

            # Ignore empty cells.
            if value == 0:
                continue

            if value != solution[row][col]:

                incorrect.append({
                    "row": row,
                    "col": col
                })

    complete = (
        not incorrect
        and is_complete_and_correct(
            board,
            solution
        )
    )

    return jsonify({
        "incorrect": incorrect,
        "complete": complete
    })


# =========================
# Hint
# =========================

@app.route("/hint", methods=["POST"])
def hint():

    # Make sure request contains JSON.
    if not request.is_json:

        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    data = request.get_json(silent=True)

    # JSON must be an object.
    if not isinstance(data, dict):

        return jsonify({
            "error": "JSON body must be an object"
        }), 400

    board = data.get("board")

    # Board must exist.
    if board is None:

        return jsonify({
            "error": "board is required"
        }), 400

    # Validate board BEFORE accessing board[row][col].
    if not is_valid_board_shape(board):

        return jsonify({
            "error": "board must be a 9x9 grid containing integers from 0 to 9"
        }), 400

    # Get current player's game.
    game = get_game()

    if game is None:

        return jsonify({
            "error": "No active game. Start a new game first."
        }), 404

    solution = game["solution"]

    # Find empty cells.
    empty_cells = []

    for row in range(9):

        for col in range(9):

            if board[row][col] == 0:

                empty_cells.append(
                    (row, col)
                )

    # No empty cells.
    if not empty_cells:

        return jsonify({
            "error": "No empty cells available"
        }), 400

    # Choose a random empty cell.
    row, col = random.choice(
        empty_cells
    )

    # Get the correct value from the solution.
    value = solution[row][col]

    # Increase hint counter.
    game.setdefault(
        "hints_used",
        0
    )

    game["hints_used"] += 1

    # Put the correct value into the board.
    board[row][col] = value

    # Check whether the puzzle is now complete.
    complete = (
        board == solution
    )

    return jsonify({
        "row": row,
        "col": col,
        "value": value,
        "hints_used": game["hints_used"],
        "complete": complete
    })


# =========================
# Error handlers
# =========================

@app.errorhandler(400)
def bad_request(error):

    return jsonify({
        "error": "Bad request"
    }), 400


@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "error": "Resource not found"
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):

    return jsonify({
        "error": "Method not allowed"
    }), 405


@app.errorhandler(415)
def unsupported_media_type(error):

    return jsonify({
        "error": "Request body must be JSON"
    }), 400


@app.errorhandler(500)
def internal_error(error):

    return jsonify({
        "error": "Internal server error"
    }), 500


# =========================
# Run application
# =========================

if __name__ == "__main__":
    app.run(debug=True)