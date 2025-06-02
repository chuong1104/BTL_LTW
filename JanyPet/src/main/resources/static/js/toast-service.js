/**
 * Toast Service - Provides toast notification functionality across the application
 */
window.toastService = (function() {
    // Container for toast notifications
    let container = null;

    // Toast configuration options
    const defaultOptions = {
        duration: 5000,    // 5 seconds
        position: 'bottom-right'
    };

    /**
     * Initialize toast container
     */
    const initContainer = () => {
        // Check if container already exists
        container = document.getElementById('toast-container');
        
        // If not, create a new one
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '1050';
            document.body.appendChild(container);
        }
    };

    /**
     * Create and show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {Object} options - Additional options
     */
    const showToast = (message, type = 'info', options = {}) => {
        initContainer();
        
        const settings = { ...defaultOptions, ...options };
        
        // Create toast element
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center border-0 ${getToastClass(type)}`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        // Create toast content
        const flexContainer = document.createElement('div');
        flexContainer.className = 'd-flex';
        
        const toastBody = document.createElement('div');
        toastBody.className = 'toast-body d-flex align-items-center';
        
        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = getToastIconClass(type);
        icon.style.marginRight = '10px';
        
        toastBody.appendChild(icon);
        toastBody.appendChild(document.createTextNode(message));
        flexContainer.appendChild(toastBody);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close btn-close-white me-2 m-auto';
        closeButton.setAttribute('data-bs-dismiss', 'toast');
        closeButton.setAttribute('aria-label', 'Close');
        flexContainer.appendChild(closeButton);
        
        toastEl.appendChild(flexContainer);
        
        // Append toast to container
        container.appendChild(toastEl);
        
        // Initialize Bootstrap toast
        const toast = new bootstrap.Toast(toastEl, {
            delay: settings.duration,
            autohide: true
        });
        
        // Show toast
        toast.show();
        
        // Remove toast element after it's hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            container.removeChild(toastEl);
        });
    };

    /**
     * Get toast CSS class based on type
     * @param {string} type - Toast type
     * @returns {string} CSS class
     */
    const getToastClass = (type) => {
        switch (type.toLowerCase()) {
            case 'success': return 'text-white bg-success';
            case 'error': return 'text-white bg-danger';
            case 'warning': return 'text-dark bg-warning';
            case 'info': return 'text-white bg-info';
            default: return 'text-white bg-primary';
        }
    };

    /**
     * Get toast icon class based on type
     * @param {string} type - Toast type
     * @returns {string} Icon class
     */
    const getToastIconClass = (type) => {
        switch (type.toLowerCase()) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            case 'info': return 'fas fa-info-circle';
            default: return 'fas fa-info-circle';
        }
    };

    /**
     * Show a success toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     */
    const showSuccessToast = (message, options = {}) => {
        showToast(message, 'success', options);
    };

    /**
     * Show an error toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     */
    const showErrorToast = (message, options = {}) => {
        showToast(message, 'error', options);
    };

    /**
     * Show a warning toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     */
    const showWarningToast = (message, options = {}) => {
        showToast(message, 'warning', options);
    };

    /**
     * Show an info toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     */
    const showInfoToast = (message, options = {}) => {
        showToast(message, 'info', options);
    };

    // Public API
    return {
        showToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast
    };
})();
