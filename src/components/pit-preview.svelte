<script lang="ts">
  export let width: number = 3;
  export let depth: number = 3;
  export let height: number = 3;

  // Isometric projection constants
  const COS30 = Math.cos(Math.PI / 6);  // ≈ 0.866
  const SIN30 = 0.5;

  // Scale cell so the graphic fits a reasonable bounding box
  $: maxDim = Math.max(width, depth, height, 1);
  $: cell = Math.max(4, Math.min(24, 140 / maxDim));

  // Convert grid (x, y, z) → screen (sx, sy), origin at top-center
  function isoX(x: number, y: number): number {
    return (x - y) * cell * COS30;
  }
  function isoY(x: number, y: number, z: number): number {
    return (x + y) * cell * SIN30 - z * cell;
  }

  // Build cube face polygons for one block at grid position (gx, gy, gz)
  interface CubeFace {
    points: string;
    face: "top" | "left" | "right";
    key: string;
  }

  // Collect only the visible shell faces, painted back-to-front
  $: allFaces = (() => {
    const faces: CubeFace[] = [];
    const toPoints = (pts: [number, number, number][]): string =>
      pts.map(([x, y, z]) => `${isoX(x, y)},${isoY(x, y, z)}`).join(" ");

    // Top faces (gz = height - 1)
    for (let gy = 0; gy < depth; gy++) {
      for (let gx = 0; gx < width; gx++) {
        const gz = height - 1;
        faces.push({
          points: toPoints([[gx, gy, gz + 1], [gx + 1, gy, gz + 1], [gx + 1, gy + 1, gz + 1], [gx, gy + 1, gz + 1]]),
          face: "top",
          key: `t-${gx}-${gy}-${gz}`,
        });
      }
    }

    // Left faces (gy = depth - 1)
    for (let gz = 0; gz < height; gz++) {
      for (let gx = 0; gx < width; gx++) {
        const gy = depth - 1;
        faces.push({
          points: toPoints([[gx, gy + 1, gz + 1], [gx + 1, gy + 1, gz + 1], [gx + 1, gy + 1, gz], [gx, gy + 1, gz]]),
          face: "left",
          key: `l-${gx}-${gy}-${gz}`,
        });
      }
    }

    // Right faces (gx = width - 1)
    for (let gz = 0; gz < height; gz++) {
      for (let gy = 0; gy < depth; gy++) {
        const gx = width - 1;
        faces.push({
          points: toPoints([[gx + 1, gy, gz + 1], [gx + 1, gy + 1, gz + 1], [gx + 1, gy + 1, gz], [gx + 1, gy, gz]]),
          face: "right",
          key: `r-${gx}-${gy}-${gz}`,
        });
      }
    }

    return faces;
  })();

  // Compute SVG viewBox from actual bounding box of the isometric projection
  // Extremes: leftmost = isoX(0, depth), rightmost = isoX(width, 0)
  //           topmost  = isoY(0, 0, height), bottommost = isoY(width, depth, 0)
  $: minX = -depth * cell * COS30;
  $: maxX = width * cell * COS30;
  $: minY = -height * cell;
  $: maxY = (width + depth) * cell * SIN30;
  $: padX = 20;
  $: padY = 16;
  $: vbX = minX - padX;
  $: vbY = minY - padY;
  $: vbW = (maxX - minX) + padX * 2;
  $: vbH = (maxY - minY) + padY * 2;
</script>

<div class="pit-preview" aria-label="Charcoal pit: {width}×{depth}×{height} blocks">
  <div class="preview-stage">
    <svg
      viewBox="{vbX} {vbY} {vbW} {vbH}"
      preserveAspectRatio="xMidYMid meet"
      class="voxel-svg"
      role="img"
      aria-label="{width} wide, {depth} deep, {height} high"
    >
      {#each allFaces as f (f.key)}
        <polygon class="voxel-face voxel-{f.face}" points={f.points} />
      {/each}
    </svg>
  </div>
  <div class="dim-badges">
    <span class="dim-badge">{width}W</span>
    <span class="dim-sep">×</span>
    <span class="dim-badge">{depth}D</span>
    <span class="dim-sep">×</span>
    <span class="dim-badge">{height}H</span>
  </div>
</div>

<style>
  .pit-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(0.5rem * var(--ui-scale, 1));
    width: 100%;
  }

  .preview-stage {
    width: 100%;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .voxel-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .voxel-face {
    stroke: var(--border-color, #ccc);
    stroke-width: 0.5;
    vector-effect: non-scaling-stroke;
  }

  .voxel-top {
    fill: var(--primary-light, #4f7a57);
    fill-opacity: 0.5;
  }

  .voxel-left {
    fill: var(--primary-color, #335f3b);
    fill-opacity: 0.7;
  }

  .voxel-right {
    fill: var(--primary-dark, #1b3a20);
    fill-opacity: 0.8;
  }

  .dim-badges {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }

  .dim-badge {
    font-family: var(--font-display, sans-serif);
    font-weight: 600;
    font-size: calc(0.85rem * var(--ui-scale, 1));
    color: var(--text-secondary, #666);
    background: var(--surface-muted, rgba(0,0,0,0.05));
    padding: 0.15em 0.55em;
    border-radius: 4px;
  }

  .dim-sep {
    color: var(--text-secondary, #666);
    font-size: 0.75rem;
  }
</style>
