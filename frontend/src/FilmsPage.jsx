import { useEffect, useState } from "react";

function FilmsPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);

  const fetchFilms = (query = "") => {
      fetch(`http://127.0.0.1:5000/api/films?search=${query}`)
      .then((res) => res.json())
      .then((data) => setFilms(data))
      .catch((err) => console.error("Error fetching films:", err));
  };

  return (
 <div>

  <button onClick={onBack}>Back to Home</button>



<div className="films-page-container">
      
      <h1>Film Search</h1>
      <p1>Enter Film Name, Actor Name or Genre</p1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => fetchFilms(searchTerm)}>Search</button>
      </div>

      <div className="results-list">
        {films.map((film) => (
          <div key={film.id} className="film-card">
            <h2>{"Id: "} {film.id}</h2>
            <h3>{film.title} ({film.year})</h3>
            <p>{film.description}</p>
          </div>
        ))}
      </div>
    </div>
      
 </div>
  );
}




export default FilmsPage;