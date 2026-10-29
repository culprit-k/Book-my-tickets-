'use client';

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";

type SeatState = "available" | "selected" | "booked";
type SeatData = { id: string; x: number; z: number; row: number; state: SeatState };

const bookedSeats = new Set(["A4", "A5", "B7", "C3", "C4", "D10", "E8", "F6", "G9", "H2", "H11"]);
const seatPrice = (row: number) => row < 3 ? 160 : row < 8 ? 240 : row < 10 ? 320 : 550;

function getYouTubeEmbedUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    let videoId = "";
    if (url.hostname === "youtu.be") videoId = url.pathname.slice(1);
    else if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
      else if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) videoId = url.pathname.split("/")[2] ?? "";
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&controls=1&rel=0&playsinline=1&loop=1&playlist=${encodeURIComponent(videoId)}&modestbranding=1` : null;
  } catch { return null; }
}

function Seat({ seat, onSelect }: { seat: SeatData; onSelect: (id: string) => void }) {
  const color = seat.state === "selected" ? "#f3c66f" : seat.state === "booked" ? "#542f39" : seat.row < 3 ? "#20805e" : seat.row < 8 ? "#286db1" : seat.row < 10 ? "#7452b8" : "#8f632a";
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

function Auditorium({ selected, setSelected, trailerUrl, filmTitle, houseLights }: { selected: string[]; setSelected: (v: string[]) => void; trailerUrl: string; filmTitle: string; houseLights: boolean }) {
  const seats = useMemo(() => {
    const list: SeatData[] = [];
    for (let r = 0; r < 12; r++) for (let c = 0; c < 18; c++) {
      const id = `${String.fromCharCode(65 + r)}${c + 1}`;
      const x = (c - 8.5) * .52 + (c >= 9 ? .32 : -.32);
      const z = 1.05 + r * .50;
      list.push({ id, x, z, row: r, state: bookedSeats.has(id) ? "booked" : selected.includes(id) ? "selected" : "available" });
    }
    return list;
  }, [selected]);
  const select = (id: string) => setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  const selectedTrailer = trailerUrl || process.env.NEXT_PUBLIC_TRAILER_URL || "https://www.youtube.com/watch?v=FW_PPcr1sPE";
  const trailerEmbed = getYouTubeEmbedUrl(selectedTrailer);

  return <group>
    <color attach="background" args={["#080a10"]} />
    <fog attach="fog" args={["#080a10", 13, 27]} />
    <ambientLight intensity={houseLights ? .88 : .28} />
    <hemisphereLight args={["#9caac4", "#100e12", houseLights ? 1.05 : .38]} />
    <spotLight position={[0, 9, -3]} angle={.72} penumbra={.7} intensity={houseLights ? 125 : 105} color="#f8d9a0" castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[-5, 6, 4]} angle={.7} penumbra={.8} intensity={houseLights ? 44 : 16} color="#a43c50" />
    <spotLight position={[5, 6, 4]} angle={.7} penumbra={.8} intensity={houseLights ? 46 : 18} color="#4669a7" />
    <pointLight position={[0, 3, -1]} intensity={houseLights ? 32 : 12} color="#f3bd62" distance={12} />
    {/* Deep room shell, tiered carpet and aisle */}
    <mesh position={[0, -.5, 4.2]} receiveShadow><boxGeometry args={[13, .35, 13]} /><meshStandardMaterial color="#17171e" roughness={.92} /></mesh>
    <mesh position={[0, -.24, 4.2]} receiveShadow><boxGeometry args={[11.7, .12, 11.8]} /><meshStandardMaterial color="#34232b" roughness={.9} /></mesh>
    <mesh position={[0, -.14, 4.4]}><boxGeometry args={[.82, .04, 10.5]} /><meshStandardMaterial color="#171b23" roughness={.9} /></mesh>
    {/* Row risers create a visible stepped auditorium profile */}
    {Array.from({ length: 12 }, (_, r) => <group key={r} position={[0, r * .115 - .22, 1.32 + r * .50]}>
      <mesh position={[0, 0, .03]} receiveShadow><boxGeometry args={[11.2, .13, .47]} /><meshStandardMaterial color={r % 2 ? "#28242c" : "#302630"} roughness={.9} /></mesh>
      <mesh position={[-5.05, .075, .28]}><boxGeometry args={[.045, .025, .35]} /><meshStandardMaterial color="#d8a752" emissive="#a8752c" emissiveIntensity={.8} /></mesh>
      <mesh position={[5.05, .075, .28]}><boxGeometry args={[.045, .025, .35]} /><meshStandardMaterial color="#d8a752" emissive="#a8752c" emissiveIntensity={.8} /></mesh>
    </group>)}
    {/* Screen frame, acoustic surround and luminous screen */}
    <mesh position={[0, 2.45, -.95]} castShadow><boxGeometry args={[9.5, 4.55, .36]} /><meshStandardMaterial color="#34323a" metalness={.5} roughness={.35} /></mesh>
    <mesh position={[0, 2.45, -.745]}><boxGeometry args={[8.95, 4.02, .08]} /><meshStandardMaterial color="#c2934e" emissive="#6e451e" emissiveIntensity={.8} metalness={.6} roughness={.25} /></mesh>
    <mesh position={[0, 2.45, -.69]}><planeGeometry args={[8.7, 3.78]} /><meshBasicMaterial color="#172538" /></mesh>
    <mesh position={[0, 2.45, -.675]}><planeGeometry args={[8.54, 3.62]} /><meshBasicMaterial color="#23354a" /></mesh>
    <Html position={[0, 2.43, -.65]} center transform distanceFactor={5.7} style={{ pointerEvents: "auto" }}>
      {trailerEmbed
        ? <iframe className="trailer-video" src={trailerEmbed} title={filmTitle + " official trailer on the theatre screen"} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        : <video className="trailer-video" src={selectedTrailer} autoPlay muted loop playsInline controls preload="metadata" aria-label={filmTitle + " trailer playing on the cinema screen"} />}
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
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-.43, -.01, .2 + i * .52]}><boxGeometry args={[.035, .025, .32]} /><meshStandardMaterial color="#d9a650" emissive="#b77d32" emissiveIntensity={1.2} /></mesh>)}
    {seats.map(seat => <Seat key={seat.id} seat={seat} onSelect={select} />)}
    {/* Front stage and velvet side curtains */}
    <mesh position={[0, -.02, -.2]}><boxGeometry args={[9.5, .15, .75]} /><meshStandardMaterial color="#44303b" roughness={.8} /></mesh>
    {[-4.95, 4.95].map(x => <group key={x}>{Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[x + (i - 3) * .055, 2.25, -.35]}><boxGeometry args={[.065, 4.4, .65]} /><meshStandardMaterial color={i % 2 ? "#5b2635" : "#351923"} roughness={.98} /></mesh>)}</group>)}
  </group>;
}

const showtimes = ["10:30 AM", "1:45 PM", "5:20 PM", "8:50 PM"];

export default function CinemaExperience({ onCheckout, trailerUrl = "https://www.youtube.com/watch?v=FW_PPcr1sPE", movieTitle = "JAILER 2" }: { onCheckout?: (data: { seats: string[]; showtime: string; total: number }) => void; trailerUrl?: string; movieTitle?: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState("Overview");
  const [showtime, setShowtime] = useState("5:20 PM");
  const [quickCount, setQuickCount] = useState(2);
  const [houseLights, setHouseLights] = useState(false);
  const [hdMode, setHdMode] = useState(true);
  const controls = useRef<any>(null);
  const sorted = [...selected].sort();
  const total = selected.reduce((sum, id) => sum + seatPrice(id.charCodeAt(0) - 65), 0);
  const quickPick = () => {
    const picked: string[] = [];
    const rows = [4, 3, 5, 2, 6, 1, 7, 8, 9, 10, 11, 0];
    const cols = [7, 10, 6, 11, 5, 12, 4, 13, 3, 14, 2, 15, 1, 16, 0, 17, 8, 9];
    for (const r of rows) {
      for (const c of cols) {
        const id = `${String.fromCharCode(65 + r)}${c + 1}`;
        if (!bookedSeats.has(id) && !picked.includes(id)) picked.push(id);
        if (picked.length >= quickCount) break;
      }
      if (picked.length >= quickCount) break;
    }
    setSelected(picked);
  };
  const setCamera = (v: string) => {
    setView(v);
    if (!controls.current) return;
    const positions: Record<string, [number, number, number]> = {
      Overview: [-8.3, 7.0, 9.5],
      "From stage": [0, 3.2, 0.8],
      Balcony: [0, 7.9, 9.2],
      Overhead: [0, 10.5, 4.0],
      Tour: [7.2, 6.3, 9.8]
    };
    controls.current.object.position.set(...positions[v]);
    controls.current.target.set(0, 1.45, 3.2);
    controls.current.update();
  };

  return <div className="cinema-layout">
    <div className="scene-wrap">
      <div className="scene-toolbar"><span className="scene-live"><i/> LIVE 3D AUDITORIUM</span><span>ORBIT · ZOOM · SELECT A SEAT</span></div>
      <Canvas shadows camera={{ position: [-8.3, 7.0, 9.5], fov: 43 }} dpr={hdMode ? [1.3, 1.8] : [0.8, 1.15]}>
        <Suspense fallback={null}><Auditorium selected={selected} setSelected={setSelected} trailerUrl={trailerUrl} filmTitle={movieTitle} houseLights={houseLights} /></Suspense>
        <OrbitControls ref={controls} makeDefault target={[0, 1.5, 3.3]} minDistance={4.5} maxDistance={22} maxPolarAngle={Math.PI / 1.95} minPolarAngle={.05} enableDamping dampingFactor={.075} autoRotate={view === "Tour"} autoRotateSpeed={.32} />
      </Canvas>
      <div className="scene-bottom"><span>01 / PREMIUM AUDITORIUM</span><span>SCREEN ↑</span><span>216 SEATS</span></div>
      <div className="view-pills">{["Overview", "From stage", "Balcony", "Overhead", "Tour"].map(v => <button className={view === v ? "active" : ""} key={v} onClick={() => setCamera(v)}>{v}</button>)}</div>
      <div className="scene-hint"><span>↗</span> TAP A SEAT · DRAG TO EXPLORE</div>
      <div className="scene-chip-controls">
        <button className={houseLights ? "scene-chip active" : "scene-chip"} onClick={() => setHouseLights(v => !v)}><span className="chip-bulb">{houseLights ? "☼" : "◐"}</span> House lights</button>
        <button className={hdMode ? "scene-chip active" : "scene-chip"} onClick={() => setHdMode(v => !v)}><span>HD</span> {hdMode ? "Quality" : "Performance"}</button>
      </div>
    </div>
    <aside className="booking-panel">
      <div className="panel-top"><span className="section-kicker">YOUR PRIVATE VIEWING</span><span className="show-badge">PREMIUM</span></div>
      <h3>{movieTitle}</h3><p className="panel-sub">Movie trailer on screen · Immersive theatre · Dolby Atmos demo</p>
      <div className="cinema-meta-grid"><div><span>FORMAT</span><b>4K LASER</b></div><div><span>AUDIO</span><b>DOLBY ATMOS</b></div><div><span>SCREEN</span><b>IMAX-STYLE</b></div></div>
      <div className="seat-classes"><div className="seat-classes-title">SEAT CLASSES <span>SELECT IN 3D</span></div>
        {[{name:"Royal Recliner",price:550,desc:"Most spacious · front rows",tone:"class-gold"},{name:"Balcony",price:320,desc:"Elevated view · center aligned",tone:"class-green"},{name:"Prime",price:240,desc:"Sweet spot for sound & picture",tone:"class-purple"},{name:"Classic",price:160,desc:"Front rows · big screen energy",tone:"class-blue"}].map(tier=><div className="seat-class-row" key={tier.name}><i className={tier.tone}/><span><b>{tier.name}</b><small>{tier.desc}</small></span><strong>₹{tier.price}</strong></div>)}
      </div>
      <div className="panel-divider"/>
      <div className="quick-pick"><div className="quick-pick-count"><small>QUICK PICK</small><div><button onClick={()=>setQuickCount(n=>Math.max(1,n-1))} aria-label="Remove quick pick seat">−</button><b>{quickCount}</b><button onClick={()=>setQuickCount(n=>Math.min(8,n+1))} aria-label="Add quick pick seat">+</button></div></div><button className="best-seats-button" onClick={quickPick}><span>✦</span> Best {quickCount} seats</button></div>
      <div className="panel-divider"/>
      <div className="panel-row"><b>Choose a showtime</b><span>Today · Demo</span></div>
      <div className="showtime-grid">{showtimes.map(t => <button key={t} className={showtime === t ? "active" : ""} onClick={() => setShowtime(t)}>{t}</button>)}</div>
      <div className="panel-divider"/>
      <div className="panel-row"><b>Select your seats</b><span>{selected.length} selected</span></div>
      <div className="legend"><span><i className="available-key"/> Available</span><span><i className="selected-key"/> Your pick</span><span><i className="booked-key"/> Booked</span></div>
      <div className="selected-list">{sorted.length ? sorted.join(" · ") : "Choose seats in the 3D auditorium"}</div>
      <div className="price-row"><span>Estimated total<small>Classic ₹160 · Prime ₹240 · Balcony ₹320 · Royal Recliner ₹550</small></span><b>₹{total.toLocaleString("en-IN")}</b></div>
      <button className="checkout-button" disabled={!selected.length} onClick={() => onCheckout ? onCheckout({ seats: sorted, showtime, total }) : window.alert(`Demo selection: ${movieTitle} · ${showtime} · ${sorted.join(", ")} · ₹${total.toLocaleString("en-IN")}. Real booking and payment are not connected yet.`)}>Review selection <span>↗</span></button>
      <p className="demo-disclaimer">Prototype mode · Seats, showtimes, and prices are illustrative. No reservation or payment is made.</p>
    </aside>
  </div>;
}
