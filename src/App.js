import { useState, useEffect } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(s => s !== null)) {
    status = 'Draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

function minimax(squares, depth, isMaximizing, computerPlayer) {
  const humanPlayer = computerPlayer === 'X' ? 'O' : 'X';
  const winner = calculateWinner(squares);

  // Terminal conditions
  if (winner === computerPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (squares.every(s => s !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const nextSquares = squares.slice();
        nextSquares[i] = computerPlayer;
        const score = minimax(nextSquares, depth + 1, false, computerPlayer);
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const nextSquares = squares.slice();
        nextSquares[i] = humanPlayer;
        const score = minimax(nextSquares, depth + 1, true, computerPlayer);
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function findBestMove(squares, player) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const nextSquares = squares.slice();
      nextSquares[i] = player;
      const score = minimax(nextSquares, 0, false, player);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [humanPlayer, setHumanPlayer] = useState('X');
  const xIsNext = currentMove % 2 === 0;
  const currentPlayer = xIsNext ? 'X' : 'O';
  const currentSquares = history[currentMove];
  const isComputerTurn = currentPlayer !== humanPlayer;

  useEffect(() => {
    if (
      isComputerTurn &&
      !calculateWinner(currentSquares) &&
      currentSquares.some(s => s === null)
    ) {
      const bestMove = findBestMove(currentSquares, currentPlayer);
      if (bestMove !== null) {
        const nextSquares = currentSquares.slice();
        nextSquares[bestMove] = currentPlayer;
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
      }
    }
  }, [currentMove, currentSquares, history, isComputerTurn, currentPlayer]);

  function handlePlay(nextSquares) {
    if (isComputerTurn) return;
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handleReset() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  function handleSwitch() {
    const opponent = humanPlayer === 'X' ? 'O' : 'X';
    const bestMove = findBestMove(currentSquares, currentPlayer);
    if (
      bestMove !== null &&
      !calculateWinner(currentSquares) &&
      currentSquares.some(s => s === null)
    ) {
      const nextSquares = currentSquares.slice();
      nextSquares[bestMove] = currentPlayer;
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
    }
    setHumanPlayer(opponent);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        <button onClick={handleReset}>Reset Game</button>
        <button onClick={handleSwitch}>
          Switch to Player {humanPlayer === 'X' ? 'O' : 'X'}
        </button>
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const str = squares.map(s => s || '-').join('');
  const re = /^(?:(?:...){0,2}([OX])\1\1|.{0,2}([OX])..\2..\2|([OX])...\3...\3|..([OX]).\4.\4)/g;
  const match = re.exec(str);
  if (match) {
    return match[1] || match[2] || match[3] || match[4];
  }
  return null;
}