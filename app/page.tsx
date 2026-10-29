import CinemaExperience from "@/components/CinemaExperience";

const films = [
  { title: "Jailer 2", genre: "Action · Thriller · Tamil", badge: "FEATURED", cls: "poster-one", art: "JAILER 2" },
  { title: "After the Storm", genre: "Drama · Mystery", badge: "8.4", cls: "poster-two", art: "AFTER THE STORM" },
  { title: "Last Signal", genre: "Sci-fi · Adventure", badge: "8.1", cls: "poster-three", art: "LAST SIGNAL" }
];

export default function Home() {
  return <main className="site-shell">
    <nav className="topbar">
      <a className="brand" href="#top"><span className="brand-mark">C</span> CINEVERSE</a>
      <div className="nav-links"><a href="#movies">Movies</a><a href="#experience">3D Experience</a><a href="#how">How it works</a></div>
      <a className="profile-button" href="#experience">Book a seat <span>↗</span></a>
    </nav>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><span className="live-dot" /> A NEW WAY TO GO TO THE MOVIES</div>
        <h1>Don’t just watch.<br /><em>Step inside.</em></h1>
        <p>Explore the theatre in 3D. Find your perfect view. Choose your seats while the big screen takes centre stage.</p>
        <a className="primary-button" href="#experience">Explore the cinema <span>↗</span></a>
        <div className="hero-meta"><span>✦ IMMERSIVE 3D</span><span>✦ INTERACTIVE SEATS</span><span>✦ CINEMATIC DESIGN</span></div>
      </div>
      <div className="hero-art" aria-label="Illustration of a cinematic auditorium">
        <div className="hero-glow" /><div className="hero-screen"><div className="screen-caption">YOUR NEXT MOVIE NIGHT<br /><b>STARTS HERE.</b></div></div>
        <div className="seat-wave">{Array.from({length:7},(_,r)=><div className="seat-row" key={r}>{Array.from({length:11},(_,i)=><span key={i} className={(r+i)%5===0?"seat seat-gold":"seat"} />)}</div>)}</div>
        <div className="art-label"><span className="live-dot" /> CINEMA 01 <span>•</span> PREMIUM EXPERIENCE</div>
      </div>
    </section>

    <section className="section-head" id="movies"><div><span className="section-kicker">NOW SHOWING · CONCEPT LINEUP</span><h2>Pick your next <em>escape.</em></h2></div><span className="section-note">Select a film, then explore its theatre.</span></section>
    <section className="movie-strip">
      {films.map((film,i)=><article className="movie-card" key={film.title}><a href="#experience" className={`poster ${film.cls}`}><span className="poster-tag">{film.badge}</span><span className="poster-title">{film.art}</span><span className="poster-cta">EXPLORE FILM ↗</span></a><div className="movie-info"><div><h3>{film.title}</h3><p>{film.genre}</p></div>{i===0?<span className="rating">DEMO</span>:<span className="rating">★ {film.badge}</span>}</div></article>)}
    </section>

    <section className="experience-section" id="experience">
      <div className="experience-heading"><div><span className="section-kicker">THE MAIN EVENT</span><h2>Your seat. Your angle. <em>Your cinema.</em></h2></div><p>Drag to orbit · Scroll to zoom · Click a seat to select it</p></div>
      <CinemaExperience />
    </section>

    <section className="how-section" id="how"><span className="section-kicker">SIMPLE, BUT CINEMATIC</span><h2>Movie night, <em>reimagined.</em></h2><div className="steps"><article><b>01</b><h3>Choose a movie</h3><p>Discover a film from the featured lineup.</p></article><article><b>02</b><h3>Explore in 3D</h3><p>Orbit the auditorium, zoom in, and preview your view.</p></article><article><b>03</b><h3>Pick your seats</h3><p>Select seats in the scene and review your demo total.</p></article></div></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">C</span> CINEVERSE</a><span>Built for the love of the big screen.</span><span>Interactive prototype · Not a live ticket service</span></footer>
  </main>;
}