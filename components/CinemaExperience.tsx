'use client';

import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type SeatState = "available" | "selected" | "booked" | "unavailable";
type SeatData = {
  id: string; row: number; seatNumber: number; block: number;
  x: number; y: number; z: number; rotation: number;
  state: SeatState; price: number;
};

const TOTAL_SEATS = 456;
const ROWS = 16;
const ROW_COUNTS = Array.from({ length: ROWS }, (_, index) => index < 9 ? 32 : 24);
const AISLE_WIDTH = 1.15;
const SEAT_PITCH = 0.60;

function range(row: number, first: number, last: number) {
  return Array.from({ length: last - first + 1 }, (_, index) =>
    "R" + String(row).padStart(2, "0") + "-S" + String(first + index).padStart(2, "0")
  );
}

// Initial availability follows the uploaded map: 394 of 456 seats available.
const unavailableSeats = new Set([
  ...range(1, 1, 9), ...range(10, 10, 14), ...range(11, 7, 14), ...range(12, 10, 11),
]);
const bookedSeats = new Set([
  ...range(11, 15, 17), ...range(12, 12, 17), ...range(13, 10, 17),
  ...range(14, 8, 14), ...range(15, 7, 13), ...range(16, 6, 12),
]);

function seatPrice(row: number) {
  if (row <= 4) return 160;
  if (row <= 9) return 240;
  if (row <= 13) return 320;
  return 550;
}

function makeSeatLayout(selected: string[]): SeatData[] {
  const seats: SeatData[] = [];
  ROW_COUNTS.forEach((count, rowIndex) => {
    const perBlock = count / 4;
    const blockWidth = perBlock * SEAT_PITCH;
    const totalWidth = 4 * blockWidth + 3 * AISLE_WIDTH;
    const left = -totalWidth / 2;
    for (let seatIndex = 0; seatIndex < count; seatIndex++) {
      const block = Math.floor(seatIndex / perBlock);
      const localIndex = seatIndex % perBlock;
      const x = left + block * (blockWidth + AISLE_WIDTH) + (localIndex + 0.5) * SEAT_PITCH;
      const row = rowIndex + 1;
      const id = "R" + String(row).padStart(2, "0") + "-S" + String(seatIndex + 1).padStart(2, "0");
      const edge = Math.abs(x) / (totalWidth / 2);
      const z = -3.65 + rowIndex * 0.88 + edge * edge * 1.05;
      const state: SeatState = selected.includes(id) ? "selected"
        : bookedSeats.has(id) ? "booked"
        : unavailableSeats.has(id) ? "unavailable" : "available";
      seats.push({
        id, row, seatNumber: seatIndex + 1, block, x,
        y: 0.15 + rowIndex * 0.12, z, rotation: Math.atan2(x, 29),
        state, price: seatPrice(row),
      });
    }
  });
  return seats;
}

function seatColor(seat: SeatData) {
  if (seat.state === "selected") return new THREE.Color("#f5cf78");
  if (seat.state === "booked") return new THREE.Color("#646a68");
  if (seat.state === "unavailable") return new THREE.Color("#252e2a");
  return new THREE.Color(["#176d54", "#185d5c", "#1a6654", "#194e64"][seat.block]);
}

function SeatInstances({ seats, onSelect }: { seats: SeatData[]; onSelect: (id: string) => void }) {
  const cushions = useRef<THREE.InstancedMesh>(null);
  const backs = useRef<THREE.InstancedMesh>(null);
  const arms = useRef<THREE.InstancedMesh>(null);
  const cushionGeometry = useMemo(() => new RoundedBoxGeometry(0.52, 0.16, 0.49, 3, 0.055), []);
  const backGeometry = useMemo(() => new RoundedBoxGeometry(0.52, 0.56, 0.13, 3, 0.055), []);
  const armGeometry = useMemo(() => new RoundedBoxGeometry(0.09, 0.22, 0.43, 3, 0.035), []);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    seats.forEach((seat, index) => {
      const color = seatColor(seat);
      dummy.position.set(seat.x, seat.y + 0.22, seat.z);
      dummy.rotation.set(0, seat.rotation, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      cushions.current?.setMatrixAt(index, dummy.matrix);
      cushions.current?.setColorAt(index, color);

      dummy.position.set(seat.x, seat.y + 0.56, seat.z + 0.22);
      dummy.updateMatrix();
      backs.current?.setMatrixAt(index, dummy.matrix);
      backs.current?.setColorAt(index, color);

      for (let side = 0; side < 2; side++) {
        dummy.position.set(seat.x + (side === 0 ? -0.29 : 0.29), seat.y + 0.31, seat.z + 0.015);
        dummy.updateMatrix();
        arms.current?.setMatrixAt(index * 2 + side, dummy.matrix);
        arms.current?.setColorAt(index * 2 + side, new THREE.Color(seat.state === "selected" ? "#c7a35e" : "#242b2d"));
      }
    });
    [cushions.current, backs.current, arms.current].forEach(mesh => {
      if (mesh) {
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    });
  }, [seats]);

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const seat = typeof event.instanceId === "number" ? seats[event.instanceId] : undefined;
    if (seat && (seat.state === "available" || seat.state === "selected")) onSelect(seat.id);
  };

  return <>
    <instancedMesh ref={cushions} args={[cushionGeometry, undefined, seats.length]} castShadow receiveShadow onClick={pick}>
      <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0.02} />
    </instancedMesh>
    <instancedMesh ref={backs} args={[backGeometry, undefined, seats.length]} castShadow receiveShadow onClick={pick}>
      <meshStandardMaterial color="#ffffff" roughness={0.68} metalness={0.02} />
    </instancedMesh>
    <instancedMesh ref={arms} args={[armGeometry, undefined, seats.length * 2]} castShadow receiveShadow>
      <meshStandardMaterial color="#ffffff" roughness={0.42} metalness={0.38} />
    </instancedMesh>
  </>;
}

function RibbedWall({ side }: { side: -1 | 1 }) {
  return <group position={[side * 12.45, 4.05, 2.7]}>
    <mesh><boxGeometry args={[0.42, 8.1, 29]} /><meshStandardMaterial color="#171015" roughness={0.96} /></mesh>
    {Array.from({ length: 32 }, (_, index) => <mesh key={index} position={[side === -1 ? 0.24 : -0.24, 0, -13.6 + index * 0.88]}>
      <boxGeometry args={[0.16, 7.3, 0.13]} /><meshStandardMaterial color={index % 2 ? "#43212b" : "#572735"} roughness={0.92} />
    </mesh>)}
    {Array.from({ length: 13 }, (_, index) => <mesh key={"light-" + index} position={[side === -1 ? 0.17 : -0.17, 1.5, -8.2 + index * 1.75]}>
      <boxGeometry args={[0.06, 0.43, 0.16]} /><meshStandardMaterial color="#e4d9bd" emissive="#b9d3c4" emissiveIntensity={0.28} />
    </mesh>)}
    <mesh position={[side === -1 ? 0.05 : -0.05, 1.2, 1.55]}>
      <boxGeometry args={[0.05, 0.34, 0.9]} /><meshStandardMaterial color="#39b878" emissive="#188e4a" emissiveIntensity={1.8} />
    </mesh>
  </group>;
}

function getYouTubeEmbedUrl(rawUrl: string, muted: boolean) {
  try {
    const url = new URL(rawUrl);
    let videoId = "";
    if (url.hostname === "youtu.be") videoId = url.pathname.slice(1);
    else if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
      else if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) videoId = url.pathname.split("/")[2] ?? "";
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://book-my-tickets-app-abhijith14.vercel.app")}&rel=0&playsinline=1&loop=1&playlist=${encodeURIComponent(videoId)}&modestbranding=1` : null;
  } catch { return null; }
}

function Auditorium({ seats, onSelect, trailerUrl, filmTitle, houseLights, iframeRef, videoRef, muted }: {
  seats: SeatData[]; onSelect: (id: string) => void; trailerUrl: string; filmTitle: string; houseLights: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>; videoRef: React.RefObject<HTMLVideoElement | null>; muted: boolean;
}) {
  const trailerEmbed = getYouTubeEmbedUrl(trailerUrl, muted);
  return <group>
    <color attach="background" args={["#050609"]} />
    <fog attach="fog" args={["#050609", 20, 42]} />
    <ambientLight intensity={houseLights ? 0.85 : 0.30} />
    <hemisphereLight args={["#a9b9d6", "#170e13", houseLights ? 0.9 : 0.35]} />
    <spotLight position={[0, 12, -7]} angle={0.78} penumbra={0.72} intensity={houseLights ? 145 : 112} color="#f4dbad" castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[-8, 7, 2]} angle={0.66} penumbra={0.85} intensity={houseLights ? 42 : 17} color="#a84b5d" />
    <spotLight position={[8, 7, 2]} angle={0.66} penumbra={0.85} intensity={houseLights ? 45 : 18} color="#4b6ca6" />
    <pointLight position={[0, 3.8, -7]} intensity={houseLights ? 35 : 16} color="#e2b66b" distance={22} />
    <pointLight position={[-10, 2.2, 2]} intensity={houseLights ? 16 : 4} color="#1cae77" distance={12} />
    <pointLight position={[10, 2.2, 2]} intensity={houseLights ? 16 : 4} color="#1cae77" distance={12} />

    {/* Auditorium shell, burgundy acoustic side walls and rear wall */}
    <mesh position={[0, -0.58, 2.25]} receiveShadow><boxGeometry args={[26, 0.72, 30]} /><meshStandardMaterial color="#171416" roughness={0.96} /></mesh>
    <mesh position={[0, -0.19, 2.25]}><boxGeometry args={[25.3, 0.08, 29.4]} /><meshStandardMaterial color="#231b20" roughness={0.92} /></mesh>
    <RibbedWall side={-1} /><RibbedWall side={1} />
    <mesh position={[0, 4.05, 17.0]}><boxGeometry args={[25.2, 8.1, 0.42]} /><meshStandardMaterial color="#18151a" roughness={0.96} /></mesh>
    <mesh position={[0, 8.35, 2.25]}><boxGeometry args={[25.1, 0.38, 29.4]} /><meshStandardMaterial color="#0d0d12" roughness={0.95} /></mesh>

    {/* Ceiling ribs and recessed lamps */}
    {Array.from({ length: 18 }, (_, index) => <group key={index} position={[-10.8 + index * 1.27, 8.12, 2.15]}>
      <mesh><boxGeometry args={[0.065, 0.08, 26.5]} /><meshStandardMaterial color="#393039" metalness={0.38} roughness={0.56} /></mesh>
      <mesh position={[0, -0.17, -4.2]}><boxGeometry args={[0.14, 0.035, 0.65]} /><meshStandardMaterial color="#e1d6c5" emissive="#c8bda9" emissiveIntensity={0.42} /></mesh>
    </group>)}

    {/* Front wall, wide screen frame, warm trim and velvet curtains */}
    <mesh position={[0, 4.2, -9.55]}><boxGeometry args={[25.0, 8.1, 0.42]} /><meshStandardMaterial color="#100d12" roughness={0.98} /></mesh>
    <mesh position={[0, 4.45, -9.20]} castShadow><boxGeometry args={[12.1, 6.95, 0.52]} /><meshStandardMaterial color="#3b3438" metalness={0.48} roughness={0.33} /></mesh>
    <mesh position={[0, 4.45, -8.91]}><boxGeometry args={[11.76, 6.62, 0.08]} /><meshStandardMaterial color="#d5b36f" emissive="#765226" emissiveIntensity={0.8} metalness={0.58} roughness={0.26} /></mesh>
    <mesh position={[0, 4.45, -8.855]}><planeGeometry args={[11.48, 6.45]} /><meshBasicMaterial color="#080a10" /></mesh>
    <Html position={[0, 4.45, -8.80]} center transform distanceFactor={100} zIndexRange={[40, 0]} style={{ pointerEvents: "auto" }}>
      {trailerEmbed
        ? <iframe ref={iframeRef} className="trailer-video" src={trailerEmbed} title={filmTitle + " trailer on the theatre screen"} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        : <video ref={videoRef} className="trailer-video" src={trailerUrl} autoPlay muted={muted} loop playsInline controls preload="metadata" aria-label={filmTitle + " trailer on the theatre screen"} />}
    </Html>
    {[-1, 1].map(side => <group key={side}>
      {Array.from({ length: 15 }, (_, index) => <mesh key={index} position={[side * (6.15 + index % 2 * 0.1), 4.25, -8.9 + index * 0.10]}>
        <boxGeometry args={[0.17, 6.5, 0.12]} /><meshStandardMaterial color={index % 2 ? "#612a36" : "#421d28"} roughness={0.97} />
      </mesh>)}
    </group>)}
    <mesh position={[0, 0.03, -7.15]}><boxGeometry args={[13.4, 0.24, 1.65]} /><meshStandardMaterial color="#34232b" roughness={0.72} /></mesh>
    <mesh position={[0, 0.17, -7.85]}><boxGeometry args={[12.9, 0.035, 0.08]} /><meshStandardMaterial color="#d9b46b" emissive="#9f722c" emissiveIntensity={1.2} /></mesh>

    {/* Sixteen stepped rows, same capacities as the uploaded plan */}
    {Array.from({ length: ROWS }, (_, rowIndex) => {
      const perBlock = ROW_COUNTS[rowIndex] / 4;
      const width = 4 * perBlock * SEAT_PITCH + 3 * AISLE_WIDTH;
      const z = -3.65 + rowIndex * 0.88 + 0.40;
      return <group key={rowIndex}>
        <mesh position={[0, rowIndex * 0.12 - 0.12, z]} receiveShadow><boxGeometry args={[Math.max(width + 1.25, 18.6), 0.16, 0.48]} /><meshStandardMaterial color={rowIndex % 2 ? "#282126" : "#30252a"} roughness={0.93} /></mesh>
        {[-1, 1].map(side => <mesh key={side} position={[side * (width / 2 + 0.35), rowIndex * 0.12 - 0.015, z - 0.05]}>
          <boxGeometry args={[0.035, 0.035, 0.34]} /><meshStandardMaterial color="#d9b46b" emissive="#a27432" emissiveIntensity={0.85} />
        </mesh>)}
      </group>;
    })}
    {/* Long illuminated aisles between the four blocks */}
    {[-11.0, -5.75, 0, 5.75, 11.0].map((x, index) => <mesh key={index} position={[x, 0.025, 4.5]}>
      <boxGeometry args={[0.055, 0.035, 17.5]} /><meshStandardMaterial color="#d7b267" emissive="#ad7d36" emissiveIntensity={0.92} />
    </mesh>)}
    <SeatInstances seats={seats} onSelect={onSelect} />

    {/* Rear doors and exit markers */}
    {[-1, 1].map(side => <group key={side} position={[side * 10.9, 1.8, 16.72]}>
      <mesh><boxGeometry args={[1.35, 3.45, 0.12]} /><meshStandardMaterial color="#17191e" roughness={0.88} /></mesh>
      <mesh position={[0, 1.02, 0.08]}><boxGeometry args={[0.77, 0.18, 0.035]} /><meshBasicMaterial color="#36d087" /></mesh>
    </group>)}
  </group>;
}

function TwoDSeatMap({ seats, onSelect }: { seats: SeatData[]; onSelect: (id: string) => void }) {
  const available = seats.filter(seat => seat.state === "available").length;
  const rows = Array.from({ length: ROWS }, (_, index) => seats.filter(seat => seat.row === index + 1));
  return <div className="reference-seat-map">
    <div className="reference-seat-map-head">
      <div className="map-availability"><strong>{available}</strong><span>of {TOTAL_SEATS} available</span></div>
      <div className="map-legend">
        <span><i className="map-available"/>Available</span><span><i className="map-selected"/>Your selection</span>
        <span><i className="map-pending"/>Pending payment</span><span><i className="map-booked"/>Paid / booked</span><span><i className="map-unavailable"/>Unavailable</span>
      </div>
    </div>
    <div className="map-screen-line"><span /></div><div className="map-screen-label">SCREEN</div>
    <div className="map-horizontal-scroll"><div className="map-rows">
      {rows.map((rowSeats, index) => <div className="map-row" key={index}>
        <span className="map-row-label">{index + 1}</span>
        <div className="map-row-blocks">{[0, 1, 2, 3].map(block => <div className="map-seat-block" key={block}>
          {rowSeats.filter(seat => seat.block === block).map(seat => <button key={seat.id}
            className={"map-seat map-seat-" + seat.state} disabled={seat.state === "booked" || seat.state === "unavailable"}
            onClick={() => onSelect(seat.id)} title={"Row " + seat.row + ", Seat " + seat.seatNumber + " · ₹" + seat.price}
            aria-label={"Row " + seat.row + ", seat " + seat.seatNumber + ", " + seat.state}>{seat.seatNumber}</button>)}
        </div>)}</div><span className="map-row-label">{index + 1}</span>
      </div>)}
    </div></div>
    <div className="map-footnote">Scroll horizontally to see every seat · Tap a green seat to select it</div>
  </div>;
}

const showtimes = ["10:30 AM", "1:45 PM", "5:20 PM", "8:50 PM"];
const cameraViews = ["Overview", "Near screen", "Balcony", "Top view", "Tour"];

export default function CinemaExperience({ onCheckout, onChangeVideo, trailerUrl = "https://www.youtube.com/watch?v=FW_PPcr1sPE", movieTitle = "JAILER 2" }: {
  onCheckout?: (data: { seats: string[]; showtime: string; total: number }) => void;
  onChangeVideo?: () => void; trailerUrl?: string; movieTitle?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState("Overview");
  const [mode, setMode] = useState<"3D" | "2D">("3D");
  const [showtime, setShowtime] = useState("5:20 PM");
  const [quickCount, setQuickCount] = useState(2);
  const [houseLights, setHouseLights] = useState(false);
  const [hdMode, setHdMode] = useState(true);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const controls = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const seats = useMemo(() => makeSeatLayout(selected), [selected]);
  const sortedSeats = useMemo(() => [...selected].sort(), [selected]);
  const selectedSeatData = seats.filter(seat => selected.includes(seat.id));
  const total = selectedSeatData.reduce((sum, seat) => sum + seat.price, 0);
  const available = seats.filter(seat => seat.state === "available").length;
  const selectedLabels = [...selectedSeatData].sort((a, b) => a.row - b.row || a.seatNumber - b.seatNumber).map(seat => "R" + seat.row + " · " + seat.seatNumber);

  const toggleSeat = (id: string) => setSelected(current => current.includes(id) ? current.filter(seat => seat !== id) : [...current, id]);
  const quickPick = () => {
    const preferredRows = [8, 9, 7, 10, 6, 11, 5, 12, 4, 13, 3, 14, 2, 15, 1, 16];
    let picks: SeatData[] = [];
    for (const rowNumber of preferredRows) {
      const rowSeats = seats.filter(seat => seat.row === rowNumber && seat.state === "available").sort((a, b) => Math.abs(a.x) - Math.abs(b.x));
      for (let index = 0; index <= rowSeats.length - quickCount; index++) {
        const group = rowSeats.slice(index, index + quickCount).sort((a, b) => a.seatNumber - b.seatNumber);
        if (group.every((seat, i) => i === 0 || seat.seatNumber === group[i - 1].seatNumber + 1)) { picks = group; break; }
      }
      if (picks.length) break;
    }
    if (!picks.length) picks = seats.filter(seat => seat.state === "available").sort((a, b) => Math.abs(a.x) - Math.abs(b.x) || Math.abs(a.row - 8) - Math.abs(b.row - 8)).slice(0, quickCount);
    setSelected(picks.map(seat => seat.id));
  };

  const sendTrailerCommand = (command: "playVideo" | "pauseVideo" | "mute" | "unMute") => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: command, args: [] }), "https://www.youtube-nocookie.com");
    const video = videoRef.current;
    if (video) {
      if (command === "playVideo") void video.play().catch(() => {});
      if (command === "pauseVideo") video.pause();
      if (command === "mute") video.muted = true;
      if (command === "unMute") video.muted = false;
    }
  };
  const togglePlaying = () => { const next = !playing; sendTrailerCommand(next ? "playVideo" : "pauseVideo"); setPlaying(next); };
  const toggleMuted = () => { const next = !muted; sendTrailerCommand(next ? "mute" : "unMute"); setMuted(next); };

  const setCamera = (preset: string) => {
    setView(preset);
    if (!controls.current) return;
    const presets: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
      "Overview": { position: [-11.5, 8.4, 13.5], target: [0, 3.5, 2.2] },
      "Near screen": { position: [0, 5.6, -1.6], target: [0, 3.8, 1.8] },
      "Balcony": { position: [0, 9.4, 12.2], target: [0, 3.0, 3.0] },
      "Top view": { position: [0, 18.5, 3.8], target: [0, 0.2, 3.5] },
      "Tour": { position: [11.5, 8.4, 13.5], target: [0, 3.4, 2.0] },
    };
    const value = presets[preset];
    controls.current.object.position.set(...value.position);
    controls.current.target.set(...value.target);
    controls.current.update();
  };
  const zoom = (factor: number) => { if (controls.current) { controls.current.object.position.sub(controls.current.target).multiplyScalar(factor).add(controls.current.target); controls.current.update(); } };

  return <div className="cinema-layout reference-cinema-layout">
    <div className="scene-wrap reference-scene-wrap">
      <div className="reference-scene-topline">
        <div className="reference-mode-toggle">
          <button className={mode === "3D" ? "active" : ""} onClick={() => setMode("3D")}>◈ 3D</button>
          <button className={mode === "2D" ? "active" : ""} onClick={() => setMode("2D")}>▦ 2D</button>
        </div>
        {mode === "3D" && <div className="reference-camera-presets">{cameraViews.map(preset => <button key={preset} className={view === preset ? "active" : ""} onClick={() => setCamera(preset)}>{preset === "Tour" ? "▶ " : ""}{preset}</button>)}</div>}
        <span className="reference-mode-live">{mode === "3D" ? "LIVE 3D" : "SEAT MAP"}</span>
      </div>
      {mode === "3D" ? <>
        <Canvas shadows camera={{ position: [-11.5, 8.4, 13.5], fov: 43, near: 0.1, far: 80 }} dpr={hdMode ? [1.2, 1.65] : [0.8, 1.1]}>
          <Suspense fallback={null}><Auditorium seats={seats} onSelect={toggleSeat} trailerUrl={trailerUrl} filmTitle={movieTitle} houseLights={houseLights} iframeRef={iframeRef} videoRef={videoRef} muted={muted} /></Suspense>
          <OrbitControls ref={controls} makeDefault target={[0, 3.5, 2.2]} minDistance={4.2} maxDistance={14.5} minAzimuthAngle={-Math.PI * 0.42} maxAzimuthAngle={Math.PI * 0.42} maxPolarAngle={Math.PI / 2.18} minPolarAngle={0.18} enablePan={false} enableDamping dampingFactor={0.075} autoRotate={view === "Tour"} autoRotateSpeed={0.16} />
        </Canvas>
        <div className="reference-scene-tools">
          <button title="Reset camera" onClick={() => setCamera("Overview")}>⌂</button>
          <button title="Zoom in" onClick={() => zoom(0.88)}>＋</button>
          <button title="Zoom out" onClick={() => zoom(1.14)}>－</button>
          <button title="Help" onClick={() => window.alert("Drag to orbit · Pinch or scroll to zoom · Tap a green seat to select it.")}>ⓘ</button>
        </div>
        <div className="reference-video-controls">
          <button className="reference-change-video" onClick={onChangeVideo}>Change video</button>
          <button onClick={togglePlaying} title={playing ? "Pause trailer" : "Play trailer"}>{playing ? "Ⅱ" : "▶"}</button>
          <button onClick={toggleMuted} title={muted ? "Enable sound" : "Mute"}>{muted ? "◖" : "◗"}</button>
        </div>
        <div className="reference-scene-bottom">
          <button onClick={() => setHouseLights(value => !value)} className={houseLights ? "active" : ""}>◉ Lights</button>
          <button onClick={() => setHdMode(value => !value)} className={hdMode ? "active" : ""}>HD</button>
        </div>
        <div className="reference-seat-toast">{selected.length} selected · {available} available</div>
      </> : <TwoDSeatMap seats={seats} onSelect={toggleSeat} />}
    </div>

    <aside className="booking-panel reference-booking-panel">
      <div className="panel-top"><span className="section-kicker">THEATRE BOOKING</span><span className="show-badge">3D EXPERIENCE</span></div>
      <h3>{movieTitle}</h3><p className="panel-sub">Official trailer on the cinema screen · 456-seat auditorium</p>
      <div className="reference-availability"><strong>{available}</strong><span>of {TOTAL_SEATS} available</span><small>{TOTAL_SEATS - available - selected.length} booked / unavailable · {selected.length} selected</small></div>
      <div className="seat-classes">
        <div className="seat-classes-title">SEAT CLASSES <span>IN ₹</span></div>
        {[{ name: "Classic", price: 160, desc: "Front rows · clear screen view", tone: "class-blue" }, { name: "Prime", price: 240, desc: "Balanced view and sound", tone: "class-purple" }, { name: "Balcony", price: 320, desc: "Elevated rear section", tone: "class-green" }, { name: "Royal Recliner", price: 550, desc: "Premium comfort · rear rows", tone: "class-gold" }].map(tier => <div className="seat-class-row" key={tier.name}><i className={tier.tone}/><span><b>{tier.name}</b><small>{tier.desc}</small></span><strong>₹{tier.price}</strong></div>)}
      </div>
      <div className="panel-divider"/>
      <div className="quick-pick">
        <div className="quick-pick-count"><small>QUICK PICK</small><div><button onClick={() => setQuickCount(value => Math.max(1, value - 1))} aria-label="Remove quick-pick seat">−</button><b>{quickCount}</b><button onClick={() => setQuickCount(value => Math.min(8, value + 1))} aria-label="Add quick-pick seat">+</button></div></div>
        <button className="best-seats-button" onClick={quickPick}>✦ Best {quickCount} seats</button>
      </div>
      <div className="panel-divider"/>
      <div className="panel-row"><b>Showtime</b><span>Today · Demo</span></div>
      <div className="showtime-grid">{showtimes.map(time => <button key={time} className={showtime === time ? "active" : ""} onClick={() => setShowtime(time)}>{time}</button>)}</div>
      <div className="panel-divider"/>
      <div className="panel-row"><b>Your seats</b><span>{selected.length} selected</span></div>
      <div className="selected-list">{selectedLabels.length ? selectedLabels.join(" · ") : "Tap a green seat in the 3D theatre or 2D map."}</div>
      <div className="price-row"><span>Estimated total<small>Seat prices vary by row and section</small></span><b>₹{total.toLocaleString("en-IN")}</b></div>
      <button className="checkout-button" disabled={!selected.length} onClick={() => onCheckout?.({ seats: sortedSeats, showtime, total })}>Continue · Add snacks <span>↗</span></button>
      <p className="demo-disclaimer">Prototype inventory · Availability and pricing are illustrative; no live booking is made.</p>
    </aside>
  </div>;
}
