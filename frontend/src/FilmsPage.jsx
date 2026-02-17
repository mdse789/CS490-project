import { useEffect, useState } from "react";
import Modal from "./ModalPage";

function FilmsPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);

  const [selectedFilm, setSelectedFilm] = useState(null);
  

  const fetchFilms = (query = "") => {
      fetch(`http://127.0.0.1:5000/api/films?search=${query}`)
      .then((res) => res.json())
      .then((data) => setFilms(data))
      .catch((err) => console.error("Error fetching films:", err));
  };

 const handleCardClick = (film) => {
  fetch(`http://127.0.0.1:5000/api/film_details/${film.id}`)
    .then(res => res.json())
    .then(fullData => {
      setSelectedFilm(fullData); 
      setIsOpen(true);          
    });
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
          <div key={film.id} className="film-card"
            onClick={() => handleCardClick(film)}
            style={{ cursor: 'help'}}
          >
            <h2>{"Id: "} {film.id}</h2>
            <h3>{film.title} ({film.year})</h3>
          </div>
        ))}
      </div>
      
      
  <Modal 
      open={selectedFilm !== null} 
      onClose={() => setSelectedFilm(null)}
  >
      {selectedFilm && (
        <div className="modal-inner-content">
          <h2>{selectedFilm.title}</h2> <strong> Film Id:</strong> {selectedFilm.id}
          <div> <strong>Release Year:</strong> {selectedFilm.year} </div>
          <p>{selectedFilm.description}</p>
          <p>Length: {selectedFilm.length} min</p>
          <p>Rating: {selectedFilm.rating}</p>
      </div>
    )}
  </Modal>

    </div>
      
 </div>
  );
}



export default FilmsPage;