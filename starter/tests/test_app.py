import pytest

from app import app, GAMES


@pytest.fixture
def client():

    app.config["TESTING"] = True

    GAMES.clear()

    with app.test_client() as client:
        yield client

    GAMES.clear()


def test_home_page(client):

    response = client.get("/")

    assert response.status_code == 200


def test_new_game_easy(client):

    response = client.get(
        "/new?difficulty=easy"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["difficulty"] == "easy"

    assert len(data["puzzle"]) == 9


def test_new_game_medium(client):

    response = client.get(
        "/new?difficulty=medium"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["difficulty"] == "medium"


def test_new_game_hard(client):

    response = client.get(
        "/new?difficulty=hard"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["difficulty"] == "hard"


def test_invalid_difficulty(client):

    response = client.get(
        "/new?difficulty=invalid"
    )

    assert response.status_code == 400

    data = response.get_json()

    assert "error" in data


def test_invalid_clues_text(client):

    response = client.get(
        "/new?clues=abc"
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "clues must be an integer"


def test_invalid_clues_too_low(client):

    response = client.get(
        "/new?clues=10"
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "clues must be between 17 and 81"


def test_invalid_clues_too_high(client):

    response = client.get(
        "/new?clues=82"
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "clues must be between 17 and 81"


def test_check_without_game(client):

    board = [
        [0 for _ in range(9)]
        for _ in range(9)
    ]

    response = client.post(
        "/check",
        json={
            "board": board
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert "error" in data


def test_check_non_json(client):

    client.get("/new?difficulty=easy")

    response = client.post(
        "/check",
        data="not json",
        content_type="text/plain"
    )

    assert response.status_code == 400

    data = response.get_json()

    assert "error" in data


def test_check_missing_board(client):

    client.get("/new?difficulty=easy")

    response = client.post(
        "/check",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "board is required"


def test_check_one_row_board(client):

    client.get("/new?difficulty=easy")

    response = client.post(
        "/check",
        json={
            "board": [
                [0 for _ in range(9)]
            ]
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert "9x9" in data["error"]


def test_check_invalid_board_value(client):

    client.get("/new?difficulty=easy")

    board = [
        [0 for _ in range(9)]
        for _ in range(9)
    ]

    board[0][0] = 10

    response = client.post(
        "/check",
        json={
            "board": board
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert "9x9" in data["error"]


def test_hint_without_game(client):

    board = [
        [0 for _ in range(9)]
        for _ in range(9)
    ]

    response = client.post(
        "/hint",
        json={
            "board": board
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert "error" in data