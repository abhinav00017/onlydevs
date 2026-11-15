import { ExtrudeGeometry, Shape, ShapeGeometry, type BufferGeometry } from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Procedural device geometry. Units: 1 = 10 cm.
 * Corners are squircles (continuous curvature), like real devices, not plain quarter circles.
 * Edges get a tight bevel, so faces stay flat and sharp while the edges catch soft highlights.
 */

/** A rounded rectangle centred on the origin, with superellipse corners (exponent 3.2: between a circle and a square). */
export function squircleRect(width: number, height: number, radius: number, steps = 14): Shape {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);
  const n = 3.2;
  const s = new Shape();
  const corner = (cx: number, cy: number, from: number) => {
    for (let i = 0; i <= steps; i++) {
      const t = from + (i / steps) * (Math.PI / 2);
      const c = Math.cos(t);
      const sn = Math.sin(t);
      const x = cx + r * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
      const y = cy + r * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / n);
      if (i === 0 && from === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
  };
  corner(w - r, h - r, 0); // top right
  corner(-w + r, h - r, Math.PI / 2); // top left
  corner(-w + r, -h + r, Math.PI); // bottom left
  corner(w - r, -h + r, (3 * Math.PI) / 2); // bottom right
  s.closePath();
  return s;
}

/**
 * A slab: a squircle-cornered rectangle, extruded along z, centred on the origin, with a rounded bevel.
 * `bevel` is the edge radius. The front face is at z = depth / 2.
 */
export function slab(width: number, height: number, depth: number, radius: number, bevel: number, bevelSegments = 6): BufferGeometry {
  const b = Math.min(bevel, depth / 2 - 1e-4);
  const shape = squircleRect(width - 2 * b, height - 2 * b, Math.max(radius - b, 1e-3));
  const geo = new ExtrudeGeometry(shape, {
    depth: Math.max(depth - 2 * b, 1e-4),
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments,
    curveSegments: 1,
  });
  geo.translate(0, 0, -(depth - 2 * b) / 2);
  // Smooth across the bevel and the rounded corners, keep a crease where faces meet at hard angles.
  const smooth = toCreasedNormals(geo, 0.6);
  geo.dispose();
  smooth.computeBoundingBox();
  return smooth;
}

/** A flat squircle panel in the XY plane, for screens and the occlusion hole behind the live UI. */
export function panel(width: number, height: number, radius: number): ShapeGeometry {
  return new ShapeGeometry(squircleRect(width, height, radius), 1);
}
