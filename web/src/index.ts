import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 5;
const CS = CELL_SIZE + 1;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const height = universe.height();
const width = universe.width();
const canvas = document.getElementById("game") as HTMLCanvasElement;
canvas.height = height * CS + 1;
canvas.width = width * CS + 1;

const context = canvas.getContext("2d");

const animate = (_: number) => {
  universe.tick();

  if (context) {
    drawGrid(context);
    drawCells(context);
  }

  requestAnimationFrame(animate);
};

const drawGrid = (ctx: CanvasRenderingContext2D) => {
  if (ctx) {
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
};

const getIndex = (row: number, column: number) => {
  return row * width + column;
};

const drawCells = (ctx: CanvasRenderingContext2D) => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  if (ctx) {
    ctx.beginPath();

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

        ctx.fillRect(col * CS + 1, row * CS + 1, CELL_SIZE, CELL_SIZE);
      }
    }

    ctx.stroke();
  }
};

if (context) {
  drawGrid(context);
  drawCells(context);
  animate(0);
}
