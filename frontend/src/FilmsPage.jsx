import { useEffect, useState } from "react";
import Modal from "./ModalPage";
import "./FandC.css"

function FilmsPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  

  const fetchFilms = (query = "") => {
    if (searchTerm.length === 0) {
      alert("Please movie name, id, actor or genre.");
      return;
    }
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
    });
};

  return (
 <div>
   <div className="films-page-container">
     <div className="heads">
      <button onClick={onBack}>Back to Home</button>
       <h1>Film Search</h1>
      </div>
      <p>Enter Film Name, Actor Name or Genre</p>
      <div className="search-barF">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => fetchFilms(searchTerm)}>Search</button>
      </div>
    
      <div className="results-listF">
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
        <div className="modal-inner-contentF">
          <h2>{selectedFilm.title}</h2> <strong> Film Id:</strong> {selectedFilm.id}
          <p> <strong>Release Year:</strong> {selectedFilm.year} </p>
          <p><strong>Description: </strong>{selectedFilm.description}</p>
          <p><strong>Length: </strong>{selectedFilm.length} min</p>
          <p><strong>Rating: </strong>{selectedFilm.rating}</p>
      </div>
    )}
  </Modal>

    </div>
      
 </div>
  );
}



export default FilmsPage;