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
  const [rentalHistory, setRentalHistory] = useState([]);


  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const openDeleteConfirm = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", address: "", address2: "", city: "", country: "", postal_code: "", phone: ""
  });
  const [errors, setErrors] = useState([]);

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


const fetchRentalHistory = (customerId) => {
    fetch(`http://127.0.0.1:5000/api/customer_rentals/${customerId}`)
      .then(res => res.json())
      .then(data => setRentalHistory(data))
      .catch(err => console.error("Error fetching history:", err));
};

  const handleCardClick = (customer) => {

    fetch(`http://127.0.0.1:5000/api/customer_details/${customer.id}`)
      .then(res => res.json())
      .then(fullData => {
        setSelectedCustomer(fullData);
        fetchRentalHistory(customer.id);
      })
      .catch(err => console.error("Error fetching details:", err));
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ first_name: "", last_name: "", email: "", address: "", address2: "", city: "", district: "", country: "", postal_code: "", phone: "" });
    setIsFormOpen(true);
  };

  const openEditForm = async(e, customer) => {
    e.stopPropagation(); 
    setEditId(customer.id);

    const response = await fetch(`http://127.0.0.1:5000/api/customer_details/${customer.id}`);
    const data = await response.json();

    setFormData({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || "",
      address: data.address || "",
      address2: data.address2 || "",
      city: data.city || "",
      district: data.district || "",
      country: data.country || "",
      postal_code: data.postal_code || "",
      phone: data.phone || ""
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    let validationErrors = [];
    const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    // Rule 1: Names (No Numbers)
    if (/\d/.test(formData.first_name) || /\d/.test(formData.last_name)) {
      validationErrors.push("First and Last names cannot contain numbers.");
    }

    if (!emailRegex.test(formData.email)) {
      validationErrors.push("Please enter a valid email address (example: name@email.com).");
  }

    // Rule 2: Phone (Only Numbers)
    if (!/^\d+$/.test(formData.phone)) {
      validationErrors.push("Phone number must contain only digits (no dashes or spaces).");
    }

  // Rule 3: Postal Code (Length Check for Sakila)
    if (formData.postal_code.length > 5) {
      validationErrors.push("Postal code cannot be longer than 5 characters.");
    }

  // If there are errors, stop and show them
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return; // Stop the fetch call
    }

  try {
    const url = editId 
      ? `http://127.0.0.1:5000/api/customers/edit/${editId}` 
      : `http://127.0.0.1:5000/api/customers`;
    
    const response = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await response.json();

    if (response.ok) {
      setIsFormOpen(false);
      fetchCustomers(currentPage, searchTerm);
      setErrors([]); // Clear any leftover messages on success
    } else {
      setErrors([result.error || "A database error occurred."]);
    }
  } catch (err) {
    setErrors(["Server is unreachable."]);
  }
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

  const handleDelete = async (id) => {
    try {
    const response = await fetch(`http://127.0.0.1:5000/api/customers/delete/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setIsDeleteModalOpen(false); 
      fetchCustomers(currentPage, searchTerm); 
    } else {
      const result = await response.json();
      alert(result.error || "Constraint Error: Cannot delete customers with rental history.");
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
  };

const handleReturn = (rentalId) => {
    fetch(`http://127.0.0.1:5000/api/rentals/return/${rentalId}`, {
 method: 'PUT', 
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert(data.message);
            fetchRentalHistory(selectedCustomer.id);
        }
    })
    .catch(err => console.error("Error returning film:", err));
};

  return (
    <div>
      <div className="customer-page-containerC">
        <div className="heads">
          <button onClick={onBack}>Back to Home</button>
          <h1>Customer Page</h1>
        </div>

        <p>Customer Search: Enter Name or Id</p>
        <div className="controls-wrapper">
          <button onClick={openAddForm} className="add-button"> + Add New Customer</button>
        <div className="search-barC">
          <input
            type="text"
            placeholder="Search name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        </div>


        <div className="results-listC">
          {customers.map((customer) => (
            <div key={customer.id} className="customer-card"
              onClick={() => handleCardClick(customer)}
              style={{ cursor: 'help' }}
            >
              <p>{"Id: "}{customer.id}</p>
              <p>{"Name: "}{customer.first_name} {customer.last_name}</p>
              <div className="card-actions">
                <button onClick={(e) => openEditForm(e, customer)}>Edit</button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  openDeleteConfirm(customer)}}
                  >Delete</button>
              </div>
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
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}> Previous </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}> Next </button>
      </div>
      
      <Modal open={selectedCustomer !== null} onClose={() => setSelectedCustomer(null)}>
          {selectedCustomer && (
              <div className="modal-inner-contentC">
                  <strong> Id:</strong> {selectedCustomer.id}
                  <h2>{selectedCustomer.first_name} {selectedCustomer.last_name}</h2> 
                  <p>Email:  {selectedCustomer.email} </p>
                  <p>Address: {selectedCustomer.address}</p>
                  <p>Phone: {selectedCustomer.phone}</p>
              </div>
            )}
            <h3>Rental History</h3>
            <div className="rent-histC">
              <table className="rental-table">
                <thead>
                <tr>
                  <th>Film Name</th>
                  <th>Rent date</th>
                  <th>Return date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
                </thead>
              <tbody>
                  {rentalHistory.map(rental => (
                    <tr key={rental.rental_id}>
                      <td>{rental.title}</td>
                      <td>{rental.rental_date}</td>
                      <td>{rental.return_date}</td>
                      <td>{rental.status}</td>
                      <td>
                        {rental.return_date === "Still Out" && (
                          <button onClick={() => handleReturn(rental.rental_id)}>Return</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal>

          <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleFormSubmit} className="customer-form-modal">
          <h2>{editId ? "Edit Customer" : "Add New Customer"}</h2>
          <input type="text" placeholder="First Name" value={formData.first_name} required 
            onChange={e => setFormData({...formData, first_name: e.target.value})} />
          <input type="text" placeholder="Last Name" value={formData.last_name} required 
            onChange={e => setFormData({...formData, last_name: e.target.value})} />
          <input type="email" placeholder="Email" value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} required/>
          <input type="text" placeholder="Address" value={formData.address} required 
            onChange={e => setFormData({...formData, address: e.target.value})} />
          <input type="text" placeholder="Address Line 2" value={formData.address2} 
            onChange={e => setFormData({...formData, address2: e.target.value})} />
          <input type="text" placeholder="City" value={formData.city} required 
            onChange={e => setFormData({...formData, city: e.target.value})} />
          <input type="text" placeholder="Postal Code" value={formData.postal_code} required 
            onChange={e => setFormData({...formData, postal_code: e.target.value})} />
          <input type="text" placeholder="District/State" value={formData.district} required 
            onChange={e => setFormData({...formData, district: e.target.value})} />
          <input type="text" placeholder="Country" value={formData.country} required 
            onChange={e => setFormData({...formData, country: e.target.value})} />
          <input type="number" placeholder="Phone" value={formData.phone} required 
            onChange={e => setFormData({...formData, phone: e.target.value})} />
          <div className="form-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsFormOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="delete-confirm-modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to permanently delete <strong>{customerToDelete?.first_name} {customerToDelete?.last_name}</strong>?</p>
          <p className="warning-note">THIS CANNOT BE UNDONE</p>
    
          <div className="form-buttons">
            <button 
              className="confirm-delete-btn" 
              onClick={() => handleDelete(customerToDelete.id)}
            >
              Yes, delete
            </button>
            <button type="button" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

 </div>
  );
}

export default CustomerPage;