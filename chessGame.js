const chessBoard = document.getElementById('chessboard');
let move = 0;

const MOVE_DIRECTIONS = {
    rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
    queen: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
    king: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
    knight: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
};

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
        if (moves.length === 0) {
            let dRow = (piece_type[0] === 'w' ? -1 : +1);
            checkPiece(piece_type, +pieceCoords[0] + dRow, +pieceCoords[1] - 1, null, null, null, true);
            checkPiece(piece_type, +pieceCoords[0] + dRow, +pieceCoords[1] + 1, null, null, null, true);
            return;
        }

        let pieceRow = moves[0][0] + (piece_type[0] === 'w' ? +1 : -1);
        checkPiece(piece_type, moves[0][0], moves[0][1] - 1, null, null, null, true);
        checkPiece(piece_type, moves[0][0], moves[0][1] + 1, null, null, null, true);

        if (pieces[moves[0][0]][moves[0][1]] === '') {
            moves.forEach(move => {
                if (isMoveLegal(pieceRow, moves[0][1], moves[0][0], moves[0][1])) {
                    addHint(move[0], move[1], 'move');
                }
            });
        }
        return;
    }

    moves.forEach(move => {
        if (!checkPiece(piece_type, move[0], move[1], null, null, null, true)) {
            addHint(move[0], move[1], 'move');
        }
    });
}

const isValidMove = (row, col) => row >= 0 && row <= 7 && col >= 0 && col <= 7;

const pushMove = (moves, pieceRow, pieceCol, row, col) => {
    if (isMoveLegal(pieceRow, pieceCol, row, col)) moves.push([row, col]);
};

const traverseMoves = (pieceRow, pieceCol, deltas, pieceType, moves) => {
    deltas.forEach(([dx, dy]) => {
        for (let step = 1; step < 8; step++) {
            const newRow = +pieceRow + dx * step;
            const newCol = +pieceCol + dy * step;
            if (!isValidMove(newRow, newCol) || checkPiece(pieceType, newRow, newCol, pieceRow, pieceCol, moves)) break;
            pushMove(moves, pieceRow, pieceCol, newRow, newCol);
        }
    });
};

const handlePawnMoves = (pieceType, pieceRow, pieceCol, moves) => {
    const direction = pieceType[0] === 'w' ? -1 : 1;
    if (!checkPiece(pieceType, +pieceRow + direction, pieceCol)) {
        pushMove(moves, pieceRow, pieceCol, +pieceRow + direction, pieceCol);
    }
    if (checkPiece(pieceType, +pieceRow + direction, +pieceCol - 1, null, null, null, true)) {
        pushMove(moves, pieceRow, pieceCol, +pieceRow + direction, +pieceCol - 1);
    }
    if (checkPiece(pieceType, +pieceRow + direction, +pieceCol + 1, null, null, null, true)) {
        pushMove(moves, pieceRow, pieceCol, +pieceRow + direction, +pieceCol + 1);
    }
    if ((pieceType[0] === 'w' && pieceRow == 6) || (pieceType[0] === 'b' && pieceRow == 1)) {
        if (!checkPiece(pieceType, +pieceRow + 2 * direction, pieceCol)) {
            pushMove(moves, pieceRow, pieceCol, +pieceRow + 2 * direction, pieceCol);
        }
    }
};

const handleKingOrKnightMoves = (pieceRow, pieceCol, deltas, pieceType, moves) => {
    deltas.forEach(([dx, dy]) => {
        const newRow = +pieceRow + dx;
        const newCol = +pieceCol + dy;
        if (isValidMove(newRow, newCol) && !checkPiece(pieceType, newRow, newCol, pieceRow, pieceCol, moves)) {
            pushMove(moves, pieceRow, pieceCol, newRow, newCol);
        }
    });
};

function getAvailableMoves(pieceType, pieceRow, pieceCol) {
    document.querySelectorAll('.hint').forEach(hint => hint.remove());
    const moves = [];

    switch (pieceType) {
        case 'wp':
        case 'bp':
            handlePawnMoves(pieceType, pieceRow, pieceCol, moves);
            break;
        case 'wr':
        case 'br':
            traverseMoves(pieceRow, pieceCol, MOVE_DIRECTIONS.rook, pieceType, moves);
            break;
        case 'wb':
        case 'bb':
            traverseMoves(pieceRow, pieceCol, MOVE_DIRECTIONS.bishop, pieceType, moves);
            break;
        case 'wq':
        case 'bq':
            traverseMoves(pieceRow, pieceCol, MOVE_DIRECTIONS.queen, pieceType, moves);
            break;
        case 'wk':
        case 'bk':
            handleKingOrKnightMoves(pieceRow, pieceCol, MOVE_DIRECTIONS.king, pieceType, moves);
            break;
        case 'wn':
        case 'bn':
            handleKingOrKnightMoves(pieceRow, pieceCol, MOVE_DIRECTIONS.knight, pieceType, moves);
            break;
    }

    return [moves, [pieceRow, pieceCol]];
}

function isSquareUnderAttack(row, col, attackerColor, boardSituation) {
    const pieceSquares = { rook: [], bishop: [], king: [] };

    const isPiece = (row, col) => boardSituation[row]?.[col] !== '' && boardSituation[row]?.[col] !== undefined;

    const traverse = (deltas, pieceType) => {
        deltas.forEach(([dx, dy]) => {
            for (let step = 1; step < 8; step++) {
                const newRow = +row + dx * step;
                const newCol = +col + dy * step;
                if (isValidMove(newRow, newCol) && isPiece(newRow, newCol)) {
                    pieceSquares[pieceType].push([newRow, newCol]);
                    break;
                }
            }
        });
    };

    traverse(MOVE_DIRECTIONS.rook, 'rook');
    traverse(MOVE_DIRECTIONS.bishop, 'bishop');

    const isAttackedByPiece = (pieceCoords, validPieces) => pieceCoords.some(([r, c]) => {
        const piece = boardSituation[r][c];
        return piece[0] === attackerColor && validPieces.includes(piece[1]);
    });

    if (isAttackedByPiece(pieceSquares.rook, ['r', 'q']) || isAttackedByPiece(pieceSquares.bishop, ['b', 'q'])) {
        return true;
    }

    const pawnAttack = (attackerColor === 'w')
        ? [[+row + 1, +col + 1], [+row + 1, +col - 1]]
        : [[+row - 1, +col + 1], [+row - 1, +col - 1]];

    if (pawnAttack.some(([r, c]) => boardSituation[r]?.[c] === `${attackerColor}p`)) {
        return true;
    }

    if (MOVE_DIRECTIONS.king.some(([dx, dy]) => {
        const newRow = +row + dx;
        const newCol = +col + dy;
        return isValidMove(newRow, newCol) && boardSituation[newRow]?.[newCol] === `${attackerColor}k`;
    })) {
        return true;
    }

    return MOVE_DIRECTIONS.knight.some(([dx, dy]) => {
        const newRow = +row + dx;
        const newCol = +col + dy;
        return isValidMove(newRow, newCol) && boardSituation[newRow]?.[newCol] === `${attackerColor}n`;
    });
}


function checkPiece(current_piece_type, row, col, pieceRow = null, pieceCol = null, moves = null, checkTook = false) {
    if (col > 7 || col < 0 || row > 7 || row < 0)
        return true;

    const aimed_piece_type = pieces[row]?.[col] ?? '';

    if (aimed_piece_type === '')
        return checkTook ? false : false; // Порожня клітинка

    if (aimed_piece_type[0] === current_piece_type[0])
        return true; // Фігура того ж кольору

    if (checkTook) {
        addHint(row, col, 'took');
        return true;
    }

    if (moves !== null && pieceRow !== null && pieceCol !== null && isMoveLegal(pieceRow, pieceCol, row, col)) {
        moves.push([row, col]);
    }

    return true;
}



function isMoveLegal(piece_row, piece_col, move_row, move_col) {
    piecesCopy = structuredClone(pieces);
    piecesCopy[move_row][move_col] = piecesCopy[piece_row][piece_col];
    piecesCopy[piece_row][piece_col] = '';
    return !isPotentialCheck();

}


function addHint(piece_row, piece_col, type) {
    const hint = document.createElement('div');

    // Визначаємо клас в залежності від типу підказки
    hint.className = `hint ${type}-hint square-${piece_row}${piece_col}`;

    // Додаємо обробник події в залежності від типу
    if (type === 'move') {
        hint.addEventListener('click', movePiece);
    } else if (type === 'took') {
        hint.addEventListener('click', tookPiece);
    }

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
