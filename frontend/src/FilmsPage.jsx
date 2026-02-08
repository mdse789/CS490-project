import { useEffect, useState } from "react";

/* User wants search for a film by name, name of an actor or genre */
function FilmsPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
   <div>

      <button onClick={onBack}>Landing Page</button>
      
      <h1>Films Page</h1>
      <p>Searching...</p>
    </div>
  );
}


export default FilmsPage;