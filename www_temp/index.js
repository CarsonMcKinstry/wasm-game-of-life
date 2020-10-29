import { memory } from 'wasm-game-of-life/wasm_game_of_life_bg';
import { Universe, Cell } from 'wasm-game-of-life';

const CELL_SIZE = 5;
const CS = CELL_SIZE + 1;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const height = universe.height();
const width = universe.width();
const canvas = document.getElementById('game');
canvas.height = height * CS + 1;
canvas.width = width * CS + 1;

const ctx = canvas.getContext('2d');

const animate = () => {
    universe.tick();

    drawGrid();
    drawCells();

    requestAnimationFrame(animate);
}

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * CS + 1, 0);
        ctx.lineTo(i * CS + 1, CS * height + 1);
    }

    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * CS + 1);
        ctx.lineTo(CS * width + 1, j * CS + 1);
    }

    ctx.stroke();
}

const getIndex = (row, column) => {
    return row * width + column;
}

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            ctx.fillStyle = cells[idx] === Cell.Dead
                ? DEAD_COLOR
                : ALIVE_COLOR;

            ctx.fillRect(
                col * CS + 1,
                row * CS + 1,
                CELL_SIZE,
                CELL_SIZE
            )
        }
    }

    ctx.stroke();
}

drawGrid();
drawCells();
animate();