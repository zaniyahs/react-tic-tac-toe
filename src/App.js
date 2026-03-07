import { useState, useEffect } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, size }) {
  function handleClick(i) {
    if (calculateWinner(squares, size) || squares[i]) {
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

  const winner = calculateWinner(squares, size);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(s => s !== null)) {
    status = 'Draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const rows = [];
  for (let row = 0; row < size; row++) {
    const cols = [];
    for (let col = 0; col < size; col++) {
      const i = row * size + col;
      cols.push(
        <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />
      );
    }
    rows.push(<div key={row} className="board-row">{cols}</div>);
  }

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  );
}

function calculateWinner(squares, size) {
  const winLength = size;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const first = squares[row * size + col];
      if (!first) continue;
      let win = true;
      for (let k = 1; k < winLength; k++) {
        if (squares[row * size + col + k] !== first) { win = false; break; }
      }
      if (win) return first;
    }
  }

  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winLength; row++) {
      const first = squares[row * size + col];
      if (!first) continue;
      let win = true;
      for (let k = 1; k < winLength; k++) {
        if (squares[(row + k) * size + col] !== first) { win = false; break; }
      }
      if (win) return first;
    }
  }

  for (let row = 0; row <= size - winLength; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const first = squares[row * size + col];
      if (!first) continue;
      let win = true;
      for (let k = 1; k < winLength; k++) {
        if (squares[(row + k) * size + (col + k)] !== first) { win = false; break; }
      }
      if (win) return first;
    }
  }

  for (let row = 0; row <= size - winLength; row++) {
    for (let col = winLength - 1; col < size; col++) {
      const first = squares[row * size + col];
      if (!first) continue;
      let win = true;
      for (let k = 1; k < winLength; k++) {
        if (squares[(row + k) * size + (col - k)] !== first) { win = false; break; }
      }
      if (win) return first;
    }
  }

  return null;
}

function minimax(squares, depth, isMaximizing, computerPlayer, size, maxDepth) {
  const humanPlayer = computerPlayer === 'X' ? 'O' : 'X';
  const winner = calculateWinner(squares, size);

  if (winner === computerPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (squares.every(s => s !== null)) return 0;
  if (depth >= maxDepth) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const nextSquares = squares.slice();
        nextSquares[i] = computerPlayer;
        const score = minimax(nextSquares, depth + 1, false, computerPlayer, size, maxDepth);
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const nextSquares = squares.slice();
        nextSquares[i] = humanPlayer;
        const score = minimax(nextSquares, depth + 1, true, computerPlayer, size, maxDepth);
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function findBestMove(squares, player, size) {
  // Limit depth based on board size to prevent freezing
  const maxDepth = size === 3 ? 9 : size === 4 ? 3 : 2;
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) {
      const nextSquares = squares.slice();
      nextSquares[i] = player;
      const score = minimax(nextSquares, 0, false, player, size, maxDepth);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function mapBoard(oldSquares, oldSize, newSize) {
  const newSquares = Array(newSize * newSize).fill(null);
  const minSize = Math.min(oldSize, newSize);
  for (let row = 0; row < minSize; row++) {
    for (let col = 0; col < minSize; col++) {
      newSquares[row * newSize + col] = oldSquares[row * oldSize + col];
    }
  }
  return newSquares;
}

export default function Game() {
  const [size, setSize] = useState(3);
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
      !calculateWinner(currentSquares, size) &&
      currentSquares.some(s => s === null)
    ) {
      const timer = setTimeout(() => {
        const bestMove = findBestMove(currentSquares, currentPlayer, size);
        if (bestMove !== null) {
          const nextSquares = currentSquares.slice();
          nextSquares[bestMove] = currentPlayer;
          const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
          setHistory(nextHistory);
          setCurrentMove(nextHistory.length - 1);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentMove, currentSquares, history, isComputerTurn, currentPlayer, size]);

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
    setHistory([Array(size * size).fill(null)]);
    setCurrentMove(0);
  }

  function handleSizeChange(e) {
    const newSize = parseInt(e.target.value);
    const mappedSquares = mapBoard(currentSquares, size, newSize);
    setSize(newSize);
    setHistory([...history.slice(0, currentMove + 1), mappedSquares]);
    setCurrentMove(currentMove + 1);
  }

  function handleSwitch() {
    const opponent = humanPlayer === 'X' ? 'O' : 'X';
    const bestMove = findBestMove(currentSquares, currentPlayer, size);
    if (
      bestMove !== null &&
      !calculateWinner(currentSquares, size) &&
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
        <div>
          <label>Board Size: </label>
          <select onChange={handleSizeChange} value={size}>
            <option value={3}>3x3</option>
            <option value={4}>4x4</option>
            <option value={5}>5x5</option>
          </select>
        </div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} size={size} />
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