// engine.js - Шахматный движок Chesszerd
window.ChessEngine = (function() {
    'use strict';
    
    // Константы доски - жёстко заданная стартовая позиция
    const INITIAL_BOARD = [
        '♜','♞','♝','♛','♚','♝','♞','♜',
        '♟','♟','♟','♟','♟','♟','♟','♟',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '♙','♙','♙','♙','♙','♙','♙','♙',
        '♖','♘','♗','♕','♔','♗','♘','♖'
    ];
    
    const INITIAL_COLORS = [
        1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0
    ];
    
    // Значения фигур
    const PIECE_VALUES = {
        '♔': 20000, '♕': 900, '♖': 500, '♗': 330, '♘': 320, '♙': 100,
        '♚': 20000, '♛': 900, '♜': 500, '♝': 330, '♞': 320, '♟': 100
    };
    
    // Таблицы позиционных весов
    const PAWN_TABLE = [
        0,0,0,0,0,0,0,0,
        50,50,50,50,50,50,50,50,
        10,10,20,30,30,20,10,10,
        5,5,10,25,25,10,5,5,
        0,0,0,20,20,0,0,0,
        5,-5,-10,0,0,-10,-5,5,
        5,10,10,-20,-20,10,10,5,
        0,0,0,0,0,0,0,0
    ];
    
    class ChessEngine {
        constructor() {
            this.board = [...INITIAL_BOARD];
            this.colors = [...INITIAL_COLORS];
            this.currentPlayer = 0; // 0 - белые, 1 - чёрные
            this.moveHistory = [];
            this.capturedPieces = [];
            this.kingMoved = [false, false];
            this.rookMoved = [false, false, false, false]; // a-rook, h-rook для белых и чёрных
            this.enPassantTarget = -1;
            this.fiftyMoveCounter = 0;
            this.positionHistory = {};
            this.gameOver = false;
            this.result = '';
        }
        
        reset() {
            this.board = [...INITIAL_BOARD];
            this.colors = [...INITIAL_COLORS];
            this.currentPlayer = 0;
            this.moveHistory = [];
            this.capturedPieces = [];
            this.kingMoved = [false, false];
            this.rookMoved = [false, false, false, false];
            this.enPassantTarget = -1;
            this.fiftyMoveCounter = 0;
            this.positionHistory = {};
            this.gameOver = false;
            this.result = '';
        }
        
        getPieceAt(index) {
            return this.board[index] || '';
        }
        
        getColorAt(index) {
            return this.colors[index] || 0;
        }
        
        isWhitePiece(piece) {
            return piece && '♔♕♖♗♘♙'.indexOf(piece) >= 0;
        }
        
        isBlackPiece(piece) {
            return piece && '♚♛♜♝♞♟'.indexOf(piece) >= 0;
        }
        
        getValidMoves(index) {
            const moves = [];
            const piece = this.board[index];
            if (!piece) return moves;
            
            const color = this.colors[index];
            if (color !== this.currentPlayer) return moves;
            
            const row = Math.floor(index / 8);
            const col = index % 8;
            
            switch(piece) {
                case '♙': // Белая пешка
                    if (row > 0 && this.board[index-8] === '') {
                        moves.push({from: index, to: index-8});
                        if (row === 6 && this.board[index-16] === '') {
                            moves.push({from: index, to: index-16});
                        }
                    }
                    if (row > 0 && col > 0 && this.colors[index-9] === 1) {
                        moves.push({from: index, to: index-9, capture: true});
                    }
                    if (row > 0 && col < 7 && this.colors[index-7] === 1) {
                        moves.push({from: index, to: index-7, capture: true});
                    }
                    if (this.enPassantTarget >= 0) {
                        const epRow = Math.floor(this.enPassantTarget / 8);
                        const epCol = this.enPassantTarget % 8;
                        if (row === 3 && Math.abs(col - epCol) === 1 && epRow === 2) {
                            moves.push({from: index, to: this.enPassantTarget, enPassant: true});
                        }
                    }
                    break;
                    
                case '♟': // Чёрная пешка
                    if (row < 7 && this.board[index+8] === '') {
                        moves.push({from: index, to: index+8});
                        if (row === 1 && this.board[index+16] === '') {
                            moves.push({from: index, to: index+16});
                        }
                    }
                    if (row < 7 && col > 0 && this.colors[index+7] === 0) {
                        moves.push({from: index, to: index+7, capture: true});
                    }
                    if (row < 7 && col < 7 && this.colors[index+9] === 0) {
                        moves.push({from: index, to: index+9, capture: true});
                    }
                    if (this.enPassantTarget >= 0) {
                        const epRow = Math.floor(this.enPassantTarget / 8);
                        const epCol = this.enPassantTarget % 8;
                        if (row === 4 && Math.abs(col - epCol) === 1 && epRow === 5) {
                            moves.push({from: index, to: this.enPassantTarget, enPassant: true});
                        }
                    }
                    break;
                    
                case '♘': case '♞': // Кони
                    const knightMoves = [-17, -15, -10, -6, 6, 10, 15, 17];
                    for (let offset of knightMoves) {
                        const target = index + offset;
                        if (target >= 0 && target < 64) {
                            const tRow = Math.floor(target / 8);
                            const tCol = target % 8;
                            if (Math.abs(tRow - row) <= 2 && Math.abs(tCol - col) <= 2) {
                                if (this.colors[target] !== color) {
                                    moves.push({from: index, to: target, capture: this.board[target] !== ''});
                                }
                            }
                        }
                    }
                    break;
                    
                case '♗': case '♝': // Слоны
                    for (let d of [-9, -7, 7, 9]) {
                        for (let i = 1; i < 8; i++) {
                            const target = index + d * i;
                            if (target < 0 || target >= 64) break;
                            const tRow = Math.floor(target / 8);
                            const tCol = target % 8;
                            if (Math.abs(tRow - row) !== i || Math.abs(tCol - col) !== i) break;
                            if (this.board[target] === '') {
                                moves.push({from: index, to: target});
                            } else {
                                if (this.colors[target] !== color) {
                                    moves.push({from: index, to: target, capture: true});
                                }
                                break;
                            }
                        }
                    }
                    break;
                    
                case '♖': case '♜': // Ладьи
                    for (let d of [-8, 8, -1, 1]) {
                        for (let i = 1; i < 8; i++) {
                            const target = index + d * i;
                            const tRow = Math.floor(target / 8);
                            const tCol = target % 8;
                            if (target < 0 || target >= 64) break;
                            if (d === -1 || d === 1) {
                                if (tRow !== row) break;
                            }
                            if (this.board[target] === '') {
                                moves.push({from: index, to: target});
                            } else {
                                if (this.colors[target] !== color) {
                                    moves.push({from: index, to: target, capture: true});
                                }
                                break;
                            }
                        }
                    }
                    break;
                    
                case '♕': case '♛': // Ферзи
                    for (let d of [-9, -7, 7, 9, -8, 8, -1, 1]) {
                        for (let i = 1; i < 8; i++) {
                            const target = index + d * i;
                            const tRow = Math.floor(target / 8);
                            const tCol = target % 8;
                            if (target < 0 || target >= 64) break;
                            if ([-1, 1].indexOf(d) >= 0 && tRow !== row) break;
                            if ([-9, -7, 7, 9].indexOf(d) >= 0) {
                                if (Math.abs(tRow - row) !== i || Math.abs(tCol - col) !== i) break;
                            }
                            if (this.board[target] === '') {
                                moves.push({from: index, to: target});
                            } else {
                                if (this.colors[target] !== color) {
                                    moves.push({from: index, to: target, capture: true});
                                }
                                break;
                            }
                        }
                    }
                    break;
                    
                case '♔': case '♚': // Короли
                    const kingMoves = [-9, -8, -7, -1, 1, 7, 8, 9];
                    for (let offset of kingMoves) {
                        const target = index + offset;
                        if (target >= 0 && target < 64) {
                            const tRow = Math.floor(target / 8);
                            const tCol = target % 8;
                            if (Math.abs(tRow - row) <= 1 && Math.abs(tCol - col) <= 1) {
                                if (this.colors[target] !== color) {
                                    moves.push({from: index, to: target, capture: this.board[target] !== ''});
                                }
                            }
                        }
                    }
                    // Рокировка
                    if (!this.kingMoved[color]) {
                        if (!this.rookMoved[color * 2] && this.board[index-3] === '' && this.board[index-2] === '' && this.board[index-1] === '') {
                            if (!this.isSquareAttacked(index-1, 1-color) && !this.isSquareAttacked(index-2, 1-color)) {
                                moves.push({from: index, to: index-2, castle: 'queenside'});
                            }
                        }
                        if (!this.rookMoved[color * 2 + 1] && this.board[index+1] === '' && this.board[index+2] === '') {
                            if (!this.isSquareAttacked(index+1, 1-color) && !this.isSquareAttacked(index+2, 1-color)) {
                                moves.push({from: index, to: index+2, castle: 'kingside'});
                            }
                        }
                    }
                    break;
            }
            
            return moves.filter(move => {
                this.makeTempMove(move);
                const inCheck = this.isInCheck(color);
                this.unmakeTempMove(move);
                return !inCheck;
            });
        }
        
        isSquareAttacked(index, attackerColor) {
            for (let i = 0; i < 64; i++) {
                if (this.colors[i] === attackerColor) {
                    const piece = this.board[i];
                    if (!piece) continue;
                    const moves = this.getRawMoves(i, piece);
                    if (moves.some(m => m.to === index)) return true;
                }
            }
            return false;
        }
        
        getRawMoves(index, piece) {
            const moves = [];
            const row = Math.floor(index / 8);
            const col = index % 8;
            
            if (!piece) return moves;
            
            switch(piece) {
                case '♙':
                    if (row > 0 && col > 0) moves.push({to: index-9});
                    if (row > 0 && col < 7) moves.push({to: index-7});
                    break;
                case '♟':
                    if (row < 7 && col > 0) moves.push({to: index+7});
                    if (row < 7 && col < 7) moves.push({to: index+9});
                    break;
                case '♘': case '♞':
                    const ks = [-17, -15, -10, -6, 6, 10, 15, 17];
                    for (let o of ks) {
                        const t = index + o;
                        if (t >= 0 && t < 64 && Math.abs(Math.floor(t/8)-row) <= 2) moves.push({to: t});
                    }
                    break;
                case '♗': case '♝':
                    for (let d of [-9, -7, 7, 9]) {
                        for (let i = 1; i < 8; i++) {
                            const t = index + d * i;
                            if (t < 0 || t >= 64) break;
                            const tr = Math.floor(t/8), tc = t%8;
                            if (Math.abs(tr-row) !== i || Math.abs(tc-col) !== i) break;
                            moves.push({to: t});
                            if (this.board[t] !== '') break;
                        }
                    }
                    break;
                case '♖': case '♜':
                    for (let d of [-8, 8, -1, 1]) {
                        for (let i = 1; i < 8; i++) {
                            const t = index + d * i;
                            if (t < 0 || t >= 64) break;
                            const tr = Math.floor(t/8);
                            if ((d === -1 || d === 1) && tr !== row) break;
                            moves.push({to: t});
                            if (this.board[t] !== '') break;
                        }
                    }
                    break;
                case '♕': case '♛':
                    for (let d of [-9, -7, 7, 9, -8, 8, -1, 1]) {
                        for (let i = 1; i < 8; i++) {
                            const t = index + d * i;
                            if (t < 0 || t >= 64) break;
                            const tr = Math.floor(t/8), tc = t%8;
                            if ([-1,1].indexOf(d) >= 0 && tr !== row) break;
                            if ([-9,-7,7,9].indexOf(d) >= 0 && (Math.abs(tr-row) !== i || Math.abs(tc-col) !== i)) break;
                            moves.push({to: t});
                            if (this.board[t] !== '') break;
                        }
                    }
                    break;
                case '♔': case '♚':
                    for (let o of [-9,-8,-7,-1,1,7,8,9]) {
                        const t = index + o;
                        if (t >= 0 && t < 64 && Math.abs(Math.floor(t/8)-row) <= 1) moves.push({to: t});
                    }
                    break;
            }
            return moves;
        }
        
        isInCheck(color) {
            let kingIndex = -1;
            const king = color === 0 ? '♔' : '♚';
            for (let i = 0; i < 64; i++) {
                if (this.board[i] === king) {
                    kingIndex = i;
                    break;
                }
            }
            if (kingIndex === -1) return true;
            return this.isSquareAttacked(kingIndex, 1 - color);
        }
        
        makeMove(move) {
            const piece = this.board[move.from];
            const capturedPiece = this.board[move.to];
            
            // Сохраняем состояние для отмены
            const state = {
                board: [...this.board],
                colors: [...this.colors],
                kingMoved: [...this.kingMoved],
                rookMoved: [...this.rookMoved],
                enPassantTarget: this.enPassantTarget,
                fiftyMoveCounter: this.fiftyMoveCounter,
                positionHistory: {...this.positionHistory},
                capturedPiece: capturedPiece,
                move: move
            };
            
            // Выполняем ход
            this.board[move.to] = piece;
            this.board[move.from] = '';
            this.colors[move.to] = this.colors[move.from];
            this.colors[move.from] = 0;
            
            // Рокировка
            if (move.castle) {
                if (move.castle === 'kingside') {
                    const rookFrom = move.from + 3;
                    const rookTo = move.from + 1;
                    this.board[rookTo] = this.board[rookFrom];
                    this.board[rookFrom] = '';
                    this.colors[rookTo] = this.colors[rookFrom];
                    this.colors[rookFrom] = 0;
                } else if (move.castle === 'queenside') {
                    const rookFrom = move.from - 4;
                    const rookTo = move.from - 1;
                    this.board[rookTo] = this.board[rookFrom];
                    this.board[rookFrom] = '';
                    this.colors[rookTo] = this.colors[rookFrom];
                    this.colors[rookFrom] = 0;
                }
            }
            
            // Взятие на проходе
            if (move.enPassant) {
                const capturedIndex = this.currentPlayer === 0 ? move.to + 8 : move.to - 8;
                state.capturedPiece = this.board[capturedIndex];
                this.board[capturedIndex] = '';
                this.colors[capturedIndex] = 0;
            }
            
            // Обновление счётчика 50 ходов
            if (piece === '♙' || piece === '♟' || capturedPiece) {
                this.fiftyMoveCounter = 0;
            } else {
                this.fiftyMoveCounter++;
            }
            
            // Обновление en passant
            this.enPassantTarget = -1;
            if ((piece === '♙' || piece === '♟') && Math.abs(move.to - move.from) === 16) {
                this.enPassantTarget = (move.from + move.to) / 2;
            }
            
            // Обновление флагов рокировки
            if (piece === '♔') this.kingMoved[0] = true;
            if (piece === '♚') this.kingMoved[1] = true;
            if (piece === '♖') {
                if (move.from === 56) this.rookMoved[0] = true;
                if (move.from === 63) this.rookMoved[1] = true;
            }
            if (piece === '♜') {
                if (move.from === 0) this.rookMoved[2] = true;
                if (move.from === 7) this.rookMoved[3] = true;
            }
            
            // Сохраняем позицию
            const fen = this.getFEN().split(' ')[0];
            this.positionHistory[fen] = (this.positionHistory[fen] || 0) + 1;
            
            // Переключение хода
            this.currentPlayer = 1 - this.currentPlayer;
            
            // Проверка на шах/мат/пат
            if (this.isCheckmate()) {
                this.gameOver = true;
                this.result = this.currentPlayer === 0 ? '1-0' : '0-1';
            } else if (this.isStalemate()) {
                this.gameOver = true;
                this.result = '1/2-1/2';
            }
            
            this.moveHistory.push(state);
            return true;
        }
        
        makeTempMove(move) {
            this.board[move.to] = this.board[move.from];
            this.board[move.from] = '';
            this.colors[move.to] = this.colors[move.from];
            this.colors[move.from] = 0;
        }
        
        unmakeTempMove(move) {
            this.board[move.from] = this.board[move.to];
            this.board[move.to] = this.tempCaptured || '';
            this.colors[move.from] = this.colors[move.to];
            this.colors[move.to] = 0;
        }
        
        undoMove() {
            if (this.moveHistory.length === 0) return false;
            
            const state = this.moveHistory.pop();
            this.board = state.board;
            this.colors = state.colors;
            this.kingMoved = state.kingMoved;
            this.rookMoved = state.rookMoved;
            this.enPassantTarget = state.enPassantTarget;
            this.fiftyMoveCounter = state.fiftyMoveCounter;
            this.positionHistory = state.positionHistory;
            this.currentPlayer = 1 - this.currentPlayer;
            this.gameOver = false;
            this.result = '';
            
            return true;
        }
        
        isCheckmate() {
            if (!this.isInCheck(this.currentPlayer)) return false;
            return this.getAllValidMoves().length === 0;
        }
        
        isStalemate() {
            if (this.isInCheck(this.currentPlayer)) return false;
            return this.getAllValidMoves().length === 0;
        }
        
        getAllValidMoves() {
            const moves = [];
            for (let i = 0; i < 64; i++) {
                if (this.colors[i] === this.currentPlayer && this.board[i]) {
                    moves.push(...this.getValidMoves(i));
                }
            }
            return moves;
        }
        
        evaluate() {
            let score = 0;
            
            // Материальная оценка
            for (let i = 0; i < 64; i++) {
                const piece = this.board[i];
                if (!piece) continue;
                let value = PIECE_VALUES[piece] || 0;
                
                // Позиционные бонусы для пешек
                if (piece === '♙') value += PAWN_TABLE[i];
                if (piece === '♟') value -= PAWN_TABLE[63 - i];
                
                score += this.colors[i] === 1 ? -value : value;
            }
            
            return score;
        }
        
        alphaBeta(depth, alpha, beta, isMaximizing) {
            if (depth === 0) {
                return this.evaluate();
            }
            
            const moves = this.getAllValidMoves();
            
            if (moves.length === 0) {
                if (this.isInCheck(this.currentPlayer)) {
                    return isMaximizing ? -99999 : 99999;
                }
                return 0;
            }
            
            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let move of moves) {
                    const state = this.makeAndSaveState(move);
                    const evalScore = this.alphaBeta(depth - 1, alpha, beta, false);
                    this.restoreState(state);
                    maxEval = Math.max(maxEval, evalScore);
                    alpha = Math.max(alpha, evalScore);
                    if (beta <= alpha) break;
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (let move of moves) {
                    const state = this.makeAndSaveState(move);
                    const evalScore = this.alphaBeta(depth - 1, alpha, beta, true);
                    this.restoreState(state);
                    minEval = Math.min(minEval, evalScore);
                    beta = Math.min(beta, evalScore);
                    if (beta <= alpha) break;
                }
                return minEval;
            }
        }
        
        makeAndSaveState(move) {
            const state = {
                board: [...this.board],
                colors: [...this.colors],
                currentPlayer: this.currentPlayer,
                kingMoved: [...this.kingMoved],
                rookMoved: [...this.rookMoved],
                enPassantTarget: this.enPassantTarget,
                fiftyMoveCounter: this.fiftyMoveCounter,
                positionHistory: {...this.positionHistory}
            };
            
            this.makeSimpleMove(move);
            return state;
        }
        
        makeSimpleMove(move) {
            this.board[move.to] = this.board[move.from];
            this.board[move.from] = '';
            this.colors[move.to] = this.colors[move.from];
            this.colors[move.from] = 0;
            this.currentPlayer = 1 - this.currentPlayer;
        }
        
        restoreState(state) {
            this.board = state.board;
            this.colors = state.colors;
            this.currentPlayer = state.currentPlayer;
            this.kingMoved = state.kingMoved;
            this.rookMoved = state.rookMoved;
            this.enPassantTarget = state.enPassantTarget;
            this.fiftyMoveCounter = state.fiftyMoveCounter;
            this.positionHistory = state.positionHistory;
        }
        
        findBestMove(depth) {
            const moves = this.getAllValidMoves();
            if (moves.length === 0) return null;
            
            let bestMove = moves[0];
            let bestEval = this.currentPlayer === 0 ? -Infinity : Infinity;
            
            for (let move of moves) {
                const state = this.makeAndSaveState(move);
                const evalScore = this.alphaBeta(depth - 1, -Infinity, Infinity, this.currentPlayer !== 0);
                this.restoreState(state);
                
                if (this.currentPlayer === 0) {
                    if (evalScore > bestEval) {
                        bestEval = evalScore;
                        bestMove = move;
                    }
                } else {
                    if (evalScore < bestEval) {
                        bestEval = evalScore;
                        bestMove = move;
                    }
                }
            }
            
            return bestMove;
        }
        
        getFEN() {
            let fen = '';
            for (let row = 0; row < 8; row++) {
                let emptyCount = 0;
                for (let col = 0; col < 8; col++) {
                    const index = row * 8 + col;
                    const piece = this.board[index];
                    if (piece) {
                        if (emptyCount > 0) {
                            fen += emptyCount;
                            emptyCount = 0;
                        }
                        fen += piece;
                    } else {
                        emptyCount++;
                    }
                }
                if (emptyCount > 0) {
                    fen += emptyCount;
                }
                if (row < 7) fen += '/';
            }
            
            fen += this.currentPlayer === 0 ? ' w ' : ' b ';
            
            let castling = '';
            if (!this.kingMoved[0]) {
                if (!this.rookMoved[1]) castling += 'K';
                if (!this.rookMoved[0]) castling += 'Q';
            }
            if (!this.kingMoved[1]) {
                if (!this.rookMoved[3]) castling += 'k';
                if (!this.rookMoved[2]) castling += 'q';
            }
            fen += castling || '-';
            fen += ' ';
            fen += this.enPassantTarget >= 0 ? this.indexToAlgebraic(this.enPassantTarget) : '-';
            fen += ' 0 1';
            
            return fen;
        }
        
        indexToAlgebraic(index) {
            const col = index % 8;
            const row = 7 - Math.floor(index / 8);
            return String.fromCharCode(97 + col) + (row + 1);
        }
    }
    
    return ChessEngine;
})();

window.createEngine = function() {
    return new window.ChessEngine();
};
