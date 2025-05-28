// Updated version of openEditBookingsModal without table
function openEditBookingsModal(bookings = []) {
    console.log('[openEditBookingsModal] called with bookings:', bookings);
    const modal = document.getElementById('edit-bookings-modal');
    if (!modal) {
        console.error('[openEditBookingsModal] edit-bookings-modal not found in DOM');
        return;
    }
    
    modal.style.display = 'block';
    console.log('[openEditBookingsModal] modal.style.display set to block');
    
    // Закрытие по кнопке
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel');
    if (!closeBtn) console.error('[openEditBookingsModal] .close button not found');
    if (!cancelBtn) console.error('[openEditBookingsModal] .cancel button not found');
    closeBtn && (closeBtn.onclick = () => { console.log('[openEditBookingsModal] closeBtn clicked'); modal.style.display = 'none'; });
    cancelBtn && (cancelBtn.onclick = () => { console.log('[openEditBookingsModal] cancelBtn clicked'); modal.style.display = 'none'; });
    
    // Сохранение
    const saveBtn = modal.querySelector('.save');
    if (!saveBtn) console.error('[openEditBookingsModal] .save button not found');
    saveBtn && (saveBtn.onclick = async () => {
        console.log('[openEditBookingsModal] saveBtn clicked');
        // Просто закрываем модальное окно, поскольку таблицы больше нет
        modal.style.display = 'none';
    });
    
    // Закрытие по клику вне окна
    window.addEventListener('click', function handler(e) {
        if (e.target === modal) {
            console.log('[openEditBookingsModal] click outside modal, closing');
            modal.style.display = 'none';
            window.removeEventListener('click', handler);
        }
    });
}

// Функция renderEditBookingsTable больше не нужна, так как таблицы нет
