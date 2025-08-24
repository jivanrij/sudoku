class SudokuApp {
  constructor() {
    this.game = new SudokuGame();
    this.selectedCell = null;
    this.timer = null;
    this.seconds = 0;
    this.score = 0;
    this.encouragementTimer = null;
    this.lastEncouragementTime = 0;
    
    this.encouragementMessages = [
      "You're doing great! Keep going! 💪",
      "Take your time, you've got this! 🌟",
      "Every puzzle has a solution! 🧩",
      "Patience is key! You're amazing! ✨",
      "Focus on one number at a time! 🎯",
      "You're closer than you think! 🚀",
      "Brilliant minds take their time! 🧠",
      "Deep breaths, you can do it! 🌈",
      "Persistence pays off! Keep trying! 💎",
      "You're a Sudoku champion in the making! 🏆"
    ];
    
    this.init();
  }

  init() {
    this.setupBoard();
    this.setupEventListeners();
    this.loadGameState();
    this.checkInstallPrompt();
  }

  setupBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener('click', () => this.selectCell(row, col));
        boardElement.appendChild(cell);
      }
    }
  }

  setupEventListeners() {
    // Number pad
    document.querySelectorAll('.number-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const num = parseInt(e.target.dataset.number);
        this.handleNumberInput(num);
      });
    });

    // Control buttons
    document.getElementById('new-game').addEventListener('click', () => this.newGame());
    document.getElementById('reset-game').addEventListener('click', () => this.resetGame());
    document.getElementById('high-scores').addEventListener('click', () => this.showHighScores());
    document.getElementById('settings').addEventListener('click', () => this.showSettings());

    // Settings modal
    document.getElementById('close-settings').addEventListener('click', () => this.closeModal('settings-modal'));
    document.getElementById('clear-data').addEventListener('click', () => this.clearAllData());
    
    // High scores modal
    document.getElementById('close-scores').addEventListener('click', () => this.closeModal('scores-modal'));
    
    // Victory modal
    document.getElementById('play-again').addEventListener('click', () => {
      this.closeModal('victory-modal');
      this.newGame();
    });

    // Difficulty selection
    document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.game.difficulty = e.target.value;
        localStorage.setItem('sudoku_difficulty', e.target.value);
      });
    });

    // Install prompt
    document.getElementById('install-btn').addEventListener('click', () => this.installApp());
    document.getElementById('dismiss-install').addEventListener('click', () => this.dismissInstall());

    // Keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  selectCell(row, col) {
    const cells = document.querySelectorAll('.cell');
    
    // First, clear ALL previous selections and highlights
    cells.forEach(cell => {
      cell.classList.remove('selected', 'highlight');
      cell.style.background = ''; // Clear any inline background styles
    });

    const index = row * 9 + col;
    const cell = cells[index];
    
    if (this.game.puzzle[row][col] === 0) {
      cell.classList.add('selected');
      this.selectedCell = { row, col };
      
      // Highlight same numbers
      const value = this.game.userBoard[row][col];
      if (value !== 0) {
        cells.forEach((c, idx) => {
          const r = Math.floor(idx / 9);
          const cl = idx % 9;
          if (this.game.userBoard[r][cl] === value) {
            c.classList.add('highlight');
          }
        });
      }
      
      // Highlight row, column, and box
      this.highlightRelatedCells(row, col);
    }
  }

  highlightRelatedCells(row, col) {
    const cells = document.querySelectorAll('.cell');
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    cells.forEach((cell, index) => {
      const r = Math.floor(index / 9);
      const c = index % 9;
      
      // Apply highlight to related cells (row, column, box)
      if (r === row || c === col || 
          (r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3)) {
        if (!cell.classList.contains('selected')) {
          // Restore proper background for fixed cells, highlight others
          if (cell.classList.contains('fixed')) {
            cell.style.background = ''; // Let CSS handle fixed cell background
          } else {
            cell.style.background = 'var(--highlight-related)';
          }
        }
      }
    });
  }

  handleNumberInput(num) {
    if (!this.selectedCell) return;
    
    const { row, col } = this.selectedCell;
    
    if (num === 0) {
      // Erase
      this.game.clearCell(row, col);
    } else {
      if (this.game.isValidUserMove(row, col, num)) {
        this.game.makeMove(row, col, num);
        this.animateCorrectMove(row, col);
        
        // Check for win
        if (this.game.checkWin()) {
          this.handleVictory();
        }
      } else {
        this.animateError(row, col);
      }
    }
    
    this.updateBoard();
    this.saveGameState();
  }

  handleKeyboard(e) {
    if (!this.selectedCell) return;
    
    const key = e.key;
    if (key >= '1' && key <= '9') {
      this.handleNumberInput(parseInt(key));
    } else if (key === 'Delete' || key === 'Backspace') {
      this.handleNumberInput(0);
    } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      this.navigateWithArrows(key);
    }
  }

  navigateWithArrows(key) {
    if (!this.selectedCell) return;
    
    let { row, col } = this.selectedCell;
    
    switch(key) {
      case 'ArrowUp': row = Math.max(0, row - 1); break;
      case 'ArrowDown': row = Math.min(8, row + 1); break;
      case 'ArrowLeft': col = Math.max(0, col - 1); break;
      case 'ArrowRight': col = Math.min(8, col + 1); break;
    }
    
    this.selectCell(row, col);
  }

  updateBoard() {
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach((cell, index) => {
      const row = Math.floor(index / 9);
      const col = index % 9;
      const value = this.game.userBoard[row][col];
      
      cell.textContent = value === 0 ? '' : value;
      
      // Preserve background style if it exists
      const currentBackground = cell.style.background;
      cell.className = 'cell';
      cell.style.background = currentBackground;
      
      if (this.game.puzzle[row][col] !== 0) {
        cell.classList.add('fixed');
      } else if (value !== 0 && value !== this.game.solution[row][col]) {
        cell.classList.add('error');
      }
    });
    
    // Reapply selection if there is one
    if (this.selectedCell) {
      const { row, col } = this.selectedCell;
      this.selectCell(row, col);
    }
    
    // Update progress
    const progress = this.game.getProgress();
    this.updateScore(progress.percentage);
  }

  animateCorrectMove(row, col) {
    const index = row * 9 + col;
    const cell = document.querySelectorAll('.cell')[index];
    cell.classList.add('correct-animation');
    setTimeout(() => cell.classList.remove('correct-animation'), 500);
  }

  animateError(row, col) {
    const index = row * 9 + col;
    const cell = document.querySelectorAll('.cell')[index];
    cell.classList.add('error');
    setTimeout(() => cell.classList.remove('error'), 300);
  }

  newGame() {
    // Stop timer
    this.stopTimer();
    
    // Get difficulty
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    // Generate new puzzle
    this.game.createPuzzle(difficulty);
    
    // Reset game state
    this.selectedCell = null;
    this.seconds = 0;
    this.score = 0;
    
    // Update display
    this.updateBoard();
    this.startTimer();
    
    // Save state
    this.saveGameState();
    
    // Show encouragement
    this.showEncouragement("New game started! Good luck! 🎮");
    this.startEncouragementTimer();
  }

  resetGame() {
    this.game.reset();
    this.updateBoard();
    this.saveGameState();
    this.showEncouragement("Board reset! Fresh start! 🔄");
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.seconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.encouragementTimer) {
      clearInterval(this.encouragementTimer);
      this.encouragementTimer = null;
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;
    document.getElementById('timer').textContent = 
      `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateScore(progressPercentage) {
    // Calculate score based on time, difficulty, and progress
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 3
    };
    
    const baseScore = Math.max(1000 - this.seconds, 100);
    const multiplier = difficultyMultiplier[this.game.difficulty];
    this.score = Math.round(baseScore * multiplier * (progressPercentage / 100));
    
    document.getElementById('score').textContent = this.score;
  }

  startEncouragementTimer() {
    this.lastEncouragementTime = Date.now();
    
    if (this.encouragementTimer) {
      clearInterval(this.encouragementTimer);
    }
    
    this.encouragementTimer = setInterval(() => {
      const timeSinceLastAction = Date.now() - this.lastEncouragementTime;
      
      // Show encouragement every 30 seconds of inactivity
      if (timeSinceLastAction > 30000) {
        const message = this.encouragementMessages[
          Math.floor(Math.random() * this.encouragementMessages.length)
        ];
        this.showEncouragement(message);
        this.lastEncouragementTime = Date.now();
      }
    }, 5000);
  }

  showEncouragement(message) {
    const element = document.getElementById('encouragement');
    element.textContent = message;
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);
    
    setTimeout(() => {
      element.textContent = '';
    }, 5000);
  }

  handleVictory() {
    this.stopTimer();
    
    // Calculate final score
    const difficultyMultiplier = {
      easy: 1000,
      medium: 1500,
      hard: 2000,
      expert: 3000
    };
    
    const timeBonus = Math.max(3600 - this.seconds, 0);
    const finalScore = difficultyMultiplier[this.game.difficulty] + timeBonus;
    
    // Save high score
    this.saveHighScore(finalScore);
    
    // Show victory modal
    document.getElementById('victory-time').textContent = 
      `${Math.floor(this.seconds / 60)}:${(this.seconds % 60).toString().padStart(2, '0')}`;
    document.getElementById('victory-score').textContent = finalScore;
    document.getElementById('victory-difficulty').textContent = 
      this.game.difficulty.charAt(0).toUpperCase() + this.game.difficulty.slice(1);
    
    this.showModal('victory-modal');
    
    // Clear saved game
    localStorage.removeItem('sudoku_current_game');
  }

  saveHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem('sudoku_high_scores') || '[]');
    
    highScores.push({
      score: score,
      time: this.seconds,
      difficulty: this.game.difficulty,
      date: new Date().toISOString()
    });
    
    // Keep only top 20 scores
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(20);
    
    localStorage.setItem('sudoku_high_scores', JSON.stringify(highScores));
  }

  showHighScores() {
    const highScores = JSON.parse(localStorage.getItem('sudoku_high_scores') || '[]');
    const listElement = document.getElementById('scores-list');
    
    if (highScores.length === 0) {
      listElement.innerHTML = '<p style="text-align: center; color: #718096;">No high scores yet!</p>';
    } else {
      listElement.innerHTML = highScores.map((score, index) => `
        <div class="score-item">
          <span class="score-rank">#${index + 1}</span>
          <div class="score-details">
            <span>${score.score} pts</span>
            <span>${score.difficulty}</span>
            <span>${Math.floor(score.time / 60)}:${(score.time % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      `).join('');
    }
    
    this.showModal('scores-modal');
  }

  showSettings() {
    this.showModal('settings-modal');
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
  }

  clearAllData() {
    if (confirm('This will delete all your game data and high scores. Are you sure?')) {
      localStorage.clear();
      location.reload();
    }
  }

  saveGameState() {
    const gameState = {
      game: this.game.serialize(),
      seconds: this.seconds,
      score: this.score
    };
    
    localStorage.setItem('sudoku_current_game', JSON.stringify(gameState));
  }

  loadGameState() {
    const savedGame = localStorage.getItem('sudoku_current_game');
    const savedDifficulty = localStorage.getItem('sudoku_difficulty');
    
    if (savedDifficulty) {
      document.querySelector(`input[name="difficulty"][value="${savedDifficulty}"]`).checked = true;
      this.game.difficulty = savedDifficulty;
    }
    
    if (savedGame) {
      try {
        const gameState = JSON.parse(savedGame);
        this.game.deserialize(gameState.game);
        this.seconds = gameState.seconds || 0;
        this.score = gameState.score || 0;
        
        this.updateBoard();
        this.updateTimerDisplay();
        document.getElementById('score').textContent = this.score;
        this.startTimer();
        this.startEncouragementTimer();
      } catch (e) {
        console.error('Failed to load saved game:', e);
        this.newGame();
      }
    } else {
      this.newGame();
    }
  }

  // PWA Install functionality
  checkInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install prompt after 30 seconds
      setTimeout(() => {
        document.getElementById('install-prompt').classList.add('show');
      }, 30000);
    });
    
    window.deferredPrompt = deferredPrompt;
  }

  async installApp() {
    const deferredPrompt = window.deferredPrompt;
    
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      alert('To install this app, use your browser\'s "Add to Home Screen" option from the menu.');
      return;
    }
    
    document.getElementById('install-prompt').classList.remove('show');
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    window.deferredPrompt = null;
  }

  dismissInstall() {
    document.getElementById('install-prompt').classList.remove('show');
    
    // Show again in 7 days
    setTimeout(() => {
      document.getElementById('install-prompt').classList.add('show');
    }, 7 * 24 * 60 * 60 * 1000);
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.sudokuApp = new SudokuApp();
});