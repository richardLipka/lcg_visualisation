/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Grid, Center, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RotateCcw, 
  Info, 
  Layers, 
  Zap, 
  Box, 
  RefreshCw,
  Trash2,
  Globe,
  Shuffle
} from 'lucide-react';
import { translations, Language } from './i18n';

// --- Types ---

interface LCGParams {
  a: string;
  c: string;
  m: string;
  seed: string;
}

interface Point3D {
  id: number;
  x: number;
  y: number;
  z: number;
}

interface SpectralResult {
  distance: number;
  normal: [number, number, number];
  u: [number, number, number];
  planes: number;
  minK: number;
  maxK: number;
}

// --- Constants & Presets ---

const PRESETS: Record<string, { name: string; params: LCGParams; description: string }> = {
  randu: {
    name: "IBM RANDU (Infamous)",
    params: {
      a: "65539",
      c: "0",
      m: "2147483648",
      seed: "1"
    },
    description: "The classic example of a bad LCG. In 3D, all points fall onto just 15 planes."
  },
  glibc: {
    name: "glibc (Standard)",
    params: {
      a: "1103515245",
      c: "12345",
      m: "2147483648",
      seed: "1"
    },
    description: "A more modern LCG used in many Unix systems. Much better distribution."
  },
  msvc: {
    name: "MS Visual C++",
    params: {
      a: "214013",
      c: "2531011",
      m: "2147483648",
      seed: "1"
    },
    description: "Used in older Windows environments. Decent but still has lattice structures."
  },
  minimal: {
    name: "Tiny LCG (Educational)",
    params: {
      a: "3",
      c: "0",
      m: "31",
      seed: "1"
    },
    description: "A very small generator to easily see the repeating cycle and lattice."
  },
  tinyA: {
    name: "Tiny A (10 Planes)",
    params: {
      a: "31",
      c: "0",
      m: "1000",
      seed: "1"
    },
    description: "m=1000, a=31. Clear lattice with approximately 10 planes."
  },
  tinyB: {
    name: "Tiny B (8 Planes)",
    params: {
      a: "9",
      c: "0",
      m: "128",
      seed: "1"
    },
    description: "m=128, a=9. Small power-of-two modulus with 8 planes."
  },
  tinyC: {
    name: "Tiny C (16 Planes)",
    params: {
      a: "13",
      c: "0",
      m: "256",
      seed: "1"
    },
    description: "m=256, a=13. Demonstrates lattice in a standard 8-bit range."
  },
  tinyD: {
    name: "Tiny D (12 Planes)",
    params: {
      a: "21",
      c: "0",
      m: "512",
      seed: "1"
    },
    description: "m=512, a=21. Another example of structured randomness."
  }
};

// --- Components ---

const PointCloud = ({ points, spectralResult, selectedPlane }: { points: Point3D[], spectralResult: SpectralResult | null, selectedPlane: number | null }) => {
  const { backgroundPoints, highlightedPoints } = useMemo(() => {
    if (!spectralResult || selectedPlane === null) {
      const pos = new Float32Array(points.length * 3);
      points.forEach((p, i) => {
        pos[i * 3] = p.x - 0.5;
        pos[i * 3 + 1] = p.y - 0.5;
        pos[i * 3 + 2] = p.z - 0.5;
      });
      return { backgroundPoints: pos, highlightedPoints: new Float32Array(0) };
    }

    const bgPos: number[] = [];
    const hlPos: number[] = [];
    
    const normal = new THREE.Vector3(...spectralResult.normal);
    const nu = Math.sqrt(spectralResult.u[0]**2 + spectralResult.u[1]**2 + spectralResult.u[2]**2);
    const sumU = spectralResult.u[0] + spectralResult.u[1] + spectralResult.u[2];

    points.forEach((p) => {
      const vx = p.x - 0.5;
      const vy = p.y - 0.5;
      const vz = p.z - 0.5;
      
      const k = Math.round(new THREE.Vector3(vx, vy, vz).dot(normal) * nu + 0.5 * sumU);
      
      if (k === selectedPlane) {
        hlPos.push(vx, vy, vz);
      } else {
        bgPos.push(vx, vy, vz);
      }
    });

    return { 
      backgroundPoints: new Float32Array(bgPos), 
      highlightedPoints: new Float32Array(hlPos) 
    };
  }, [points, spectralResult, selectedPlane]);

  if (points.length === 0) return null;

  return (
    <group key={`points-${points.length}-${selectedPlane}`}>
      {/* Background/Normal Points */}
      {backgroundPoints.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={backgroundPoints.length / 3}
              array={backgroundPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={selectedPlane !== null ? 3 : 4} 
            color={selectedPlane !== null ? "#cbd5e1" : "#2563eb"}
            transparent 
            opacity={selectedPlane !== null ? 0.2 : 1} 
            sizeAttenuation={false}
            depthWrite={false}
          />
        </points>
      )}

      {/* Highlighted Points */}
      {highlightedPoints.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={highlightedPoints.length / 3}
              array={highlightedPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={6} 
            color="#1e3a8a" // Darker blue (blue-900)
            transparent 
            opacity={1} 
            sizeAttenuation={false}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};

const BoundingBox = () => (
  <group>
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
      <lineBasicMaterial color="#94a3b8" transparent opacity={0.3} />
    </lineSegments>
    <Grid 
      infiniteGrid 
      fadeDistance={10} 
      fadeStrength={5} 
      cellSize={0.1} 
      sectionSize={0.5} 
      sectionColor="#3b82f6" 
      cellColor="#94a3b8" 
      position={[0, -0.5, 0]}
    />
  </group>
);

const Planes = ({ result, selectedPlane }: { result: SpectralResult, selectedPlane: number | null }) => {
  const { u, normal, minK, maxK } = result;
  
  const planeCount = maxK - minK;
  
  // Limit rendering to avoid performance issues
  const step = Math.max(1, Math.ceil(planeCount / 50));
  
  const normalVec = useMemo(() => new THREE.Vector3(...normal), [normal]);
  const sumU = useMemo(() => u[0] + u[1] + u[2], [u]);
  const nu = useMemo(() => Math.sqrt(u[0]*u[0] + u[1]*u[1] + u[2]*u[2]), [u]);

  const planeElements = useMemo(() => {
    const elements = [];
    for (let k = minK; k <= maxK; k += step) {
      const isSelected = selectedPlane === k;
      const offset = (k - 0.5 * sumU) / nu;
      
      elements.push(
        <mesh 
          key={k} 
          position={normalVec.clone().multiplyScalar(offset)} 
          quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec)}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial 
            color={isSelected ? "#1e40af" : "#6366f1"} 
            transparent 
            opacity={isSelected ? 0.4 : 0.1} 
            side={THREE.DoubleSide} 
            depthWrite={false}
          />
        </mesh>
      );
    }

    // Always ensure the selected plane is rendered if it's not on a step
    if (selectedPlane !== null && (selectedPlane - minK) % step !== 0) {
      const offset = (selectedPlane - 0.5 * sumU) / nu;
      elements.push(
        <mesh 
          key="selected" 
          position={normalVec.clone().multiplyScalar(offset)} 
          quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec)}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial 
            color="#2563eb" 
            transparent 
            opacity={0.4} 
            side={THREE.DoubleSide} 
            depthWrite={false}
          />
        </mesh>
      );
    }

    return elements;
  }, [minK, maxK, sumU, nu, normalVec, step, selectedPlane]);

  return <group>{planeElements}</group>;
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [params, setParams] = useState<LCGParams>(PRESETS.randu.params);
  const [points, setPoints] = useState<Point3D[]>([]);
  const [currentSeed, setCurrentSeed] = useState<string>(PRESETS.randu.params.seed);
  const [showFormula, setShowFormula] = useState(true);
  const [activePreset, setActivePreset] = useState<string>("randu");

  const [autoRotate, setAutoRotate] = useState(false);
  const [spectralResult, setSpectralResult] = useState<SpectralResult | null>(null);
  const [selectedPlane, setSelectedPlane] = useState<number | null>(null);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const shuffleState = useRef<{ v: bigint[], y: bigint } | null>(null);

  const performSpectralTest = useCallback(() => {
    const a = BigInt(params.a);
    const m = BigInt(params.m);
    
    // Basis for dual lattice L*
    // u1 + a*u2 + a^2*u3 = k*m
    // We use BigInt for precision during reduction
    let b1 = [m, 0n, 0n];
    let b2 = [-a, 1n, 0n];
    // a^2 can exceed 2^64, so we must be careful with BigInt
    let b3 = [-(a * a % m), 0n, 1n];

    const dot = (v1: bigint[], v2: bigint[]) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const lengthSq = (v: bigint[]) => dot(v, v);

    let basis = [b1, b2, b3];
    let changed = true;
    let iterations = 0;
    
    // Simple lattice reduction (Size reduction)
    while (changed && iterations < 1000) {
      changed = false;
      iterations++;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i === j) continue;
          const d_ij = dot(basis[i], basis[j]);
          const d_jj = dot(basis[j], basis[j]);
          if (d_jj === 0n) continue;
          
          // k = round(d_ij / d_jj)
          const k = (2n * d_ij + (d_ij > 0n ? d_jj : -d_jj)) / (2n * d_jj);
          
          if (k !== 0n) {
            basis[i] = [
              basis[i][0] - k * basis[j][0],
              basis[i][1] - k * basis[j][1],
              basis[i][2] - k * basis[j][2]
            ];
            changed = true;
          }
        }
      }
      // Sort by length to help convergence
      basis.sort((v1, v2) => Number(lengthSq(v1) - lengthSq(v2)));
    }

    // Shortest vector is basis[0] (after sorting)
    let shortest = basis[0];
    let minLenSq = lengthSq(shortest);
    
    // Ensure we didn't get a zero vector
    if (minLenSq === 0n) {
      shortest = basis[1];
      minLenSq = lengthSq(shortest);
    }

    const nu = Math.sqrt(Number(minLenSq));
    const distance = 1 / nu;
    
    // Normal vector
    const normal: [number, number, number] = [
      Number(shortest[0]) / nu,
      Number(shortest[1]) / nu,
      Number(shortest[2]) / nu
    ];

    // Calculate number of planes: range of (u . x) for x in [0, 1]^3
    // K = u1*x1 + u2*x2 + u3*x3
    // max K = sum of positive u_i
    // min K = sum of negative u_i
    let maxK = 0n;
    let minK = 0n;
    shortest.forEach(u => {
      if (u > 0n) maxK += u;
      else minK += u;
    });
    const planes = Number(maxK - minK);

    setSpectralResult({
      distance,
      normal,
      u: [Number(shortest[0]), Number(shortest[1]), Number(shortest[2])],
      planes,
      minK: Number(minK),
      maxK: Number(maxK)
    });
    setSelectedPlane(null);
  }, [params]);

  const generatePoints = useCallback((count: number) => {
    const newPoints: Point3D[] = [];
    let x = BigInt(currentSeed);
    const a = BigInt(params.a);
    const c = BigInt(params.c);
    const m = BigInt(params.m);

    // --- Bays-Durham Shuffle Logic ---
    // This algorithm (Algorithm M from Knuth) uses an auxiliary table to 
    // break up short-term correlations in the LCG sequence.
    const next = () => {
      if (!shuffleEnabled) {
        x = (a * x + c) % m;
        return x;
      }

      // Initialize shuffle table if it doesn't exist
      if (!shuffleState.current) {
        const v: bigint[] = [];
        let curr = x;
        // Fill table with first 128 values
        for (let i = 0; i < 128; i++) {
          curr = (a * curr + c) % m;
          v.push(curr);
        }
        // Y is the 129th value
        const y = (a * curr + c) % m;
        // X is the 130th value (ready for the first replacement)
        x = (a * y + c) % m;
        shuffleState.current = { v, y };
      }

      const { v, y } = shuffleState.current;
      // Determine index j in [0, 127] based on current Y
      const j = Number((BigInt(128) * y) / m);
      // The output is the value at V[j]
      const result = v[j];
      // Replace V[j] with the next value from the LCG
      v[j] = x;
      x = (a * x + c) % m;
      // Update Y for the next call
      shuffleState.current.y = result;
      return result;
    };

    for (let i = 0; i < count; i++) {
      // Generate 3 numbers for x, y, z
      const coords: number[] = [];
      for (let j = 0; j < 3; j++) {
        const val = next();
        coords.push(Number(val) / Number(m));
      }
      newPoints.push({
        id: points.length + i,
        x: coords[0],
        y: coords[1],
        z: coords[2]
      });
    }

    setCurrentSeed(x.toString());
    setPoints(prev => [...prev, ...newPoints]);
  }, [params, currentSeed, points.length, shuffleEnabled]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      generatePoints(1000);
      initialized.current = true;
    }
  }, [generatePoints]);

  const reset = () => {
    setPoints([]);
    setCurrentSeed(params.seed);
    shuffleState.current = null;
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    setParams(preset.params);
    setCurrentSeed(preset.params.seed);
    setPoints([]);
    setActivePreset(key);
    setSpectralResult(null);
    setSelectedPlane(null);
    shuffleState.current = null;
  };

  const updateParam = (key: keyof LCGParams, value: string) => {
    try {
      BigInt(value); // Validate
      setParams(prev => ({ ...prev, [key]: value }));
      if (key === 'seed') setCurrentSeed(value);
      setPoints([]); // Reset points when params change
      setSpectralResult(null);
      setSelectedPlane(null);
      shuffleState.current = null;
    } catch (e) {
      // Ignore invalid bigint input
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-96 h-full bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-100 bg-blue-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold tracking-tight text-slate-800">{t.title}</h1>
            </div>
            <button 
              onClick={() => setLang(lang === 'en' ? 'cs' : 'en')}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
            >
              <Globe className="w-3 h-3" />
              {lang.toUpperCase()}
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {t.subtitle}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Formula Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                <Info className="w-4 h-4" /> {t.formulaTitle}
              </h2>
              <button 
                onClick={() => setShowFormula(!showFormula)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showFormula ? t.hide : t.show}
              </button>
            </div>
            <AnimatePresence>
              {showFormula && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-4 font-mono text-sm text-blue-700 mb-4 bg-white p-4 rounded-lg border border-slate-100 shadow-inner">
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <span>X<sub>n+1</sub> = (</span>
                      <input 
                        type="text" 
                        value={params.a.toString()} 
                        onChange={(e) => updateParam('a', e.target.value)}
                        className="w-24 bg-blue-50 border-b-2 border-blue-200 text-center focus:border-blue-500 outline-none px-1 transition-colors"
                        title="Multiplier (a)"
                      />
                      <span>· X<sub>n</sub> +</span>
                      <input 
                        type="text" 
                        value={params.c.toString()} 
                        onChange={(e) => updateParam('c', e.target.value)}
                        className="w-16 bg-blue-50 border-b-2 border-blue-200 text-center focus:border-blue-500 outline-none px-1 transition-colors"
                        title="Increment (c)"
                      />
                      <span>) mod</span>
                      <input 
                        type="text" 
                        value={params.m.toString()} 
                        onChange={(e) => updateParam('m', e.target.value)}
                        className="w-28 bg-blue-50 border-b-2 border-blue-200 text-center focus:border-blue-500 outline-none px-1 transition-colors"
                        title="Modulus (m)"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">{t.initialSeed}</span>
                      <span>X<sub>0</sub> =</span>
                      <input 
                        type="text" 
                        value={params.seed.toString()} 
                        onChange={(e) => updateParam('seed', e.target.value)}
                        className="w-28 bg-blue-50 border-b-2 border-blue-200 text-center focus:border-blue-500 outline-none px-1 transition-colors"
                        title="Initial Seed (X₀)"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t.formulaDescription}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Presets */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4" /> {t.presetsTitle}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    activePreset === key 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 hover:border-blue-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">{t.presets[key as keyof typeof t.presets].name}</div>
                  <div className={`text-[10px] mt-1 line-clamp-2 ${activePreset === key ? 'text-blue-100' : 'text-slate-400'}`}>
                    {t.presets[key as keyof typeof t.presets].description}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">{t.addPoints}</span>
            <span className="text-xs font-mono text-blue-600 font-bold">{points.length.toLocaleString()} {t.total}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 10, 100, 1000].map((n) => (
              <button
                key={n}
                onClick={() => generatePoints(n)}
                className="bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center"
              >
                <Plus className="w-3 h-3 mb-1" />
                {n}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setShuffleEnabled(!shuffleEnabled);
                setPoints([]);
                setCurrentSeed(params.seed);
                shuffleState.current = null;
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                shuffleEnabled 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              <Shuffle className="w-4 h-4" /> {shuffleEnabled ? t.shuffleOn : t.shuffleOff}
            </button>
            <button
              onClick={() => {
                setPoints([]);
                setCurrentSeed(params.seed);
                shuffleState.current = null;
                generatePoints(1000);
              }}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-200"
            >
              <RefreshCw className="w-4 h-4" /> {t.regenerate}
            </button>
          </div>

          {shuffleEnabled && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[10px] text-emerald-600 font-medium italic leading-tight px-1"
            >
              {t.shuffleWarning}
            </motion.p>
          )}

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-lg text-xs font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" /> {t.clear}
            </button>

            {/* Spectral Test Button */}
          <button
            onClick={performSpectralTest}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-200"
          >
            <Zap className="w-4 h-4" /> {t.performTest}
          </button>

          {/* Spectral Result Display */}
          <AnimatePresence>
            {spectralResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> {t.spectralResult}
                  </h3>
                  <button 
                    onClick={() => {
                      setSpectralResult(null);
                      setSelectedPlane(null);
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors uppercase"
                  >
                    {t.closeTest}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase">{t.distance}</div>
                    <div className="text-sm font-mono font-bold text-indigo-900">{spectralResult.distance.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase">{t.planesCount}</div>
                    <div className="text-sm font-mono font-bold text-indigo-900">~{spectralResult.planes}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">{t.normalVector}</div>
                  <div className="text-[11px] font-mono bg-white p-2 rounded border border-indigo-100 text-indigo-800 break-all">
                    u = ({spectralResult.u[0].toString()}, {spectralResult.u[1].toString()}, {spectralResult.u[2].toString()})
                  </div>
                  <div className="text-[9px] text-indigo-300 mt-1 italic">
                    Normalized: ({spectralResult.normal[0].toFixed(4)}, {spectralResult.normal[1].toFixed(4)}, {spectralResult.normal[2].toFixed(4)})
                  </div>
                </div>

                {/* Plane Selection Slider */}
                <div className="pt-2 border-t border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-indigo-400 font-bold uppercase">{t.selectPlane}</label>
                    <span className="text-[10px] font-mono font-bold text-indigo-600">
                      {selectedPlane === null ? t.none : selectedPlane}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min={spectralResult.minK - 1}
                    max={spectralResult.maxK}
                    step="1"
                    value={selectedPlane === null ? spectralResult.minK - 1 : selectedPlane}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val < spectralResult.minK) {
                        setSelectedPlane(null);
                      } else {
                        setSelectedPlane(val);
                      }
                    }}
                    className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-indigo-300 font-bold uppercase">{t.none}</span>
                    <span className="text-[8px] text-indigo-300 font-bold uppercase">{t.planesCount}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2 text-center">
            <p className="text-[10px] text-slate-400 font-medium">{t.copyright}</p>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-white">
        {/* Overlay Info */}
        <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-2 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl max-w-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">{t.interactiveView}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.viewDescription}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> {t.dragToRotate}</span>
              <span className="flex items-center gap-1"><Box className="w-3 h-3" /> {t.scrollToZoom}</span>
              <button 
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1 pointer-events-auto transition-colors ${autoRotate ? 'text-blue-600' : 'hover:text-slate-600'}`}
              >
                <RefreshCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} /> 
                {autoRotate ? t.autoRotateOn : t.autoRotateOff}
              </button>
            </div>
          </div>
        </div>

        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[2, 2, 2]} fov={45} />
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <group position={[0, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <PointCloud points={points} spectralResult={spectralResult} selectedPlane={selectedPlane} />
            <BoundingBox />
            {spectralResult && <Planes result={spectralResult} selectedPlane={selectedPlane} />}
          </group>

          <OrbitControls 
            makeDefault 
            autoRotate={autoRotate} 
            autoRotateSpeed={1.5}
            enableDamping 
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={10}
          />
        </Canvas>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-20 flex gap-4 pointer-events-none">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t.xAxis}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t.yAxis}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t.zAxis}</span>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
