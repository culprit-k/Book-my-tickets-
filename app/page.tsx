'use client';

import { useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Clapperboard, Clock3, Compass, CreditCard, Film, Home, MapPin, Minus, Plus, ShieldCheck, Ticket, UserRound, Wallet } from "lucide-react";
import CinemaExperience from "@/components/CinemaExperience";

type Movie = { title: string; language: string; genre: string; duration: string; rating: string; art: string; accent: string; synopsis: string };
const movies: Movie[] = [
  { title: "RAMAYANA", language: "Hindi · Telugu · Tamil", genre: "Epic · Adventure · Drama", duration: "2h 48m", rating: "U/A 13+", art: "ramayana", accent: "#bd5c2c", synopsis: "A timeless epic returns to the big screen in a sweeping cinematic experience." },
  { title: "JAILER 2", language: "Tamil", genre: "Action · Thriller", duration: "2h 18m", rating: "U/A 16+", art: "jailer", accent: "#d8a34f", synopsis: "The legend returns. One last mission. No room for mistakes." },
  { title: "AFTER THE STORM", language: "English", genre: "Drama · Mystery", duration: "2h 04m", rating: "U/A 13+", art: "storm", accent: "#7a9da9", synopsis: "A quiet coastal town hides a secret that refuses to stay buried." },
  { title: "LAST SIGNAL", language: "English", genre: "Sci-fi · Adventure", duration: "1h 56m", rating: "U/A 13+", art: "signal", accent: "#a08be1", synopsis: "A signal from the edge of space changes everything." }
];
const dates = [{ day: "FRI", date: "30" }, { day: "SAT", date: "31" }, { day: "SUN", date: "01" }, { day: "MON", date: "02" }, { day: "TUE", date: "03" }];
const times = ["10:30 AM", "1:45 PM", "5:20 PM", "8:50 PM"];

function Poster({ movie, large = false, onClick }: { movie: Movie; large?: boolean; onClick?: () => void }) {
  return <div role="button" tabIndex={0} className={`poster-art poster-${movie.art} ${large ? "poster-large" : ""}`} onClick={onClick} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && onClick) { e.preventDefault(); onClick(); } }} aria-label={`View ${movie.title}`}>
    <span className="poster-vignette" />
    <span className="poster-topline"><span>✦ CINEVERSE ORIGINAL</span><span>4K</span></span>
    <span className="poster-artwork">{movie.art === "ramayana" ? <><i className="ramayana-sun" /><i className="ramayana-figure" /><i className="ramayana-bow" /></> : movie.art === "jailer" ? <><i className="jailer-light" /><i className="jailer-figure" /></> : movie.art === "storm" ? <><i className="storm-moon" /><i className="storm-ridge" /></> : <><i className="signal-planet" /><i className="signal-beam" /></>}</span>
    <span className="poster-bottom"><small>{movie.genre.toUpperCase()}</small><strong>{movie.title}</strong><span>{movie.language}</span></span>
  </div>;
}

function BottomNav({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  const items = [{ id: "home", label: "Home", icon: Home }, { id: "tickets", label: "My tickets", icon: Ticket }, { id: "account", label: "Profile", icon: UserRound }];
  return <nav className="bottom-nav">{items.map(item => { const Icon = item.icon; return <button key={item.id} className={active === item.id ? "nav-active" : ""} onClick={() => setActive(item.id)}><Icon size={19} strokeWidth={active === item.id ? 2.3 : 1.7} /><span>{item.label}</span></button>; })}</nav>;
}

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  const [movie, setMovie] = useState<Movie>(movies[0]);
  const [dateIndex, setDateIndex] = useState(0);
  const [showtime, setShowtime] = useState("5:20 PM");
  const [venue, setVenue] = useState("Cineverse · IMAX");
  const [checkout, setCheckout] = useState<{ seats: string[]; showtime: string; total: number } | null>(null);
  const [snacks, setSnacks] = useState({ popcorn: 0, drinks: 0, nachos: 0 });
  const [ticketCreated, setTicketCreated] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [trailerOpen, setTrailerOpen] = useState(false);

  const openMovie = (item: Movie) => { setMovie(item); setScreen("details"); setActiveTab("home"); setTicketCreated(false); };
  const openShowtimes = () => { setScreen("showtimes"); setActiveTab("home"); };
  const openSeats = () => { setScreen("seats"); setActiveTab("home"); };
  const goTab = (tab: string) => { setActiveTab(tab); setScreen(tab); };
  const snackTotal = snacks.popcorn * 5 + snacks.drinks * 3 + snacks.nachos * 4;
  const changeSnack = (key: keyof typeof snacks, delta: number) => setSnacks(s => ({ ...s, [key]: Math.max(0, s[key] + delta) }));

  return <main className="cine-app">
    <header className="app-header">
      <button className="app-brand" onClick={() => goTab("home")}><span className="brand-emblem"><Clapperboard size={17} /></span><span>CINE<span>VERSE</span><small>YOUR MOVIE UNIVERSE</small></span></button>
      <div className="header-actions"><button aria-label="Explore" onClick={() => goTab("home")}><Compass size={19} /></button><button aria-label="Notifications"><Bell size={19} /><i /></button><button className="avatar-button" aria-label="Profile" onClick={() => goTab("account")}><UserRound size={17} /></button></div>
    </header>

    {screen === "home" && <div className="screen-content home-screen">
      <div className="home-intro"><div><span className="eyebrow"><i /> THE BIG SCREEN, REIMAGINED</span><h1>Find your next<br /><em>movie moment.</em></h1></div><span className="city-chip"><MapPin size={12} /> BUKHARA <ChevronRight size={13} /></span></div>
      <div className="section-row"><div><span className="section-overline">CURATED FOR YOU</span><h2>Now showing</h2></div><button className="text-action" onClick={() => openMovie(movies[0])}>View all <ChevronRight size={15} /></button></div>
      <div className="poster-carousel">{movies.map(item => <div className="poster-card" key={item.title}><Poster movie={item} onClick={() => openMovie(item)} /><div className="poster-card-meta"><div><strong>{item.title}</strong><span>{item.genre}</span></div><span className="age-rating">{item.rating}</span></div><button className="book-small" onClick={() => openMovie(item)}>Book tickets <ChevronRight size={14} /></button></div>)}</div>
      <section className="featured-banner"><div className="featured-copy"><span className="gold-label">✦ THIS WEEK'S PREMIERE</span><h2>Stories worth<br />leaving home for.</h2><p>Choose your film. Find your perfect seat. Make it a night to remember.</p><button className="gold-button" onClick={() => openMovie(movies[0])}>Explore premiere <ChevronRight size={16} /></button></div><div className="banner-orb"><i /><span>PREMIERE<br /><b>01</b></span></div></section>
      <div className="section-row venues-heading"><div><span className="section-overline">YOUR LOCAL CINEMAS</span><h2>Playing near you</h2></div><button className="text-action" onClick={openShowtimes}>All cinemas <ChevronRight size={15} /></button></div>
      <button className="venue-card" onClick={openShowtimes}><span className="venue-icon"><Film size={21} /></span><span className="venue-copy"><strong>Cineverse · IMAX</strong><small><MapPin size={12} /> Bukhara, Uzbekistan · 1.2 km</small><span className="venue-tags"><i /> Dolby Atmos <i /> Laser 4K</span></span><ChevronRight size={18} /></button>
      <button className="venue-card" onClick={openShowtimes}><span className="venue-icon venue-icon-purple"><Clapperboard size={21} /></span><span className="venue-copy"><strong>Cineverse · Grand</strong><small><MapPin size={12} /> Bukhara, Uzbekistan · 3.4 km</small><span className="venue-tags"><i /> Premium recliners <i /> 4K</span></span><ChevronRight size={18} /></button>
    </div>}

    {screen === "details" && <div className="screen-content detail-screen">
      <button className="back-button" onClick={() => setScreen("home")}><ChevronLeft size={18} /> Back to movies</button>
      <div className={`detail-hero detail-${movie.art}`}><div className="detail-shade" /><div className="detail-poster"><Poster movie={movie} large /></div><div className="detail-title"><span className="gold-label">NOW SHOWING · CINEVERSE EXCLUSIVE</span><h1>{movie.title}</h1><div className="detail-meta"><span>{movie.rating}</span><i />{movie.duration}<i />{movie.language}</div><p>{movie.synopsis}</p><div className="detail-buttons"><button className="gold-button" onClick={openShowtimes}>Book tickets <ChevronRight size={16} /></button><button className="outline-button" onClick={() => setTrailerOpen(!trailerOpen)}>▶ Watch trailer</button></div></div></div>
      {trailerOpen && <div className="trailer-placeholder"><div className="play-large">▶</div><span>TRAILER PREVIEW</span><small>Connect a licensed trailer URL to enable playback.</small></div>}
      <div className="detail-info-grid"><div><span>GENRE</span><strong>{movie.genre}</strong></div><div><span>LANGUAGE</span><strong>{movie.language}</strong></div><div><span>EXPERIENCE</span><strong>4K · Dolby Atmos</strong></div></div>
      <div className="detail-description"><span className="section-overline">THE STORY</span><h2>Made for the big screen.</h2><p>{movie.synopsis} Experience every frame with immersive sound, breathtaking visuals, and the comfort of a premium auditorium.</p></div>
    </div>}

    {screen === "showtimes" && <div className="screen-content showtimes-screen">
      <button className="back-button" onClick={() => setScreen("details")}><ChevronLeft size={18} /> Movie details</button><div className="showtime-movie"><Poster movie={movie} /><div><span className="gold-label">SELECT YOUR EXPERIENCE</span><h1>{movie.title}</h1><p>{movie.genre} · {movie.duration}</p><span className="venue-rating">★ 4.8 <small>audience rating</small></span></div></div>
      <div className="section-row"><div><span className="section-overline">PICK YOUR DATE</span><h2>Choose a showtime</h2></div><span className="timezone-note">Local time</span></div>
      <div className="date-strip">{dates.map((d,i) => <button key={d.day} className={dateIndex === i ? "date-active" : ""} onClick={() => setDateIndex(i)}><span>{d.day}</span><strong>{d.date}</strong><small>{i === 0 ? "OCT" : i === 1 ? "OCT" : "NOV"}</small></button>)}</div>
      <div className="section-row"><div><span className="section-overline">CINEMA & FORMAT</span><h2>Choose your screen</h2></div></div>
      {[{name:"Cineverse · IMAX",detail:"Laser 4K · Dolby Atmos · Premium recliners",distance:"1.2 km",price:"from $10"},{name:"Cineverse · Grand",detail:"4K projection · Surround sound",distance:"3.4 km",price:"from $7"}].map((v,i)=><div className={`show-venue ${venue===v.name?"venue-selected":""}`} key={v.name} onClick={() => setVenue(v.name)}><button className="venue-select" aria-label={`Select ${v.name}`}>{venue===v.name ? "✓" : ""}</button><div className="show-venue-copy"><strong>{v.name}</strong><span><MapPin size={12} /> {v.distance} away</span><small>{v.detail}</small><div className="showtime-buttons">{times.map(t=><button key={t} className={showtime===t && venue===v.name?"time-active":""} onClick={(e)=>{e.stopPropagation();setShowtime(t);setVenue(v.name);}}>{t}</button>)}</div></div><span className="venue-price">{v.price}</span></div>)}
      <div className="notice-line"><ShieldCheck size={16} /> Demo availability only — no live seats are reserved.</div><button className="gold-button full-button" onClick={openSeats}>Choose your seats <ChevronRight size={17} /></button>
    </div>}

    {screen === "seats" && <div className="screen-content seats-screen"><div className="seat-screen-heading"><button className="back-button" onClick={openShowtimes}><ChevronLeft size={18} /> Showtimes</button><div><span className="gold-label">THE IMMERSIVE EXPERIENCE</span><h1>Find your <em>perfect view.</em></h1><p>{movie.title} · {dates[dateIndex].day}, {dates[dateIndex].date} {dateIndex < 2 ? "OCT" : "NOV"} · {showtime}</p></div></div><div className="seat-intro-strip"><span className="mini-movie-icon"><Film size={18} /></span><span><strong>{venue}</strong><small>Premium auditorium · 128 seats</small></span><span className="live-pill"><i /> LIVE 3D</span></div><CinemaExperience onCheckout={(data) => { setCheckout(data); setShowtime(data.showtime); setScreen("checkout"); }} /><div className="seat-footnote"><ShieldCheck size={15} /> This is an interactive prototype. Seat availability and prices are illustrative.</div></div>}

    {screen === "checkout" && <div className="screen-content checkout-screen"><button className="back-button" onClick={openSeats}><ChevronLeft size={18} /> Back to seats</button><div className="checkout-heading"><span className="gold-label">ALMOST MOVIE TIME</span><h1>Make it a <em>whole night.</em></h1><p>Add your favourites, review your booking, and continue to checkout.</p></div><div className="checkout-summary"><Poster movie={movie} /><div><span className="gold-label">YOUR SELECTION</span><h2>{movie.title}</h2><p><Clock3 size={13} /> {showtime} · {venue}</p><div className="selected-seat-tags">{checkout?.seats.map(s=><span key={s}>{s}</span>)}</div></div></div><div className="section-row"><div><span className="section-overline">THE SNACK BAR</span><h2>Complete the ritual</h2></div></div>{([{key:"popcorn" as const,name:"Classic popcorn",desc:"Freshly popped · salted",price:5,emoji:"🍿"},{key:"drinks" as const,name:"Chilled drink",desc:"Your favourite refreshment",price:3,emoji:"🥤"},{key:"nachos" as const,name:"Loaded nachos",desc:"Cheese dip on the side",price:4,emoji:"🌮"}]).map(item=><div className="snack-row" key={item.key}><span className="snack-emoji">{item.emoji}</span><span className="snack-copy"><strong>{item.name}</strong><small>{item.desc}</small><b>${item.price.toFixed(2)}</b></span><div className="snack-stepper"><button onClick={()=>changeSnack(item.key,-1)} aria-label="Remove"><Minus size={14}/></button><strong>{snacks[item.key]}</strong><button onClick={()=>changeSnack(item.key,1)} aria-label="Add"><Plus size={14}/></button></div></div>)}<div className="bill-card"><div><span>Movie tickets ({checkout?.seats.length ?? 0})</span><b>${(checkout?.total ?? 0).toFixed(2)}</b></div><div><span>Snacks & drinks</span><b>${snackTotal.toFixed(2)}</b></div><div><span>Convenience fee</span><b>$1.50</b></div><div className="bill-total"><span>Total amount</span><strong>${((checkout?.total ?? 0)+snackTotal+1.5).toFixed(2)}</strong></div></div><div className="notice-line"><ShieldCheck size={16}/> Demo checkout only. No payment will be collected.</div><button className="gold-button full-button" onClick={()=>{setTicketCreated(true);setScreen("confirmation");}}>Continue to checkout <ChevronRight size={17}/></button></div>}

    {screen === "confirmation" && <div className="screen-content confirmation-screen"><div className="success-orbit"><span>✓</span></div><span className="gold-label">YOUR MOVIE NIGHT IS READY</span><h1>It's a <em>date.</em></h1><p className="confirmation-copy">Your demo ticket has been created. In a live service, this is where confirmed payment and booking details would appear.</p><div className="digital-ticket"><div className="ticket-art"><Poster movie={movie}/><div><span className="gold-label">CINEVERSE · E-TICKET</span><h2>{movie.title}</h2><p>{venue}</p><p>{dates[dateIndex].day}, {dates[dateIndex].date} · {showtime}</p></div></div><div className="ticket-perforation"><span/><i/><span/></div><div className="ticket-qr"><div className="fake-qr" aria-label="Decorative sample QR code">{Array.from({length:49},(_,i)=><i key={i} className={(i*7+i%3)%4===0?"qr-dark":""}/>)}</div><div><strong>DEMO TICKET</strong><small>Not valid for entry</small><span>CV-{String(Date.now()).slice(-6)}</span></div></div></div><button className="gold-button full-button" onClick={()=>goTab("tickets")}>View my tickets <Ticket size={17}/></button><button className="outline-button full-button" onClick={()=>goTab("home")}>Back to home</button></div>}

    {screen === "tickets" && <div className="screen-content tickets-screen"><span className="section-overline">YOUR CINEVERSE</span><h1>My <em>tickets.</em></h1><div className="ticket-tabs"><button className="tab-selected">Upcoming</button><button>Past visits</button></div>{ticketCreated ? <button className="wallet-ticket" onClick={()=>setScreen("confirmation")}><Poster movie={movie}/><span><small>DEMO E-TICKET</small><strong>{movie.title}</strong><span>{dates[dateIndex].day}, {dates[dateIndex].date} · {showtime}</span><span>{venue}</span><b>View ticket <ChevronRight size={14}/></b></span></button> : <div className="empty-tickets"><div className="empty-ticket-icon"><Ticket size={27}/></div><h2>Your next movie memory awaits.</h2><p>Your bookings will appear here. Find a film, choose your seats, and let the show begin.</p><button className="gold-button" onClick={()=>goTab("home")}>Explore movies <ChevronRight size={16}/></button></div>}<div className="ticket-help"><ShieldCheck size={16}/><span><strong>Tickets, safely stored.</strong><small>In a live app, confirmed tickets and QR codes would be available here.</small></span></div></div>}

    {screen === "account" && <div className="screen-content account-screen"><div className="account-orb"><UserRound size={31}/></div><span className="section-overline">WELCOME TO YOUR UNIVERSE</span><h1>Your cinema.<br/><em>Your way.</em></h1><p>Sign in to keep your tickets, preferences, and movie nights all in one place.</p><div className="auth-toggle"><button className={authMode==="signin"?"auth-active":""} onClick={()=>setAuthMode("signin")}>Sign in</button><button className={authMode==="signup"?"auth-active":""} onClick={()=>setAuthMode("signup")}>Create account</button></div><label className="form-label">EMAIL ADDRESS<input type="email" placeholder="you@example.com"/></label>{authMode==="signup"&&<label className="form-label">YOUR NAME<input type="text" placeholder="How should we call you?"/></label>}<label className="form-label">PASSWORD<input type="password" placeholder="Enter your password"/></label><button className="gold-button full-button" onClick={()=>window.alert("Authentication is a visual prototype and is not connected to an account service.")}>{authMode==="signin"?"Sign in":"Create account"} <ChevronRight size={17}/></button><div className="auth-note"><ShieldCheck size={15}/> Authentication is not connected yet.</div><div className="account-perks"><div><Ticket size={18}/><span><strong>All your tickets</strong><small>One place for every booking</small></span></div><div><Wallet size={18}/><span><strong>Easy checkout</strong><small>Faster, smoother movie nights</small></span></div><div><CreditCard size={18}/><span><strong>Secure payments</strong><small>Payment integration comes next</small></span></div></div></div>}

    <BottomNav active={activeTab} setActive={goTab} />
    <footer className="app-footer"><span>✦ CINEVERSE</span><small>YOUR MOVIE UNIVERSE · INTERACTIVE CONCEPT</small></footer>
  </main>;
}
