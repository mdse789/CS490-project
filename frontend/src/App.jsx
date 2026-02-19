import { useEffect, useState } from "react";
import FilmsPage from "./FilmsPage";
import CustomerPage from "./CustomerPage";
import "./App.css"
import Modal from "./ModalPage";

function Landingpage({ onNavigate }) {
  const [topFilm, setTopFilms] = useState([]);
  const [topActors, setTopActors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const handleOpenModal = (item) => {
    if (item.film_id) {
      fetch(`http://127.0.0.1:5000/api/film_details/${item.film_id}`)
        .then(res => res.json())
        .then(data => {
          setSelectedItem(data);
          setIsOpen(true);
        })
        .catch(err => console.error("Error fetching film details:", err));
    } else if (item.actor_id) {
      fetch(`http://127.0.0.1:5000/api/actors/${item.actor_id}`)
        .then(res => res.json())
        .then(data => {
          setSelectedItem(data);
          setIsOpen(true);
        });
    }
  };

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/top5films")
      .then(res => {
        if (!res.ok) throw new Error("Error fetching films");
        return res.json();
      })
      .then(data => setTopFilms(data))
      .catch(err => setError(err.message));


    fetch("http://127.0.0.1:5000/api/top5actors")
      .then(res => res.json())
      .then(data => setTopActors(data))
  }, []);
  return (
    <div className="landing-container">
      <div className="title-block">
        <h1>Welcome to the Rental Store</h1>

        <div>
          <button onClick={() => onNavigate("films")}>Films</button>
          <button onClick={() => onNavigate("customer")}>Customer Page</button>
        </div>
      </div>

      <div className="tables-grid">
        <div className="tables-wrapper">
          <h2>Top 5 Rented Films</h2>
          <table>
            <thead>
              <tr>
                <th>Film ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Rentals</th>
              </tr>
            </thead>
            <tbody>
              {topFilm.map((film) => (
                <tr
                  key={film.film_id}
                  onClick={() => handleOpenModal(film)}
                  className="click-row"
                >
                  <td>{film.film_id}</td>
                  <td>{film.title}</td>
                  <td>{film.category}</td>
                  <td>{film.rented}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tables-wrapper">
          <h2>Top 5 Actors</h2>
          <table>
            <thead>
              <tr>
                <th>Actor ID</th>
                <th>Name</th>
                <th>Film Count</th>
              </tr>
            </thead>
            <tbody>
              {topActors.map((actor) => (
                <tr key={actor.actor_id}
                  onClick={() => handleOpenModal(actor)}
                  className="click-row"
                >
                  <td>{actor.actor_id}</td>
                  <td>{actor.first_name} {actor.last_name}</td>
                  <td>{actor.movies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        {selectedItem && (
          <div className="modal-content">
            {selectedItem.title ? (
              <>
                <h2>{selectedItem.title}</h2>
                <p><strong>Film ID:</strong> {selectedItem.id}</p>
                <p><strong>Description:</strong> {selectedItem.description}</p>
                <p><strong>Release Year:</strong> {selectedItem.year}</p>
                <p><strong>Rating:</strong> {selectedItem.rating}</p>
                <p><strong>Length:</strong> {selectedItem.length} minutes</p>
                <p><strong>Replacement Cost:</strong> ${selectedItem.replacement_cost}</p>
                <p><strong>Special Features:</strong> {Array.isArray(selectedItem.special_features) ? selectedItem.special_features.join(', ')
                  : String(selectedItem.special_features).replace(/[{'}]/g, '')}</p>
              </>
            ) : (
              <div className="actor-details">
                <h3>Top 5 Movies</h3>
                {Array.isArray(selectedItem) ? (
                  selectedItem.map((film) => (
                    <div key={film.film_id} className="actor-film-row">
                      <p><strong>Film ID:</strong> {film.film_id}</p>
                      <p><strong>Title:</strong> {film.title}</p>
                      <hr />
                    </div>
                  ))
                ) : (
                  <p>No film data found</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );

}

function App() {
  const [view, setView] = useState("home");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div>
        {view === "home" && <Landingpage onNavigate={setView} />}
        {view === "films" && <FilmsPage onBack={() => setView("home")} />}
        {view === "customer" && <CustomerPage onBack={() => setView("home")} />}
      </div>
    </div>
  );
}

export default App;

