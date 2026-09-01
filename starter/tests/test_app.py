import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import json
from starter.app import app
from starter.sudoku.constants import DIFFICULTY_RANGES


def test_new_endpoint_default():
    client = app.test_client()
    resp = client.get('/new')
    assert resp.status_code == 200
    data = json.loads(resp.data)
    assert 'puzzle' in data
    puzzle = data['puzzle']
    assert len(puzzle) == 9 and len(puzzle[0]) == 9


def test_new_endpoint_difficulty_easy():
    client = app.test_client()
    resp = client.get('/new?difficulty=easy')
    assert resp.status_code == 200
    data = json.loads(resp.data)
    puzzle = data['puzzle']
    # count clues
    clues = sum(1 for r in puzzle for v in r if v != 0)
    erange = DIFFICULTY_RANGES['easy']
    assert erange[0] <= clues <= erange[1]
