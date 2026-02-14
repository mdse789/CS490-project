/* List all customer using pagination*/
import { useEffect, useState } from "react";

function CustomerPage({ onBack }) {

  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const fetchCustomers = (page) => {
    fetch(`http://127.0.0.1:5000/api/customer_all?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers);
        setTotalPages(data.total_pages);
      })
      .catch((err) => console.error("Error fetching customer data", err));
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

 
return (
 <div>
<div className="customer-page-container">
      <button onClick={onBack}>Back to Home</button>
      <h1>Customer Page</h1>

      <div className="results-list">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <h2>{"Id: "}{customer.id}</h2>
            <h3>{"Name: "}{customer.first_name} {customer.last_name}</h3>
            <p>{"Email: "}{customer.email}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="pagination-controls">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>

        <span> Page {currentPage} of {totalPages} </span>

        <button 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(prev => prev + 1)}>
          Next
        </button>
      </div>
      
 </div>
  );
}

export default CustomerPage;