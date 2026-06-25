import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

/*
 * Cosmic Dust — Monochrome Edition.
 * React-optimized: strips out empty render passes and applies
 * bloom strictly to isolated particles before background composition.
 */

// ---- Tunable look (Monochrome / Silver Theme) -------------------------------
const VOID_COLOR = '#050505'    // Deep near-black void
const FLAME_A = '#333333'       // Dark gray flames
const FLAME_B = '#888888'       // Silver/mid-gray flames
const FLAME_AMOUNT = 0.2        // Corner flame intensity
const DUST_DIM = '#777777'      // Cooler/dimmer motes (vibrant gray)
const DUST_BRIGHT = '#ffffff'   // Warmer/brighter motes (pure white)
const DUST_ALPHA = 0.68         // Target opacity after the initial fade-in
const FIELD_DEPTH = 3.7         // Field half-size — larger spreads motes deeper
const DRIFT_SPEED = 0.4         // Camera-driven drift speed multiplier
const FADE_MS = 2200            // Gentle fade-up duration on mount

// ---- Performance tiers ------------------------------------------------------
type Tier = 'low' | 'mid' | 'high'

interface TierParams {
  count: number
  dprCap: number
  bloom: boolean
}

const TIERS: Record<Tier, TierParams> = {
  low: { count: 280, dprCap: 1, bloom: false },
  mid: { count: 620, dprCap: 1.5, bloom: false },
  high: { count: 1200, dprCap: 2, bloom: true },
}

function detectTier(): Tier {
  const nav = navigator as Navigator & {
    hardwareConcurrency?: number
    deviceMemory?: number
  }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(nav.userAgent ?? '')
  const coarse = window.matchMedia('(pointer: coarse)').matches

  let score = 0
  if (cores >= 8) score += 2
  else if (cores >= 4) score += 1
  if (memory >= 8) score += 2
  else if (memory >= 4) score += 1
  if (!mobile && !coarse) score += 1

  if (score >= 4 && !mobile) return 'high'
  if (score >= 2) return 'mid'
  return 'low'
}

function hexToVec3(hex: string): THREE.Vector3 {
  const n = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

// ---- Shaders ----------------------------------------------------------------
const POINT_VERTEX = /* glsl */ `
attribute float size;
uniform float iTime;
uniform vec3 iShift;
uniform vec2 iResolution;
uniform vec3 iAnimation;
uniform float uDepth;
varying float transparency;
varying float warmness;
vec3 warp3d(vec3 pos, float t) {
  float curv = 0.9, a = 1.9, b = 0.25, b2 = 0.03, c = 0.02;
  pos *= 2.;
  pos.x += curv * sin(c * t + a * pos.y) + t * b2;
  pos.y += curv * cos(c * t + a * pos.x);
  pos.z += curv * cos(c * t + a * pos.y);
  pos.z += curv * sin(c * t + a * pos.x) + t * b;
  pos.z = abs(pos.z);
  return pos.xyz;
}
void main() {
  vec3 v = warp3d(position, iTime);
  v = uDepth * (2. * fract(v + iShift) - 1.) + iAnimation;
  vec4 vpos = modelViewMatrix * vec4(v, 1.);
  transparency = step(length(v), uDepth);
  warmness = step(.75, fract(size * 7.13));
  // Caps maximum point size so particles don't turn into giant blurry blobs near the camera
  gl_PointSize = min(size * iResolution.y / 1000. / -vpos.z, 20.);
  gl_Position = projectionMatrix * vpos;
}
`

const POINT_FRAGMENT = /* glsl */ `
varying float transparency; varying float warmness;
uniform float iAlpha; uniform vec3 uCool; uniform vec3 uWarm;
void main() {
  vec3 color = mix(uCool * .8, uWarm * .8, warmness);
  float tex = smoothstep(1., .3, length(2. * gl_PointCoord - 1.));
  gl_FragColor = vec4(tex * color, tex * transparency * iAlpha);
}
`

// Final Composite: Dark void + Edge flames + High-frequency dithering
const FINAL_FRAGMENT = /* glsl */ `
uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
varying vec2 vUv;
vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
  pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
  pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
  pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
  return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
void main(){
  vec2 uv = 2.*vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
  vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
  flame *= smoothstep(0.25, 1., abs(uv.y));
  float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
  vec3 bg = uBg * (1.0 - 0.4 * length(uv));
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  
  // Composite all rendering layers
  vec3 finalColor = bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo;
  
  // High-frequency pseudo-random dithering to nuke color banding in the dark gradient
  float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  finalColor += (noise - 0.5) / 255.0;
  
  gl_FragColor = vec4(finalColor, 1.);
}
`

const FINAL_VERTEX = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`

export default function CosmicDustBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tier = TIERS[detectTier()]

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    const dpr = Math.min(window.devicePixelRatio || 1, tier.dprCap)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 1)
    renderer.domElement.className = 'cosmic-dust-canvas'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(0x000000, 0, 22)

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80)
    camera.position.set(0, 0, 3)
    scene.add(camera)

    // 1x1 black data texture to replace useless render targets and save GPU memory
    const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat)
    black.needsUpdate = true

    // ---- Dust geometry ----
    const positions: number[] = []
    const sizes: number[] = []
    for (let i = 0; i < tier.count; i++) {
      positions.push(2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1)
      sizes.push(25 + 25 * Math.random()) // Scaled up according to the original prompt constraints
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    const uniforms: Record<string, THREE.IUniform> = {
      iTime: { value: 0 },
      iShift: { value: new THREE.Vector3() },
      iAlpha: { value: 0 },
      iAnimation: { value: new THREE.Vector3(0, 0, 0) },
      iResolution: {
        value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr),
      },
      uDepth: { value: FIELD_DEPTH },
      uCool: { value: hexToVec3(DUST_DIM) },
      uWarm: { value: hexToVec3(DUST_BRIGHT) },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      transparent: true,
      depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    points.position.set(0, 0, -1)
    scene.add(points)

    // ---- Post-Processing Pipeline ----
    const finalShader = {
      uniforms: {
        iTime: { value: 0 },
        tDiffuse: { value: null },
        torusTexture: { value: black },
        bloomTexture: { value: black },
        haloTexture: { value: black },
        uBg: { value: hexToVec3(VOID_COLOR) },
        uFlameA: { value: hexToVec3(FLAME_A) },
        uFlameB: { value: hexToVec3(FLAME_B) },
        uFlameAmt: { value: FLAME_AMOUNT },
      },
      vertexShader: FINAL_VERTEX,
      fragmentShader: FINAL_FRAGMENT,
    }

    const composer = new EffectComposer(renderer)
    
    // Step 1: Render purely the dust particles against an absolute black void
    composer.addPass(new RenderPass(scene, camera))

    // Step 2: Conditionally apply Bloom, affecting ONLY the bright particles
    let bloomPass: UnrealBloomPass | null = null
    if (tier.bloom) {
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5, // strength (increased to match original prompt)
        0.7, // radius
        0.0, // threshold
      )
      composer.addPass(bloomPass)
    }

    // Step 3: Apply the final shader pass that merges the void background and edge flames
    const finalPass = new ShaderPass(finalShader)
    composer.addPass(finalPass)

    // ---- Sizing ----
    const setSize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, tier.dprCap)
      renderer.setPixelRatio(ratio)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      composer.setPixelRatio(ratio)
      composer.setSize(w, h)
      bloomPass?.setSize(w, h)
      ;(uniforms.iResolution.value as THREE.Vector2).set(w * ratio, h * ratio)
    }
    setSize()

    // ---- Animation ----
    const driftStep = camera.position.clone().multiplyScalar(0.0022 * DRIFT_SPEED)
    const start = performance.now()
    let raf = 0

    const renderFrame = (now: number) => {
      const t = now / 1000
      uniforms.iTime.value = t
      finalPass.uniforms.iTime.value = t
      ;(uniforms.iShift.value as THREE.Vector3).add(driftStep)
      const p = Math.min((now - start) / FADE_MS, 1)
      const eased = p * p * p * (p * (p * 6 - 15) + 10) // smootherstep easing
      uniforms.iAlpha.value = eased * DUST_ALPHA
      composer.render()
    }

    const loop = (now: number) => {
      renderFrame(now)
      raf = requestAnimationFrame(loop)
    }

    if (reducedMotion) {
      uniforms.iAlpha.value = DUST_ALPHA
      composer.render()
    } else {
      raf = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      if (reducedMotion) return
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        raf = requestAnimationFrame(loop)
      }
    }

    window.addEventListener('resize', setSize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', setSize)
      document.removeEventListener('visibilitychange', onVisibility)
      composer.dispose()
      bloomPass?.dispose()
      geometry.dispose()
      material.dispose()
      black.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className="cosmic-dust" aria-hidden="true" style={{ width: '100%', height: '100%' }} />
}