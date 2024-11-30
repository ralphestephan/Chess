document.addEventListener("DOMContentLoaded", () => {
    const chessBoard = document.getElementById("chessBoard");
    const pieces = {
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };
    const initialPosition = [
      "rnbqkbnr", // Row 0
      "pppppppp", // Row 1
      "        ", // Row 2
      "        ", // Row 3
      "        ", // Row 4
      "        ", // Row 5
      "PPPPPPPP", // Row 6
      "RNBQKBNR"  // Row 7
    ];
    const boardState = initialPosition.map(row => row.split("")); // Tracks the board
    let currentTurn = "white"; // Tracks whose turn it is
  
    // Generate the chessboard
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
        square.dataset.row = row;
        square.dataset.col = col;
        chessBoard.appendChild(square);
      }
    }
  
    const squares = chessBoard.children;
  
    // Place pieces
    const updateBoard = () => {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = squares[row * 8 + col];
          square.innerHTML = ""; // Clear square
          const piece = boardState[row][col];
          if (piece !== " ") {
            const pieceElement = document.createElement("div");
            pieceElement.classList.add("chess-piece");
            pieceElement.textContent = pieces[piece];
            pieceElement.draggable = true;
            pieceElement.dataset.row = row;
            pieceElement.dataset.col = col;
            pieceElement.dataset.piece = piece;
            square.appendChild(pieceElement);
          }
        }
      }
    };
  
    updateBoard();
  
    // Move validation
    const isValidMove = (fromRow, fromCol, toRow, toCol, piece) => {
      const dx = toCol - fromCol;
      const dy = toRow - fromRow;
      const target = boardState[toRow][toCol];
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
  
      // Check turn validity
      const isWhite = piece === piece.toUpperCase();
      if ((currentTurn === "white" && !isWhite) || (currentTurn === "black" && isWhite)) {
        return false;
      }
  
      // Validate moves based on piece type
      switch (piece.toLowerCase()) {
        case 'p': // Pawn
          if (piece === 'P') {
            if (dx === 0 && target === " " && (dy === -1 || (fromRow === 6 && dy === -2 && boardState[5][toCol] === " "))) return true;
            if (absDx === 1 && dy === -1 && target !== " " && target === target.toLowerCase()) return true;
          } else {
            if (dx === 0 && target === " " && (dy === 1 || (fromRow === 1 && dy === 2 && boardState[2][toCol] === " "))) return true;
            if (absDx === 1 && dy === 1 && target !== " " && target === target.toUpperCase()) return true;
          }
          break;
        case 'r': // Rook
          if ((dx === 0 || dy === 0) && isPathClear(fromRow, fromCol, toRow, toCol)) return true;
          break;
        case 'n': // Knight
          if (absDx * absDy === 2) return true;
          break;
        case 'b': // Bishop
          if (absDx === absDy && isPathClear(fromRow, fromCol, toRow, toCol)) return true;
          break;
        case 'q': // Queen
          if ((dx === 0 || dy === 0 || absDx === absDy) && isPathClear(fromRow, fromCol, toRow, toCol)) return true;
          break;
        case 'k': // King
          if (absDx <= 1 && absDy <= 1) return true;
          break;
      }
      return false;
    };
  
    const isPathClear = (fromRow, fromCol, toRow, toCol) => {
      const dx = toCol - fromCol;
      const dy = toRow - fromRow;
      const stepX = dx ? dx / Math.abs(dx) : 0;
      const stepY = dy ? dy / Math.abs(dy) : 0;
  
      let x = fromCol + stepX;
      let y = fromRow + stepY;
      while (x !== toCol || y !== toRow) {
        if (boardState[y][x] !== " ") return false;
        x += stepX;
        y += stepY;
      }
      return true;
    };
  
    // Drag and drop functionality
    let draggedPiece = null;
    let fromRow, fromCol;
  
    document.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("chess-piece")) {
          draggedPiece = e.target;
          fromRow = parseInt(draggedPiece.dataset.row);
          fromCol = parseInt(draggedPiece.dataset.col);
          e.dataTransfer.effectAllowed = "move"; // Only allow 'move' effect
        } else {
          e.preventDefault(); // Prevent dragging non-piece elements
        }
      });

      document.addEventListener("dragover", (e) => {
        e.preventDefault(); // Allow drop on valid targets
      });

      document.addEventListener("drop", (e) => {
        e.preventDefault(); // Prevent default drop behavior
        const targetSquare = e.target.closest(".light, .dark");
        if (targetSquare && draggedPiece) {
          const toRow = parseInt(targetSquare.dataset.row);
          const toCol = parseInt(targetSquare.dataset.col);
          const piece = draggedPiece.dataset.piece;

          if (isValidMove(fromRow, fromCol, toRow, toCol, piece)) {
            // Update board state
            boardState[fromRow][fromCol] = " "; // Clear old position
            boardState[toRow][toCol] = piece; // Move piece
            updateBoard();

            // Switch turn
            currentTurn = currentTurn === "white" ? "black" : "white";
          }
          draggedPiece = null;
        }
      });

  });
  