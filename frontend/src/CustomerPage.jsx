/* List all customer using pagination*/
import { useEffect, useState } from "react";
import Modal from "./ModalPage";
import "./FandC.css"

function CustomerPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [jumpPage, setJumpPage] = useState("");
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

  const handlePageJump = (e) => {
  e.preventDefault();
  const pageNum = parseInt(jumpPage);

  if (pageNum >= 1 && pageNum <= totalPages) {
    setCurrentPage(pageNum);
    setJumpPage(""); 
  } else {
    alert(`Please enter a page between 1 and ${totalPages}`);
  }
};
 
return (
 <div>
<div className="customer-page-containerC">
    <div className="heads">
      <button onClick={onBack}>Back to Home</button>
      <h1>Customer Page</h1>
    </div>  
      
      <p>Customer Search: Enter Name or Id</p>
   <div className="search-barC">
  <input
    type="text"
    placeholder="Search name or ID..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button onClick={handleSearch}>Search</button>
</div>

      <div className="results-listC">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-card" 
          onClick={() =>handleCardClick(customer)}
          style={{cursor: 'help'}}
          >
            <p>{"Id: "}{customer.id}</p>
            <p>{"Name: "}{customer.first_name} {customer.last_name}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="pagination-controls">

       <form onSubmit={handlePageJump} style={{ display: 'inline', marginLeft: '15px' }}>
          <input 
            type="number" 
            placeholder="Go to page"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ marginLeft: '5px' }}>Go</button>
        </form>
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
                <div className="modal-inner-contentC">
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