const defaultOptions = {
  canvas: {
    width: 500,
    height: 500,
    background: "#000",
  },
  grid: 50,
  tick: 1000, // repaint in 1 sec
  visitedCellColor: "red",
  wallColor: "pink",
  cellColor: "green",
  startPoint: { x: 0, y: 0 },
};

class Cell {
  constructor(
    x,
    y,
    w,
    h,
    color = "green",
    wallColor = "pink",
    visitedColor = "red"
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.wallColor = wallColor;
    this.visited = false;
    this.visitedColor = visitedColor;
    this.wall = {
      left: true,
      right: true,
      up: true,
      down: true,
    };
  }

  mergeCell(cell) {
    if (this.x - cell.x === -1) {
      this.wall.right = false;
      cell.wall.left = false;
    } else if (this.x - cell.x === 1) {
      this.wall.left = false;
      cell.wall.right = false;
    } else if (this.y - cell.y === -1) {
      this.wall.down = false;
      cell.wall.up = false;
    } else if (this.y - cell.y === 1) {
      this.wall.up = false;
      cell.wall.down = false;
    }
  }

  paint(ctx) {
    if (this.visited) this.color = this.visitedColor;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * this.w, this.y * this.h, this.w, this.h);
    if (this.wall.left) {
      ctx.beginPath();
      ctx.moveTo(this.x * this.w, this.y * this.h);
      ctx.lineTo(this.x * this.w, this.y * this.h + this.h);
      ctx.stroke();
      ctx.closePath();
    }
    if (this.wall.right) {
      ctx.beginPath();
      ctx.moveTo(this.x * this.w + this.w, this.y * this.h);
      ctx.lineTo(this.x * this.w + this.w, this.y * this.h + this.h);
      ctx.stroke();
      ctx.closePath();
    }
    if (this.wall.up) {
      ctx.beginPath();
      ctx.moveTo(this.x * this.w + this.w, this.y * this.h);
      ctx.moveTo(this.x * this.w, this.y * this.h);
      ctx.lineTo(this.x * this.w + this.w, this.y * this.h);
      ctx.stroke();
      ctx.closePath();
    }
    if (this.wall.down) {
      ctx.beginPath();
      ctx.moveTo(this.x * this.w, this.y * this.h + this.h);
      ctx.lineTo(this.x * this.w + this.w, this.y * this.h + this.h);
      ctx.stroke();
      ctx.closePath();
    }
    ctx.strokeStyle = this.wallColor;
  }
}

const indexToCoor = (index, width) => {
  return [Math.floor(index / width), index % width];
};
const coorToIndex = (x, y, width) => {
  if (y >= width)
    throw Error("value of y cannot be greater than array's width");
  return x * width + y;
};

const generateGrid = (row, col) => {
  const grid = [...Array(row * col).fill(0)];
  return grid.map((_, index) => [Math.floor(index / col), index % col]);
};

const getNeighborOf = (width, height, x, y) => {
  const left = x > 0 ? [x - 1, y] : null;
  const right = x + 1 < width ? [x + 1, y] : null;
  const up = y > 0 ? [x, y - 1] : null;
  const down = y + 1 < height ? [x, y + 1] : null;
  return [left, up, right, down].filter((each) => each !== null);
};

function shuffle(array) {
  let shuffled = array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  return shuffled;
}

const mazeVisualizer = (ctx, options = defaultOptions, onComplete) => {
  let { canvas, grid, tick, visitedCellColor, wallColor, cellColor } = options;
  if (!tick) tick = defaultOptions.tick;
  if (!grid) grid = defaultOptions.grid;
  if (!visitedCellColor) defaultOptions.visitedCellColor;
  if (!wallColor) defaultOptions.wallColor;
  if (!cellColor) defaultOptions.cellColor;

  const rowSize = canvas.height / grid;
  const colSize = canvas.width / grid;

  let x = options?.startPoint?.x ?? 0;
  let y = options?.startPoint?.y ?? 0;

  const paintCanvas = () => {
    ctx.fillStyle = canvas.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const cells = generateGrid(grid, grid).map(
    ([x, y]) =>
      new Cell(x, y, colSize, rowSize, cellColor, wallColor, visitedCellColor)
  );

  const paintCells = (cells, ctx) => {
    cells.forEach((cell) => cell.paint(ctx));
  };

  const stack = [];
  let interval;
  const loop = () => {
    const cell = coorToIndex(x, y, grid);
    if (!cells[cell].visited) {
      stack.push([x, y]);
      cells[cell].visited = true;
    }
    const neighbor = shuffle(getNeighborOf(grid, grid, x, y)).find((coor) => {
      const [x, y] = coor;
      const c = coorToIndex(x, y, grid);
      if (cells[c].visited) return false;
      return true;
    });
    if (!neighbor) {
      stack.pop();
      if (!stack.length) {
        onComplete(true);
        return clearInterval(interval);
      }
      x = stack.at(-1)[0];
      y = stack.at(-1)[1];
    } else {
      const c = coorToIndex(...neighbor, grid);
      cells[cell].mergeCell(cells[c]);
      x = neighbor[0];
      y = neighbor[1];
    }
  };
  loop();

  interval = setInterval(() => {
    paintCells(cells, ctx);
    loop();
  }, tick);
};

export default mazeVisualizer;
