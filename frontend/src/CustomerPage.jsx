/* List all customer using pagination*/
import { useEffect, useState } from "react";
import Modal from "./ModalPage";

function CustomerPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = (page, query = "") => {
    fetch(`http://127.0.0.1:5000/api/customer_all?page=${page}&search=${query}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers);
        setTotalPages(data.total_pages);
      })
      .catch((err) => console.error("Error fetching customer data", err));
};

  useEffect(() => {
    fetchCustomers(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers(1, searchTerm);
};

const handleCardClick = (customer) => {
  
    fetch(`http://127.0.0.1:5000/api/customer_details/${customer.id}`)
      .then(res => res.json())
      .then(fullData => {
        setSelectedCustomer(fullData);
      })
      .catch(err => console.error("Error fetching details:", err));
  };
 
return (
 <div>
<div className="customer-page-container">
      <button onClick={onBack}>Back to Home</button>
      <h1>Customer Page</h1>
      
      <h2>Customer Search</h2>
      <p1>Enter Name or Id</p1>
   <div className="search-bar">
  <input
    type="text"
    placeholder="Search name or ID..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button onClick={handleSearch}>Search</button>
</div>

      <div className="results-list">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-card" 
          onClick={() =>handleCardClick(customer)}
          style={{cursor: 'help'}}
          >
            <h3>{"Id: "}{customer.id}</h3>
            <h4>{"Name: "}{customer.first_name} {customer.last_name}</h4>
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
      
      <Modal 
          open={selectedCustomer !== null} 
          onClose={() => setSelectedCustomer(null)}
      >
          {selectedCustomer && (
                <div className="modal-inner-content">
                  <strong> Id:</strong> {selectedCustomer.id}
                  <h2>{selectedCustomer.first_name} {selectedCustomer.last_name}</h2> 
                  <p>Email:  {selectedCustomer.email} </p>
                  <p>Address: {selectedCustomer.address}</p>
                  <p>Phone: {selectedCustomer.phone}</p>
              </div>
            )}
          </Modal>

 </div>
  );
}

export default CustomerPage;