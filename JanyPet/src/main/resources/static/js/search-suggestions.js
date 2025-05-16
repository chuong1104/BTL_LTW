document.addEventListener('DOMContentLoaded', () => {
    const searchInputHeader = document.getElementById('searchInputHeader');
    const suggestionsContainerHeader = document.getElementById('searchSuggestionsHeader');
    const searchFormHeader = document.getElementById('search-form-header');

    const searchInputModal = document.getElementById('searchInputModal');
    const suggestionsContainerModal = document.getElementById('searchSuggestionsModal');
    const searchFormModal = document.getElementById('search-form-modal');
    const searchModalElement = document.getElementById('searchModal');

    // Add elements for sidebar search
    const searchInputSidebar = document.getElementById('searchInputSidebar');
    const suggestionsContainerSidebar = document.getElementById('searchSuggestionsSidebar');
    const searchFormSidebar = document.getElementById('search-form-sidebar');


    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    async function fetchAndDisplaySuggestions(searchTerm, container, baseUrl) {
        if (searchTerm.length < 2) { // Minimum characters to trigger search
            hideSuggestions(container);
            return;
        }

        try {
            const response = await fetch(`/api/products/search?name=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                if (response.status === 204) { // No content
                    hideSuggestions(container);
                    return;
                }
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const products = await response.json();
            displaySuggestions(products, container, baseUrl);
        } catch (error) {
            console.error('Failed to fetch search suggestions:', error);
            hideSuggestions(container);
        }
    }

    function displaySuggestions(products, container, baseUrl) {
        if (!container) return; // Add a guard clause
        container.innerHTML = ''; // Clear previous suggestions
        if (!products || products.length === 0) {
            container.style.display = 'none';
            return;
        }

        products.slice(0, 5).forEach(product => { // Show max 5 suggestions
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');

            const link = document.createElement('a');
            link.href = `${baseUrl}?keyword=${encodeURIComponent(product.name)}`;

            let content = '';
            if (product.imageUrl) {
                let fullImageUrl = product.imageUrl;
                if (!product.imageUrl.startsWith('http') && !product.imageUrl.startsWith('/')) {
                    fullImageUrl = `/uploads/${product.imageUrl}`;
                }
                content += `<img src="${fullImageUrl}" alt="${product.name}" style="width:30px; height:30px; margin-right:8px; vertical-align:middle; object-fit:cover;">`;
            }
            content += product.name;
            link.innerHTML = content;

            suggestionItem.appendChild(link);
            container.appendChild(suggestionItem);
        });
        container.style.display = 'block';
    }

    function hideSuggestions(container) {
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    }

    const debouncedFetchHeader = debounce(fetchAndDisplaySuggestions, 300);
    const debouncedFetchModal = debounce(fetchAndDisplaySuggestions, 300);
    // Add debounced function for sidebar
    const debouncedFetchSidebar = debounce(fetchAndDisplaySuggestions, 300);


    function setupSearchListener(searchInput, suggestionsContainer, form, debouncedFetchFunction) {
        if (!searchInput || !suggestionsContainer) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            debouncedFetchFunction(searchTerm, suggestionsContainer, 'shop.html');
        });

        searchInput.addEventListener('focus', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length >= 2) {
                 debouncedFetchFunction(searchTerm, suggestionsContainer, 'shop.html');
            }
        });

        if (form) {
            form.addEventListener('submit', () => {
                hideSuggestions(suggestionsContainer);
            });
        }
    }

    // Setup for header search
    if (searchInputHeader && suggestionsContainerHeader) {
        setupSearchListener(searchInputHeader, suggestionsContainerHeader, searchFormHeader, debouncedFetchHeader);
    }

    // Setup for modal search
    if (searchInputModal && suggestionsContainerModal) {
        setupSearchListener(searchInputModal, suggestionsContainerModal, searchFormModal, debouncedFetchModal);
    }

    // Setup for sidebar search
    if (searchInputSidebar && suggestionsContainerSidebar) {
        setupSearchListener(searchInputSidebar, suggestionsContainerSidebar, searchFormSidebar, debouncedFetchSidebar);
    }


    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (suggestionsContainerHeader && !suggestionsContainerHeader.contains(e.target) && searchInputHeader && !searchInputHeader.contains(e.target)) {
            hideSuggestions(suggestionsContainerHeader);
        }
        // For modal
        if (searchModalElement && searchModalElement.classList.contains('show')) {
             if (suggestionsContainerModal && !suggestionsContainerModal.contains(e.target) && searchInputModal && !searchInputModal.contains(e.target)) {
                const modalBody = searchModalElement.querySelector('.modal-body');
                if (modalBody && modalBody.contains(e.target) && !e.target.closest('.suggestion-item')) {
                    hideSuggestions(suggestionsContainerModal);
                } else if (!modalBody || !modalBody.contains(e.target)) {
                     hideSuggestions(suggestionsContainerModal);
                }
            }
        }
        // For sidebar
        if (suggestionsContainerSidebar && !suggestionsContainerSidebar.contains(e.target) && searchInputSidebar && !searchInputSidebar.contains(e.target)) {
            // Check if the click is inside the sidebar but not on the input or suggestions
            const sidebar = searchInputSidebar.closest('.sidebar'); // Find the parent sidebar
            if (sidebar && sidebar.contains(e.target) && !e.target.closest('.suggestion-item')) {
                 hideSuggestions(suggestionsContainerSidebar);
            } else if (!sidebar || !sidebar.contains(e.target)) {
                // Click is outside the sidebar entirely
                 hideSuggestions(suggestionsContainerSidebar);
            }
        }
    });
    
    if (searchModalElement) {
        searchModalElement.addEventListener('hidden.bs.modal', () => {
            hideSuggestions(suggestionsContainerModal);
            if (searchInputModal) searchInputModal.value = '';
        });
    }
});