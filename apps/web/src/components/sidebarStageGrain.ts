const TILE_WIDTH = 768;
const SAMPLE_STEP = 24;
const TAU = Math.PI * 2;

const CATHEDRAL_ARCHES = [
  { x: 244, y: 40, amplitude: 21, width: 62, spread: 30 },
  { x: 500, y: 58, amplitude: 18, width: 74, spread: 30 },
  { x: 690, y: 30, amplitude: 16, width: 52, spread: 26 },
];

type Point = readonly [x: number, y: number];

function round(value: number) {
  return Number(value.toFixed(1));
}

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function wrappedDistance(x: number, center: number) {
  const half = TILE_WIDTH / 2;
  return ((((x - center + half) % TILE_WIDTH) + TILE_WIDTH) % TILE_WIDTH) - half;
}

// Every term has a whole number of periods per tile, so lines leave a tile where they enter the next.
function grainY(x: number, baseY: number) {
  const angle = (x / TILE_WIDTH) * TAU;
  let y =
    baseY +
    4.6 * Math.sin(angle + 1.2 + baseY * 0.012) +
    2.2 * Math.sin(2 * angle + 0.4 + baseY * 0.02) +
    Math.sin(5 * angle + 2 + baseY * 0.03);
  for (const arch of CATHEDRAL_ARCHES) {
    const alongGrain = Math.exp(-((wrappedDistance(x, arch.x) / arch.width) ** 2));
    const acrossGrain = Math.exp(-(((baseY - arch.y) / arch.spread) ** 2));
    y -= arch.amplitude * alongGrain * acrossGrain;
  }
  return y;
}

function smoothSegments(points: ReadonlyArray<Point>) {
  let path = "";
  for (let index = 1; index < points.length - 1; index += 1) {
    const [x, y] = points[index]!;
    const [nextX, nextY] = points[index + 1]!;
    path += `Q${round(x)} ${round(y)} ${round((x + nextX) / 2)} ${round((y + nextY) / 2)}`;
  }
  const [lastX, lastY] = points[points.length - 1]!;
  return `${path}L${round(lastX)} ${round(lastY)}`;
}

function buildStageGrain() {
  const random = createRandom(7);
  const sampleXs: number[] = [];
  for (let x = -SAMPLE_STEP * 2; x <= TILE_WIDTH + SAMPLE_STEP * 2; x += SAMPLE_STEP) {
    sampleXs.push(x);
  }
  const hairlines: Array<{ baseY: number; path: string; opacity: number }> = [];
  const darkStreaks: Array<{ baseY: number; path: string; opacity: number }> = [];
  const lightStreaks: Array<{ baseY: number; path: string; opacity: number }> = [];

  for (let baseY = -24; baseY < 96; baseY += 2.4 + random() * 4.4) {
    const kind = random();
    const top = sampleXs.map((x): Point => [x, grainY(x, baseY)]);
    const [topX, topY] = top[0]!;
    const edge = `M${round(topX)} ${round(topY)}${smoothSegments(top)}`;
    hairlines.push({ baseY, path: edge, opacity: Number((0.05 + random() * 0.1).toFixed(2)) });

    const waves = 1 + Math.floor(random() * 3);
    const phase = random() * TAU;
    const maxWidth = baseY > 34 ? 0.5 + random() * 1.4 : 0.5 + random() * 2.8;
    const bottom = sampleXs
      .map((x): Point => {
        const swell = 0.5 + 0.5 * Math.sin((x / TILE_WIDTH) * TAU * waves + phase);
        return [x, grainY(x, baseY) + maxWidth * (0.15 + 0.85 * swell)];
      })
      .reverse();
    const [bottomX, bottomY] = bottom[0]!;
    const ribbon = `${edge}L${round(bottomX)} ${round(bottomY)}${smoothSegments(bottom)}Z`;
    if (kind < 0.52) {
      darkStreaks.push({ baseY, path: ribbon, opacity: round((0.28 + random() * 0.34) * 10) / 10 });
    } else if (kind > 0.86) {
      lightStreaks.push({ baseY, path: ribbon, opacity: round((0.08 + random() * 0.1) * 10) / 10 });
    }
  }

  let pores = "";
  for (let index = 0; index < 170; index += 1) {
    const x = 6 + random() * (TILE_WIDTH - 14);
    const baseY = -6 + random() * 90;
    const length = 2 + random() * 5;
    const startY = grainY(x, baseY);
    const endY = grainY(x + length, baseY);
    pores += `M${round(x)} ${round(startY)}l${round(length)} ${round(endY - startY)}`;
  }

  return { tileWidth: TILE_WIDTH, hairlines, darkStreaks, lightStreaks, pores };
}

let stageGrain: ReturnType<typeof buildStageGrain> | null = null;

// Built on first paint because Latest never shows stage art.
export function getStageGrain() {
  stageGrain ??= buildStageGrain();
  return stageGrain;
}
