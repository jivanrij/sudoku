class SudokuGame {
  constructor() {
    this.size = 9;
    this.boxSize = 3;
    this.solution = [];
    this.puzzle = [];
    this.userBoard = [];
    this.difficulty = 'easy';
    this.cellsToRemove = {
      easy: 35,
      medium: 45,
      hard: 55,
      expert: 65
    };
  }

  generateSolution() {
    this.solution = Array(this.size).fill().map(() => Array(this.size).fill(0));
    this.fillBoard(this.solution);
    return this.solution;
  }

  fillBoard(board) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (board[row][col] === 0) {
          this.shuffleArray(numbers);
          
          for (let num of numbers) {
            if (this.isValidMove(board, row, col, num)) {
              board[row][col] = num;
              
              if (this.fillBoard(board)) {
                return true;
              }
              
              board[row][col] = 0;
            }
          }
          
          return false;
        }
      }
    }
    
    return true;
  }

  isValidMove(board, row, col, num) {
    // Check row
    for (let x = 0; x < this.size; x++) {
      if (board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < this.size; x++) {
      if (board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / this.boxSize) * this.boxSize;
    const boxCol = Math.floor(col / this.boxSize) * this.boxSize;
    
    for (let i = 0; i < this.boxSize; i++) {
      for (let j = 0; j < this.boxSize; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  }

  createPuzzle(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.generateSolution();
    
    // Create a deep copy of the solution
    this.puzzle = this.solution.map(row => [...row]);
    this.userBoard = this.solution.map(row => [...row]);
    
    const cellsToRemove = this.cellsToRemove[difficulty];
    const removed = new Set();
    
    while (removed.size < cellsToRemove) {
      const row = Math.floor(Math.random() * this.size);
      const col = Math.floor(Math.random() * this.size);
      const key = `${row}-${col}`;
      
      if (!removed.has(key)) {
        removed.add(key);
        this.puzzle[row][col] = 0;
        this.userBoard[row][col] = 0;
      }
    }
    
    return this.puzzle;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  checkWin() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.userBoard[row][col] !== this.solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  isValidUserMove(row, col, num) {
    return this.isValidMove(this.userBoard, row, col, num);
  }

  makeMove(row, col, num) {
    if (this.puzzle[row][col] === 0) {
      this.userBoard[row][col] = num;
      return true;
    }
    return false;
  }

  clearCell(row, col) {
    if (this.puzzle[row][col] === 0) {
      this.userBoard[row][col] = 0;
      return true;
    }
    return false;
  }

  reset() {
    this.userBoard = this.puzzle.map(row => [...row]);
  }

  getHint() {
    const emptyCells = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.userBoard[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      return {
        row: randomCell.row,
        col: randomCell.col,
        value: this.solution[randomCell.row][randomCell.col]
      };
    }
    
    return null;
  }

  getProgress() {
    let filled = 0;
    let total = 0;
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.puzzle[row][col] === 0) {
          total++;
          if (this.userBoard[row][col] !== 0) {
            filled++;
          }
        }
      }
    }
    
    return { filled, total, percentage: Math.round((filled / total) * 100) };
  }

  serialize() {
    return {
      solution: this.solution,
      puzzle: this.puzzle,
      userBoard: this.userBoard,
      difficulty: this.difficulty
    };
  }

  deserialize(data) {
    this.solution = data.solution;
    this.puzzle = data.puzzle;
    this.userBoard = data.userBoard;
    this.difficulty = data.difficulty;
  }
}