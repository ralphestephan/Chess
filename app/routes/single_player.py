from flask import Blueprint, request, jsonify
from app.models import SinglePlayerGame, Move
from app import db
from app.utils import update_board


single_player_bp = Blueprint('single_player', __name__)


@single_player_bp.route('/create', methods=['POST'])
def create_game():
    initial_board = {
        "board": [  # Simplified initial chessboard representation
            ["r", "n", "b", "q", "k", "b", "n", "r"],
            ["p", "p", "p", "p", "p", "p", "p", "p"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["P", "P", "P", "P", "P", "P", "P", "P"],
            ["R", "N", "B", "Q", "K", "B", "N", "R"]
        ],
        "turn": "white"
    }
    game = SinglePlayerGame(board_state=initial_board)
    db.session.add(game)
    db.session.commit()
    return jsonify({"message": "Singleplayer game created!", "game_id": game.id}), 201


@single_player_bp.route('/move', methods=['POST'])
def make_move():
    data = request.json
    game = SinglePlayerGame.query.get(data['game_id'])
    if not game:
        return jsonify({"message": "Game not found!"}), 404

    move = data['move']
    updated_board = update_board(game.board_state["board"], move)
    game.board_state["board"] = updated_board
    game.board_state["turn"] = "black" if game.board_state["turn"] == "white" else "white"

    move_record = Move(game_id=game.id, move=move)
    db.session.add(move_record)
    db.session.commit()
    return jsonify({"message": "Move recorded!", "board": game.board_state["board"]}), 200


@single_player_bp.route('/delete/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    game = SinglePlayerGame.query.get(game_id)
    if not game:
        return jsonify({"message": "Game not found!"}), 404
    db.session.delete(game)
    db.session.commit()
    return jsonify({"message": "Game deleted!"}), 200
