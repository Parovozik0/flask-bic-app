// Navigation between pages
function navigateTo(page) {
    const pageUrls = { container: '/container', kp: '/kp', buking: '/buking' };
    const url = pageUrls[page];
    if (!url) return console.error('Unknown page:', page);
    currentPage = page;
    window.history.pushState({ page }, '', url);
    updateSidebar(page);
    loadPageContent(url, currentPage === 'container' ? '40/20' : null);
}

// Update sidebar active state
function updateSidebar(activePage) {
    document.querySelectorAll('.sidebar nav ul li').forEach(item => {
        item.classList.toggle('active', item.dataset.page === activePage);
    });
}

// Attach sidebar navigation listeners
function attachSidebarListeners() {
    const sidebarNav = document.querySelector('.sidebar nav ul');
    if (!sidebarNav) return;
    // Remove previous handler if it exists
    if (sidebarNav._sidebarClickHandler) {
        sidebarNav.removeEventListener('click', sidebarNav._sidebarClickHandler);
    }
    // New handler
    const handler = e => {
        const li = e.target.closest('li[data-page]');
        if (li) navigateTo(li.dataset.page);
    };
    sidebarNav.addEventListener('click', handler);
    sidebarNav._sidebarClickHandler = handler;
}

// Load page content via fetch
async function loadPageContent(url, selectedValue) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Only change #main-content, not the entire body!
        const newMain = doc.getElementById('main-content');
        if (newMain) {
            document.getElementById('main-content').innerHTML = newMain.innerHTML;
        }

        afterPageLoad();
        if (currentPage === 'container' && selectedValue) {
            attachSelectListener(selectedValue);
        }
        updateSidebar(currentPage);
        document.title = doc.querySelector('title')?.textContent || 'Контейнеры';
    } catch (error) {
        console.error('Error loading page content:', error);
        window.location.href = url;
    }
}

// Handle browser back/forward buttons
window.onpopstate = (event) => {
    if (event.state?.page) {
        currentPage = event.state.page;
        updateSidebar(currentPage);
        loadPageContent(event.state.page === 'container' ? '/container' : `/${event.state.page}`, currentPage === 'container' ? '40/20' : null);
    }
};