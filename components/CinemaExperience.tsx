'use client';

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";

type SeatState = "available" | "selected" | "booked";
type SeatData = { id: string; x: number; z: number; state: SeatState };

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
  } catch {
    return null;
  }
}

function Seat({ seat, onSelect }: { seat: SeatData; onSelect: (id: string) => void }) {
  const color = seat.state === "selected" ? "#e9b85c" : seat.state === "booked" ? "#633b45" : "#287b68";
  return <group position={[seat.x, 0.22 + Math.max(0, -seat.z) * .02, seat.z]} onClick={(e) => { e.stopPropagation(); if (seat.state !== "booked") onSelect(seat.id); }}>
    <mesh position={[0, .02, 0]} castShadow><boxGeometry args={[.34, .1, .32]} /><meshStandardMaterial color={color} roughness={.6} emissive={seat.state === "selected" ? "#6a4315" : "#000"} emissiveIntensity={.45} /></mesh>
    <mesh position={[0, .19, -.12]} castShadow><boxGeometry args={[.34, .3, .08]} /><meshStandardMaterial color={color} roughness={.65} /></mesh>
    <mesh position={[-.15, .08, .01]}><boxGeometry args={[.045, .12, .25]} /><meshStandardMaterial color="#25282e" /></mesh>
    <mesh position={[.15, .08, .01]}><boxGeometry args={[.045, .12, .25]} /><meshStandardMaterial color="#25282e" /></mesh>
  </group>;
}

function Auditorium({ selected, setSelected }: { selected: string[]; setSelected: (v: string[]) => void }) {
  const seats = useMemo(() => {
    const list: SeatData[] = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) {
      const id = `${String.fromCharCode(65 + r)}${c + 1}`;
      const x = (c - 5.5) * .47 + (c >= 6 ? .15 : -.15);
      const z = 1.1 + r * .56;
      list.push({ id, x, z, state: ["A4","B7","C3","D10","F6","G9"].includes(id) ? "booked" : selected.includes(id) ? "selected" : "available" });
    }
    return list;
  }, [selected]);
  const select = (id: string) => setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  return <group>
    <ambientLight intensity={1.1} />
    <spotLight position={[0,7,-2]} angle={.85} penumbra={.6} intensity={65} color="#f6d49a" castShadow />
    <pointLight position={[-5,3,3]} intensity={8} color="#d24c53" />
    <pointLight position={[5,3,4]} intensity={8} color="#537dd7" />
    <mesh position={[0,-.15,3.4]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[11,10]} /><meshStandardMaterial color="#17191e" roughness={.9} /></mesh>
    <mesh position={[0,2.25,-1]}><boxGeometry args={[8.3,4.2,.22]} /><meshStandardMaterial color="#29272b" /></mesh>
    <mesh position={[0,2.3,-.86]}><planeGeometry args={[7.4,3.15]} /><meshBasicMaterial color="#151d2b" /></mesh>
    <mesh position={[0,2.3,-.84]}><planeGeometry args={[7.2,2.95]} /><meshBasicMaterial color="#202b3c" /></mesh>
    <Html position={[0,2.25,-.79]} center transform distanceFactor={5.8} style={{pointerEvents:"auto"}}>
      {process.env.NEXT_PUBLIC_TRAILER_URL ? (
        getYouTubeEmbedUrl(process.env.NEXT_PUBLIC_TRAILER_URL) ? (
          <iframe className="trailer-video" src={getYouTubeEmbedUrl(process.env.NEXT_PUBLIC_TRAILER_URL)!} title="Movie trailer" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <video className="trailer-video" src={process.env.NEXT_PUBLIC_TRAILER_URL} autoPlay muted loop playsInline controls preload="metadata" aria-label="Movie trailer playing on the cinema screen" />
        )
      ) : (
        <div className="trailer-screen"><span className="trailer-stars">✦ C I N E V E R S E</span><strong className="trailer-title">THE SHOW<br/>BEGINS HERE</strong><span className="trailer-sub">ADD A TRAILER URL TO ENABLE PLAYBACK</span></div>
      )}
    </Html>
    {seats.map(seat => <Seat key={seat.id} seat={seat} onSelect={select} />)}
    <mesh position={[0,.03,.25]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[8.2,.45]} /><meshStandardMaterial color="#38313a" /></mesh>
    {[-5.2,5.2].map(x=><mesh key={x} position={[x,2.1,2.5]}><boxGeometry args={[.12,4.2,8]} /><meshStandardMaterial color="#27272e" /></mesh>)}
  </group>;
}

export default function CinemaExperience() {
  const [selected,setSelected] = useState<string[]>([]);
  const [view,setView] = useState("Explore");
  const controls = useRef<any>(null);
  const total = selected.length * 12;
  const sorted = [...selected].sort();
  return <div className="cinema-layout">
    <div className="scene-wrap">
      <div className="scene-toolbar"><span className="scene-live"><i/> 3D LIVE VIEW</span><span>DRAG TO ROTATE · SCROLL TO ZOOM</span></div>
      <Canvas shadows camera={{position:[7,6.2,9],fov:45}} dpr={[1,1.7]}>
        <color attach="background" args={["#101116"]} />
        <Suspense fallback={null}><Auditorium selected={selected} setSelected={setSelected}/></Suspense>
        <OrbitControls ref={controls} makeDefault target={[0,1,2.3]} minDistance={4.5} maxDistance={16} maxPolarAngle={Math.PI/2.03} minPolarAngle={.15} enableDamping dampingFactor={.07}/>
      </Canvas>
      <div className="scene-bottom"><span>SCREEN</span><span>← FRONT OF AUDITORIUM</span><span>BACK ROW →</span></div>
      <div className="view-pills">{["Explore","Front","Back"].map(v=><button className={view===v?"active":""} key={v} onClick={()=>{setView(v);if(controls.current){if(v==="Front") controls.current.object.position.set(0,4.5,10); else if(v==="Back") controls.current.object.position.set(0,7,13); else controls.current.object.position.set(7,6.2,9);controls.current.target.set(0,1,2.3);controls.current.update();}}}>{v}</button>)}</div>
    </div>
    <aside className="booking-panel">
      <div className="panel-top"><span className="section-kicker">NOW BOOKING</span><span className="show-badge">DEMO SHOW</span></div>
      <h3>Jailer 2</h3><p className="panel-sub">Tamil · Action / Thriller · 2h 18m</p>
      <div className="trailer-note"><span className="play-circle">▶</span><div><b>3D cinema screen</b><small>Visual placeholder — trailer video not connected yet</small></div></div>
      <div className="panel-divider"/>
      <div className="panel-row"><b>Select your seats</b><span>{selected.length} selected</span></div>
      <div className="legend"><span><i className="available-key"/>Available</span><span><i className="selected-key"/>Selected</span><span><i className="booked-key"/>Booked</span></div>
      <div className="selected-list">{sorted.length ? sorted.join(" · ") : "Click seats in the 3D auditorium"}</div>
      <div className="price-row"><span>Ticket total <small>Demo price · $12 per seat</small></span><b>${total.toFixed(2)}</b></div>
      <button className="checkout-button" disabled={!selected.length} onClick={()=>window.alert(`Demo booking: ${sorted.join(", ")} — $${total.toFixed(2)}. Connect a backend to reserve real seats.`)}>Continue to checkout <span>→</span></button>
      <p className="demo-disclaimer">Prototype only. Seat availability and checkout are not connected to a live booking system.</p>
    </aside>
  </div>;
}