# Honey Generator Project

## Project Overview
Honey Generator is a simple clicker game where players generate "honey" by interacting with buttons. The game includes upgrades for manual clicks and an option to unlock automatic honey generation. It also features visual and audio feedback for user actions.

---

## Features
1. **Manual Honey Generation**:
   - Click a button to generate honey.
2. **Click Upgrades**:
   - Improve the amount of honey gained per click.
3. **Automatic Honey Maker**:
   - Unlock an auto-generator that produces honey over time.
4. **Dynamic Visual Feedback**:
   - Canvas-based graphics display honey-related elements (jars, boxes).
5. **Audio Effects**:
   - Play sounds during interactions.
6. **Error Notifications**:
   - Display error messages when insufficient honey is available for actions.

---

## Files Overview

### 1. **HTML (index.html)**
The main structure of the application:
- **Canvas**: Used for rendering visual elements.
- **Buttons**: User interaction for adding honey, unlocking auto-generator, and upgrading.
- **Error Message**: Displayed dynamically when actions fail.

### Key Sections:
- `<canvas id="newElementsContainer">`: Renders dynamic images based on game state.
- `<h1 id="counterDisplay">`: Displays the current amount of honey.
- Buttons for actions:
  - `id="counterAdd"`: Adds honey manually.
  - `id="clickImprove"`: Upgrades manual click efficiency.
  - `id="counterAuto"`: Unlocks the auto-generator.

### 2. **CSS (style.css)**
Handles the visual styling of the game:
- **Roboto Font**: Imported from Google Fonts for modern typography.
- **Buttons**: Styled with distinct colors for interactivity.
  - Green for adding honey.
  - Orange for unlocking auto-generation.
  - Yellow for upgrades.
- **Error Message**:
  - Red background with animation for fading out.
- **Canvas**:
  - Positioned in the background for dynamic visuals.

### Key Classes and IDs:
- `.roboto-*`: Styles for various weights and italic versions of Roboto font.
- `#counterAdd`: Styled for positive feedback with color changes on click.
- `#errorMessage`: Styled with a fade-out animation.

### 3. **JavaScript (script.js)**
Implements the logic and interactivity:
- **Game Class**:
  - Manages total honey, auto-generation, and visual updates.
- **ClickImprovement Class**:
  - Tracks milestones and upgrades for manual clicks.
- **Event Listeners**:
  - Button actions for incrementing honey, unlocking auto-generation, and upgrading clicks.
- **Dynamic Canvas Rendering**:
  - Draws elements like jars or boxes of honey based on the current total.
- **Audio Effects**:
  - Plays sounds during user interactions.

### Key Functions:
- `updateCounterDisplay()`: Updates the counter display element.
- `refresh()`: Renders canvas elements dynamically.
- `errorMessageDisplay()`: Shows error messages with animations.

---

## How to Run
1. Clone the repository or download the project files.
2. Ensure the following file structure:
   ```
   /project
   |-- index.html
   |-- style.css
   |-- script.js
   |-- assets/
       |-- Miel.png
       |-- Boite.png
       |-- youtube_8P5WCI0iQlo_audio.mp3
       |-- PLOUF.mp3
   ```
3. Open `index.html` in a modern browser to launch the game.

---

## Future Enhancements
1. Add more upgrade tiers and milestones.
2. Include a progress bar for auto-generation.
3. Improve mobile responsiveness.
4. Expand the canvas visuals with more diverse elements.
5. Add leaderboard functionality to track high scores.

---

## Credits
- **Fonts**: [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)
- **Images**: Assets for honey and boxes.
- **Sounds**: Audio clips for interaction feedback.

