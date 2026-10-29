'use client';

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";

type SeatState = "available" | "selected" | "booked";
type SeatData = { id: string; x: number; z: number; row: number; state: SeatState };

const bookedSeats = new Set(["A4", "A5", "B7", "C3", "C4", "D10", "E8", "F6", "G9", "H2", "H11"]);
const seatPrice = (row: number) => row < 2 ? 16 : row < 6 ? 12 : 10;

function getYouTubeEmbedUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    let videoId = "";
    if (url.hostname === "youtu.be") videoId = url.pathname.slice(1);
    else if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
      else if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) videoId = url.pathname.split("/")[2] ?? "";
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&controls=1&rel=0&playsinline=1` : null;
  } catch { return null; }
}

function Seat({ seat, onSelect }: { seat: SeatData; onSelect: (id: string) => void }) {
  const color = seat.state === "selected" ? "#f3c66f" : seat.state === "booked" ? "#542f39" : seat.row < 2 ? "#277db5" : seat.row < 5 ? "#167c68" : "#285d91";
  const glow = seat.state === "selected" ? "#b37d2d" : "#000000";
  return <group position={[seat.x, .18 + seat.row * .105, seat.z]} onClick={(e) => { e.stopPropagation(); if (seat.state !== "booked") onSelect(seat.id); }}>
    {/* Upholstered seat base and padded back */}
    <RoundedBox position={[0, .08, 0]} args={[.39, .14, .36]} radius={.055} smoothness={4} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.58} metalness={.02} emissive={glow} emissiveIntensity={seat.state === "selected" ? .38 : .015} /></RoundedBox>
    <RoundedBox position={[0, .29, -.125]} args={[.39, .35, .11]} radius={.055} smoothness={5} castShadow><meshStandardMaterial color={color} roughness={.62} metalness={.015} emissive={glow} emissiveIntensity={seat.state === "selected" ? .3 : .01} /></RoundedBox>
    <RoundedBox position={[-.2, .13, .005]} args={[.07, .17, .3]} radius={.025} smoothness={3} castShadow><meshStandardMaterial color="#252831" roughness={.3} metalness={.48} /></RoundedBox>
    <RoundedBox position={[.2, .13, .005]} args={[.07, .17, .3]} radius={.025} smoothness={3} castShadow><meshStandardMaterial color="#252831" roughness={.3} metalness={.48} /></RoundedBox>
    <mesh position={[.19, .22, -.045]}><cylinderGeometry args={[.026, .026, .035, 12]} /><meshStandardMaterial color="#b98d4d" metalness={.8} roughness={.2} /></mesh>
    <mesh position={[0, .018, .12]}><boxGeometry args={[.24, .025, .045]} /><meshStandardMaterial color="#30333b" metalness={.35} roughness={.45} /></mesh>
  </group>;
}

function WallPanel({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <mesh><boxGeometry args={[.72, 1.35, .07]} /><meshStandardMaterial color="#20232c" roughness={.85} /></mesh>
    <mesh position={[0, 0, .043]}><boxGeometry args={[.045, 1.1, .018]} /><meshStandardMaterial color="#b78a43" emissive="#6b4219" emissiveIntensity={.65} metalness={.6} /></mesh>
  </group>;
}

function Auditorium({ selected, setSelected }: { selected: string[]; setSelected: (v: string[]) => void }) {
  const seats = useMemo(() => {
    const list: SeatData[] = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) {
      const id = `${String.fromCharCode(65 + r)}${c + 1}`;
      const x = (c - 5.5) * .49 + (c >= 6 ? .32 : -.32);
      const z = 1.05 + r * .57;
      list.push({ id, x, z, row: r, state: bookedSeats.has(id) ? "booked" : selected.includes(id) ? "selected" : "available" });
    }
    return list;
  }, [selected]);
  const select = (id: string) => setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  return <group>
    <color attach="background" args={["#080a10"]} />
    <fog attach="fog" args={["#080a10", 13, 27]} />
    <ambientLight intensity={.62} />
    <hemisphereLight args={["#9caac4", "#100e12", .75]} />
    <spotLight position={[0, 9, -3]} angle={.72} penumbra={.7} intensity={105} color="#f8d9a0" castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[-5, 6, 4]} angle={.7} penumbra={.8} intensity={28} color="#a43c50" />
    <spotLight position={[5, 6, 4]} angle={.7} penumbra={.8} intensity={30} color="#4669a7" />
    <pointLight position={[0, 3, -1]} intensity={22} color="#f3bd62" distance={12} />
    {/* Deep room shell, tiered carpet and aisle */}
    <mesh position={[0, -.5, 4.2]} receiveShadow><boxGeometry args={[13, .35, 13]} /><meshStandardMaterial color="#17171e" roughness={.92} /></mesh>
    <mesh position={[0, -.24, 4.2]} receiveShadow><boxGeometry args={[11.7, .12, 11.8]} /><meshStandardMaterial color="#34232b" roughness={.9} /></mesh>
    <mesh position={[0, -.14, 4.4]}><boxGeometry args={[.82, .04, 10.5]} /><meshStandardMaterial color="#171b23" roughness={.9} /></mesh>
    {/* Row risers create a visible stepped auditorium profile */}
    {Array.from({ length: 8 }, (_, r) => <group key={r} position={[0, r * .105 - .22, 1.32 + r * .57]}>
      <mesh position={[0, 0, .03]} receiveShadow><boxGeometry args={[11.2, .13, .53]} /><meshStandardMaterial color={r % 2 ? "#28242c" : "#302630"} roughness={.9} /></mesh>
      <mesh position={[-5.05, .075, .28]}><boxGeometry args={[.045, .025, .35]} /><meshStandardMaterial color="#d8a752" emissive="#a8752c" emissiveIntensity={.8} /></mesh>
      <mesh position={[5.05, .075, .28]}><boxGeometry args={[.045, .025, .35]} /><meshStandardMaterial color="#d8a752" emissive="#a8752c" emissiveIntensity={.8} /></mesh>
    </group>)}
    {/* Screen frame, acoustic surround and luminous screen */}
    <mesh position={[0, 2.45, -.95]} castShadow><boxGeometry args={[9.5, 4.55, .36]} /><meshStandardMaterial color="#34323a" metalness={.5} roughness={.35} /></mesh>
    <mesh position={[0, 2.45, -.745]}><boxGeometry args={[8.95, 4.02, .08]} /><meshStandardMaterial color="#c2934e" emissive="#6e451e" emissiveIntensity={.8} metalness={.6} roughness={.25} /></mesh>
    <mesh position={[0, 2.45, -.69]}><planeGeometry args={[8.7, 3.78]} /><meshBasicMaterial color="#172538" /></mesh>
    <mesh position={[0, 2.45, -.675]}><planeGeometry args={[8.54, 3.62]} /><meshBasicMaterial color="#23354a" /></mesh>
    <Html position={[0, 2.43, -.65]} center transform distanceFactor={5.7} style={{ pointerEvents: "auto" }}>
      {process.env.NEXT_PUBLIC_TRAILER_URL ? (
        getYouTubeEmbedUrl(process.env.NEXT_PUBLIC_TRAILER_URL)
          ? <iframe className="trailer-video" src={getYouTubeEmbedUrl(process.env.NEXT_PUBLIC_TRAILER_URL)!} title="Movie trailer" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          : <video className="trailer-video" src={process.env.NEXT_PUBLIC_TRAILER_URL} autoPlay muted loop playsInline controls preload="metadata" aria-label="Movie trailer playing on the cinema screen" />
      ) : <div className="trailer-screen"><span className="trailer-stars">✦ C I N E V E R S E · PREMIERE</span><strong className="trailer-title">THE BIG SCREEN<br />FEELS DIFFERENT HERE</strong><span className="trailer-sub">IMMERSIVE CINEMA EXPERIENCE</span></div>}
    </Html>
    {/* Ceiling beams, wall ribs and acoustic panels */}
    <mesh position={[0, 6.2, 4.1]}><boxGeometry args={[13, .35, 13]} /><meshStandardMaterial color="#11131a" roughness={.95} /></mesh>
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-5.4 + i * 1.35, 6, 4.2]}><boxGeometry args={[.07, .08, 11.7]} /><meshStandardMaterial color="#36303a" metalness={.45} roughness={.45} /></mesh>)}
    {Array.from({ length: 8 }, (_, i) => <WallPanel key={`l${i}`} position={[-5.95, 2.4, -.1 + i * 1.35]} rotation={Math.PI / 2} />)}
    {Array.from({ length: 8 }, (_, i) => <WallPanel key={`r${i}`} position={[5.95, 2.4, -.1 + i * 1.35]} rotation={-Math.PI / 2} />)}
    {/* Side walls and rear acoustic treatment */}
    <mesh position={[-6.25, 2.7, 4.2]}><boxGeometry args={[.25, 5.6, 13]} /><meshStandardMaterial color="#191a22" roughness={.9} /></mesh>
    <mesh position={[6.25, 2.7, 4.2]}><boxGeometry args={[.25, 5.6, 13]} /><meshStandardMaterial color="#191a22" roughness={.9} /></mesh>
    <mesh position={[0, 2.8, 10.6]}><boxGeometry args={[12.5, 5.6, .25]} /><meshStandardMaterial color="#171820" roughness={.95} /></mesh>
    {/* Aisle markers and seats */}
    {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[-.43, -.01, .2 + i * 1.05]}><boxGeometry args={[.035, .025, .38]} /><meshStandardMaterial color="#d9a650" emissive="#b77d32" emissiveIntensity={1.2} /></mesh>)}
    {seats.map(seat => <Seat key={seat.id} seat={seat} onSelect={select} />)}
    {/* Front stage and velvet side curtains */}
    <mesh position={[0, -.02, -.2]}><boxGeometry args={[9.5, .15, .75]} /><meshStandardMaterial color="#44303b" roughness={.8} /></mesh>
    {[-4.95, 4.95].map(x => <group key={x}>{Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[x + (i - 3) * .055, 2.25, -.35]}><boxGeometry args={[.065, 4.4, .65]} /><meshStandardMaterial color={i % 2 ? "#5b2635" : "#351923"} roughness={.98} /></mesh>)}</group>)}
  </group>;
}

const showtimes = ["10:30 AM", "1:45 PM", "5:20 PM", "8:50 PM"];

export default function CinemaExperience({ onCheckout }: { onCheckout?: (data: { seats: string[]; showtime: string; total: number }) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState("Explore");
  const [showtime, setShowtime] = useState("5:20 PM");
  const controls = useRef<any>(null);
  const sorted = [...selected].sort();
  const total = selected.reduce((sum, id) => sum + seatPrice(id.charCodeAt(0) - 65), 0);
  const setCamera = (v: string) => {
    setView(v);
    if (!controls.current) return;
    const positions: Record<string, [number, number, number]> = {
      Explore: [7.5, 6.2, 10.5], Front: [0, 4.1, 6.7], Back: [0, 7.1, 12.1], Screen: [0, 3.4, 1.6]
    };
    controls.current.object.position.set(...positions[v]);
    controls.current.target.set(0, 1.45, 3.2);
    controls.current.update();
  };

  return <div className="cinema-layout">
    <div className="scene-wrap">
      <div className="scene-toolbar"><span className="scene-live"><i/> LIVE 3D AUDITORIUM</span><span>ORBIT · ZOOM · SELECT A SEAT</span></div>
      <Canvas shadows camera={{ position: [0, 5.25, 11.7], fov: 43 }} dpr={[1, 1.7]}>
        <Suspense fallback={null}><Auditorium selected={selected} setSelected={setSelected} /></Suspense>
        <OrbitControls ref={controls} makeDefault target={[0, 1.45, 3.2]} minDistance={4.5} maxDistance={19} maxPolarAngle={Math.PI / 2.01} minPolarAngle={.12} enableDamping dampingFactor={.075} />
      </Canvas>
      <div className="scene-bottom"><span>01 / PREMIUM AUDITORIUM</span><span>SCREEN ↑</span><span>128 SEATS</span></div>
      <div className="view-pills">{["Explore", "Front", "Back", "Screen"].map(v => <button className={view === v ? "active" : ""} key={v} onClick={() => setCamera(v)}>{v}</button>)}</div>
      <div className="scene-hint"><span>↗</span> SELECT A SEAT DIRECTLY IN THE 3D SCENE</div>
    </div>
    <aside className="booking-panel">
      <div className="panel-top"><span className="section-kicker">YOUR PRIVATE VIEWING</span><span className="show-badge">PREMIUM</span></div>
      <h3>Jailer 2</h3><p className="panel-sub">Tamil · Action / Thriller · 2h 18m · Dolby Atmos</p>
      <div className="cinema-meta-grid"><div><span>FORMAT</span><b>4K LASER</b></div><div><span>AUDIO</span><b>DOLBY ATMOS</b></div><div><span>SCREEN</span><b>IMAX-STYLE</b></div></div>
      <div className="panel-divider"/>
      <div className="panel-row"><b>Choose a showtime</b><span>Today · Demo</span></div>
      <div className="showtime-grid">{showtimes.map(t => <button key={t} className={showtime === t ? "active" : ""} onClick={() => setShowtime(t)}>{t}</button>)}</div>
      <div className="panel-divider"/>
      <div className="panel-row"><b>Select your seats</b><span>{selected.length} selected</span></div>
      <div className="legend"><span><i className="available-key"/>Available</span><span><i className="selected-key"/>Selected</span><span><i className="booked-key"/>Unavailable</span></div>
      <div className="selected-list">{sorted.length ? sorted.join(" · ") : "Choose seats in the 3D auditorium"}</div>
      <div className="price-row"><span>Estimated total<small>Premium rows $16 · Standard $12 · Rear $10</small></span><b>${total.toFixed(2)}</b></div>
      <button className="checkout-button" disabled={!selected.length} onClick={() => onCheckout ? onCheckout({ seats: sorted, showtime, total }) : window.alert(`Demo selection: Jailer 2 · ${showtime} · ${sorted.join(", ")} · ${total.toFixed(2)}. Real booking and payment are not connected yet.`)}>Review selection <span>↗</span></button>
      <p className="demo-disclaimer">Interactive product concept. Showtimes and seat inventory are illustrative; checkout does not reserve or charge tickets.</p>
    </aside>
  </div>;
}
