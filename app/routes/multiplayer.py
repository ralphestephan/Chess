from flask import Blueprint, request, jsonify
from app.models import MultiplayerGame, Move  # Adjust based on your actual structure
from app import db  # Import the database instance


multiplayer_bp = Blueprint('multiplayer', __name__)  # Create the blueprint


@multiplayer_bp.route('/create', methods=['POST'])
def create_game():
    data = request.json
    game_id = "123ABC"  # Placeholder for actual game ID generation
    board_state = {"board": "initial_board", "turn": "white"}
    game = MultiplayerGame(id=game_id, player1_id=data['player1_id'], board_state=board_state)
    db.session.add(game)
    db.session.commit()
    return jsonify({"message": "Game created!", "game_id": game_id}), 201


@multiplayer_bp.route('/join', methods=['POST'])
def join_game():
    data = request.json
    game = MultiplayerGame.query.get(data['game_id'])
    if game and not game.player2_id:
        game.player2_id = data['player2_id']
        db.session.commit()
        return jsonify({"message": "Joined game!"}), 200
    return jsonify({"message": "Game not found or already full!"}),


@multiplayer_bp.route('/move', methods=['POST'])
def make_move():
    data = request.json
    game = MultiplayerGame.query.get(data['game_id'])
    if not game:
        return jsonify({"message": "Game not found!"}), 404

    move = data['move']
    if game.turn != data['player']:
        return jsonify({"message": "Not your turn!"}), 403

    # Update board state
    from app.utils import update_board
    updated_board = update_board(game.board_state["board"], move)
    game.board_state["board"] = updated_board
    game.board_state["turn"] = "black" if game.board_state["turn"] == "white" else "white"

    # Save the move
    move_record = Move(multiplayer_game_id=game.id, move=move)
    db.session.add(move_record)
    db.session.commit()

    return jsonify({"message": "Move recorded!", "board": game.board_state["board"]}), 200


@multiplayer_bp.route('/end/<string:game_id>', methods=['POST'])
def end_game(game_id):
    data = request.json
    game = MultiplayerGame.query.get(game_id)
    if not game:
        return jsonify({"message": "Game not found!"}), 404

    game.result = data["result"]  # e.g., "Player 1 wins"
    db.session.commit()
    return jsonify({"message": "Game ended!", "result": game.result}), 200
