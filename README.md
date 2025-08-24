# Annejoku

A mobile-friendly Sudoku puzzle game built with vanilla JavaScript, featuring multiple difficulty levels, score tracking, and installable as a web app.

## Features

✅ **4 Difficulty Levels**: Easy, Medium, Hard, and Expert
✅ **Score System**: Points based on completion time and difficulty
✅ **Local Storage**: All game data saved locally on your device
✅ **High Scores**: Track your best performances
✅ **Mobile Optimized**: Designed for phone screens with touch support
✅ **Installable**: Add to home screen for app-like experience
✅ **Encouraging Messages**: Friendly support when you take your time
✅ **Offline Play**: Works without internet connection
✅ **Dark Mode Support**: Adapts to system theme

## How to Play

1. **Select a cell** by tapping on it
2. **Enter a number** using the number pad
3. **Erase** mistakes with the backspace button
4. **Complete** the puzzle by filling all cells correctly

## Installation

### As a Web App
1. Open the game in your mobile browser
2. Wait for the install prompt or use browser menu
3. Select "Add to Home Screen" or "Install"
4. Launch from your home screen like any app

### For Development
1. Clone or download the files
2. Open `generate-icons.html` in a browser to create icon files
3. Serve the files with any web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx serve
   ```
4. Open http://localhost:8000 in your browser

## Game Rules

- Each row must contain numbers 1-9 without repetition
- Each column must contain numbers 1-9 without repetition
- Each 3x3 box must contain numbers 1-9 without repetition

## Scoring System

- **Base Score**: 1000 points minus seconds elapsed
- **Difficulty Multiplier**:
  - Easy: 1x
  - Medium: 1.5x
  - Hard: 2x
  - Expert: 3x
- **Completion Bonus**: Extra points for faster completion

## Local Storage

All data is stored locally on your device:
- Current game state
- High scores
- Difficulty preference
- No server or account needed
- Data stays private on your device

## Browser Support

- Chrome/Edge 80+
- Safari 14+
- Firefox 75+
- Mobile browsers with PWA support

## Tips

- Take your time - there's no penalty for thinking
- Use the highlight feature to track numbers
- Start with easier cells that have fewer possibilities
- Look for rows, columns, or boxes with many filled cells
- The game saves automatically - close and resume anytime

## Enjoy the game! 🧩