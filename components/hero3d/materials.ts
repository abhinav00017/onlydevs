import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  type Texture,
} from "three";

/**
 * Physical materials for the devices. No texture files: the only map is a soft noise made in code,
 * which varies the roughness a little, like real anodised or bead-blasted metal.
 */

function smoothNoise(size: number, seed: number): Uint8Array {
  // Value noise on a coarse grid, smoothly interpolated, plus a fine grain. Tileable.
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const cells = 8;
  const grid = Array.from({ length: cells * cells }, rand);
  const at = (x: number, y: number) => grid[((y + cells) % cells) * cells + ((x + cells) % cells)];
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * cells;
      const gy = (y / size) * cells;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const fx = gx - x0;
      const fy = gy - y0;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const top = at(x0, y0) * (1 - ux) + at(x0 + 1, y0) * ux;
      const bottom = at(x0, y0 + 1) * (1 - ux) + at(x0 + 1, y0 + 1) * ux;
      const v = top * (1 - uy) + bottom * uy;
      const grain = rand();
      // 0.82 to 1.0 of the material's roughness.
      out[y * size + x] = Math.round(255 * (0.82 + 0.13 * v + 0.05 * grain));
    }
  }
  return out;
}

export function roughnessNoise(repeat: number, seed = 7): Texture {
  const size = 128;
  // Three reads roughness from the green channel, so the map is grey RGBA, not one channel.
  const n = smoothNoise(size, seed);
  const rgba = new Uint8Array(size * size * 4);
  for (let i = 0; i < n.length; i++) {
    rgba[i * 4] = n[i];
    rgba[i * 4 + 1] = n[i];
    rgba[i * 4 + 2] = n[i];
    rgba[i * 4 + 3] = 255;
  }
  const tex = new DataTexture(rgba, size, size);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

export type DeviceMaterials = ReturnType<typeof makeMaterials>;

export function makeMaterials() {
  const fine = roughnessNoise(3, 11);
  const coarse = roughnessNoise(1.2, 23);

  /** Laptop: bead-blasted silver aluminium. */
  const aluminium = new MeshPhysicalMaterial({
    color: "#c5c9ce",
    metalness: 1,
    roughness: 0.42,
    roughnessMap: coarse,
    envMapIntensity: 1,
  });

  /** Phone frame: satin graphite, lightly brushed (anisotropic), with a thin clear lacquer. */
  const frame = new MeshPhysicalMaterial({
    color: "#5d6268",
    metalness: 1,
    roughness: 0.3,
    roughnessMap: fine,
    anisotropy: 0.35,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
  });

  /** Dark cover glass: the bezel around the live screen and the phone's front. */
  const glass = new MeshPhysicalMaterial({
    color: "#040506",
    metalness: 0,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    ior: 1.52,
    specularIntensity: 1,
  });

  /** The reflection on the screen glass, over the live UI. See glassOverlay(). */
  const screenGlass = glassOverlay(0.42);

  /** Keyboard keys: soft-touch black. */
  const keys = new MeshStandardMaterial({ color: "#16171a", metalness: 0, roughness: 0.62 });

  /** Trackpad: smoother, slightly darker than the deck. */
  const trackpad = new MeshPhysicalMaterial({ color: "#b4b8bd", metalness: 1, roughness: 0.26, roughnessMap: fine, clearcoat: 0.3, clearcoatRoughness: 0.2 });

  /** Hinge, feet and camera rings. */
  const dark = new MeshPhysicalMaterial({ color: "#26282c", metalness: 0.6, roughness: 0.45 });

  const all = [aluminium, frame, glass, screenGlass, keys, trackpad, dark];
  return {
    aluminium,
    frame,
    glass,
    screenGlass,
    keys,
    trackpad,
    dark,
    dispose() {
      for (const m of all) m.dispose();
      fine.dispose();
      coarse.dispose();
    },
  };
}

/**
 * Cover glass over a live screen. The live UI is real DOM behind the canvas, so the glass cannot be opaque.
 * This is a clear-coated black physical material whose output keeps only the reflection:
 * colour is the reflected light, alpha is its brightness. Over the DOM it reads like light reflected on glass.
 */
export function glassOverlay(strength: number): MeshPhysicalMaterial {
  const m = new MeshPhysicalMaterial({
    color: "#000000",
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    ior: 1.52,
    transparent: true,
    depthWrite: false,
  });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
      float glareL = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b));
      gl_FragColor = vec4(gl_FragColor.rgb / max(glareL, 1e-4), clamp(glareL * ${strength.toFixed(3)}, 0.0, 0.55));`,
    );
  };
  m.customProgramCacheKey = () => `glass-overlay-${strength}`;
  return m;
}

/** Steps the laptop back into shadow while the phone is the hero: 0 is normal, 1 is darkest. */
export function dimLaptop(m: DeviceMaterials, dim: number) {
  m.aluminium.envMapIntensity = 1 - 0.45 * dim;
  m.trackpad.envMapIntensity = 1 - 0.45 * dim;
}
