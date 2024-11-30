def update_board(board, move):
    """
    Update the board state based on the move.
    Example move: "e2e4" (from e2 to e4)
    """
    from_row = 8 - int(move[1])  # Convert rank to row index
    from_col = ord(move[0]) - ord('a')  # Convert file to column index
    to_row = 8 - int(move[3])
    to_col = ord(move[2]) - ord('a')

    # Get the piece at the source square
    piece = board[from_row][from_col]

    # Clear the source square
    board[from_row][from_col] = ""

    # Move the piece to the target square
    board[to_row][to_col] = piece

    return board
