// === МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ БУКИНГОВ ===

function openEditBookingsModal(bookings = []) {
    console.log('[openEditBookingsModal] called with bookings:', bookings);
    const modal = document.getElementById('edit-bookings-modal');
    if (!modal) {
        console.error('[openEditBookingsModal] edit-bookings-modal not found in DOM');
        return;
    }
    
    // Создаем структуру таблицы, если ее нет
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody.querySelector('table')) {
        // Добавляем таблицу для редактирования букингов
        const tableHTML = `
            <table class="edit-bookings-table">
                <thead>
                    <tr>
                        <th>Номер букинга</th>
                        <th>Количество</th>
                        <th>Линия</th>
                        <th>Судно</th>
                        <th>Заметки</th>
                    </tr>
                </thead>
                <tbody id="edit-bookings-table-body">
                    <!-- Здесь будут строки для редактирования букингов -->
                </tbody>
            </table>
        `;
        // Добавляем таблицу перед сообщением об ошибке
        const errorMsg = modalBody.querySelector('#edit-bookings-error-message');
        if (errorMsg) {
            errorMsg.insertAdjacentHTML('beforebegin', tableHTML);
        } else {
            modalBody.innerHTML = tableHTML + `<div id="edit-bookings-error-message" class="error-message"></div>`;
        }
    }
    
    // Используем ModalBackdropManager для отображения модального окна
    window.modalBackdropManager.openModal(modal);
    console.log('[openEditBookingsModal] Modal opened using modalBackdropManager');
    
    // Отображаем данные в таблице
    renderEditBookingsTable(bookings);
    
    // Закрытие по кнопке
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel');
    if (!closeBtn) console.error('[openEditBookingsModal] .close button not found');
    if (!cancelBtn) console.error('[openEditBookingsModal] .cancel button not found');    closeBtn && (closeBtn.onclick = () => { 
        console.log('[openEditBookingsModal] closeBtn clicked'); 
        window.modalBackdropManager.closeModal(modal);
    });
    cancelBtn && (cancelBtn.onclick = () => { 
        console.log('[openEditBookingsModal] cancelBtn clicked'); 
        window.modalBackdropManager.closeModal(modal);
    });
    
    // Сохранение
    const saveBtn = modal.querySelector('.save');
    if (!saveBtn) console.error('[openEditBookingsModal] .save button not found');    saveBtn && (saveBtn.onclick = async () => {
        console.log('[openEditBookingsModal] saveBtn clicked');
        const rows = modal.querySelectorAll('tbody#edit-bookings-table-body tr');
        const updates = [];
        let hasErrors = false;
        rows.forEach(row => {
            // Получаем текст из ячеек и удаляем невидимые символы с помощью регулярного выражения
            const booking = (row.querySelector('.booking-cell')?.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            const quantity = (row.querySelector('.quantity-cell')?.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            const line = (row.querySelector('.line-cell')?.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            const vessel = (row.querySelector('.vessel-cell')?.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            const notes = (row.querySelector('.notes-cell')?.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            
            if (!booking) {
                row.classList.add('error-row');
                hasErrors = true;
            } else {
                row.classList.remove('error-row');
                updates.push({ booking, quantity, line, vessel, notes });
            }
        });
        
        if (hasErrors) {
            const errMsg = modal.querySelector('#edit-bookings-error-message');
            if (errMsg) errMsg.textContent = 'Заполните все обязательные поля (номер букинга)';
            return;
        }
        
        const errMsg = modal.querySelector('#edit-bookings-error-message');
        if (errMsg) errMsg.textContent = '';
          // TODO: отправка данных на сервер через fetch API
        // Здесь можно добавить отправку данных на сервер
        
        // Используем ModalBackdropManager для закрытия модального окна
        window.modalBackdropManager.closeModal(modal);
        // Обновление общей таблицы
        if (typeof updateTable === 'function' && typeof getCurrentFilters === 'function') {
            updateTable(getCurrentFilters());
        }
    });    // Закрытие по клику вне окна
    window.addEventListener('click', function handler(e) {
        if (e.target === modal) {
            console.log('[openEditBookingsModal] click outside modal, closing');
            window.modalBackdropManager.closeModal(modal);
            window.removeEventListener('click', handler);
        }
    });
    
    // Добавляем всплывающее окно для ячеек заметок букингов
    let lastBookingCell = null;
    let repositionBookingPopup = null;
    const editPopup = document.getElementById('edit-notes-popup');
    const editPopupText = document.getElementById('edit-notes-popup-text');
    const bookingNotesCells = modal.querySelectorAll('.notes-cell');
    bookingNotesCells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            lastBookingCell = cell;
            editPopupText.value = cell.textContent.trim();
            repositionBookingPopup = function() {
                const rect = lastBookingCell.getBoundingClientRect();
                editPopup.style.left = `${rect.right + window.scrollX + 5}px`;
                editPopup.style.top = `${rect.top + window.scrollY}px`;
                editPopup.style.width = `${rect.width}px`;
            };
            repositionBookingPopup();
            editPopup.style.display = 'block';
            editPopupText.focus();
            editPopupText._linkedCell = cell;
            e.stopPropagation();
        });
    });
    // Reposition popup on window resize
    window.addEventListener('resize', () => {
        if (editPopup.style.display === 'block' && repositionBookingPopup) {
            repositionBookingPopup();
        }
    });
    // Обновление текста ячейки при вводе в textarea
    editPopupText.addEventListener('input', () => {
        if (editPopupText._linkedCell) {
            editPopupText._linkedCell.textContent = editPopupText.value;
        }
    });
    // Скрыть попап при клике вне его
    document.addEventListener('mousedown', function hideBookingEditPopupOnClick(e) {
        if (editPopup.style.display === 'block' && !editPopup.contains(e.target)) {
            editPopup.style.display = 'none';
        }
    });    // Скрыть попап при прокрутке тела модального окна
    const modalBodyElem = modal.querySelector('.modal-body');
    if (modalBodyElem) {
        modalBodyElem.addEventListener('scroll', () => {
            if (editPopup.style.display === 'block') {
                editPopup.style.display = 'none';
            }
        });
    }    // Скрыть попап при прокрутке таблицы редактирования букингов
    const editBookingsTable = modal.querySelector('.edit-bookings-table');
    if (editBookingsTable) {
        editBookingsTable.addEventListener('scroll', () => {
            if (editPopup.style.display === 'block') {
                editPopup.style.display = 'none';
            }
        });
    }

    // Скрыть попап при прокрутке tbody таблицы редактирования букингов
    const editBookingsTbody = modal.querySelector('#edit-bookings-table-body');
    if (editBookingsTbody) {
        editBookingsTbody.addEventListener('scroll', () => {
            if (editPopup.style.display === 'block') {
                editPopup.style.display = 'none';
            }
        });
    }

    // Скрыть попап при прокрутке всей страницы
    window.addEventListener('scroll', () => {
        if (editPopup.style.display === 'block') {
            editPopup.style.display = 'none';
        }
    });

    // Включаем функционал выделения ячеек таблицы
    if (typeof setupEditBookingTableSelection === 'function') {
        // Запускаем после того, как таблица полностью будет добавлена в DOM
        setTimeout(() => setupEditBookingTableSelection(), 0);
    }
}

// Функция для отображения данных в таблице редактирования букингов
function renderEditBookingsTable(bookings) {
    const tbody = document.getElementById('edit-bookings-table-body');
    if (!tbody) return;
    
    let html = '';
    if (!bookings.length) {
        // Пустая строка для ввода нового букинга
        html += `<tr>
            <td contenteditable="true" class="booking-cell" data-placeholder="Номер букинга">\u200B</td>
            <td contenteditable="true" class="quantity-cell" data-placeholder="Количество">\u200B</td>
            <td contenteditable="true" class="line-cell" data-placeholder="Линия">\u200B</td>
            <td contenteditable="true" class="vessel-cell" data-placeholder="Судно">\u200B</td>
            <td contenteditable="true" class="notes-cell" data-placeholder="Заметки">\u200B</td>
        </tr>`;
    } else {
        // Отображаем переданные букинги
        bookings.forEach(b => {
            html += `<tr>
                <td contenteditable="true" class="booking-cell">${b.booking || ''}\u200B</td>
                <td contenteditable="true" class="quantity-cell">${b.quantity || ''}\u200B</td>
                <td contenteditable="true" class="line-cell">${b.line || ''}\u200B</td>
                <td contenteditable="true" class="vessel-cell">${b.vessel || ''}\u200B</td>
                <td contenteditable="true" class="notes-cell">${b.notes || ''}\u200B</td>
            </tr>`;
        });
    }
    
    tbody.innerHTML = html;
}
