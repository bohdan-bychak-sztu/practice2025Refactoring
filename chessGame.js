const chessBoard = document.getElementById('chessboard');
let move = 0;

function pieceClick(event) {
    const pieceColor = event.target.classList[1][0];

    deleteHintsAndHighLights();
    if (pieceColor === (move % 2 === 0 ? 'b' : 'w')) {
        return;
    }
    event.target.classList.add('selected');
    const square = event.target.classList.item(2);
    highlightSquare(square);
    const moves = getAvailableMoves(event.target.classList[1], square[square.length - 2], square[square.length - 1]);
    addHints(event.target.classList[1], moves[0], moves[1]);

}

function addHints(piece_type, moves, pieceCoords) {
    if (piece_type[1] === 'p') {
        /*moves.forEach(move => {
            if (!isTook(piece_type, move[0], move[1]))
                addHint(move[0], move[1]);
        })*/
        if (moves.length === 0){
            let dRow = (piece_type[0] === 'w' ? -1 : +1);
            if (isMoveLegal(pieceCoords[0], +pieceCoords[1], +pieceCoords[0] + dRow, +pieceCoords[0] - 1))
                isTook(piece_type, +pieceCoords[0] + dRow, +pieceCoords[1] - 1);
            if (isMoveLegal(pieceCoords[0], +pieceCoords[1], +pieceCoords[0] + dRow, +pieceCoords[0] + 1))
                isTook(piece_type, +pieceCoords[0] + dRow, +pieceCoords[1] + 1);
            return;
        }

        let pieceRow = moves[0][0] + (piece_type[0] === 'w' ? +1 : -1);
        if (isMoveLegal(pieceRow, moves[0][1], moves[0][0], moves[0][1] - 1))
            isTook(piece_type, moves[0][0], moves[0][1] - 1);
        if (isMoveLegal(pieceRow, moves[0][1], moves[0][0], +moves[0][1] + 1))
            isTook(piece_type, moves[0][0], +moves[0][1] + 1);
        if (pieces[moves[0][0]][moves[0][1]] === '')
            moves.forEach(move => {
                if (isMoveLegal(pieceRow, moves[0][1], moves[0][0], moves[0][1]))
                addHint(move[0], move[1]);
            })
        return;
    }
    moves.forEach(move => {
        if (!isTook(piece_type, move[0], move[1]))
            addHint(move[0], move[1]);
    })
}

function getAvailableMoves(pieceType, pieceRow, pieceCol) {
    document.querySelectorAll('.hint').forEach(hint => hint.remove());

    const moves = [];
    const directions = {
        rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
        bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        queen: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        king: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
        knight: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
    };

    const pushMove = (row, col) => {
        if (isMoveLegal(pieceRow, pieceCol, row, col))
            moves.push([row, col]);
    }

    const isValidMove = (row, col) => row >= 0 && row <= 7 && col >= 0 && col <= 7;

    const traverse = (deltas) => {
        deltas.forEach(([dx, dy]) => {
            for (let step = 1; step < 8; step++) {
                const newRow = +pieceRow + dx * step;
                const newCol = +pieceCol + dy * step;
                if (!isValidMove(newRow, newCol) || isPieceOld(pieces[newRow][newCol], pieceType, newRow, newCol, moves, pieceRow, pieceCol)) break;
                pushMove(newRow, newCol);
            }
        });
    };

    switch (pieceType) {
        case 'wp':
            if (!isPiece(pieceType, +pieceRow - 1, pieceCol))
                pushMove(+pieceRow - 1, pieceCol);
            if (isTook(pieceType, +pieceRow - 1, +pieceCol - 1))
                pushMove(+pieceRow - 1, +pieceCol - 1);
            if (isTook(pieceType, +pieceRow - 1, +pieceCol + 1))
                pushMove(+pieceRow - 1, +pieceCol + 1);
            if (pieceRow == 6 && !isPiece(pieceType, +pieceRow - 2, pieceCol)) pushMove(+pieceRow - 2, pieceCol);

            break;
        case 'bp':
            if (!isPiece(pieceType, +pieceRow + 1, pieceCol))
                pushMove(+pieceRow + 1, pieceCol);
            if (isTook(pieceType, +pieceRow + 1, +pieceCol - 1))
                pushMove(+pieceRow + 1, +pieceCol - 1);
            if (isTook(pieceType, +pieceRow + 1, +pieceCol + 1))
                pushMove(+pieceRow + 1, +pieceCol + 1);
            if (pieceRow == 1 && !isPiece(pieceType, +pieceRow + 2, pieceCol)) pushMove(+pieceRow + 2, pieceCol);

            break;
        case 'wr':
        case 'br':
            traverse(directions.rook);
            break;
        case 'wb':
        case 'bb':
            traverse(directions.bishop);
            break;
        case 'wq':
        case 'bq':
            traverse(directions.queen);
            break;
        case 'wk':
        case 'bk':
            directions.king.forEach(([dx, dy]) => {
                const newRow = +pieceRow + dx;
                const newCol = +pieceCol + dy;
                if (isValidMove(newRow, newCol) && !isPieceOld(pieces[newRow][newCol], pieceType, newRow, newCol, moves, pieceRow, pieceCol)) {
                    pushMove(newRow, newCol);
                }
            });
            break;
        case 'wn':
        case 'bn':
            directions.knight.forEach(([dx, dy]) => {
                const newRow = +pieceRow + dx;
                const newCol = +pieceCol + dy;
                if (isValidMove(newRow, newCol) && !isPieceOld(pieces[newRow][newCol], pieceType, newRow, newCol, moves, pieceRow, pieceCol)) {
                    pushMove(newRow, newCol);
                }
            });
            break;
    }

    return [moves, [pieceRow, pieceCol]];
}

function isSquareUnderAttack(row, col, attackerColor, boardSituation) {
    const rookSquares = [];
    const bishopSquares = [];
    const kingSquares = [];
    const directions = {
        rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
        bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        queen: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        king: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
        knight: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
    };

    const isValidMove = (row, col) => row >= 0 && row <= 7 && col >= 0 && col <= 7;

    function isPiece(row, col) {
        return !((boardSituation[row][col] === '') || (boardSituation[row][col] === undefined));
    }

    const traverse = (deltas, piece) => {
        deltas.forEach(([dx, dy]) => {
            for (let step = 1; step < 8; step++) {
                const newRow = +row + dx * step;
                const newCol = +col + dy * step;
                if (isValidMove(newRow, newCol) && isPiece(newRow, newCol)) {
                    if (piece === 'rook')
                        rookSquares.push([newRow, newCol]);
                    else if (piece === 'bishop')
                        bishopSquares.push([newRow, newCol]);
                    else if (piece === 'king')
                        kingSquares.push([newRow, newCol]);
                    break;
                }
            }
        });
    };
    traverse(directions.rook, 'rook');
    traverse(directions.bishop, 'bishop');
    let isTrue = rookSquares.some(pieceCoord => {
        const piece = boardSituation[pieceCoord[0]][pieceCoord[1]];
        return piece[0] === attackerColor && ['r', 'q'].includes(piece[1]);
    });
    if (isTrue) return true;
    isTrue = bishopSquares.some(pieceCoord => {
        const piece = boardSituation[pieceCoord[0]][pieceCoord[1]];
        return piece[0] === attackerColor && ['b', 'q'].includes(piece[1]);
    });
    if (isTrue) return true;
    if (attackerColor === 'w') {
        if (boardSituation[+row + 1][+col + 1] === 'wp' || boardSituation[+row + 1][+col - 1] === 'wp')
            return true;
    }
    if (attackerColor === 'b') {
        if (boardSituation[+row - 1][+col + 1] === 'bp' || boardSituation[+row - 1][+col - 1] === 'bp')
            return true;
    }
    isTrue = directions.king.some(([dx, dy]) => {
        const newRow = +row + dx;
        const newCol = +col + dy;
        return isValidMove(newRow, newCol) && (boardSituation[newRow][newCol] === (attackerColor + 'k'));
    });
    if (isTrue) return true;

    return directions.knight.some(([dx, dy]) => {
        const newRow = +row + dx;
        const newCol = +col + dy;
        return isValidMove(newRow, newCol) && (boardSituation[newRow][newCol] === (attackerColor + 'n'));
    });

    return false;
}


function isPieceOld(aimed_piece_type, current_piece_type, row, col, moves, pieceRow, pieceCol) {
    if (col > 7 || col < 0 || row > 7 || row < 0)
        return true;
    if (aimed_piece_type === '' || aimed_piece_type === undefined)
        return false;
    if (aimed_piece_type[0] === current_piece_type[0]) {
        return true;
    }
    if (isMoveLegal(pieceRow, pieceCol, row, col))
        moves.push([row, col]);
    return true;
}

function isPiece(current_piece_type, row, col, pieceRow, pieceCol) {
    if (col > 7 || col < 0 || row > 7 || row < 0)
        return true;
    const aimed_piece_type = pieces[row][col];
    if (aimed_piece_type === '' || aimed_piece_type === undefined)
        return false;
    if (aimed_piece_type[0] === current_piece_type[0]) {
        return true;
    }
    return true;
}

function isTook(current_piece_type, row, col) {

    if ((pieces[row][col] ?? '') === '')
        return false;
    if (pieces[row][col][0] === current_piece_type[0])
        return false;
    addTookHint(row, col);
    return true;
}

function isPawnTook(current_piece_type, row, col) {
    if (pieces[row][col] === '')
        return false;
    if (pieces[row][col][0] === current_piece_type[0])
        return false;
    addTookHint(row, col);
    return true;
}

function addHint(piece_row, piece_col) {

    const hint = document.createElement('div');
    hint.className = `hint move-hint square-${piece_row}${piece_col}`;
    hint.addEventListener('click', movePiece);
    chessBoard.appendChild(hint);
}

function isMoveLegal(piece_row, piece_col, move_row, move_col) {
    piecesCopy = structuredClone(pieces);
    piecesCopy[move_row][move_col] = piecesCopy[piece_row][piece_col];
    piecesCopy[piece_row][piece_col] = '';
    return !isPotentialCheck();

}

function addTookHint(piece_row, piece_col) {
    const hint = document.createElement('div');
    hint.className = `hint took-hint square-${piece_row}${piece_col}`;
    hint.addEventListener('click', tookPiece);
    chessBoard.appendChild(hint);
}

function movePiece(event) {
    const piece = document.querySelector('.selected');
    pieces[piece.classList[2][7]][piece.classList[2][8]] = '';
    pieces[event.target.classList[2][7]][event.target.classList[2][8]] = piece.classList[1];
    piece.classList.remove('selected');
    piece.classList.remove(piece.classList[2])
    piece.classList.add(event.target.classList[2]);
    deleteHintsAndHighLights();

    move++;
    if (isCheck()) {
        console.log('CHECK!!')
        setCheckMate();
    }
}

function tookPiece(event) {
    removePiece(document.querySelector('.' + event.target.classList[2]));
    movePiece(event);
    deleteHintsAndHighLights();
}

function deleteHintsAndHighLights() {
    document.querySelector('.selected')?.classList.remove('selected');
    document.getElementById('highlight-square')?.remove();
    document.querySelectorAll('.hint').forEach(hint => {
        hint.remove();
    })
}

function isCheck() {
    const kingColor = move % 2 === 0 ? 'wk' : 'bk';
    const king = document.querySelector(`.${kingColor}`);
    return isSquareUnderAttack(king.classList[2][7], king.classList[2][8], move % 2 === 0 ? 'b' : 'w', pieces)
}

function isPotentialCheck() {
    const kingColor = move % 2 === 0 ? 'wk' : 'bk';
    let coords = findElementCoordinates(piecesCopy, kingColor);
    return isSquareUnderAttack(coords['row'], coords['col'], move % 2 === 0 ? 'b' : 'w', piecesCopy);
}

function findElementCoordinates(array, target) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (array[i][j] === target) {
                return {row: i, col: j};
            }
        }
    }
    return null;
}

function removePiece(piece) {
    console.log('Piece tooked: ');
    console.log(piece);
    piece.remove();
}

function highlightSquare(square) {
    let highlight = document.getElementById('highlight-square');
    if (highlight) {
        highlight.className = `piece ${square}`;
        return
    }
    const squareBlock = document.createElement('div');
    squareBlock.className = `piece ${square}`;
    squareBlock.id = 'highlight-square';
    document.getElementById('chessboard').appendChild(squareBlock);
}

function setCheckMate() {
    let moveColor = move % 2 === 0 ? 'w' : 'b';
    let allPieces = Array.from(document.querySelectorAll('.piece')); // Перетворюємо NodeList на масив
    allPieces = allPieces.filter(piece => {
        const secondClass = piece.classList[1]; // Доступ до другого класу
        return secondClass && secondClass[0] === moveColor; // Перевірка існування і кольору
    });
    let isCheck = allPieces.every((piece) => {
        const square = piece.classList.item(2);
        const moves = getAvailableMoves(piece.classList[1], square[square.length - 2], square[square.length - 1])[0];
        console.log(moves)
        return moves.length === 0;
    });
    console.log(isCheck)
    if (!isCheck)
        return;
    deleteHintsAndHighLights();
    console.log(('Перемогли' + (moveColor === 'w' ? 'ЧОРНІ!!' : 'БІЛІ!!')));
}

function placePiece(chessboard, square, pieceType) {
    const piece = document.createElement('div');
    piece.className = `piece ${pieceType} square-${square}`;
    piece.addEventListener('click', pieceClick)
    chessboard.appendChild(piece);
}


let squares = [
    [], [], [], [], [], [], [], []
];

let pieces = [
    ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
]
let piecesCopy = structuredClone(pieces);

for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        if (pieces[i][j] !== '')
            placePiece(chessBoard, `${i}${j}`, pieces[i][j])
    }
}
