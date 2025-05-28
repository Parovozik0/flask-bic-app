// Additional styles for the internal numbers module

// This function previously added styles for selected cells in the edit bookings table
// Now it's empty since cell selection is disabled for the edit bookings table
function addEditBookingsTableStyles() {
    // Check if old styles exist and remove them
    const oldStyles = document.getElementById('edit-bookings-table-styles');
    if (oldStyles) {
        oldStyles.remove();
    }
    
    // No new styles are added since cell selection is disabled
}

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    addEditBookingsTableStyles();
});

// If DOM is already loaded, add styles immediately
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    addEditBookingsTableStyles();
}
