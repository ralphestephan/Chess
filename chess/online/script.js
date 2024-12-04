const API_URL = "http://localhost:5000"; // Replace with your actual API URL

let board = Array.from({ length: 8 }, () => Array(8).fill("")); // Initialize an empty 8x8 board
let selectedSquare = null;
let gameId = null;
let userId = null;
let pollingInterval = null; // Interval for polling

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
            if (board[row][col]) {
                square.innerHTML = `<span class="piece">${board[row][col]}</span>`;
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

// Make a move and send it to the backend
async function makeMove(from, to) {
    const updatedBoardState = cloneBoardAndMove(from, to); // Clone and update the board state

    const response = await fetch(`${API_URL}/chess/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            game_id: gameId,
            user_id: userId,
            move: `${from.join("")}${to.join("")}`, // Example: "e2e4"
            board_state: updatedBoardState, // Send the updated board state
        }),
    });

    const result = await response.json();

    if (response.ok) {
        board = updatedBoardState;
        initializeBoard(); // Re-render the board
        alert("Move made successfully!");
    } else {
        alert(`Error making move: ${result.message}`);
    }
}

// Fetch the latest board state from the backend
async function fetchBoardState() {
    try {
        const response = await fetch(`${API_URL}/chess/game/${gameId}`);
        if (!response.ok) throw new Error("Failed to fetch board state");

        const result = await response.json();
        console.log("Fetched board state:", result.board_state);

        board = result.board_state; // Update the global board state
        initializeBoard(); // Re-render the board
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
    }, 1000); // Poll every 2 seconds
}


// Set up event listeners and game flow
function setupGame() {
    document.getElementById("create-game").addEventListener("click", async () => {
        const response = await fetch(`${API_URL}/chess/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
        });

        const result = await response.json();

        if (response.ok) {
            gameId = result.game_id;
            board = result.board_state;
            initializeBoard(); // Render the board
            document.getElementById("chessboard").style.display = "grid"; // Show the chessboard
            alert(`Game created! Share this Game ID: ${gameId}`);
            startPolling(); // Start polling for updates
        } else {
            alert(`Error creating game: ${result.message}`);
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
            console.log("Joined game successfully. Game ID:", gameInput);

            gameId = gameInput;
            board = result.board_state; // Update the board with the state from the backend
            console.log("Board state after joining:", board);

            initializeBoard(); // Render the board
            document.getElementById("chessboard").style.display = "grid"; // Show the chessboard
            startPolling(); // Start polling for updates
        } catch (error) {
            alert(`Error joining game: ${error.message}`);
        }
    });


}

// Initialize the app
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

    setupGame(); // Set up game flow
});
