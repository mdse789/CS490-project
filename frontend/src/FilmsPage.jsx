import { useEffect, useState } from "react";
import Modal from "./ModalPage";
import "./FandC.css"

function FilmsPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [renting, setRenting] = useState(false); 
  const [customerId, setCustomerId] = useState("");

  const fetchFilms = (query = "") => {
    if (searchTerm.length === 0) {
      alert("Please enter a movie name, id, actor or genre.");
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

  const handleRent = (filmId, custId) => {
    if (!custId) {
      alert("Please enter a Customer ID");
      return;
    }

    fetch(`http://127.0.0.1:5000/api/rentals/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        film_id: filmId,
        customer_id: parseInt(custId) 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert("Success! " + data.message);
        setSelectedFilm(null);
        setRenting(false);
        setCustomerId(""); 
      }
    })
    .catch(err => console.error("Error in the rent:", err));
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
              style={{ cursor: 'help' }}
            >
              <h2>{"Id: "} {film.id}</h2>
              <h3>{film.title} ({film.year})</h3>
            </div>
          ))}
        </div>

        <Modal open={selectedFilm !== null} onClose={() => { setSelectedFilm(null); setRenting(false); }}>
          {selectedFilm && (
            <div className="modal-inner-contentF">
              {!renting ? (
                <>
                  <h2>{selectedFilm.title}</h2> <strong> Film Id:</strong> {selectedFilm.id}
                  <p> <strong>Release Year:</strong> {selectedFilm.year} </p>
                  <p><strong>Description: </strong>{selectedFilm.description}</p>
                  <p><strong>Length: </strong>{selectedFilm.length} min</p>
                  <p><strong>Rating: </strong>{selectedFilm.rating}</p>
                  <button className="rent-btn" onClick={() => setRenting(true)}> Rent this Film </button>
                </>
              ) : (
                <div className="rental-form">
                  <h2>Rental Form</h2>
                  <h2>Filme Name "{selectedFilm.title}"</h2>
                  <p>Please enter the Customer ID:</p>

                  <input
                    type="number"
                    placeholder="Customer ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="rental-input"
                  />

                  <div className="form-actions">
                    <button onClick={() => setRenting(false)}>Cancel</button>
                    <button onClick={() => handleRent(selectedFilm.id, customerId)}>Confirm </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default FilmsPage;