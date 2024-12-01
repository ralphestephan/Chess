const gameBoard = document.querySelector('#gameboard');
const playerDisplay = document.querySelector('#player');
const infoDisplay = document.querySelector('#info-display');

const width = 8;


let playerGo = 'white';
// The position on the board the piece starts from
let startPositionId = -1;
let draggedElement;

let taken, takenByOpponent;
let targetId, startId, idInterval;
let startRow, startCol, targetRow, targetCol;
let rowInterval, colInterval;


const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

let allSquares;


function init() {
    playerDisplay.textContent = playerGo;

    createBoard();

    allSquares = document.querySelectorAll('.square');
    allSquares.forEach(square => {
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragover', dragOver);
        square.addEventListener('drop', dragDrop);
    });

}


function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');

        square.classList.add('square');
        square.setAttribute('square-id', i);
        square.innerHTML = startPiece;
        square.firstChild?.setAttribute('draggable', 'true');

        const row = Math.floor(i / 8);

        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? 'white-square' : 'black-square');
        } else {
            square.classList.add(i % 2 === 0 ? 'black-square' : 'white-square');
        }

        let pieceColor = '';
        if (i <= 15) {
            square.firstChild.firstChild.classList.add('white-piece');
            pieceColor = 'white';
        } else if (i >= 48) {
            square.firstChild.firstChild.classList.add('black-piece');
            pieceColor = 'black';
        }

        const pieceType = startPiece.trim();
        console.log(`square ${i} ${pieceColor} ${pieceType}`);

        gameBoard.append(square);
    });
}


function dragStart(e) {
    draggedElement = e.target;
    startPositionId = draggedElement.parentNode.getAttribute('square-id');

}

function dragOver(e) {
    //
    e.preventDefault();
}


let timerStarted = false;

function dragDrop(e) {
    e.stopPropagation();

    correctGo = draggedElement.firstChild.classList.contains(playerGo + '-piece');
    opponentGo = playerGo === 'black' ? 'white' : 'black';
    taken = e.target.classList.contains('piece');
    takenByOpponent = e.target.firstChild?.classList.contains(opponentGo + '-piece');

    if (correctGo) {
        if (isValidMove(e.target)) {
            notifyPlayer('', false);
            if (!timerStarted) {
                startTimer();
                timerStarted = true;
            }
            if (!taken) {
                e.target.append(draggedElement);
                if (!checkWin()) changePlayer();
            } else if (takenByOpponent) {
                document.getElementById(`${playerGo}-captures`).innerHTML += `<div class="captured-piece">${e.target.innerHTML}</div>`;
                e.target.parentNode.append(draggedElement);
                e.target.remove();
                if (!checkWin()) changePlayer();
            } else notifyPlayer('You can not go there!');

            // Check for pawn promotion
            const squareId = parseInt(e.target.getAttribute('square-id'));
            const isPawn = draggedElement.firstChild.classList.contains('pawn');
            const isPromotionRow = (playerGo === 'white' && squareId >= 56) || (playerGo === 'black' && squareId <= 7);
            console.log(`isPawn: ${isPawn}, isPromotionRow: ${isPromotionRow}, squareId: ${squareId}`);

            if (isPawn && isPromotionRow) {
                promotePawn(e.target, playerGo);
            }
        } else notifyPlayer('You can not go there!');
    }
}

let whiteTime = 300; // 5 minutes in seconds
let blackTime = 300; // 5 minutes in seconds
let timerInterval;

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (playerGo === 'white') {
            whiteTime--;
            updateTimerDisplay('white', whiteTime);
            if (whiteTime <= 0) {
                clearInterval(timerInterval);
                alert('Black wins on time!');
            }
        } else {
            blackTime--;
            updateTimerDisplay('black', blackTime);
            if (blackTime <= 0) {
                clearInterval(timerInterval);
                alert('White wins on time!');
            }
        }
    }, 1000);
}

function updateTimerDisplay(player, time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById(`${player}-timer`).textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}


function notifyPlayer(message, useTimer = true) {
    infoDisplay.textContent = message;
    if (useTimer) setTimeout(() => { infoDisplay.textContent = '' }, 2000);
}


function changePlayer() {
    playerGo = playerGo === 'black' ? 'white' : 'black';
    playerDisplay.textContent = playerGo;
    startTimer();
}


const validMoves = {
    'pawn': () => {
        let direction = 1;
        // Flip the rows depending on who's playing. 
        if (playerGo === 'black') {
            startRow = width - 1 - startRow;
            targetRow = width - 1 - targetRow;
            direction = -1;
        }
        // Check if the pawn's movement is blocked by any piece
        const blockedByPiece = Boolean(document.querySelector(`[square-id="${startId + direction * width}"]`).firstChild);

        return targetRow > startRow && ((!taken && !blockedByPiece && startRow === 1 && idInterval === 2 * width) || (!taken && idInterval === width) || (takenByOpponent && (idInterval === width - 1 || idInterval === width + 1)));
    },
    'rook': () => {
        // Successful vertical movement or horizontal movement
        if ((rowInterval !== 0 && colInterval === 0) || (rowInterval === 0 && colInterval !== 0)) {
            // Check if the rook's movement is blocked by any piece
            for (let i = Math.abs(rowInterval ? rowInterval : colInterval) - 1; i > 0; --i) {
                const id = rowInterval ? startId + Math.sign(rowInterval) * i * width : startId + Math.sign(colInterval) * i;
                if (Boolean(document.querySelector(`[square-id="${id}"]`).firstChild)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },
    'bishop': () => {
        // Successful diagonal movement
        if (Math.abs(rowInterval) === Math.abs(colInterval) && rowInterval !== 0) {
            // Check if the bishop's movement is blocked by any piece
            for (let i = Math.abs(rowInterval) - 1; i > 0; --i) {
                if (Boolean(document.querySelector(`[square-id="${startId + Math.sign(rowInterval) * i * width + Math.sign(colInterval) * i
                    }"]`).firstChild)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },
    'knight': () => {
        // Two steps up or down, one step right or left - Two steps right or left, one step up or down
        return (Math.abs(rowInterval) === 2 && Math.abs(colInterval) === 1) || (Math.abs(colInterval) === 2 && Math.abs(rowInterval) === 1);
    },
    'queen': () => {
        // A queen is simply just a rook and a bishop at the same time
        // return this.rook() || this.bishop();
        return (validMoves['rook']() || validMoves['bishop']());
    },
    'king': () => {
        // King moves one step anywhere
        return (idInterval === width || idInterval === width - 1 || idInterval === width + 1 || idInterval === 1);
    }
}


function isValidMove(target) {
    targetId = Number(target.getAttribute('square-id') || target.parentNode.getAttribute('square-id'));
    startId = Number(startPositionId);
    idInterval = Math.abs(targetId - startId);

    startRow = Math.floor(startId / width);
    startCol = startId % width;
    targetRow = Math.floor(targetId / width);
    targetCol = targetId % width;

    rowInterval = targetRow - startRow;
    colInterval = targetCol - startCol;

    return validMoves[draggedElement.id]();
}


function promotePawn(square, pieceColor) {
    const promotionChoices = ['queen', 'rook', 'bishop', 'knight'];
    const promotionContainer = document.createElement('div');
    promotionContainer.classList.add('promotion-container');

    promotionChoices.forEach(choice => {
        const choiceElement = document.createElement('div');
        choiceElement.classList.add('promotion-choice');
        choiceElement.textContent = choice;
        choiceElement.addEventListener('click', () => {
            square.innerHTML = `<div class="${pieceColor}-piece ${choice}"></div>`;
            document.body.removeChild(promotionContainer);
        });
        promotionContainer.appendChild(choiceElement);
    });

    // Position the promotion container near the board
    promotionContainer.style.position = 'absolute';
    promotionContainer.style.top = '50%';
    promotionContainer.style.left = '50%';
    promotionContainer.style.transform = 'translate(-50%, -50%)';
    promotionContainer.style.backgroundColor = 'white';
    promotionContainer.style.border = '1px solid black';
    promotionContainer.style.padding = '10px';
    promotionContainer.style.zIndex = '1000';

    document.body.appendChild(promotionContainer);
}

function checkWin() {
    const kings = document.querySelectorAll('#gameboard #king');

    if (kings.length < 2) {
        notifyPlayer(`${playerGo} player wins`, false);
        playerDisplay.parentElement.textContent = '';
        playerGo = '';
        document.querySelectorAll('.piece').forEach(piece => {
            piece.setAttribute('draggable', false);
        });

        return true;
    }

    return false;
}


init();