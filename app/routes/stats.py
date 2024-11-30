from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import Stats, MultiplayerGame
from app import db

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/user', methods=['GET'])
def user_stats():
    user_id = get_jwt_identity()  # Get the logged-in user
    stats = Stats.query.filter_by(user_id=user_id).first()
    if not stats:
        return jsonify({"message": "No stats found for this user."}), 404
    return jsonify({
        "wins": stats.wins,
        "losses": stats.losses,
        "total_games": stats.total_games
    }), 200


@stats_bp.route('/history', methods=['GET'])
def game_history():
    user_id = get_jwt_identity()
    games = MultiplayerGame.query.filter(
        (MultiplayerGame.player1_id == user_id) |
        (MultiplayerGame.player2_id == user_id)
    ).all()
    return jsonify([{
        "game_id": game.id,
        "result": game.result,
        "created_at": game.created_at
    } for game in games]), 200


@stats_bp.route('/game/<string:game_id>', methods=['GET'])
def game_moves(game_id):
    moves = Move.query.filter_by(multiplayer_game_id=game_id).all()
    if not moves:
        return jsonify({"message": "No moves found for this game."}), 404
    return jsonify([{"move": move.move, "timestamp": move.timestamp} for move in moves]), 200
