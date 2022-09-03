import visualizer from "./visualizer.js";

const canvas = document.getElementById("playground");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// does not matter.
const countNearest = (v) => {
  const nearest = 10 ** ((v + "").length - 1);
  return v - (v % nearest);
};

visualizer(
  ctx,
  {
    canvas: {
      width: canvas.width,
      height: canvas.height,
    },
    grid: 50,
    tick: 0.0000001,
    cellColor: "#000",
    wallColor: "#000",
    visitedCellColor: "#fffb2b",
    startPoint: {
      x: Math.floor(Math.random() * 50),
      y: Math.floor(Math.random() * 50),
    },
  },
  (bool) => {
    if (bool) alert("completed");
  }
);
