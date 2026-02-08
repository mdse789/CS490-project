import { useEffect, useState } from "react";
import FilmsPage from "./FilmsPage";
import CustomerPage from "./CustomerPage";

function Landingpage({ onNavigate }) {
  return (
    <div>
        <h1>Welcome to the Rental Store</h1>
    <div>
    <button onClick={() => onNavigate("films")}>Films</button>
    <button onClick={() => onNavigate("customer")}>Customer Page</button>
    </div>
    </div>
  );

}

function App() {
  const [view, setView] = useState("home");

  /*useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);*/

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

