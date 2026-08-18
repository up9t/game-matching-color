<script setup lang="ts">
import { onMounted, ref } from "vue";

type Position = {
  positionX: number | null | undefined;
  positionY: number | null | undefined;
};

type Previous = {
  selectedColor: number | undefined | null;
  clickedIndex: number | undefined | null;
};

const canvasElement = ref<HTMLCanvasElement | null>(null);

const TILE_SIZE: number = 4;
const BLOCK_SIZE: number = 100;
const SPACE_BEETWEEN_BLOCK: number = 5;
const COLORS: Array<string> = [];
const POSITION_AVAILABLE: Array<number | null> = [];

const CLICK: Position = {
  positionX: undefined,
  positionY: undefined,
};

const PREVIOUS: Previous = {
  selectedColor: undefined,
  clickedIndex: undefined,
};

let requestAnimationFrameID: null | number = null;

function Start(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  clearCanvas(canvas, context);

  if (checkWin(POSITION_AVAILABLE)) {
    insertText(canvas, context, "You Win!");

    if (requestAnimationFrameID !== null) {
      cancelAnimationFrame(requestAnimationFrameID);
      return;
    }
  }

  POSITION_AVAILABLE.forEach((position: number | null, index: number) => {
    const [x, y] = [
      (index % TILE_SIZE) * (BLOCK_SIZE + SPACE_BEETWEEN_BLOCK),
      Math.floor(index / TILE_SIZE) * (BLOCK_SIZE + SPACE_BEETWEEN_BLOCK),
    ];
    if (isClickedBetween(canvas, x, y)) {
      if (isColorPicked()) {
        if (isColorMatch(index, position)) {
          if (typeof PREVIOUS.clickedIndex === "number") {
            POSITION_AVAILABLE[PREVIOUS.clickedIndex] = null;
          }
          POSITION_AVAILABLE[index] = null;
        }
        PREVIOUS.clickedIndex = null;
        PREVIOUS.selectedColor = null;
      } else if (!isValidColorPicked(position)) {
        PREVIOUS.clickedIndex = null;
        PREVIOUS.selectedColor = null;
      } else {
        PREVIOUS.clickedIndex = index;
        PREVIOUS.selectedColor = position;
      }
      CLICK.positionX = null;
      CLICK.positionY = null;
    }
    context.fillStyle = typeof position === "number" ? (COLORS[position] as string) : "transparent";
    context.globalAlpha = PREVIOUS.clickedIndex === index ? 0.7 : 1;
    context.lineWidth = PREVIOUS.clickedIndex === index ? 10 : 1;
    context.beginPath();
    context.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    context.fill();
    context.stroke();
    context.closePath();
  });

  requestAnimationFrameID = requestAnimationFrame(() => Start(canvas, context));
}

function isColorMatch(index: number, position: number | null): boolean {
  return (
    typeof PREVIOUS.clickedIndex === "number" &&
    PREVIOUS.clickedIndex !== index &&
    PREVIOUS.selectedColor === position
  );
}
function isColorPicked(): boolean {
  return typeof PREVIOUS.clickedIndex === "number";
}

function isValidColorPicked(position: number | null): position is number {
  return typeof position === "number";
}

function isClickedBetween(canvas: HTMLCanvasElement, x: number, y: number): boolean {
  const [OFFSET_X, OFFSET_Y] = [
    window.innerWidth / 2 - canvas.width / 2,
    window.innerHeight / 2 - canvas.height / 2,
  ];
  const isBetweenXPosition: boolean = !CLICK.positionX
    ? false
    : CLICK.positionX >= x + OFFSET_X && CLICK.positionX <= x + BLOCK_SIZE + OFFSET_X;
  const isBetweenYPosition: boolean = !CLICK.positionY
    ? false
    : CLICK.positionY >= y + OFFSET_Y && CLICK.positionY <= y + BLOCK_SIZE + OFFSET_Y;
  return isBetweenXPosition && isBetweenYPosition;
}

function insertText(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  text: string,
): TextMetrics {
  context.font = "50px Arial";
  context.fillStyle = "white";
  const measureText = context.measureText(text);
  context.fillText(
    text,
    canvas.width / 2 - measureText.width / 2,
    canvas.height / 2 + measureText.actualBoundingBoxAscent / 2,
  );
  return measureText;
}

function randomize(position: Array<number | null>): void {
  for (let index = 0; index < position.length - 1; index++) {
    const victim: number = getRandomIntN(index, position.length - 1);
    const victimPosition = position[victim];
    const prevPosition = position[index];

    if (typeof prevPosition === "number") {
      position.splice(victim, 1, prevPosition);
    }

    if (typeof victimPosition === "number") {
      position.splice(index, 1, victimPosition);
    }
  }
}

function getRandomIntN(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

function clearCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function checkWin(blocks: Array<number | null>): boolean {
  return blocks.every((block) => typeof block !== "number");
}
onMounted(() => {
  const canvas = canvasElement.value;

  if (!canvas) {
    throw new Error("canvas element is undefined");
  }

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("failed to retrieve context from canvas");
  }

  canvas.width = TILE_SIZE * BLOCK_SIZE + SPACE_BEETWEEN_BLOCK * TILE_SIZE - 1;
  canvas.height = TILE_SIZE * BLOCK_SIZE + SPACE_BEETWEEN_BLOCK * TILE_SIZE - 1;

  addEventListener("click", (): void => {
    PREVIOUS.selectedColor = null;
    PREVIOUS.clickedIndex = null;
  });

  canvas.addEventListener("click", (event: MouseEvent): void => {
    event.stopPropagation();

    CLICK.positionX = event.clientX;
    CLICK.positionY = event.clientY;
  });

  Start(canvas, context);

  for (let i = 0; i < TILE_SIZE ** 2 / 2; i++) {
    POSITION_AVAILABLE.push(i, i);

    const [red, green, blue] = [
      getRandomIntN(0, 255),
      getRandomIntN(0, 255),
      getRandomIntN(0, 255),
    ];
    const color = `rgb(${red}, ${green}, ${blue})`;
    COLORS.push(color);
  }

  randomize(POSITION_AVAILABLE);
});
</script>

<template>
  <canvas ref="canvasElement"></canvas>
</template>

<style scoped></style>
