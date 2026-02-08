import { useEffect, useState } from "react";

function FilmsPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);

  const fetchFilms = (query = "") => {
    fetch(`http://localhost:5000/api/films?search=${query}`)
      .then((res) => res.json())
      .then((data) => setFilms(data))
      .catch((err) => console.error("Error fetching films:", err));
  };

  return (
 <div>
<div className="films-page-container">
      <button onClick={onBack}>Back to Home</button>
      <h1>Film Search</h1>
      <p1>Searching films name only</p1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Actor Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => fetchFilms(searchTerm)}>Search</button>
      </div>

      <div className="results-list">
        {films.map((film) => (
          <div key={film.id} className="film-card">
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