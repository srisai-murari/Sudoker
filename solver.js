let size = 9;
let solutions = [];
let currentSolutionIndex = 0;
let userBoard = [];

function validateBoard(board) {
  const sqrt = Math.sqrt(size);

  for (let i = 0; i < size; i++) {
    const rowSet = new Set();
    const colSet = new Set();

    for (let j = 0; j < size; j++) {
      let rowVal = board[i][j];
      let colVal = board[j][i];

      if (rowVal !== 0) {
        if (rowSet.has(rowVal)) return false;
        rowSet.add(rowVal);
      }

      if (colVal !== 0) {
        if (colSet.has(colVal)) return false;
        colSet.add(colVal);
      }
    }
  }

  for (let boxRow = 0; boxRow < size; boxRow += sqrt) {
    for (let boxCol = 0; boxCol < size; boxCol += sqrt) {
      const boxSet = new Set();
      for (let i = 0; i < sqrt; i++) {
        for (let j = 0; j < sqrt; j++) {
          const val = board[boxRow + i][boxCol + j];
          if (val !== 0) {
            if (boxSet.has(val)) return false;
            boxSet.add(val);
          }
        }
      }
    }
  }

  return true;
}

function generateBoard() {
  const boardDiv = document.getElementById("board");
  size = parseInt(document.getElementById("board-size").value);
  const sqrt = Math.sqrt(size);

  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${size}, 40px)`;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = "2";
      input.id = `cell-${i}-${j}`;

      if ((j + 1) % sqrt === 0 && j !== size - 1)
        input.classList.add("thick-right");
      if ((i + 1) % sqrt === 0 && i !== size - 1)
        input.classList.add("thick-bottom");

      boardDiv.appendChild(input);
    }
  }

  document.getElementById("navigation").style.display = "none";
}

function solveBoard() {
  const board = [];
  userBoard = [];
  let filledCells = 0;

  for (let i = 0; i < size; i++) {
    const row = [];
    const userRow = [];
    for (let j = 0; j < size; j++) {
      const input = document.getElementById(`cell-${i}-${j}`);
      const val = input.value.trim();

      if (val === "") {
        row.push(0);
        userRow.push(0);
        continue;
      }

      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > size) {
        alert(`⚠️ Invalid number at row ${i + 1}, col ${j + 1}: "${val}"\nMust be 1 to ${size}`);
        input.focus();
        return;
      }

      row.push(num);
      userRow.push(num);
      filledCells++;
    }
    board.push(row);
    userBoard.push(userRow);
  }

  if (!validateBoard(board)) {
    alert("⚠️ Invalid board: duplicates found in row, column, or box.");
    return;
  }

  if (filledCells < 10 && size === 9) {
    alert("⚠️ Very few clues provided. Solving may take time. Showing only first 100 solutions.");
  }

  solutions = [];
  currentSolutionIndex = 0;
  findAllSolutions(board);

  if (solutions.length === 0) {
    alert("❌ No solution found!");
    return;
  }

  showSolution(0);
  document.getElementById("navigation").style.display = solutions.length > 1 ? "block" : "none";
}

function isSafe(board, row, col, num) { 
  for (let x = 0; x < size; x++) {
    if (board[row][x] === num || board[x][col] === num)
      return false;
  }

  const sqrt = Math.sqrt(size);
  const boxRowStart = row - row % sqrt;
  const boxColStart = col - col % sqrt;

  for (let i = 0; i < sqrt; i++) {
    for (let j = 0; j < sqrt; j++) {
      if (board[boxRowStart + i][boxColStart + j] === num)
        return false;
    }
  }

  return true;
}

function findAllSolutions(board, row = 0, col = 0) {
  if (solutions.length >= 100) return; // Limit to first 10 solutions

  if (row === size) {
    solutions.push(board.map(r => [...r]));
    return;
  }

  const [nextRow, nextCol] = col === size - 1 ? [row + 1, 0] : [row, col + 1];

  if (board[row][col] !== 0) {
    findAllSolutions(board, nextRow, nextCol);
  } else {
    for (let num = 1; num <= size; num++) {
      if (isSafe(board, row, col, num)) {
        board[row][col] = num;
        findAllSolutions(board, nextRow, nextCol);
        board[row][col] = 0;

        if (solutions.length >= 100) return;
      }
    }
  }
}

function showSolution(index) {
  const solution = solutions[index];
  currentSolutionIndex = index;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const input = document.getElementById(`cell-${i}-${j}`);
      input.value = solution[i][j];
      input.classList.toggle("solved-cell", userBoard[i][j] === 0);
    }
  }

  const countSpan = document.getElementById("solution-count");
  countSpan.textContent = `Solution ${index + 1} of ${solutions.length}`;
}

function nextSolution() {
  if (currentSolutionIndex < solutions.length - 1) {
    showSolution(currentSolutionIndex + 1);
  }
}

function previousSolution() {
  if (currentSolutionIndex > 0) {
    showSolution(currentSolutionIndex - 1);
  }
}

window.addEventListener("DOMContentLoaded", generateBoard);
window.addEventListener("keydown", (e) => {
  if (solutions.length <= 1) return;

  if (e.key === "ArrowLeft") {
    previousSolution();
  } else if (e.key === "ArrowRight") {
    nextSolution();
  }
});


