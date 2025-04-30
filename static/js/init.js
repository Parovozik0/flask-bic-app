// Main initialization code that runs on DOM load
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing app - DOM content loaded');
        const path = window.location.pathname;
        currentPage = { '/kp': 'kp', '/buking': 'buking' }[path] || 'container';
        console.log('Current page set to:', currentPage);
        
        updateSidebar(currentPage);
        loadPageContent(path || '/container', currentPage === 'container' ? '40/20' : null);
        afterPageLoad();
        document.addEventListener('tableUpdated', () => attachTableCellListeners());
        setupSocket();
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('Произошла ошибка при инициализации приложения. Пожалуйста, обновите страницу.');
    }
});

// After each page load, initialize all components
function afterPageLoad() {
    try {
        console.log('Running afterPageLoad');
        attachSidebarListeners();
        attachModalListeners();
        attachTableRowListeners();
        attachNotesPopupListeners();
        attachFilterListeners();
        attachTableCellListeners();
        setupInventoryModal();
        console.log('afterPageLoad completed successfully');
    } catch (error) {
        console.error('Error in afterPageLoad:', error);
    }
}