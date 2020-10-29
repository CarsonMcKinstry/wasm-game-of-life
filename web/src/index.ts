import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg.wasm";

const isCanvasElement = (
  element: HTMLElement | null
): element is HTMLCanvasElement => !!element && element.nodeName === "CANVAS";

enum CellColor {
  ALIVE = "#000000",
  DEAD = "#FFFFFF",
}

const GRID_COLOR = "#CCCCCC";

class GameOfLife {
  private mem: WebAssembly.Memory;

  private universe: Universe;
  private width: number;
  private height: number;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private cellSize: number = 5; // px

  private get adjCellSize() {
    return this.cellSize + 1;
  }

  private fpsLimit: number = 60;
  private previousDelta: number = 0;

  constructor(fpsLimit?: number) {
    this.fpsLimit = fpsLimit || this.fpsLimit;

    this.universe = Universe.new();
    this.mem = memory;

    this.width = this.universe.width();
    this.height = this.universe.height();

    const canvas = document.getElementById("game");

    if (isCanvasElement(canvas)) {
      this.canvas = canvas;
      this.canvas.width = this.width * this.cellSize + 1;
      this.canvas.height = this.height * this.cellSize + 1;
    } else {
      throw new Error("Unable to find canvas element");
    }

    const context = this.canvas.getContext("2d");

    if (context) {
      this.ctx = context;
    } else {
      throw new Error("Unable to get context from canvas");
    }
  }

  public init() {
    this.animate(0);
  }
  private animate(currentDelta: number) {
    requestAnimationFrame(this.animate.bind(this));

    const delta = currentDelta - this.previousDelta;

    if (this.fpsLimit && delta < 1000 / this.fpsLimit) {
      return;
    }

    this.universe.tick();
    this.render();

    this.previousDelta = currentDelta;
  }
  private render() {
    this.drawGrid();
    this.drawCells();
  }

  private getIndex(row: number, col: number) {
    return row * this.width + col;
  }

  private drawCells() {
    const cellsPtr = this.universe.cells();
    const cells = new Uint8Array(
      this.mem.buffer,
      cellsPtr,
      this.width * this.height
    );

    this.ctx.beginPath();

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const idx = this.getIndex(row, col);

        this.ctx.fillStyle =
          cells[idx] === Cell.Dead ? CellColor.DEAD : CellColor.ALIVE;

        this.ctx.fillRect(
          col * this.adjCellSize + 1,
          row * this.adjCellSize + 1,
          this.cellSize,
          this.cellSize
        );
      }
    }

    this.ctx.stroke();
  }

  private drawGrid() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i < this.width; i++) {
      this.ctx.moveTo(i * this.adjCellSize + 1, 0);
      this.ctx.lineTo(
        i * this.adjCellSize + 1,
        this.adjCellSize * this.height + 1
      );
    }

    for (let j = 0; j <= this.height; j++) {
      this.ctx.moveTo(0, j * this.adjCellSize + 1);
      this.ctx.lineTo(
        this.adjCellSize * this.width + 1,
        j * this.adjCellSize + 1
      );
    }

    this.ctx.stroke();
  }
}

const game = new GameOfLife(24);

game.init();
