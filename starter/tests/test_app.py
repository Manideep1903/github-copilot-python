import pytest
import app as app_module
from app import app as flask_app

@pytest.fixture
def client():
    """Provide a Flask test client for the local app module.

    The tests import the local app.py directly because pytest will be run
    from the starter/ folder. That makes "import app" resolve to starter/app.py.
    """
    flask_app.testing = True
    with flask_app.test_client() as client:
        yield client


def test_index_route_returns_200_and_contains_title(client):
    """GET / should return the index HTML containing the title text 'Sudoku Game'."""
    res = client.get('/')
    assert res.status_code == 200
    assert b'Sudoku Game' in res.data


def test_new_route_returns_9x9_puzzle(client):
    """GET /new should return JSON with a 9x9 puzzle list-of-lists."""
    res = client.get('/new?clues=30')
    assert res.status_code == 200
    data = res.get_json()
    assert 'puzzle' in data
    puzzle = data['puzzle']
    assert isinstance(puzzle, list)
    assert len(puzzle) == 9
    assert all(isinstance(row, list) and len(row) == 9 for row in puzzle)


def test_check_without_game_returns_400_and_error(client):
    """POST /check when no game is in progress should return a 400 status and an error message."""
    # Clear in-memory solution state to simulate no game in progress
    app_module.CURRENT['solution'] = None
    board = [[0 for _ in range(9)] for _ in range(9)]
    res = client.post('/check', json={'board': board})
    assert res.status_code == 400
    data = res.get_json()
    assert data.get('error') == 'No game in progress'


def test_check_with_correct_solution_reports_no_incorrect_cells(client):
    """Start a new game, then POST the stored solution to /check and expect no incorrect cells."""
    res_new = client.get('/new')
    assert res_new.status_code == 200
    # Read the stored solution from the module-level CURRENT
    solution = app_module.CURRENT.get('solution')
    assert solution is not None
    res = client.post('/check', json={'board': solution})
    assert res.status_code == 200
    data = res.get_json()
    assert isinstance(data.get('incorrect'), list)
    assert data.get('incorrect') == []
