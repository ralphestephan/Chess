from app import db


class User(db.Model):
    """User model for storing user information."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)  # Username must be unique
    password = db.Column(db.String(200), nullable=False)  # Password stored as plain text (simplified)

    def __repr__(self):
        return f"<User {self.username}>"


class Game(db.Model):
    """Game model for storing game state and player information."""
    id = db.Column(db.Integer, primary_key=True)
    player_white = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # White player
    player_black = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Black player (optional initially)
    board_state = db.Column(db.Text, nullable=False)  # JSON string representing the chess board
    turn = db.Column(db.String(10), nullable=False, default='white')  # Whose turn it is: 'white' or 'black'
    created_at = db.Column(db.DateTime, default=db.func.now())  # Timestamp for game creation
    moves = db.Column(db.Text, nullable=True)  # JSON array storing all moves, optional initially

    def __repr__(self):
        return f"<Game {self.id}>"
