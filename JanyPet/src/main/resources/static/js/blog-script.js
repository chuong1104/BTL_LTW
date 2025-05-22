document.addEventListener('DOMContentLoaded', async () => {
  // Check if auth service exists and initialize it
  if (window.authService) {
    window.authService.initAuth();
  }
  
  // Check if we're on a single blog post page or the blog listing page
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');
  
  if (blogId) {
    // Load single blog post
    await loadSingleBlog(blogId);
  } else {
    // Load blog listing
    await loadBlogListing();
  }
});

// Load blog listing page
async function loadBlogListing() {
  try {
    // Get URL parameters for filtering and pagination
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = 6; // Number of blogs per page
    
    // Prepare filters
    const filters = {
      page,
      limit,
    };
    
    if (category) {
      filters.category = category;
    }
    
    // Fetch blogs with pagination
    const response = await window.apiService.getBlogs(filters);
    
    // Update UI with blogs
    updateBlogListingUI(response.content, response.totalPages, page);
    
    // Load categories for sidebar
    await loadBlogCategories();
    
  } catch (error) {
    console.error('Error loading blog listing:', error);
    showErrorMessage('Unable to load blog posts. Please try again later.');
  }
}

// Load single blog post
async function loadSingleBlog(blogId) {
  try {
    // Fetch the blog post
    const blog = await window.apiService.getBlogById(blogId);
    
    // Update UI with blog data
    updateSingleBlogUI(blog);
    
    // Load related blog posts
    if (blog.category) {
      loadRelatedBlogs(blog.id, blog.category);
    }
    
  } catch (error) {
    console.error('Error loading blog post:', error);
    showErrorMessage('Unable to load the requested blog post. Please try again later.');
  }
}

// Load blog categories
async function loadBlogCategories() {
  try {
    // This would be a separate API endpoint in your backend
    const response = await fetch(`${API_BASE_URL}/blogs/categories`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog categories: ${response.status}`);
    }
    
    const categories = await response.json();
    
    // Update sidebar with categories
    updateCategoriesSidebar(categories);
    
  } catch (error) {
    console.error('Error loading blog categories:', error);
    // This is non-critical, so we don't show an error to the user
  }
}

// Load related blog posts
async function loadRelatedBlogs(currentBlogId, category) {
  try {
    // Fetch related posts in the same category
    const blogs = await window.apiService.getBlogs({
      category,
      limit: 3,
      excludeId: currentBlogId
    });
    
    // Update UI with related blogs
    updateRelatedBlogsUI(blogs.content);
    
  } catch (error) {
    console.error('Error loading related blogs:', error);
    // This is non-critical, so we don't show an error to the user
  }
}

// Update blog listing UI
function updateBlogListingUI(blogs, totalPages, currentPage) {
  if (!blogs || blogs.length === 0) {
    // Show message for no blogs
    const blogContainer = document.querySelector('.blog-container');
    if (blogContainer) {
      blogContainer.innerHTML = '<div class="col-12 text-center py-5"><h3>No blog posts found</h3></div>';
    }
    return;
  }
  
  // Update blog listing
  const blogContainer = document.querySelector('.blog-container');
  if (blogContainer) {
    // Clear existing content
    blogContainer.innerHTML = '';
    
    // Add blog items
    blogs.forEach(blog => {
      const date = new Date(blog.date);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      
      const blogItem = document.createElement('div');
      blogItem.className = 'col-md-6 my-4';
      blogItem.innerHTML = `
        <div class="z-1 position-absolute rounded-3 m-2 px-3 pt-1 bg-light">
          <h3 class="secondary-font text-primary m-0">${day}</h3>
          <p class="secondary-font fs-6 m-0">${month}</p>
        </div>
        <div class="card position-relative">
          <a href="single-post.html?id=${blog.id}"><img src="${blog.image}" class="img-fluid rounded-4" alt="${blog.title}"></a>
          <div class="card-body p-0">
            <a href="single-post.html?id=${blog.id}">
              <h3 class="card-title pt-4 pb-3 m-0">${blog.title}</h3>
            </a>
            <div class="card-text">
              <p class="blog-paragraph fs-6">${blog.excerpt || blog.content.substring(0, 120)}...</p>
              <a href="single-post.html?id=${blog.id}" class="blog-read">read more</a>
            </div>
          </div>
        </div>
      `;
      blogContainer.appendChild(blogItem);
    });
    
    // Add pagination
    const paginationContainer = document.querySelector('.pagination-container');
    if (paginationContainer && totalPages > 1) {
      paginationContainer.innerHTML = createPaginationHTML(currentPage, totalPages);
    }
  }
}

// Update single blog post UI
function updateSingleBlogUI(blog) {
  if (!blog) return;
  
  // Update blog title
  const titleElement = document.querySelector('.blog-title');
  if (titleElement) {
    titleElement.textContent = blog.title;
  }
  
  // Update blog image
  const imageElement = document.querySelector('.blog-image');
  if (imageElement) {
    imageElement.src = blog.image;
    imageElement.alt = blog.title;
  }
  
  // Update blog date
  const dateElement = document.querySelector('.blog-date');
  if (dateElement) {
    const date = new Date(blog.date);
    dateElement.textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Update blog author
  const authorElement = document.querySelector('.blog-author');
  if (authorElement) {
    authorElement.textContent = blog.author || 'Admin';
  }
  
  // Update blog content
  const contentElement = document.querySelector('.blog-content');
  if (contentElement) {
    contentElement.innerHTML = blog.content;
  }
  
  // Update blog category
  const categoryElement = document.querySelector('.blog-category');
  if (categoryElement && blog.category) {
    categoryElement.textContent = blog.category;
    categoryElement.href = `blog.html?category=${blog.category}`;
  }
  
  // Update blog tags
  const tagsElement = document.querySelector('.blog-tags');
  if (tagsElement && blog.tags && blog.tags.length > 0) {
    tagsElement.innerHTML = blog.tags.map(tag => 
      `<a href="blog.html?tag=${tag}" class="badge bg-light text-dark me-1">${tag}</a>`
    ).join('');
  }
}

// Update related blogs UI
function updateRelatedBlogsUI(blogs) {
  if (!blogs || blogs.length === 0) return;
  
  const relatedPostsContainer = document.querySelector('.related-posts-container');
  if (!relatedPostsContainer) return;
  
  // Clear existing content
  relatedPostsContainer.innerHTML = '<h3 class="mb-4">Related Posts</h3>';
  
  // Create row for posts
  const row = document.createElement('div');
  row.className = 'row';
  
  // Add related blog items
  blogs.forEach(blog => {
    const relatedBlogItem = document.createElement('div');
    relatedBlogItem.className = 'col-md-4 mb-4';
    relatedBlogItem.innerHTML = `
      <div class="card h-100">
        <a href="single-post.html?id=${blog.id}">
          <img src="${blog.image}" class="card-img-top" alt="${blog.title}">
        </a>
        <div class="card-body">
          <h5 class="card-title">
            <a href="single-post.html?id=${blog.id}" class="text-dark">${blog.title}</a>
          </h5>
          <p class="card-text">${blog.excerpt || blog.content.substring(0, 80)}...</p>
          <a href="single-post.html?id=${blog.id}" class="blog-read">Read more</a>
        </div>
      </div>
    `;
    row.appendChild(relatedBlogItem);
  });
  
  relatedPostsContainer.appendChild(row);
}

// Update categories sidebar
function updateCategoriesSidebar(categories) {
  if (!categories || categories.length === 0) return;
  
  const categoriesList = document.querySelector('.categories-list');
  if (!categoriesList) return;
  
  // Clear existing content
  categoriesList.innerHTML = '';
  
  // Add category items
  categories.forEach(category => {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.innerHTML = `
      <a href="blog.html?category=${category.slug}" class="text-dark">${category.name}</a>
      <span class="badge bg-primary rounded-pill">${category.count}</span>
    `;
    categoriesList.appendChild(listItem);
  });
}

// Create pagination HTML
function createPaginationHTML(currentPage, totalPages) {
  let paginationHTML = '<ul class="pagination justify-content-center">';
  
  // Previous button
  if (currentPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="blog.html?page=${currentPage - 1}" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;
  } else {
    paginationHTML += `
      <li class="page-item disabled">
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;
  }
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      paginationHTML += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`;
    } else {
      paginationHTML += `<li class="page-item"><a class="page-link" href="blog.html?page=${i}">${i}</a></li>`;
    }
  }
  
  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="blog.html?page=${currentPage + 1}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;
  } else {
    paginationHTML += `
      <li class="page-item disabled">
        <a class="page-link" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;
  }
  
  paginationHTML += '</ul>';
  
  return paginationHTML;
}

// Show error message
function showErrorMessage(message) {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    // Create alert container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.className = 'container mt-3';
    
    // Insert after header
    const header = document.querySelector('header');
    if (header) {
      header.parentNode.insertBefore(container, header.nextSibling);
    } else {
      // If header not found, insert at the beginning of body
      document.body.insertBefore(container, document.body.firstChild);
    }
  }
  
  const alertElement = document.getElementById('alert-container');
  
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger alert-dismissible fade show';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertElement.innerHTML = '';
  alertElement.appendChild(alert);
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}