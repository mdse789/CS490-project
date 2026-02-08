import { useEffect, useState } from "react";

/* List all customer using pagination*/
function FilmsPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
   <div>

      <button onClick={onBack}>Landing Page</button>
      
      <h1>Customer Page</h1>
      <p>Searching...</p>
    </div>
  );
}


export default FilmsPage;