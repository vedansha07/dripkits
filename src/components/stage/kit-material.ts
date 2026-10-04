// The jersey's cloth material: the same physical knit as the catalogue renders (sheen, knit bump,
// darker inside), plus the print pass. Switching kits runs a scan line up the shirt; below the
// line the new kit is already printed, sublimation style.

import * as THREE from "three";

export type KitMaterial = THREE.MeshPhysicalMaterial & {
  userData: {
    uniforms: {
      uMap2: { value: THREE.Texture | null };
      uMix: { value: number };
      uScanColor: { value: THREE.Color };
      uBounds: { value: THREE.Vector2 };
    };
  };
};

export function createKitMaterial(map: THREE.Texture, bump: THREE.Texture, bounds: [number, number]): KitMaterial {
  const uniforms = {
    uMap2: { value: map as THREE.Texture | null },
    uMix: { value: 0 },
    uScanColor: { value: new THREE.Color("#ffffff") },
    uBounds: { value: new THREE.Vector2(...bounds) },
  };
  const m = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap: bump,
    bumpScale: 0.35,
    roughness: 0.58,
    metalness: 0,
    sheen: 0.5,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color("#ffffff"),
    side: THREE.DoubleSide,
  }) as KitMaterial;
  m.userData.uniforms = uniforms;

  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform vec2 uBounds;\nvarying float vScanY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvScanY = (position.y - uBounds.x) / (uBounds.y - uBounds.x);");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D uMap2;\nuniform float uMix;\nuniform vec3 uScanColor;\nvarying float vScanY;",
      )
      .replace(
        "#include <map_fragment>",
        `float scanLine = 0.0;
#ifdef USE_MAP
  vec4 kitA = texture2D( map, vMapUv );
  vec4 kitB = texture2D( uMap2, vMapUv );
  float scanY = uMix * 1.16 - 0.08;
  float printed = 1.0 - smoothstep( scanY - 0.003, scanY + 0.003, vScanY );
  diffuseColor *= mix( kitA, kitB, printed );
  scanLine = ( 1.0 - smoothstep( 0.0, 0.02, abs( vScanY - scanY ) ) ) * step( 0.0005, uMix ) * step( uMix, 0.9995 );
#endif`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uScanColor * scanLine * 1.8;",
      )
      // the inside of a garment is in its own shade, as in a ghost-mannequin shot
      .replace("#include <opaque_fragment>", "if (!gl_FrontFacing) outgoingLight *= 0.42;\n#include <opaque_fragment>");
  };
  m.customProgramCacheKey = () => "dripkits-kit-v1";
  return m;
}

const atlasCache = new Map<string, Promise<THREE.Texture>>();
// raw pixels: no premultiply and no colour conversion, so the GPU upload is a straight copy (the
// default premultiplied bitmap costs a CPU conversion pass on every 2048 px upload)
const loader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: "none", premultiplyAlpha: "none", colorSpaceConversion: "none" });

/** Loads a kit atlas once. glTF texture space, so flipY stays false (ImageBitmaps cannot flip). */
export function loadAtlas(url: string, anisotropy: number): Promise<THREE.Texture> {
  let p = atlasCache.get(url);
  if (!p) {
    p = loader.loadAsync(url).then((bitmap) => {
      const t = new THREE.Texture(bitmap as ImageBitmap);
      t.flipY = false;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = anisotropy;
      t.needsUpdate = true;
      return t;
    });
    atlasCache.set(url, p);
    p.catch(() => atlasCache.delete(url));
  }
  return p;
}

/** The knit tile, one repeat per 6 mm of cloth (the atlas spans 4096 px at 2600 px per metre). */
export function loadKnit(): Promise<THREE.Texture> {
  return loader.loadAsync("/kits/knit.webp").then((bitmap) => {
    const t = new THREE.Texture(bitmap as ImageBitmap);
    t.flipY = false;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    const span = 4096 / 2600;
    t.repeat.set(span / 0.006, span / 0.006);
    t.needsUpdate = true;
    return t;
  });
}
