// Main JavaScript for IntelliSent Blog

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeSearch();
    initializeFilters();
    initializeReadingProgress();
    initializeLazyLoading();
    initializeTooltips();
    initializeShareButtons();
    
    console.log('🚀 IntelliSent Blog initialized successfully!');
});

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            hideSearchResults();
            return;
        }
        
        searchTimeout = setTimeout(() => performSearch(query), 300);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-box')) {
            hideSearchResults();
        }
    });
}

async function performSearch(query) {
    try {
        // Search in GitHub Issues
        const response = await fetch(`https://api.github.com/repos/IntelliApp-pl/intellisent-blog/issues?q=${encodeURIComponent(query)}&state=open&per_page=5`);
        const issues = await response.json();
        
        displaySearchResults(issues, query);
    } catch (error) {
        console.error('Search error:', error);
        displaySearchError();
    }
}

function displaySearchResults(issues, query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    if (issues.length === 0) {
        searchResults.innerHTML = `
            <div class="search-result-item text-muted">
                <i class="fas fa-search me-2"></i>
                Brak wyników dla "${query}"
            </div>
        `;
        searchResults.style.display = 'block';
        return;
    }
    
    const resultsHTML = issues.map(issue => {
        const title = issue.title.replace(/\[.*?\]\s*/, ''); // Remove prefixes
        const excerpt = issue.body ? issue.body.substring(0, 100) + '...' : '';
        const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        
        return `
            <div class="search-result-item" onclick="window.location.href='/posts/${slug}/'">
                <h6 class="mb-1">${highlightSearchTerm(title, query)}</h6>
                <p class="mb-1 small text-muted">${highlightSearchTerm(excerpt, query)}</p>
                <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    ${new Date(issue.created_at).toLocaleDateString('pl-PL')}
                    <i class="fas fa-comments ms-2 me-1"></i>
                    ${issue.comments}
                </small>
            </div>
        `;
    }).join('');
    
    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = 'block';
}

function highlightSearchTerm(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function displaySearchError() {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    searchResults.innerHTML = `
        <div class="search-result-item text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Błąd podczas wyszukiwania
        </div>
    `;
    searchResults.style.display = 'block';
}

function hideSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogPosts = document.querySelectorAll('.blog-post');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Filter posts
            blogPosts.forEach(post => {
                const labels = post.dataset.labels || '';
                const category = post.dataset.category || '';
                
                if (filter === 'all' || 
                    labels.toLowerCase().includes(filter.toLowerCase()) ||
                    category.toLowerCase().includes(filter.toLowerCase())) {
                    post.style.display = 'block';
                    post.classList.remove('d-none');
                } else {
                    post.style.display = 'none';
                    post.classList.add('d-none');
                }
            });
            
            // Update URL without page reload
            const url = new URL(window.location);
            if (filter === 'all') {
                url.searchParams.delete('filter');
            } else {
                url.searchParams.set('filter', filter);
            }
            window.history.replaceState({}, '', url);
        });
    });
    
    // Apply filter from URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const activeFilter = urlParams.get('filter');
    if (activeFilter) {
        const filterButton = document.querySelector(`[data-filter="${activeFilter}"]`);
        if (filterButton) {
            filterButton.click();
        }
    }
}

// Reading progress indicator
function initializeReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;
    
    function updateReadingProgress() {
        const article = document.querySelector('.post-content, .issue-content');
        if (!article) return;
        
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
        
        progressBar.style.width = scrollPercent + '%';
    }
    
    window.addEventListener('scroll', updateReadingProgress);
    updateReadingProgress(); // Initial call
}

// Lazy loading for images
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Share functionality
function initializeShareButtons() {
    // Copy link functionality
    window.copyToClipboard = function(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                showToast('Link skopiowany do schowka!', 'success');
            }).catch(function(err) {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    };
    
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('Link skopiowany do schowka!', 'success');
        } catch (err) {
            showToast('Nie można skopiować linku', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = 'toast-' + Date.now();
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger', 
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white ${bgClass} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast with Bootstrap
    if (typeof bootstrap !== 'undefined') {
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        bsToast.show();
        
        // Remove toast from DOM after it's hidden
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    } else {
        // Fallback without Bootstrap
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Load more posts functionality (for pagination)
function loadMorePosts() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', async function() {
        const currentPage = parseInt(this.dataset.page || '1');
        const nextPage = currentPage + 1;
        
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Ładowanie...';
        this.disabled = true;
        
        try {
            const response = await fetch(`https://api.github.com/repos/IntelliApp-pl/intellisent-blog/issues?state=open&page=${nextPage}&per_page=6`);
            const issues = await response.json();
            
            if (issues.length === 0) {
                this.innerHTML = 'Brak więcej postów';
                this.disabled = true;
                return;
            }
            
            // Add new posts to the grid
            const postsGrid = document.getElementById('posts-grid');
            issues.forEach(issue => {
                const postElement = createPostElement(issue);
                postsGrid.appendChild(postElement);
            });
            
            // Update button
            this.dataset.page = nextPage;
            this.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Wczytaj więcej';
            this.disabled = false;
            
        } catch (error) {
            console.error('Error loading more posts:', error);
            showToast('Błąd podczas ładowania postów', 'error');
            this.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Wczytaj więcej';
            this.disabled = false;
        }
    });
}

// Create post element from GitHub issue data
function createPostElement(issue) {
    const title = issue.title.replace(/\[.*?\]\s*/, '');
    const excerpt = issue.body ? issue.body.substring(0, 150) + '...' : '';
    const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const labels = issue.labels.map(label => 
        `<span class="badge rounded-pill me-1" style="background-color: #${label.color}; color: ${label.color === 'ffffff' ? '#000' : '#fff'}">${label.name}</span>`
    ).join('');
    
    const div = document.createElement('div');
    div.className = 'col-lg-4 col-md-6 mb-4 blog-post';
    div.dataset.labels = issue.labels.map(l => l.name).join(' ').toLowerCase();
    div.dataset.category = issue.labels[0]?.name.toLowerCase() || 'uncategorized';
    
    div.innerHTML = `
        <article class="card h-100 border-0 shadow-sm hover-lift blog-post-card">
            <div class="card-header border-0 bg-transparent pb-0">
                ${labels}
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-3">
                    <a href="/posts/${slug}/" class="text-decoration-none text-dark stretched-link">
                        ${title}
                    </a>
                </h5>
                <p class="card-text text-muted flex-grow-1">${excerpt}</p>
                <div class="d-flex justify-content-between align-items-center text-muted small">
                    <div class="d-flex align-items-center">
                        <img src="${issue.user.avatar_url}" alt="${issue.user.login}" 
                             class="rounded-circle me-2" width="24" height="24">
                        <span>${issue.user.login}</span>
                    </div>
                    <div>
                        <i class="fas fa-calendar-alt me-1"></i>
                        ${new Date(issue.created_at).toLocaleDateString('pl-PL')}
                    </div>
                </div>
            </div>
            <div class="card-footer border-0 bg-transparent">
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="fas fa-comments me-1"></i>
                        ${issue.comments} komentarzy
                    </small>
                    <small>
                        <a href="${issue.html_url}" target="_blank" class="text-muted text-decoration-none">
                            <i class="fab fa-github me-1"></i>GitHub
                        </a>
                    </small>
                </div>
            </div>
        </article>
    `;
    
    return div;
}

// Initialize load more functionality
document.addEventListener('DOMContentLoaded', function() {
    loadMorePosts();
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Theme switcher (if needed in the future)
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update button icon
        const icon = this.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
}

// Performance monitoring
function trackPagePerformance() {
    if ('performance' in window && 'measure' in performance) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`⚡ Page loaded in ${loadTime}ms`);
                
                // Track to analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_load_time', {
                        event_category: 'Performance',
                        event_label: window.location.pathname,
                        value: loadTime
                    });
                }
            }, 0);
        });
    }
}

// Initialize performance tracking
document.addEventListener('DOMContentLoaded', trackPagePerformance);
