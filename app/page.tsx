'use client';

import { useEffect, useState } from "react";
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Clapperboard, Clock3, Compass, CreditCard, Film, Home as HomeIcon, Inbox, MapPin, Minus, Play, Plus, Search, ShieldCheck, Sparkles, Telescope, Ticket, UserRound, Wallet, Volume2, VolumeX } from "lucide-react";
import CinemaExperience from "@/components/CinemaExperience";

type Movie = { title: string; language: string; genre: string; duration: string; rating: string; art: string; accent: string; synopsis: string; trailerId: string; posterImage: string };
const movies: Movie[] = [
  { title: "VIKRAM", language: "Tamil", genre: "Action · Thriller", duration: "2h 54m", rating: "U/A 16+", art: "vikram", accent: "#a9b5c8", synopsis: "A black-ops squad is drawn into a maze of secrets, shifting loyalties, and dangerous power.", trailerId: "OKBMCL-frPU", posterImage: "https://i.ytimg.com/vi/OKBMCL-frPU/hq720.jpg" },
  { title: "LEO", language: "Tamil", genre: "Action · Crime · Thriller", duration: "2h 44m", rating: "U/A 16+", art: "leo", accent: "#9ab3ce", synopsis: "A quiet life is shaken when a man’s past catches up with him in explosive fashion.", trailerId: "Po3jStA673E", posterImage: "https://i.ytimg.com/vi/Po3jStA673E/hq720.jpg" },
  { title: "COOLIE", language: "Tamil", genre: "Action · Crime", duration: "2h 48m", rating: "A", art: "coolie", accent: "#c9a165", synopsis: "A ruthless gold-smuggling world collides with one man's dangerous plan for revenge.", trailerId: "qeVfT2iLiu0", posterImage: "https://i.ytimg.com/vi/qeVfT2iLiu0/hq720.jpg" },
  { title: "VARANASI", language: "Telugu · Adventure", genre: "Epic · Adventure · Mystery", duration: "TBA", rating: "PRE-BOOK", art: "varanasi", accent: "#f2b85d", synopsis: "An epic adventure unfolds across time, place, and a mystery that reaches beyond the familiar world.", trailerId: "DMD2uthghWE", posterImage: "https://i.ytimg.com/vi/DMD2uthghWE/hq720.jpg" },
  { title: "TOXIC", language: "Kannada · Multilingual", genre: "Action · Period Crime", duration: "TBA", rating: "U/A 16+", art: "toxic", accent: "#b4b7c0", synopsis: "A fairytale for grown-ups emerges from a dangerous world of ambition, crime, and consequence.", trailerId: "f5M1d7r2UNQ", posterImage: "https://i.ytimg.com/vi/f5M1d7r2UNQ/hq720.jpg" },
  { title: "JAILER 2", language: "Tamil", genre: "Action · Thriller", duration: "2h 45m", rating: "U/A 16+", art: "jailer", accent: "#d8a34f", synopsis: "Tiger Muthuvel Pandian returns as old enemies and a deeper network threaten to pull him back into the fight.", trailerId: "FW_PPcr1sPE", posterImage: "https://i.ytimg.com/vi/FW_PPcr1sPE/hq720.jpg" },
  { title: "RAMAYANA", language: "Hindi · Telugu · Tamil", genre: "Epic · Adventure · Drama", duration: "TBA", rating: "U/A 13+", art: "ramayana", accent: "#bd5c2c", synopsis: "A timeless epic returns to the big screen in a sweeping cinematic experience.", trailerId: "1zip1rNaNYs", posterImage: "https://i.ytimg.com/vi/1zip1rNaNYs/hq720.jpg" }
];
const dates = [{ day: "FRI", date: "30" }, { day: "SAT", date: "31" }, { day: "SUN", date: "01" }, { day: "MON", date: "02" }, { day: "TUE", date: "03" }];
const times = ["10:30 AM", "1:45 PM", "5:20 PM", "8:50 PM"];

function trailerEmbedUrl(movie: Movie, muted: boolean) {
  return `https://www.youtube-nocookie.com/embed/${movie.trailerId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&rel=0&playsinline=1&loop=1&playlist=${movie.trailerId}&modestbranding=1`;
}

function Poster({ movie, large = false, onClick }: { movie: Movie; large?: boolean; onClick?: () => void }) {
  return <div role="button" tabIndex={0} className={`poster-art poster-${movie.art} ${large ? "poster-large" : ""}`} onClick={onClick} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && onClick) { e.preventDefault(); onClick(); } }} aria-label={`View ${movie.title}`}>
    <img className="poster-photo" src={movie.posterImage} alt="" loading="lazy" draggable={false} />
    <span className="poster-vignette" />
    <span className="poster-topline"><span>✦ CINEVERSE ORIGINAL</span><span>4K</span></span>
    {!movie.posterImage && <span className="poster-artwork">{movie.art === "ramayana" ? <><i className="ramayana-sun" /><i className="ramayana-figure" /><i className="ramayana-bow" /></> : movie.art === "jailer" ? <><i className="jailer-light" /><i className="jailer-figure" /></> : movie.art === "storm" ? <><i className="storm-moon" /><i className="storm-ridge" /></> : <><i className="signal-planet" /><i className="signal-beam" /></>}</span>}
    <span className="poster-bottom"><small>{movie.genre.toUpperCase()}</small><strong>{movie.title}</strong><span>{movie.language}</span></span>
  </div>;
}

function BottomNav({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "explore", label: "Explore", icon: Telescope },
    { id: "copilot", label: "Copilot", icon: Sparkles }
  ];
  return <nav className="bottom-nav">{items.map(item => { const Icon = item.icon; return <button key={item.id} className={active === item.id ? "nav-active" : ""} onClick={() => setActive(item.id)}><Icon size={22} strokeWidth={active === item.id ? 2.3 : 1.7} /><span>{item.label}</span></button>; })}</nav>;
}

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  const [movie, setMovie] = useState<Movie>(movies[5]);
  const [activeMovieIndex, setActiveMovieIndex] = useState(3);
  const [showIntro, setShowIntro] = useState(true);
  const [trailerMuted, setTrailerMuted] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [carouselGap, setCarouselGap] = useState(158);
  useEffect(() => {
    const syncCarouselGap = () => setCarouselGap(window.innerWidth < 600 ? 92 : window.innerWidth < 950 ? 124 : 158);
    syncCarouselGap();
    window.addEventListener("resize", syncCarouselGap);
    return () => window.removeEventListener("resize", syncCarouselGap);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2400);
    return () => window.clearTimeout(timer);
  }, []);

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
  const goTab = (tab: string) => {
    setActiveTab(tab);
    setScreen(tab === "inbox" ? "inbox" : tab === "copilot" ? "copilot" : tab === "tickets" ? "tickets" : tab === "account" ? "account" : "home");
  };
  const snackTotal = snacks.popcorn * 250 + snacks.drinks * 150 + snacks.nachos * 220;
  const filteredMovies = movies.filter(item => item.title.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  const activeMovie = movies[activeMovieIndex] ?? movies[3];
  const moveMovie = (delta: number) => setActiveMovieIndex(index => (index + delta + movies.length) % movies.length);
  const changeSnack = (key: keyof typeof snacks, delta: number) => setSnacks(s => ({ ...s, [key]: Math.max(0, s[key] + delta) }));

  return <main className="cine-app">
    {showIntro && <div className="cinematic-intro" role="status" aria-label="Cineverse opening animation">
      <div className="intro-cosmos"><span className="intro-ring intro-ring-one"/><span className="intro-ring intro-ring-two"/><span className="intro-screen-glow"/></div>
      <div className="intro-brand"><span className="intro-mark">C</span><strong>CINE<span>VERSE</span></strong><small>YOUR MOVIE UNIVERSE</small></div>
      <div className="intro-loading"><span/><i/></div><p>THE SHOW IS ABOUT TO BEGIN</p>
      <button onClick={() => setShowIntro(false)}>SKIP INTRO <ChevronDown size={13}/></button>
    </div>}
    <header className="app-header">
      <button className="app-brand" onClick={() => goTab("home")}><span className="brand-emblem"><Clapperboard size={16} /></span><span>CINE<span>VERSE</span></span></button>
      <nav className="desktop-movie-nav"><button onClick={() => goTab("explore")}>Movies</button><button onClick={() => goTab("explore")}>Events</button><button onClick={() => goTab("explore")}>Plays</button><button onClick={() => goTab("explore")}>Sports</button></nav>
      <label className="site-search"><Search size={13}/><input aria-label="Search movies" placeholder="Search movies, theatres..." value={searchTerm} onChange={e => { const value = e.target.value; setSearchTerm(value); setScreen("home"); const match = movies.findIndex(item => item.title.toLowerCase().includes(value.trim().toLowerCase())); if (match >= 0) setActiveMovieIndex(match); }} /><span>⌘ K</span></label>
      <div className="header-actions header-actions-wide"><button className="header-tickets" onClick={() => goTab("tickets")}><Ticket size={13}/> My tickets</button><button className="header-location" onClick={() => window.alert("Location selection is a demo. Current showcase city: Chennai.")}><MapPin size={12}/> Chennai <ChevronDown size={12}/></button><button className="header-sign-in" onClick={() => goTab("account")}>Sign in</button></div>
      <div className="header-actions header-actions-mobile"><button aria-label="My tickets" onClick={() => goTab("tickets")}><Ticket size={17}/></button><button className="avatar-button" aria-label="Profile" onClick={() => goTab("account")}><UserRound size={17}/></button></div>
    </header>

    {(screen === "home" || screen === "explore") && <div className="screen-content home-screen">
      <section className="cinema-home-stage">
        <div className="stage-starfield"/><div className="stage-blue-orb"/><div className="stage-beam stage-beam-left"/><div className="stage-beam stage-beam-right"/>
        <div className="stage-title"><span className="stage-kicker"><i/> THE CINEVERSE EXPERIENCE</span><h1>CINE<span>VERSE</span></h1><p>DRAG TO EXPLORE · TAP A SCREEN TO BOOK</p></div>
        <div className="film-gallery" aria-label="Featured movie carousel">
          {filteredMovies.map(item => {
            const index = movies.indexOf(item);
            const offset = index - activeMovieIndex;
            const dist = Math.abs(offset);
            return <div key={item.title} role="button" tabIndex={0} aria-label={`Select ${item.title}`} className={`film-gallery-item ${offset === 0 ? "film-current" : ""}`} style={{transform:`translate(-50%, 0) translateX(${offset * carouselGap}px) translateZ(${offset === 0 ? 45 : -dist * 72}px) rotateY(${offset * -18}deg) scale(${Math.max(.64, 1 - dist * .075)})`,zIndex:30-dist*3,opacity:dist>3?.16:1}} onClick={() => { if (offset === 0) { setMovie(item); setTrailerMuted(true); setScreen("details"); } else setActiveMovieIndex(index); }} onKeyDown={e => { if(e.key==="Enter" || e.key===" ") { e.preventDefault(); setActiveMovieIndex(index); } }}>
              <div className="film-pedestal"><Poster movie={item}/><div className="film-reflection"><img src={item.posterImage} alt="" draggable={false}/></div></div>
              <div className="film-gallery-label"><span>{item.title}</span><small>{item.language}</small></div>
            </div>;
          })}
          {filteredMovies.length === 0 && <div className="no-movies-found"><Search size={22}/><strong>No movie found</strong><span>Try another title.</span></div>}
        </div>
        <div className="carousel-controls"><button aria-label="Previous movie" onClick={() => moveMovie(-1)}><ChevronLeft size={16}/></button><span>{String(activeMovieIndex+1).padStart(2,"0")} <i>/</i> {String(movies.length).padStart(2,"0")}</span><button aria-label="Next movie" onClick={() => moveMovie(1)}><ChevronRight size={16}/></button></div>
        <div className="movie-action-dock"><div className="dock-status"><i/> {activeMovieIndex === 3 ? "PRE-BOOKING OPEN" : "NOW SHOWING"}</div><div className="dock-film"><strong>{activeMovie.title}</strong><span>{activeMovie.language} · {activeMovie.genre} · <b>★ 9.6</b></span></div><div className="dock-buttons"><button className="dock-trailer" onClick={() => {setMovie(activeMovie);setTrailerMuted(true);setScreen("details");}}><Play size={11} fill="currentColor"/> Trailer</button><button className="dock-book" onClick={() => {setMovie(activeMovie);setTicketCreated(false);setScreen("showtimes");setActiveTab("home");}}>Pre-book</button></div></div>
        <div className="stage-side-label stage-side-left">THE ART OF<br/>THE BIG SCREEN</div><div className="stage-side-label stage-side-right">A NEW WAY<br/>TO EXPERIENCE CINEMA</div>
      </section>
      <div className="home-bottom-line"><span>✦ CURATED FOR THE CINEPHILE</span><span>ONE NIGHT. INFINITE WORLDS.</span><button onClick={() => goTab("tickets")}>MY TICKETS <ChevronRight size={12}/></button></div>
      <section className="home-discovery"><div className="section-row"><div><span className="section-overline">THE LINE-UP</span><h2>Stories worth <em>leaving home for.</em></h2></div><span className="section-note">Select a film to see the trailer and book.</span></div><div className="discovery-grid">{filteredMovies.map(item=><article key={item.title} className="discovery-card"><Poster movie={item} onClick={()=>{setMovie(item);setTrailerMuted(true);setScreen("details");}}/><div className="discovery-meta"><div><strong>{item.title}</strong><span>{item.genre}</span></div><button onClick={()=>{setMovie(item);setScreen("showtimes");}} aria-label={`Book ${item.title}`}><ChevronRight size={15}/></button></div></article>)}</div></section>
      <section className="venue-discovery"><div><span className="section-overline">YOUR CINEMA, YOUR WAY</span><h2>Beyond the <em>ordinary.</em></h2><p>Choose your film, step inside a detailed 3D auditorium, and find the view that feels made for you.</p></div><button className="gold-button" onClick={()=>{setMovie(movies[5]);setScreen("seats");setActiveTab("explore");}}>Explore 3D theatre <ChevronRight size={16}/></button></section>
    </div>}

    {screen === "details" && <div className="screen-content detail-screen">
      <div className={`movie-trailer-hero detail-${movie.art}`}>
        <iframe className="detail-trailer-video" src={trailerEmbedUrl(movie, trailerMuted)} title={`${movie.title} official trailer on Cineverse`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>
        <div className="trailer-gradient"/><div className="detail-topline"><button className="back-button" onClick={() => setScreen("home")}><ChevronLeft size={16}/> Movies</button><span className="cinema-live-tag"><i/> NOW PLAYING</span></div>
        <div className="movie-trailer-info"><div className="detail-poster"><Poster movie={movie} large/></div><div className="detail-title"><span className="gold-label">OFFICIAL TRAILER · CINEVERSE PREMIERE</span><h1>{movie.title}</h1><div className="detail-meta"><span>{movie.rating}</span><i/>{movie.duration}<i/>{movie.language}</div><p>{movie.synopsis}</p><div className="detail-buttons"><button className="movie-red-button" onClick={openShowtimes}>Book tickets <ChevronRight size={16}/></button><button className="trailer-sound-button" onClick={()=>setTrailerMuted(v=>!v)}>{trailerMuted ? <VolumeX size={15}/> : <Volume2 size={15}/>} {trailerMuted ? "Sound off" : "Sound on"}</button></div></div></div>
        <span className="trailer-hint"><Play size={10} fill="currentColor"/> OFFICIAL TRAILER · AUDIO MUTED BY DEFAULT</span>
      </div>
      <div className="detail-info-grid"><div><span>GENRE</span><strong>{movie.genre}</strong></div><div><span>LANGUAGE</span><strong>{movie.language}</strong></div><div><span>EXPERIENCE</span><strong>4K · Dolby Atmos</strong></div></div>
      <div className="detail-description"><span className="section-overline">THE STORY</span><h2>Made for the big screen.</h2><p>{movie.synopsis} Experience every frame with immersive sound, breathtaking visuals, and the comfort of a premium auditorium.</p><button className="gold-button" onClick={openShowtimes}>Choose your showtime <ChevronRight size={15}/></button></div>
    </div>}

    {screen === "showtimes" && <div className="screen-content showtimes-screen">
      <button className="back-button" onClick={() => setScreen("details")}><ChevronLeft size={18} /> Movie details</button><div className="showtime-movie"><Poster movie={movie} /><div><span className="gold-label">SELECT YOUR EXPERIENCE</span><h1>{movie.title}</h1><p>{movie.genre} · {movie.duration}</p><span className="venue-rating">★ 4.8 <small>audience rating</small></span></div></div>
      <div className="section-row"><div><span className="section-overline">PICK YOUR DATE</span><h2>Choose a showtime</h2></div><span className="timezone-note">Local time</span></div>
      <div className="date-strip">{dates.map((d,i) => <button key={d.day} className={dateIndex === i ? "date-active" : ""} onClick={() => setDateIndex(i)}><span>{d.day}</span><strong>{d.date}</strong><small>{i === 0 ? "OCT" : i === 1 ? "OCT" : "NOV"}</small></button>)}</div>
      <div className="section-row"><div><span className="section-overline">CINEMA & FORMAT</span><h2>Choose your screen</h2></div></div>
      {[{name:"Cineverse · IMAX",detail:"Laser 4K · Dolby Atmos · Premium recliners",distance:"1.2 km",price:"from $10"},{name:"Cineverse · Grand",detail:"4K projection · Surround sound",distance:"3.4 km",price:"from $7"}].map((v,i)=><div className={`show-venue ${venue===v.name?"venue-selected":""}`} key={v.name} onClick={() => setVenue(v.name)}><button className="venue-select" aria-label={`Select ${v.name}`}>{venue===v.name ? "✓" : ""}</button><div className="show-venue-copy"><strong>{v.name}</strong><span><MapPin size={12} /> {v.distance} away</span><small>{v.detail}</small><div className="showtime-buttons">{times.map(t=><button key={t} className={showtime===t && venue===v.name?"time-active":""} onClick={(e)=>{e.stopPropagation();setShowtime(t);setVenue(v.name);}}>{t}</button>)}</div></div><span className="venue-price">{v.price}</span></div>)}
      <div className="notice-line"><ShieldCheck size={16} /> Demo availability only — no live seats are reserved.</div><button className="gold-button full-button" onClick={openSeats}>Choose your seats <ChevronRight size={17} /></button>
    </div>}

    {screen === "seats" && <div className="screen-content seats-screen"><div className="seat-screen-heading"><button className="back-button" onClick={openShowtimes}><ChevronLeft size={18} /> Showtimes</button><div><span className="gold-label">THE IMMERSIVE EXPERIENCE</span><h1>Find your <em>perfect view.</em></h1><p>{movie.title} · {dates[dateIndex].day}, {dates[dateIndex].date} {dateIndex < 2 ? "OCT" : "NOV"} · {showtime}</p></div></div><div className="seat-intro-strip"><span className="mini-movie-icon"><Film size={18} /></span><span><strong>{venue}</strong><small>Premium auditorium · 216 seats</small></span><span className="live-pill"><i /> LIVE 3D</span></div><CinemaExperience movieTitle={movie.title} trailerUrl={`https://www.youtube.com/watch?v=${movie.trailerId}`} onCheckout={(data) => { setCheckout(data); setShowtime(data.showtime); setScreen("checkout"); }} /><div className="seat-footnote"><ShieldCheck size={15} /> This is an interactive prototype. Seat availability and prices are illustrative.</div></div>}

    {screen === "checkout" && <div className="screen-content checkout-screen"><button className="back-button" onClick={openSeats}><ChevronLeft size={18} /> Back to seats</button><div className="checkout-heading"><span className="gold-label">ALMOST MOVIE TIME</span><h1>Make it a <em>whole night.</em></h1><p>Add your favourites, review your booking, and continue to checkout.</p></div><div className="checkout-summary"><Poster movie={movie} /><div><span className="gold-label">YOUR SELECTION</span><h2>{movie.title}</h2><p><Clock3 size={13} /> {showtime} · {venue}</p><div className="selected-seat-tags">{checkout?.seats.map(s=><span key={s}>{s}</span>)}</div></div></div><div className="section-row"><div><span className="section-overline">THE SNACK BAR</span><h2>Complete the ritual</h2></div></div>{([{key:"popcorn" as const,name:"Classic popcorn",desc:"Freshly popped · salted",price:250,emoji:"🍿"},{key:"drinks" as const,name:"Chilled drink",desc:"Your favourite refreshment",price:150,emoji:"🥤"},{key:"nachos" as const,name:"Loaded nachos",desc:"Cheese dip on the side",price:220,emoji:"🌮"}]).map(item=><div className="snack-row" key={item.key}><span className="snack-emoji">{item.emoji}</span><span className="snack-copy"><strong>{item.name}</strong><small>{item.desc}</small><b>₹{item.price.toLocaleString("en-IN")}</b></span><div className="snack-stepper"><button onClick={()=>changeSnack(item.key,-1)} aria-label="Remove"><Minus size={14}/></button><strong>{snacks[item.key]}</strong><button onClick={()=>changeSnack(item.key,1)} aria-label="Add"><Plus size={14}/></button></div></div>)}<div className="bill-card"><div><span>Movie tickets ({checkout?.seats.length ?? 0})</span><b>₹{(checkout?.total ?? 0).toLocaleString("en-IN")}</b></div><div><span>Snacks & drinks</span><b>₹{snackTotal.toLocaleString("en-IN")}</b></div><div><span>Convenience fee</span><b>₹25</b></div><div className="bill-total"><span>Total amount</span><strong>₹{((checkout?.total ?? 0)+snackTotal+25).toLocaleString("en-IN")}</strong></div></div><div className="notice-line"><ShieldCheck size={16}/> Demo checkout only. No payment will be collected.</div><button className="gold-button full-button" onClick={()=>{setTicketCreated(true);setScreen("confirmation");}}>Continue to checkout <ChevronRight size={17}/></button></div>}

    {screen === "confirmation" && <div className="screen-content confirmation-screen"><div className="success-orbit"><span>✓</span></div><span className="gold-label">YOUR MOVIE NIGHT IS READY</span><h1>It's a <em>date.</em></h1><p className="confirmation-copy">Your demo ticket has been created. In a live service, this is where confirmed payment and booking details would appear.</p><div className="digital-ticket"><div className="ticket-art"><Poster movie={movie}/><div><span className="gold-label">CINEVERSE · E-TICKET</span><h2>{movie.title}</h2><p>{venue}</p><p>{dates[dateIndex].day}, {dates[dateIndex].date} · {showtime}</p></div></div><div className="ticket-perforation"><span/><i/><span/></div><div className="ticket-qr"><div className="fake-qr" aria-label="Decorative sample QR code">{Array.from({length:49},(_,i)=><i key={i} className={(i*7+i%3)%4===0?"qr-dark":""}/>)}</div><div><strong>DEMO TICKET</strong><small>Not valid for entry</small><span>CV-{String(Date.now()).slice(-6)}</span></div></div></div><button className="gold-button full-button" onClick={()=>goTab("tickets")}>View my tickets <Ticket size={17}/></button><button className="outline-button full-button" onClick={()=>goTab("home")}>Back to home</button></div>}

    {screen === "tickets" && <div className="screen-content tickets-screen"><span className="section-overline">YOUR CINEVERSE</span><h1>My <em>tickets.</em></h1><div className="ticket-tabs"><button className="tab-selected">Upcoming</button><button>Past visits</button></div>{ticketCreated ? <button className="wallet-ticket" onClick={()=>setScreen("confirmation")}><Poster movie={movie}/><span><small>DEMO E-TICKET</small><strong>{movie.title}</strong><span>{dates[dateIndex].day}, {dates[dateIndex].date} · {showtime}</span><span>{venue}</span><b>View ticket <ChevronRight size={14}/></b></span></button> : <div className="empty-tickets"><div className="empty-ticket-icon"><Ticket size={27}/></div><h2>Your next movie memory awaits.</h2><p>Your bookings will appear here. Find a film, choose your seats, and let the show begin.</p><button className="gold-button" onClick={()=>goTab("home")}>Explore movies <ChevronRight size={16}/></button></div>}<div className="ticket-help"><ShieldCheck size={16}/><span><strong>Tickets, safely stored.</strong><small>In a live app, confirmed tickets and QR codes would be available here.</small></span></div></div>}

    {screen === "inbox" && <div className="screen-content inbox-screen"><span className="section-overline">YOUR CINEVERSE</span><h1>Your <em>inbox.</em></h1><div className="inbox-empty"><span className="inbox-icon"><Inbox size={26}/></span><h2>All caught up.</h2><p>Premieres, booking updates, and exclusive cinema moments will appear here.</p><button className="gold-button" onClick={()=>goTab("explore")}>Explore movies <ChevronRight size={15}/></button></div><article className="inbox-note"><Sparkles size={17}/><div><strong>Welcome to Cineverse</strong><span>Your next movie memory starts with a film you love.</span></div></article></div>}

    {screen === "copilot" && <div className="screen-content copilot-screen"><span className="section-overline">CINEVERSE COPILOT</span><h1>Let’s find your <em>next story.</em></h1><p>Your movie companion for discovering films, choosing seats, and planning a cinema night.</p><div className="copilot-prompt-grid"><button onClick={()=>{setActiveMovieIndex(3);goTab("explore");}}>✨ What should I watch?</button><button onClick={()=>{setMovie(movies[5]);setScreen("seats");setActiveTab("explore");}}>🎟 Find my perfect seats</button><button onClick={()=>goTab("tickets")}>📩 Where are my tickets?</button></div><label className="copilot-input"><input placeholder="Ask Cineverse Copilot..." onKeyDown={e=>{if(e.key==="Enter") window.alert("Cineverse Copilot is a design prototype; AI recommendations are not connected yet.");}}/><button onClick={()=>window.alert("Cineverse Copilot is a design prototype; AI recommendations are not connected yet.")}><Sparkles size={17}/></button></label><span className="auth-note"><ShieldCheck size={14}/> AI assistance is a visual prototype and is not connected yet.</span></div>}

    {screen === "account" && <div className="screen-content account-screen"><div className="account-orb"><UserRound size={31}/></div><span className="section-overline">WELCOME TO YOUR UNIVERSE</span><h1>Your cinema.<br/><em>Your way.</em></h1><p>Sign in to keep your tickets, preferences, and movie nights all in one place.</p><div className="auth-toggle"><button className={authMode==="signin"?"auth-active":""} onClick={()=>setAuthMode("signin")}>Sign in</button><button className={authMode==="signup"?"auth-active":""} onClick={()=>setAuthMode("signup")}>Create account</button></div><label className="form-label">EMAIL ADDRESS<input type="email" placeholder="you@example.com"/></label>{authMode==="signup"&&<label className="form-label">YOUR NAME<input type="text" placeholder="How should we call you?"/></label>}<label className="form-label">PASSWORD<input type="password" placeholder="Enter your password"/></label><button className="gold-button full-button" onClick={()=>window.alert("Authentication is a visual prototype and is not connected to an account service.")}>{authMode==="signin"?"Sign in":"Create account"} <ChevronRight size={17}/></button><div className="auth-note"><ShieldCheck size={15}/> Authentication is not connected yet.</div><div className="account-perks"><div><Ticket size={18}/><span><strong>All your tickets</strong><small>One place for every booking</small></span></div><div><Wallet size={18}/><span><strong>Easy checkout</strong><small>Faster, smoother movie nights</small></span></div><div><CreditCard size={18}/><span><strong>Secure payments</strong><small>Payment integration comes next</small></span></div></div></div>}

    <BottomNav active={activeTab} setActive={goTab} />
    <footer className="app-footer"><span>✦ CINEVERSE</span><small>YOUR MOVIE UNIVERSE · INTERACTIVE PROTOTYPE</small><span className="footer-official">OFFICIAL TRAILERS · DEMO BOOKINGS</span></footer>
  </main>;
}
