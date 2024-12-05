from flask import Blueprint, request, jsonify
from app.models import db, Game
import json

chess_bp = Blueprint('chess', __name__)


@chess_bp.route('/start', methods=['POST'])
@chess_bp.route('/start', methods=['POST'])
def start_game():
    data = request.json
    user_id = data['user_id']

    # Initialize the board with a standard chess setup
    board_state = json.dumps([
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],  # Black pieces
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],  # Black pawns
        ['', '', '', '', '', '', '', ''],          # Empty rows
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],  # White pawns
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']   # White pieces
    ])  # Standard starting position

    game = Game(player_white=user_id, board_state=board_state, turn='white')
    db.session.add(game)
    db.session.commit()

    # Include 'board_state' in the response
    return jsonify({
        'game_id': game.id,
        'board_state': json.loads(board_state),
        'turn': game.turn
    }), 201


@chess_bp.route('/join', methods=['POST'])
def join_game():
    data = request.json
    game_id = data.get('game_id')
    user_id = data.get('user_id')

    game = Game.query.filter_by(id=game_id).first()
    if not game:
        return jsonify({"message": "Game not found"}), 404

    if not game.player_black:  # Check if the second player slot is available
        game.player_black = user_id
        db.session.commit()

    return jsonify({
        "game_id": game.id,
        "board_state": json.loads(game.board_state)  # Ensure the board_state is sent
    }), 200


@chess_bp.route('/move', methods=['POST'])
def make_move():
    data = request.json

    if 'game_id' not in data or 'user_id' not in data or 'board_state' not in data:
        return jsonify({'message': 'Missing required fields: game_id, user_id, or board_state'}), 400

    game = Game.query.get(data['game_id'])
    if not game:
        return jsonify({'message': 'Game not found'}), 404

    # Ensure both players have joined
    if not game.player_white or not game.player_black:
        return jsonify({'message': 'Waiting for another player to join'}), 400

    # Turn validation
    user_id = data['user_id']
    if (game.turn == 'white' and game.player_white != user_id) or (game.turn == 'black' and game.player_black != user_id):
        return jsonify({'message': 'Not your turn'}), 403

    try:
        game.board_state = json.dumps(data['board_state'])
        game.turn = 'black' if game.turn == 'white' else 'white'
        db.session.commit()
        return jsonify({'message': 'Move registered', 'turn': game.turn}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating the game: {str(e)}'}), 500


@chess_bp.route('/game/<int:game_id>', methods=['GET'])
def get_game(game_id):
    game = Game.query.get(game_id)
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    return jsonify({'game_id': game.id, 'board_state': json.loads(game.board_state), 'turn': game.turn}), 200


@chess_bp.route('/end', methods=['POST'])
def end_game():
    """Endpoint to mark the game as ended and store the winner."""
    data = request.json
    game_id = data.get('game_id')

    if not game_id:
        return jsonify({"message": "Game ID is required"}), 400

    try:
        # Find the game
        game = Game.query.get(game_id)
        if not game:
            return jsonify({"message": "Game not found"}), 404

        # Determine the winner based on whose turn it is
        if game.turn == 'white':
            game.winner = game.player_black  # Black wins if it's White's turn and game ends
        else:
            game.winner = game.player_white  # White wins if it's Black's turn and game ends

        db.session.commit()

        return jsonify({"message": "Game ended successfully", "winner": game.winner}), 200
    except Exception as e:
        print(f"Error ending game: {e}")
        db.session.rollback()
        return jsonify({"message": "Failed to end game"}), 500

