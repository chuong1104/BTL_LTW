/**
 * Enhanced Detail Views - Improves the detail view presentation in admin panel
 */
const EnhancedDetailViews = {
  /**
   * Create a product detail view
   * @param {Object} product - Product data
   * @returns {String} HTML content for the modal
   */
  createProductDetailView(product) {
    if (!product) return '<p>Product data not available</p>';
    
    const statusClass = product.isActive ? 'active' : 'inactive';
    const statusText = product.isActive ? 'Active' : 'Inactive';
    
    return `
      <div class="detail-view">
        <div class="detail-section">
          <div class="d-flex align-items-center justify-content-between">
            <h3>${product.name}</h3>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
          
          <div class="image-preview-container mt-3">
            ${product.imageUrl ? 
              `<img src="${product.imageUrl}" alt="${product.name}" class="img-fluid">` : 
              `<div class="no-image">No image available</div>`
            }
          </div>
        </div>
        
        <div class="detail-section">
          <h3>Product Details</h3>
          <div class="property-list">
            <div class="property-item">
              <div class="property-label">ID</div>
              <div class="property-value">${product.id}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Category</div>
              <div class="property-value">${product.categoryName || 'Uncategorized'}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Price</div>
              <div class="property-value">${this.formatCurrency(product.price)}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Stock</div>
              <div class="property-value">${product.stock} units</div>
            </div>
            <div class="property-item full-width">
              <div class="property-label">Description</div>
              <div class="property-value description-content">${product.description || 'No description provided'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Create an order detail view
   * @param {Object} order - Order data
   * @returns {String} HTML content for the modal
   */
  createOrderDetailView(order) {
    if (!order) return '<p>Order data not available</p>';
    
    // Generate order items HTML
    const itemsHtml = order.orderDetails && order.orderDetails.length > 0
      ? order.orderDetails.map(item => `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              ${item.productImage ? 
                `<img src="/uploads/${item.productImage}" alt="${item.productName}" class="me-2" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
                ''
              }
              <div>
                <div class="fw-medium">${item.productName || 'N/A'}</div>
                <div class="text-muted small">
                  ${item.productColor && item.productColor !== "Default" ? `Color: ${item.productColor}` : ""}
                  ${item.productSize && item.productSize !== "Default" ? `Size: ${item.productSize}` : ""}
                </div>
              </div>
            </div>
          </td>
          <td class="text-center">${item.quantity || 0}</td>
          <td class="text-end">${this.formatCurrency(item.unitPrice || 0)}</td>
          <td class="text-end">${this.formatCurrency(item.subtotal || 0)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" class="text-center">No products in this order</td></tr>';
    
    return `
      <div class="detail-view">
        <div class="detail-section">
          <div class="d-flex align-items-center justify-content-between">
            <h3>Order #${order.orderCode || order.id}</h3>
            <span class="status-badge ${order.status?.toLowerCase() || 'pending'}">${order.status || 'PENDING'}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>Customer Information</h3>
          <div class="property-list">
            <div class="property-item">
              <div class="property-label">Name</div>
              <div class="property-value">${order.customerFirstName || ''} ${order.customerLastName || ''}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Email</div>
              <div class="property-value">${order.customerEmail || 'N/A'}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Phone</div>
              <div class="property-value">${order.customerPhone || 'N/A'}</div>
            </div>
            <div class="property-item full-width">
              <div class="property-label">Shipping Address</div>
              <div class="property-value">
                ${order.shippingAddress || 'N/A'}<br>
                ${order.shippingWard || ''}, ${order.shippingDistrict || ''}, ${order.shippingCity || ''}
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>Order Items</h3>
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-center">Quantity</th>
                <th class="text-end">Price</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                <td class="text-end">${this.formatCurrency(order.subtotalAmount || 0)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end">Shipping Fee:</td>
                <td class="text-end">${this.formatCurrency(order.shippingFee || 0)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end">Discount:</td>
                <td class="text-end">-${this.formatCurrency(order.discountAmount || 0)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end"><strong>Total:</strong></td>
                <td class="text-end"><strong>${this.formatCurrency(order.totalAmount || 0)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="detail-section">
          <h3>Order Details</h3>
          <div class="property-list">
            <div class="property-item">
              <div class="property-label">Order Date</div>
              <div class="property-value">${order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Payment Method</div>
              <div class="property-value">${order.paymentMethod || 'N/A'}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Payment Status</div>
              <div class="property-value">
                <span class="status-badge ${order.paymentStatus?.toLowerCase() || 'pending'}">${order.paymentStatus || 'PENDING'}</span>
              </div>
            </div>
            <div class="property-item">
              <div class="property-label">Shipping Method</div>
              <div class="property-value">${order.shippingMethod || 'N/A'}</div>
            </div>
            ${order.orderNotes ? `
            <div class="property-item full-width">
              <div class="property-label">Notes</div>
              <div class="property-value">${order.orderNotes}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    if (typeof amount !== 'number') amount = 0;
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  /**
   * Show product details in modal
   * @param {Object} product - Product data
   */
  showProductDetails(product) {
    const content = this.createProductDetailView(product);
    window.ModalHandlers.showDetailModal(`Product: ${product.name}`, content, 'medium');
  },
  
  /**
   * Show order details in modal
   * @param {Object} order - Order data
   */
  showOrderDetails(order) {
    const content = this.createOrderDetailView(order);
    window.ModalHandlers.showDetailModal(`Order #${order.orderCode || order.id}`, content, 'large');
  }
};

// Export to global scope
window.EnhancedDetailViews = EnhancedDetailViews;