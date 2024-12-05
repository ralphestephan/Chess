const API_URL = "http://localhost:5000";

let board = Array.from({ length: 8 }, () => Array(8).fill("")); // Initialize an empty 8x8 board
let selectedSquare = null;
let gameId = null;
let userId = null;
let pollingInterval = null; // Interval for polling
let kingMoved = { white: false, black: false }; // Track if kings have moved
let rookMoved = { white: [false, false], black: [false, false] }; // Track rooks (king-side, queen-side)
let lastMove = null; // Store the last move [fromRow, fromCol, toRow, toCol]
const pieceImages = {
    P: "./pieces/White-Pawn.png",
    R: "./pieces/White-Rook.png",
    N: "./pieces/White-Knight.png",
    B: "./pieces/White-Bishop.png",
    Q: "./pieces/White-Queen.png",
    K: "./pieces/White-King.png",
    p: "./pieces/Black-Pawn.png",
    r: "./pieces/Black-Rook.png",
    n: "./pieces/Black-Knight.png",
    b: "./pieces/Black-Bishop.png",
    q: "./pieces/Black-Queen.png",
    k: "./pieces/Black-King.png",
};

// Initialize the chessboard
function initializeBoard() {
    console.log("Initializing board with state:", board);
    const boardElement = document.getElementById("chessboard");
    boardElement.innerHTML = ""; // Clear any previous board

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement("div");
            square.className = `square ${(row + col) % 2 === 0 ? "white" : "black"}`;
            square.dataset.position = `${row},${col}`;
            square.addEventListener("click", () => handleSquareClick(row, col));

            // Add piece image if there is a piece on the square
            const piece = board[row][col];
            if (piece) {
                const img = document.createElement("img");
                img.src = pieceImages[piece]; // Map piece letter to its image
                img.alt = piece; // For accessibility
                img.className = "piece"; // Optional: for styling
                square.appendChild(img);
            }

            boardElement.appendChild(square);
        }
    }
}
// Handle square click
async function handleSquareClick(row, col) {
    const piece = board[row][col]; // The piece on the clicked square

    if (selectedSquare) {
        const [fromRow, fromCol] = selectedSquare;
        await makeMove([fromRow, fromCol], [row, col]); // Await the move
        selectedSquare = null; // Reset selection
    } else if (piece) {
        selectedSquare = [row, col]; // Select the square
    }
}

// Clone the board and apply the move
function cloneBoardAndMove(from, to) {
    const clonedBoard = board.map(row => [...row]); // Clone the board
    clonedBoard[to[0]][to[1]] = clonedBoard[from[0]][from[1]]; // Move piece
    clonedBoard[from[0]][from[1]] = ""; // Clear the source square
    return clonedBoard;
}

// Validate a move based on chess rules
function validateMove(from, to, piece, board) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const targetSquare = board[toRow][toCol];

    // Determine color of the piece
    const color = piece === piece.toUpperCase() ? "white" : "black";
    const targetColor = targetSquare
        ? targetSquare === targetSquare.toUpperCase()
            ? "white"
            : "black"
        : null;

    // Prevent eating own pieces
    if (targetSquare && color === targetColor) {
        return false;
    }

    // Define rules for each piece
    switch (piece.toLowerCase()) {
        case "p": // Pawn
            const direction = piece === "P" ? -1 : 1; // White moves up (-1), Black moves down (+1)
            if (
                toCol === fromCol && // Forward move
                targetSquare === "" &&
                (toRow === fromRow + direction || // Normal move
                    (fromRow === (piece === "P" ? 6 : 1) && // Starting row
                        toRow === fromRow + 2 * direction &&
                        board[fromRow + direction][fromCol] === "")) // Double move
            ) {
                return true; // Normal pawn move
            }
            if (
                Math.abs(toCol - fromCol) === 1 && // Diagonal move
                toRow === fromRow + direction && // Forward move
                targetSquare && // Capturing a piece
                color !== targetColor
            ) {
                return true; // Pawn capture
            }
            break;

        case "n": // Knight
            if (
                (Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 1) ||
                (Math.abs(toRow - fromRow) === 1 && Math.abs(toCol - fromCol) === 2)
            ) {
                return true; // Valid knight move
            }
            break;

        case "b": // Bishop
            if (
                Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol) &&
                isPathClear(from, to, board)
            ) {
                return true; // Valid bishop move
            }
            break;

        case "r": // Rook
            if (
                (toRow === fromRow || toCol === fromCol) &&
                isPathClear(from, to, board)
            ) {
                return true; // Valid rook move
            }
            break;

        case "q": // Queen
            if (
                (toRow === fromRow || toCol === fromCol || Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol)) &&
                isPathClear(from, to, board)
            ) {
                return true; // Valid queen move
            }
            break;

        case "k": // King
            if (
                Math.abs(toRow - fromRow) <= 1 &&
                Math.abs(toCol - fromCol) <= 1
            ) {
                return true; // Normal king move
            }
            break;
    }

    return false; // Invalid move
}




// Helper function to check if the path is clear (for bishops, rooks, and queens)
function isPathClear(from, to, board) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (row !== toRow || col !== toCol) {
        if (board[row][col] !== "") return false; // Path is blocked
        row += rowStep;
        col += colStep;
    }

    return true;
}

// Check if the king is in check
function isKingInCheck(board, color) {
    let kingPosition = null;

    // Find the king's position
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === (color === "white" ? "K" : "k")) {
                kingPosition = [row, col];
                break;
            }
        }
    }

    if (!kingPosition) return false;

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (
                piece &&
                ((color === "white" && piece === piece.toLowerCase()) ||
                 (color === "black" && piece === piece.toUpperCase()))
            ) {
                if (validateMove([row, col], kingPosition, piece, board)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// Validate a move and ensure the king isn't left in check
function validateMoveAndKingSafety(from, to, piece, board, color, kingMoved, rookMoved, lastMove) {
    // Validate the move for the piece
    if (!validateMove(from, to, piece, board)) {
        return false; // Invalid move
    }

    // Clone the board for testing the move
    const clonedBoard = cloneBoardAndMove(from, to);

    // Handle pawn promotion validation
    if (piece.toLowerCase() === "p" && (to[0] === 0 || to[0] === 7)) {
        clonedBoard[to[0]][to[1]] = "q"; // Assume promotion to queen for validation
    }

    // Check if the move exposes the king to a check
    if (isKingInCheck(clonedBoard, color)) {
        return false; // Move not valid as it leaves the king in check
    }

    return true; // Move is valid
}




// Check if castling is allowed
function canCastle(board, color, kingMoved, rookMoved, from, to) {
    const row = color === "white" ? 7 : 0;
    const rookCol = to[1] > from[1] ? 7 : 0;

    if (kingMoved[color] || rookMoved[color][rookCol === 7 ? 0 : 1]) return false;
    if (!isPathClear([row, from[1]], [row, rookCol], board)) return false;

    // Ensure king is not in check before, during, or after the castling move
    for (let col = Math.min(from[1], to[1]); col <= Math.max(from[1], to[1]); col++) {
        const tempBoard = cloneBoardAndMove(from, [row, col]);
        if (isKingInCheck(tempBoard, color)) return false;
    }
    return true;
}

// Check if en passant is allowed
function canEnPassant(board, from, to, lastMove) {
    if (!lastMove || lastMove.length !== 4) return false; // Ensure lastMove is valid and well-formed

    // Destructure lastMove to get previous move's details
    const [lastFromRow, lastFromCol, lastToRow, lastToCol] = lastMove;

    // Check if the current move qualifies for en passant
    return (
        Math.abs(from[0] - to[0]) === 1 && // Row difference of 1
        Math.abs(from[1] - to[1]) === 1 && // Column difference of 1
        board[from[0]][from[1]].toLowerCase() === "p" && // Current piece is a pawn
        board[lastToRow][lastToCol].toLowerCase() === "p" && // Last moved piece is a pawn
        lastToRow === from[0] && // Last move's destination row is the current pawn's row
        lastToCol === to[1] // Last move's destination column matches the en passant target
    );
}



// Handle pawn promotion
function handlePawnPromotion(board, to, promotionChoice) {
    const [row, col] = to;

    // Determine if the pawn has reached the back rank
    if (board[row][col].toLowerCase() === "p" && (row === 0 || row === 7)) {
        // Replace the pawn with the chosen piece (default to queen if no choice is provided)
        board[row][col] = promotionChoice || "q"; // 'q' for queen
    }
}

// Handle castling move
function handleCastling(board, from, to) {
    const row = from[0];
    const rookCol = to[1] > from[1] ? 7 : 0; // Determine rook position
    const newRookCol = to[1] > from[1] ? 5 : 3; // Determine new rook position

    // Move the rook during castling
    board[row][newRookCol] = board[row][rookCol];
    board[row][rookCol] = ""; // Clear the original rook position
}
async function isCheckmate(board, color, gameId) {
    // Find if the king is in check
    if (!isKingInCheck(board, color)) return false;

    // Check if the player has any valid moves left
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (
                piece &&
                (color === "white" ? piece === piece.toUpperCase() : piece === piece.toLowerCase())
            ) {
                // Check if this piece has any valid moves
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        if (validateMoveAndKingSafety([row, col], [toRow, toCol], piece, board, color)) {
                            return false; // At least one valid move exists
                        }
                    }
                }
            }
        }
    }

    // No valid moves and the king is in check => Checkmate
    const winner = color === "white" ? "black" : "white"; // Opponent wins
    alert(`Checkmate! The winner is ${winner}.`);

    // Call the endGame function to update the backend
    await endGame(gameId);

    return true;
}


async function endGame(gameId) {
    const response = await fetch(`${API_URL}/chess/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
    });

    const result = await response.json();
    if (response.ok) {
        alert(`Game ended! The winner is Player ${result.winner}`);
    } else {
        alert(`Failed to end game: ${result.message}`);
    }
}


// Fetch the latest board state from the backend
async function fetchBoardState() {
    try {
        const response = await fetch(`${API_URL}/chess/game/${gameId}`);
        const result = await response.json();

        if (response.ok) {
            board = result.board_state; // Update the global board state
            initializeBoard(); // Re-render the board
        } else {
            throw new Error("Failed to fetch board state");
        }
    } catch (error) {
        console.error("Error fetching board state:", error);
    }
}

// Start polling for board updates
function startPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval); // Clear any existing polling interval
    }
    pollingInterval = setInterval(async () => {
        await fetchBoardState(); // Fetch the latest board state periodically
    }, 1000); // Poll every 1 second
}


// Make a move
async function makeMove(from, to, promotionChoice = "q") {
    const piece = board[from[0]][from[1]];
    const color = piece === piece.toUpperCase() ? "white" : "black";

    // Validate the move
    if (!validateMoveAndKingSafety(from, to, piece, board, color, kingMoved, rookMoved, lastMove)) {
        alert("Invalid move. Your king would be in check or the move is invalid!");
        return;
    }

    // Handle special moves
    if (piece.toLowerCase() === "p" && canEnPassant(board, from, to, lastMove)) {
        board[lastMove[2]][lastMove[3]] = ""; // Capture the pawn en passant
    }
    if (piece.toLowerCase() === "k" && canCastle(board, color, kingMoved, rookMoved, from, to)) {
        handleCastling(board, from, to); // Perform castling
    }

    const updatedBoardState = cloneBoardAndMove(from, to);

    // Handle pawn promotion
    if (piece.toLowerCase() === "p" && (to[0] === 0 || to[0] === 7)) {
        handlePawnPromotion(updatedBoardState, to, promotionChoice);
    }

    // Update movement tracking
    if (piece.toLowerCase() === "k") kingMoved[color] = true;
    if (piece.toLowerCase() === "r") {
        const isKingSide = from[1] === 7;
        rookMoved[color][isKingSide ? 0 : 1] = true;
    }
    lastMove = [from[0], from[1], to[0], to[1]];

    // Send the updated board state to the backend
    try {
        const response = await fetch(`${API_URL}/chess/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                game_id: gameId,
                user_id: userId,
                move: `${from.join("")}${to.join("")}`,
                board_state: updatedBoardState,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            board = updatedBoardState;
            initializeBoard()

            // Check for checkmate
            const opponentColor = color === "white" ? "black" : "white";
            if (isKingInCheck(board, opponentColor) && await isCheckmate(opponentColor)) {
                alert(`Checkmate! The winner is ${color}!`);

                // Update the backend with the winner
                await fetch(`${API_URL}/chess/end`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        game_id: gameId,
                        winner: userId, // The current player
                    }),
                });

                // End the game
                return;
            }
        } else {
            alert(`Error making move: ${result.message}`);
        }
    } catch (error) {
        console.error("Error making move:", error);
        alert("An error occurred while making the move.");
    }
}




// Authentication and game setup code
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sign-in").addEventListener("click", async () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            userId = result.user_id;
            alert("Sign-in successful!");
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("game-section").style.display = "block";
        } else {
            alert(`Error: ${result.message}`);
        }
    });

    document.getElementById("sign-up").addEventListener("click", async () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Sign-up successful! You can now log in.");
        } else {
            alert(`Error: ${result.message}`);
        }
    });
    // Set up event listeners and game flow
    function setupGame() {
    document.getElementById("create-game").addEventListener("click", async () => {
        try {
            const response = await fetch(`${API_URL}/chess/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!response.ok) throw new Error("Failed to create game");

            const result = await response.json();
            gameId = result.game_id;
            board = result.board_state;
            initializeBoard(); // Render the board
            document.getElementById("chessboard").style.display = "grid"; // Show the chessboard
            alert(`Game created! Share this Game ID: ${gameId}`);
            startPolling(); // Start polling for updates
        } catch (error) {
            alert(`Error creating game: ${error.message}`);
        }
    });

    document.getElementById("join-game").addEventListener("click", async () => {
        const gameInput = prompt("Enter the Game ID to join:");
        try {
            const response = await fetch(`${API_URL}/chess/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, game_id: gameInput }),
            });

            if (!response.ok) throw new Error("Failed to join game");

            const result = await response.json();
            gameId = gameInput;
            board = result.board_state; // Update the board with the state from the backend
            initializeBoard(); // Render the board
            document.getElementById("chessboard").style.display = "grid"; // Show the chessboard
            alert("Joined the game successfully!");
            startPolling(); // Start polling for updates
        } catch (error) {
            alert(`Error joining game: ${error.message}`);
        }
    });
}


    setupGame();
});

// Fetch board state and start polling code remains unchanged.
// Ensure to copy all other functions from your earlier code like validateMoveAndKingSafety, handlePawnPromotion, handleCastling, etc.
