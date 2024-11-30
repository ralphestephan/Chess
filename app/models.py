from app import db
from datetime import datetime


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    board_state = db.Column(db.JSON, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    games = db.relationship('Game', backref='user', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Stats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)
    total_games = db.Column(db.Integer, default=0)


class SinglePlayerGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    board_state = db.Column(db.JSON, nullable=False)  # Store the board in JSON
    moves = db.relationship('Move', backref='singleplayer_game', lazy=True)  # Move history
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class MultiplayerGame(db.Model):
    id = db.Column(db.String(6), primary_key=True)  # Short, user-friendly game ID
    player1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    player2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    board_state = db.Column(db.JSON, nullable=False)  # Store the board in JSON
    turn = db.Column(db.String(80), nullable=False)  # Whose turn
    result = db.Column(db.String(80), nullable=True)  # e.g., "Player 1 wins"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    moves = db.relationship('Move', backref='multiplayer_game', lazy=True)


class Move(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('single_player_game.id'), nullable=True)
    multiplayer_game_id = db.Column(db.String(6), db.ForeignKey('multiplayer_game.id'), nullable=True)
    move = db.Column(db.String(20), nullable=False)  # e.g., "e2e4"
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
