import { Game } from './Game.js';

// Initialize the game when the page is loaded
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Maintain aspect ratio
        const container = document.getElementById('gameContainer');
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        const aspectRatio = canvas.width / canvas.height;
        
        let newWidth = maxWidth;
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }
        
        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
    });
    
    // Handle pause/resume
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            if (game.gameState === 'playing') {
                game.gameState = 'paused';
            } else if (game.gameState === 'paused') {
                game.gameState = 'playing';
            }
        }
    });
    
    // Start the game
    game.start();
});