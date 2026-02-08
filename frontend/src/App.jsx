import { useEffect, useState } from "react";

function Landingpage() {
  return (
    <div>
        <h1>Welcome to the Rental Store</h1>
    
    <div>
    <button onClick={() =>console.log("Go to Films")} >Films </button>
    <button onClick={() =>console.log("Go to Customer Page")} >Customer Page</button>
    </div>
    </div>
  );

}

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);

  return <Landingpage/>;
}

export default App;

