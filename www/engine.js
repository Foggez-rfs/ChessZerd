// engine.js - Шахматный движок Chesszerd
window.ChessEngine = (function() {
    'use strict';

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

    const PIECE_VALUES = {
        '♔': 20000, '♕': 900, '♖': 500, '♗': 330, '♘': 320, '♙': 100,
        '♚': 20000, '♛': 900, '♜': 500, '♝': 330, '♞': 320, '♟': 100
    };

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
            this.reset();
        }

        reset() {
            this.board = [...INITIAL_BOARD];
            this.colors = [...INITIAL_COLORS];
            this.currentPlayer = 0;
            this.moveHistory = [];
            this.kingMoved = [false, false];
            this.rookMoved = [false, false, false, false];
            this.enPassantTarget = -1;
            this.fiftyMoveCounter = 0;
            this.positionHistory = {};
            this.gameOver = false;
            this.result = '';
        }

        getPieceAt(index) { return this.board[index] || ''; }
        getColorAt(index) { return this.colors[index] || 0; }

        isWhitePiece(p) { return p && '♔♕♖♗♘♙'.includes(p); }
        isBlackPiece(p) { return p && '♚♛♜♝♞♟'.includes(p); }

        getValidMoves(index) {
            const moves = [];
            const piece = this.board[index];
            if (!piece || this.colors[index] !== this.currentPlayer) return moves;

            const row = Math.floor(index / 8);
            const col = index % 8;
            const color = this.colors[index];

            const addMove = (to, extra={}) => {
                moves.push({from: index, to, ...extra});
            };

            const canMove = (to) => {
                if (to < 0 || to >= 64) return false;
                const tRow = Math.floor(to/8), tCol = to%8;
                // Проверка для фигур с ограничением по направлению
                return true;
            };

            switch(piece) {
                case '♙':
                    if (index-8 >= 0 && this.board[index-8] === '') {
                        addMove(index-8);
                        if (row === 6 && this.board[index-16] === '') addMove(index-16);
                    }
                    if (col>0 && index-9>=0 && this.colors[index-9]===1) addMove(index-9, {capture:true});
                    if (col<7 && index-7>=0 && this.colors[index-7]===1) addMove(index-7, {capture:true});
                    break;
                case '♟':
                    if (index+8 < 64 && this.board[index+8] === '') {
                        addMove(index+8);
                        if (row === 1 && this.board[index+16] === '') addMove(index+16);
                    }
                    if (col>0 && index+7<64 && this.colors[index+7]===0) addMove(index+7, {capture:true});
                    if (col<7 && index+9<64 && this.colors[index+9]===0) addMove(index+9, {capture:true});
                    break;
                case '♘': case '♞':
                    [-17,-15,-10,-6,6,10,15,17].forEach(offset => {
                        const to = index+offset;
                        if (to>=0 && to<64 && Math.abs(Math.floor(to/8)-row)<=2 && Math.abs(to%8-col)<=2
                            && this.colors[to] !== color)
                            addMove(to, {capture: !!this.board[to]});
                    });
                    break;
                case '♗': case '♝':
                    [-9,-7,7,9].forEach(dir => {
                        for (let i=1; i<8; i++) {
                            const to = index + dir*i;
                            if (to<0||to>=64) break;
                            const tr = Math.floor(to/8), tc = to%8;
                            if (Math.abs(tr-row)!==i || Math.abs(tc-col)!==i) break;
                            if (this.board[to]==='') addMove(to);
                            else {
                                if (this.colors[to]!==color) addMove(to, {capture:true});
                                break;
                            }
                        }
                    });
                    break;
                case '♖': case '♜':
                    [-8,8,-1,1].forEach(dir => {
                        for (let i=1; i<8; i++) {
                            const to = index + dir*i;
                            if (to<0||to>=64) break;
                            if ((dir===-1||dir===1) && Math.floor(to/8)!==row) break;
                            if (this.board[to]==='') addMove(to);
                            else {
                                if (this.colors[to]!==color) addMove(to, {capture:true});
                                break;
                            }
                        }
                    });
                    break;
                case '♕': case '♛':
                    [-9,-7,7,9,-8,8,-1,1].forEach(dir => {
                        for (let i=1; i<8; i++) {
                            const to = index + dir*i;
                            if (to<0||to>=64) break;
                            const tr = Math.floor(to/8), tc = to%8;
                            if ((dir===-1||dir===1) && tr!==row) break;
                            if ([-9,-7,7,9].includes(dir) && (Math.abs(tr-row)!==i || Math.abs(tc-col)!==i)) break;
                            if (this.board[to]==='') addMove(to);
                            else {
                                if (this.colors[to]!==color) addMove(to, {capture:true});
                                break;
                            }
                        }
                    });
                    break;
                case '♔': case '♚':
                    [-9,-8,-7,-1,1,7,8,9].forEach(offset => {
                        const to = index+offset;
                        if (to>=0 && to<64 && Math.abs(Math.floor(to/8)-row)<=1 && Math.abs(to%8-col)<=1
                            && this.colors[to]!==color)
                            addMove(to, {capture: !!this.board[to]});
                    });
                    // Рокировка
                    if (!this.kingMoved[color]) {
                        const rowBase = color===0 ? 7 : 0;
                        if (!this.rookMoved[color*2] && this.board[index-3]==='' && this.board[index-2]==='' && this.board[index-1]==='')
                            addMove(index-2, {castle:'queenside'});
                        if (!this.rookMoved[color*2+1] && this.board[index+1]==='' && this.board[index+2]==='')
                            addMove(index+2, {castle:'kingside'});
                    }
                    break;
            }

            // Фильтрация ходов, оставляющих короля под шахом
            return moves.filter(move => {
                const newBoard = [...this.board];
                const newColors = [...this.colors];
                this.makeMoveOnBoard(newBoard, newColors, move);
                return !this.isInCheck(color, newBoard, newColors);
            });
        }

        // Вспомогательная: выполнить ход на переданных массивах (не меняя this)
        makeMoveOnBoard(board, colors, move) {
            const piece = board[move.from];
            board[move.to] = piece;
            board[move.from] = '';
            colors[move.to] = colors[move.from];
            colors[move.from] = 0;
            if (move.castle === 'kingside') {
                const rookFrom = move.from + 3;
                board[move.from+1] = board[rookFrom];
                board[rookFrom] = '';
                colors[move.from+1] = colors[rookFrom];
                colors[rookFrom] = 0;
            } else if (move.castle === 'queenside') {
                const rookFrom = move.from - 4;
                board[move.from-1] = board[rookFrom];
                board[rookFrom] = '';
                colors[move.from-1] = colors[rookFrom];
                colors[rookFrom] = 0;
            }
            if (move.enPassant) {
                const captured = move.to + (colors[move.from]===0 ? 8 : -8);
                board[captured] = '';
                colors[captured] = 0;
            }
        }

        isInCheck(color, board=this.board, colors=this.colors) {
            let kingIdx = -1;
            const king = color===0 ? '♔' : '♚';
            for (let i=0; i<64; i++) {
                if (board[i] === king) { kingIdx = i; break; }
            }
            if (kingIdx === -1) return true;
            return this.isSquareAttacked(kingIdx, 1-color, board, colors);
        }

        isSquareAttacked(index, attackerColor, board=this.board, colors=this.colors) {
            const row = Math.floor(index/8), col = index%8;
            // Логика атаки пешками
            if (attackerColor === 0) {
                if (index+9<64 && col<7 && board[index+9]==='♙') return true;
                if (index+7<64 && col>0 && board[index+7]==='♙') return true;
            } else {
                if (index-9>=0 && col>0 && board[index-9]==='♟') return true;
                if (index-7>=0 && col<7 && board[index-7]==='♟') return true;
            }
            // Конём
            const knightMoves = [-17,-15,-10,-6,6,10,15,17];
            const knight = attackerColor===0 ? '♘' : '♞';
            for (let offset of knightMoves) {
                const to = index+offset;
                if (to>=0 && to<64 && board[to]===knight && Math.abs(Math.floor(to/8)-row)<=2) return true;
            }
            // Скользящие фигуры
            const dirs = { '♗':[-9,-7,7,9], '♝':[-9,-7,7,9], '♖':[-8,8,-1,1], '♜':[-8,8,-1,1], '♕':[-9,-7,7,9,-8,8,-1,1], '♛':[-9,-7,7,9,-8,8,-1,1] };
            for (let pieceChar in dirs) {
                if ((attackerColor===0 && pieceChar.charCodeAt(0) < 1000) || (attackerColor===1 && pieceChar.charCodeAt(0) > 1000)) {
                    for (let dir of dirs[pieceChar]) {
                        for (let i=1; i<8; i++) {
                            const to = index+dir*i;
                            if (to<0||to>=64) break;
                            const tr=Math.floor(to/8), tc=to%8;
                            if ((dir===-1||dir===1) && tr!==row) break;
                            if ([-9,-7,7,9].includes(dir) && (Math.abs(tr-row)!==i||Math.abs(tc-col)!==i)) break;
                            if (board[to]==='') continue;
                            if (board[to]===pieceChar) return true;
                            break;
                        }
                    }
                }
            }
            // Король
            const kingChar = attackerColor===0 ? '♔' : '♚';
            const kingMoves = [-9,-8,-7,-1,1,7,8,9];
            for (let offset of kingMoves) {
                const to = index+offset;
                if (to>=0 && to<64 && Math.abs(Math.floor(to/8)-row)<=1 && board[to]===kingChar) return true;
            }
            return false;
        }

        makeMove(move) {
            const state = {
                board: [...this.board], colors: [...this.colors],
                kingMoved: [...this.kingMoved], rookMoved: [...this.rookMoved],
                enPassantTarget: this.enPassantTarget, fiftyMoveCounter: this.fiftyMoveCounter,
                positionHistory: {...this.positionHistory}
            };
            // Выполняем ход
            this.makeMoveOnBoard(this.board, this.colors, move);
            // Обновляем флаги рокировки
            if (this.board[move.to]==='♔') this.kingMoved[0]=true;
            if (this.board[move.to]==='♚') this.kingMoved[1]=true;
            if (this.board[move.to]==='♖') {
                if (move.from===56) this.rookMoved[0]=true;
                else if (move.from===63) this.rookMoved[1]=true;
            }
            if (this.board[move.to]==='♜') {
                if (move.from===0) this.rookMoved[2]=true;
                else if (move.from===7) this.rookMoved[3]=true;
            }
            // en passant
            this.enPassantTarget = -1;
            const piece = this.board[move.to];
            if ((piece==='♙'||piece==='♟') && Math.abs(move.to-move.from)===16)
                this.enPassantTarget = (move.from + move.to)>>1;
            // Счетчик 50 ходов
            if (piece==='♙'||piece==='♟' || state.board[move.to]!=='') this.fiftyMoveCounter=0;
            else this.fiftyMoveCounter++;
            // Хеш позиции
            const fenPart = this.getFEN().split(' ')[0];
            this.positionHistory[fenPart] = (this.positionHistory[fenPart] || 0) + 1;
            this.currentPlayer = 1-this.currentPlayer;
            // Проверка окончания
            if (this.isCheckmate()) { this.gameOver=true; this.result = this.currentPlayer===0?'1-0':'0-1'; }
            else if (this.isStalemate()) { this.gameOver=true; this.result='1/2-1/2'; }
            this.moveHistory.push(state);
            return true;
        }

        undoMove() {
            if (this.moveHistory.length===0) return false;
            const s = this.moveHistory.pop();
            this.board = s.board; this.colors = s.colors;
            this.kingMoved = s.kingMoved; this.rookMoved = s.rookMoved;
            this.enPassantTarget = s.enPassantTarget; this.fiftyMoveCounter = s.fiftyMoveCounter;
            this.positionHistory = s.positionHistory;
            this.currentPlayer = 1-this.currentPlayer;
            this.gameOver = false; this.result = '';
            return true;
        }

        isCheckmate() { return this.isInCheck(this.currentPlayer) && this.getAllValidMoves().length===0; }
        isStalemate() { return !this.isInCheck(this.currentPlayer) && this.getAllValidMoves().length===0; }

        getAllValidMoves() {
            const moves = [];
            for (let i=0; i<64; i++) {
                if (this.colors[i]===this.currentPlayer && this.board[i])
                    moves.push(...this.getValidMoves(i));
            }
            return moves;
        }

        evaluate() {
            let score = 0;
            for (let i=0; i<64; i++) {
                const piece = this.board[i];
                if (!piece) continue;
                let val = PIECE_VALUES[piece] || 0;
                if (piece==='♙') val += PAWN_TABLE[i];
                else if (piece==='♟') val -= PAWN_TABLE[63-i];
                score += this.colors[i]===1 ? -val : val;
            }
            return score;
        }

        alphaBeta(depth, alpha, beta, maximizing) {
            if (depth===0) return this.evaluate();
            const moves = this.getAllValidMoves();
            if (moves.length===0) return this.isInCheck(this.currentPlayer) ? (maximizing ? -99999 : 99999) : 0;
            if (maximizing) {
                let maxEval = -Infinity;
                for (let move of moves) {
                    const s = this.makeCopyState();
                    this.makeMove(move);
                    const e = this.alphaBeta(depth-1, alpha, beta, false);
                    this.restoreState(s);
                    maxEval = Math.max(maxEval, e);
                    alpha = Math.max(alpha, e);
                    if (beta <= alpha) break;
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (let move of moves) {
                    const s = this.makeCopyState();
                    this.makeMove(move);
                    const e = this.alphaBeta(depth-1, alpha, beta, true);
                    this.restoreState(s);
                    minEval = Math.min(minEval, e);
                    beta = Math.min(beta, e);
                    if (beta <= alpha) break;
                }
                return minEval;
            }
        }

        makeCopyState() {
            return {
                board: [...this.board], colors: [...this.colors],
                currentPlayer: this.currentPlayer, kingMoved: [...this.kingMoved],
                rookMoved: [...this.rookMoved], enPassantTarget: this.enPassantTarget,
                fiftyMoveCounter: this.fiftyMoveCounter, positionHistory: {...this.positionHistory}
            };
        }
        restoreState(s) {
            this.board = s.board; this.colors = s.colors;
            this.currentPlayer = s.currentPlayer; this.kingMoved = s.kingMoved;
            this.rookMoved = s.rookMoved; this.enPassantTarget = s.enPassantTarget;
            this.fiftyMoveCounter = s.fiftyMoveCounter; this.positionHistory = s.positionHistory;
        }

        findBestMove(depth) {
            const moves = this.getAllValidMoves();
            if (moves.length===0) return null;
            let best = moves[0];
            let bestVal = this.currentPlayer===0 ? -Infinity : Infinity;
            for (let move of moves) {
                const s = this.makeCopyState();
                this.makeMove(move);
                const val = this.alphaBeta(depth-1, -Infinity, Infinity, this.currentPlayer!==0);
                this.restoreState(s);
                if (this.currentPlayer===0 && val > bestVal) { bestVal=val; best=move; }
                else if (this.currentPlayer===1 && val < bestVal) { bestVal=val; best=move; }
            }
            return best;
        }

        getFEN() {
            let fen = '';
            for (let r=0; r<8; r++) {
                let empty = 0;
                for (let c=0; c<8; c++) {
                    const idx = r*8+c;
                    if (this.board[idx]) {
                        if (empty>0) { fen+=empty; empty=0; }
                        fen+=this.board[idx];
                    } else empty++;
                }
                if (empty>0) fen+=empty;
                if (r<7) fen+='/';
            }
            fen += this.currentPlayer===0 ? ' w ' : ' b ';
            let castling = '';
            if (!this.kingMoved[0]) {
                if (!this.rookMoved[1]) castling+='K';
                if (!this.rookMoved[0]) castling+='Q';
            }
            if (!this.kingMoved[1]) {
                if (!this.rookMoved[3]) castling+='k';
                if (!this.rookMoved[2]) castling+='q';
            }
            fen += castling||'-';
            fen += ' ' + (this.enPassantTarget>=0 ? this.indexToAlgebraic(this.enPassantTarget) : '-');
            fen += ' 0 1';
            return fen;
        }

        indexToAlgebraic(i) { return String.fromCharCode(97+i%8)+(7-Math.floor(i/8)+1); }
    }

    return ChessEngine;
})();

window.createEngine = function() { return new window.ChessEngine(); };
