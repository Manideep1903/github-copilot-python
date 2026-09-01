import json
import os
import random
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from starter.app import CURRENT, app
from starter.sudoku.constants import DIFFICULTY_RANGES


def count_clues(board):
    return sum(1 for row in board for value in row if value != 0)


@pytest.fixture(autouse=True)
def reset_current_state():
    CURRENT['puzzle'] = None
    CURRENT['solution'] = None
    yield
    CURRENT['puzzle'] = None
    CURRENT['solution'] = None


def test_new_endpoint_default():
    client = app.test_client()
    response = client.get('/new')
    assert response.status_code == 200
    payload = json.loads(response.data)
    assert 'puzzle' in payload
    board = payload['puzzle']
    assert len(board) == 9 and len(board[0]) == 9


@pytest.mark.parametrize(
    'difficulty, expected_range',
    [
        ('easy', DIFFICULTY_RANGES['easy']),
        ('medium', DIFFICULTY_RANGES['medium']),
        ('hard', DIFFICULTY_RANGES['hard']),
    ],
)
def test_new_endpoint_accepts_each_difficulty(difficulty, expected_range):
    client = app.test_client()
    response = client.get(f'/new?difficulty={difficulty}')
    assert response.status_code == 200
    board = json.loads(response.data)['puzzle']
    clues = count_clues(board)
    assert expected_range[0] <= clues <= expected_range[1]


def test_check_accepts_correct_solution_and_identifies_incorrect_cells():
    client = app.test_client()
    random.seed(1)
    response = client.get('/new')
    assert response.status_code == 200

    solution = CURRENT['solution']
    response = client.post('/check', json={'board': solution})
    assert response.status_code == 200
    assert json.loads(response.data)['incorrect'] == []

    wrong = [row[:] for row in solution]
    wrong[0][0] = (solution[0][0] % 9) + 1
    response = client.post('/check', json={'board': wrong})
    assert response.status_code == 200
    assert [0, 0] in json.loads(response.data)['incorrect']


def test_check_returns_error_when_no_game_is_in_progress():
    client = app.test_client()
    response = client.post('/check', json={'board': [[0 for _ in range(9)] for _ in range(9)]})
    assert response.status_code == 400
    assert json.loads(response.data)['error'] == 'No game in progress'
