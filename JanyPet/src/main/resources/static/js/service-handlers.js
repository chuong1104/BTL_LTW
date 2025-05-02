/**
 * Service Management Handler
 */
const ServiceHandlers = {
  servicesList: [],
  currentServiceId: null,
  
  // Initialize service events
  initializeServiceEvents: function() {
    // Load services when section is shown
    document.querySelectorAll('.menu-item').forEach(item => {
      if (item.dataset.section === 'services-section') {
        item.addEventListener('click', () => {
          this.loadServices();
        });
      }
    });
    
    // Add service button
    document.getElementById('add-service-btn').addEventListener('click', () => {
      this.resetServiceForm();
      document.getElementById('service-form-title').textContent = 'Add New Service';
    });
    
    // Add service item button
    document.getElementById('add-service-item').addEventListener('click', () => {
      this.addServiceItemRow();
    });
    
    // Form submission
    document.getElementById('service-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveService();
    });
    
    // Initialize the services table
    this.loadServices();
  },
  
  // Load all services
  loadServices: function() {
    fetch('/api/services')
      .then(response => response.json())
      .then(data => {
        this.servicesList = data;
        this.renderServicesTable(data);
      })
      .catch(error => {
        console.error('Error loading services:', error);
        window.toastService.showToast('Error loading services', 'error');
      });
  },
  
  // Render services table
  renderServicesTable: function(services) {
    const tableBody = document.getElementById('services-table-body');
    tableBody.innerHTML = '';
    
    if (services.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No services found</td>
        </tr>
      `;
      return;
    }
    
    services.forEach(service => {
      const row = document.createElement('tr');
      row.dataset.id = service.id;
      
      row.innerHTML = `
        <td>${service.name}</td>
        <td>${service.category}</td>
        <td>${service.duration} mins</td>
        <td>$${service.basePrice.toFixed(2)}</td>
        <td>${service.availability || 'N/A'}</td>
        <td><span class="status ${service.active ? 'active' : 'inactive'}">${service.active ? 'Active' : 'Inactive'}</span></td>
        <td class="actions">
          <button class="icon-btn edit-btn" data-id="${service.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn delete-btn" data-id="${service.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('#services-table-body .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editService(btn.dataset.id);
      });
    });
    
    document.querySelectorAll('#services-table-body .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteService(btn.dataset.id);
      });
    });
  },
  
  // Reset the service form
  resetServiceForm: function() {
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = '';
    document.getElementById('service-items-list').innerHTML = '';
    this.currentServiceId = null;
  },
  
  // Add a new service item row
  addServiceItemRow: function() {
    const template = document.getElementById('service-item-template');
    const container = document.getElementById('service-items-list');
    
    // Clone the template
    const serviceItem = template.content.cloneNode(true);
    container.appendChild(serviceItem);
    
    // Add event listener to delete button
    const deleteBtn = container.lastElementChild.querySelector('.delete-service-item');
    deleteBtn.addEventListener('click', function() {
      this.closest('.service-item').remove();
    });
  },
  
  // Edit a service
  editService: function(serviceId) {
    const service = this.servicesList.find(s => s.id === serviceId);
    if (!service) return;
    
    this.currentServiceId = serviceId;
    document.getElementById('service-form-title').textContent = 'Edit Service';
    
    // Set form values
    document.getElementById('service-id').value = service.id;
    document.getElementById('service-name').value = service.name;
    document.getElementById('service-description').value = service.description || '';
    document.getElementById('service-category').value = service.category;
    document.getElementById('service-base-price').value = service.basePrice;
    document.getElementById('service-duration').value = service.duration;
    document.getElementById('service-small-price').value = service.smallPetPrice;
    document.getElementById('service-medium-price').value = service.mediumPetPrice;
    document.getElementById('service-large-price').value = service.largePetPrice;
    document.getElementById('service-xlarge-price').value = service.xlargePetPrice;
    document.getElementById('service-images').value = service.images || '';
    document.getElementById('service-max-pets').value = service.maxPetsPerSlot || 1;
    document.getElementById('service-icon-class').value = service.iconClass || '';
    document.getElementById('service-procedure').value = service.procedure || '';
    document.getElementById('service-benefits').value = service.benefits || '';
    document.getElementById('service-notes').value = service.notes || '';
    
    // Set checkboxes
    document.getElementById('service-requires-vaccination').checked = service.requiresVaccination || false;
    document.getElementById('service-is-featured').checked = service.isFeatured || false;
    document.getElementById('service-is-popular').checked = service.isPopular || false;
    document.getElementById('service-active').checked = service.active || false;
    
    // Set availability checkboxes
    if (service.availability) {
      const days = service.availability.split(',');
      document.querySelectorAll('[id^="availability-"]').forEach(checkbox => {
        checkbox.checked = days.includes(checkbox.value);
      });
    }
    
    // Set included items
    if (service.includedItems && service.includedItems.length > 0) {
      document.getElementById('service-included-items').value = service.includedItems.join('\n');
    }
    
    // Add service items
    document.getElementById('service-items-list').innerHTML = '';
    if (service.serviceItems && service.serviceItems.length > 0) {
      service.serviceItems.forEach(item => {
        this.addServiceItemRow();
        const itemContainer = document.getElementById('service-items-list').lastElementChild;
        
        itemContainer.querySelector('.service-item-name').value = item.name;
        itemContainer.querySelector('.service-item-small-price').value = item.smallPetPrice;
        itemContainer.querySelector('.service-item-medium-price').value = item.mediumPetPrice;
        itemContainer.querySelector('.service-item-large-price').value = item.largePetPrice;
        itemContainer.querySelector('.service-item-xlarge-price').value = item.xlargePetPrice;
        itemContainer.querySelector('.service-item-duration').value = item.duration;
      });
    }
    
    // Scroll to form
    document.getElementById('service-form').scrollIntoView({behavior: 'smooth'});
  },
  
  // Save a service
  saveService: function() {
    // Get form values
    const serviceId = document.getElementById('service-id').value;
    const serviceData = {
      name: document.getElementById('service-name').value,
      description: document.getElementById('service-description').value,
      category: document.getElementById('service-category').value,
      basePrice: parseFloat(document.getElementById('service-base-price').value),
      duration: parseInt(document.getElementById('service-duration').value),
      smallPetPrice: parseFloat(document.getElementById('service-small-price').value),
      mediumPetPrice: parseFloat(document.getElementById('service-medium-price').value),
      largePetPrice: parseFloat(document.getElementById('service-large-price').value),
      xlargePetPrice: parseFloat(document.getElementById('service-xlarge-price').value),
      images: document.getElementById('service-images').value,
      maxPetsPerSlot: parseInt(document.getElementById('service-max-pets').value) || 1,
      iconClass: document.getElementById('service-icon-class').value,
      procedure: document.getElementById('service-procedure').value,
      benefits: document.getElementById('service-benefits').value,
      notes: document.getElementById('service-notes').value,
      requiresVaccination: document.getElementById('service-requires-vaccination').checked,
      isFeatured: document.getElementById('service-is-featured').checked,
      isPopular: document.getElementById('service-is-popular').checked,
      active: document.getElementById('service-active').checked
    };
    
    // Get availability
    const selectedDays = [];
    document.querySelectorAll('[id^="availability-"]:checked').forEach(checkbox => {
      selectedDays.push(checkbox.value);
    });
    serviceData.availability = selectedDays.join(',');
    
    // Get included items
    const includedItemsText = document.getElementById('service-included-items').value;
    if (includedItemsText) {
      serviceData.includedItems = includedItemsText.split('\n').filter(item => item.trim() !== '');
    }
    
    // Get service items
    const serviceItems = [];
    document.querySelectorAll('.service-item').forEach(item => {
      const name = item.querySelector('.service-item-name').value;
      if (name) {
        serviceItems.push({
          name: name,
          smallPetPrice: parseFloat(item.querySelector('.service-item-small-price').value) || 0,
          mediumPetPrice: parseFloat(item.querySelector('.service-item-medium-price').value) || 0,
          largePetPrice: parseFloat(item.querySelector('.service-item-large-price').value) || 0,
          xlargePetPrice: parseFloat(item.querySelector('.service-item-xlarge-price').value) || 0,
          duration: parseInt(item.querySelector('.service-item-duration').value) || 0
        });
      }
    });
    serviceData.serviceItems = serviceItems;
    
    // Send request to API
    const url = serviceId ? `/api/services/${serviceId}` : '/api/services';
    const method = serviceId ? 'PUT' : 'POST';
    
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        window.toastService.showToast(`Service ${serviceId ? 'updated' : 'created'} successfully!`, 'success');
        this.resetServiceForm();
        this.loadServices();
      })
      .catch(error => {
        console.error('Error saving service:', error);
        window.toastService.showToast(`Error ${serviceId ? 'updating' : 'creating'} service: ${error.message}`, 'error');
      });
  },
  
  // Delete a service
  deleteService: function(serviceId) {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          window.toastService.showToast('Service deleted successfully!', 'success');
          this.loadServices();
        })
        .catch(error => {
          console.error('Error deleting service:', error);
          window.toastService.showToast(`Error deleting service: ${error.message}`, 'error');
        });
    }
  }
};

// Initialize service handlers when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  ServiceHandlers.initializeServiceEvents();
});