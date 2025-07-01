import { Game } from './game/Game.js';

// Inicializar el juego cuando la página esté cargada
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    game.start();
});