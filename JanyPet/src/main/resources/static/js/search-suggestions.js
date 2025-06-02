/**
 * Search Suggestions Component
 * Provides real-time search suggestions as users type in search inputs
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all search input elements
    const searchInputs = [
        document.getElementById('searchInputHeader'),
        document.getElementById('searchInputSidebar'),
        document.getElementById('searchInputModal')
    ].filter(input => input !== null);
    
    // Get all search suggestion containers
    const suggestionsContainers = [
        document.getElementById('searchSuggestionsHeader'),
        document.getElementById('searchSuggestionsSidebar'),
        document.getElementById('searchSuggestionsModal')
    ].filter(container => container !== null);
    
    // Setup search functionality for each input
    searchInputs.forEach((input, index) => {
        let debounceTimer;
        
        input.addEventListener('input', function() {
            const keyword = this.value.trim();
            const suggestionsContainer = suggestionsContainers[index];
            
            clearTimeout(debounceTimer);
            
            // Clear suggestions if input is empty
            if (keyword.length === 0) {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            // Debounce to avoid excessive API calls
            debounceTimer = setTimeout(async () => {
                await fetchAndDisplaySuggestions(keyword, suggestionsContainer);
            }, 300);
        });
    });
    
    // Fetch and display search suggestions
    async function fetchAndDisplaySuggestions(keyword, container) {
        if (!keyword || !container) return;
        
        // Show loading indicator
        container.innerHTML = '<div class="p-2 text-center"><div class="spinner-border spinner-border-sm" role="status"></div></div>';
        container.style.display = 'block';
        
        try {
            // Check if ShopProductService exists and has searchProducts method
            if (!window.ShopProductService || typeof window.ShopProductService.searchProducts !== 'function') {
                throw new Error('Search service not available');
            }
            
            // Get search results - the function now handles its own errors
            const results = await window.ShopProductService.searchProducts(keyword);
            
            // Display results even if empty
            displaySuggestions(results, container, keyword);
        } catch (error) {
            console.error('Failed to fetch search suggestions:', error);
            
            // Show error message in suggestions container
            container.innerHTML = `
                <div class="p-3 text-center">
                    <p class="text-danger mb-0">
                        <i class="fas fa-exclamation-circle me-1"></i>
                        Không thể tải kết quả tìm kiếm
                    </p>
                </div>
            `;
        }
    }
    
    // Display search suggestions in container
    function displaySuggestions(results, container, keyword) {
        // Clear container
        container.innerHTML = '';
        
        // If no results, show message
        if (!results || results.length === 0) {
            container.innerHTML = `
                <div class="p-3 text-center">
                    <p class="text-muted mb-0">
                        <i class="fas fa-search me-1"></i>
                        Không tìm thấy sản phẩm nào cho "${keyword}"
                    </p>
                </div>
            `;
            return;
        }
        
        // Create suggestion items
        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'search-suggestions-list';
        
        // Limit to 5 results
        results.slice(0, 5).forEach(product => {
            const item = document.createElement('a');
            item.href = `single-product.html?id=${product.id}`;
            item.className = 'search-suggestion-item';
            
            item.innerHTML = `
                <div class="d-flex align-items-center p-2">
                    <div class="flex-shrink-0">
                        <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}" 
                            class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-0">${highlightKeyword(product.name, keyword)}</h6>
                        <p class="text-primary mb-0">${formatCurrency(product.price)}</p>
                    </div>
                </div>
            `;
            suggestionsList.appendChild(item);
        });
        
        // Add view all results link if there are more than 5 results
        if (results.length > 5) {
            const viewAllLink = document.createElement('a');
            viewAllLink.href = `shop.html?keyword=${encodeURIComponent(keyword)}`;
            viewAllLink.className = 'search-view-all';
            viewAllLink.innerHTML = `
                <div class="d-flex justify-content-center p-2 border-top">
                    <p class="mb-0">
                        <i class="fas fa-search me-1"></i>
                        Xem tất cả ${results.length} kết quả
                    </p>
                </div>
            `;
            suggestionsList.appendChild(viewAllLink);
        }
        
        container.appendChild(suggestionsList);
        container.style.display = 'block';
    }
    
    // Helper function to highlight keyword in text
    function highlightKeyword(text, keyword) {
        if (!keyword) return text;
        
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<strong class="highlight">$1</strong>');
    }
    
    // Helper function to format currency
    function formatCurrency(price) {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    }
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
        suggestionsContainers.forEach(container => {
            if (container && !container.contains(event.target)) {
                container.style.display = 'none';
            }
        });
    });
});