// Modal dialogs handling
// API functions for fetching data
async function fetchKpNumbers() {
    try {
        const response = await fetch('/get_kp_numbers');
        if (!response.ok) throw new Error('Ошибка получения номеров КП');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification({
            success: 0,
            failed: 0,
            errors: ['Не удалось загрузить номера КП: ' + error.message],
            status: 'error',
            action: 'fetch'
        });
        return [];
    }
}

async function fetchBookingNumbers() {
    try {
        const response = await fetch('/get_booking_numbers');
        if (!response.ok) throw new Error('Ошибка получения номеров букинга');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification({
            success: 0,
            failed: 0,
            errors: ['Не удалось загрузить номера букинга: ' + error.message],
            status: 'error',
            action: 'fetch'
        });
        return [];
    }
}

// Update status select style based on selected value
function updateStatusSelectStyle(select) {
    const value = select.value;
    select.classList.remove(
        'status-directed-to-china',
        'status-in-china',
        'status-directed-to-russia',
        'status-in-russia'
    );
    switch (value) {
        case 'Направлен в Китай':
            select.classList.add('status-directed-to-china');
            break;
        case 'В Китае':
            select.classList.add('status-in-china');
            break;
        case 'Направлен в Россию':
            select.classList.add('status-directed-to-russia');
            break;
        case 'В России':
            select.classList.add('status-in-russia');
            break;
    }
}

// Show suggestions for KP and booking cells
function showSuggestions(cell, suggestionsList, suggestionBox) {
    const filter = cell.textContent.trim().toLowerCase();
    if (!filter) {
        suggestionBox.style.display = 'none';
        return;
    }

    const filteredSuggestions = suggestionsList.filter(item => item.toLowerCase().includes(filter));
    if (filteredSuggestions.length === 0) {
        suggestionBox.style.display = 'none';
        return;
    }

    suggestionBox.innerHTML = filteredSuggestions.map((item, index) => `
        <div class="suggestion-item" data-index="${index}">${item}</div>
    `).join('');

    const rect = cell.getBoundingClientRect();
    suggestionBox.style.left = `${rect.left + window.scrollX}px`;
    suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
    suggestionBox.style.width = `${rect.width}px`;
    suggestionBox.style.display = 'block';

    const items = suggestionBox.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            cell.textContent = item.textContent;
            suggestionBox.style.display = 'none';
            cell.focus();
        });
    });
}

function hideSuggestions(suggestionBox) {
    setTimeout(() => {
        if (!suggestionBox.contains(document.activeElement)) {
            suggestionBox.style.display = 'none';
        }
    }, 200);
}

function handleSuggestionNavigation(event, cell, suggestionBox) {
    if (suggestionBox.style.display === 'none') return;

    const items = suggestionBox.querySelectorAll('.suggestion-item');
    if (!items.length) return;

    let activeIndex = -1;
    items.forEach((item, index) => {
        if (item.classList.contains('active')) activeIndex = index;
    });

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        items.forEach(item => item.classList.remove('active'));
        items[activeIndex].classList.add('active');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items.forEach(item => item.classList.remove('active'));
        items[activeIndex].classList.add('active');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        cell.textContent = items[activeIndex].textContent;
        suggestionBox.style.display = 'none';
        cell.focus();
    } else if (event.key === 'Escape') {
        suggestionBox.style.display = 'none';
        cell.focus();
    }
}

// Function to render edit table for containers, KPs and bookings
async function renderEditTable(items) {
    const checkbox = document.getElementById('same-data-checkbox');
    const container = document.getElementById('edit-table-body');
    const isSameData = checkbox.checked;
    const kpNumbers = currentPage === 'container' ? await fetchKpNumbers() : [];
    const bookingNumbers = currentPage === 'container' ? await fetchBookingNumbers() : [];

    const statusOptions = [
        { value: "Направлен в Китай", text: "Направлен в Китай" },
        { value: "В Китае", text: "В Китае" },
        { value: "Направлен в Россию", text: "Направлен в Россию" },
        { value: "В России", text: "В России" }
    ];
    function formatDate(dateStr) {
        if (!dateStr) return '';
        if (/^\д{2}\.\д{2}\.\д{4}$/.test(dateStr)) return dateStr;
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${day}.${month}.${year}`;
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }

    const uniqueItems = [];
    const seenNumbers = new Set();
    items.forEach(item => {
        if (!seenNumbers.has(item.number)) {
            seenNumbers.add(item.number);
            uniqueItems.push(item);
        }
    });

    let html = '';
    if (isSameData) {
        if (currentPage === 'container') {
            html += `
                <tr>
                    <td style="padding: 0 10px">Все</td>
                    <td contenteditable="true" class="kp-cell" data-placeholder="КП"></td>
                    <td contenteditable="true" class="booking-cell" data-placeholder="Букинг"></td>
                    <td>
                        <select class="status-select" onchange="updateStatusSelectStyle(this)">
                            ${statusOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('')}
                        </select>
                    </td>
                    <td contenteditable="true" class="location" data-placeholder="Локация"></td>
                    <td contenteditable="true" class="delivery-date" data-placeholder="Дата сдачи"></td>
                    <td contenteditable="true" class="pickup-date" data-placeholder="Дата pick up"></td>
                    <td contenteditable="true" class="notes-cell" data-placeholder="Заметки"></td>
                </tr>
            `;
        } else if (currentPage === 'kp') {
            html += `
                <tr>
                    <td style="padding: 0 10px">Все</td>
                    <td contenteditable="true" class="location" data-placeholder="Станция назначения"></td>
                    <td contenteditable="true" class="notes-cell" data-placeholder="Заметки"></td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td style="padding: 0 10px">Все</td>
                    <td contenteditable="true" class="notes-cell" data-placeholder="Заметки"></td>
                </tr>
            `;
        }
    } else {
        uniqueItems.forEach(item => {
            if (currentPage === 'container') {
                const formattedDeliveryDate = formatDate(item.delivery_date);
                const formattedPickupDate = formatDate(item.pickup_date);
                const currentStatus = item.status || "Направлен в Китай";
                html += `
                    <tr>
                        <td style="padding: 0 10px">${cleanValue(item.number)}</td>
                        <td contenteditable="true" class="kp-cell">${cleanValue(item.KP)}</td>
                        <td contenteditable="true" class="booking-cell">${cleanValue(item.booking)}</td>
                        <td>
                            <select class="status-select" onchange="updateStatusSelectStyle(this)">
                                ${statusOptions.map(option => `
                                    <option value="${option.value}" ${currentStatus === option.value ? 'selected' : ''}>
                                        ${option.text}
                                    </option>
                                `).join('')}
                            </select>
                        </td>
                        <td contenteditable="true" class="location">${cleanValue(item.location)}</td>
                        <td contenteditable="true" class="delivery-date">${formattedDeliveryDate}</td>
                        <td contenteditable="true" class="pickup-date">${formattedPickupDate}</td>
                        <td contenteditable="true" class="notes-cell">${cleanValue(item.notes)}</td>
                    </tr>
                `;
            } else if (currentPage === 'kp') {
                html += `
                    <tr>
                        <td style="padding: 0 10px">${cleanValue(item.number)}</td>
                        <td contenteditable="true" class="location">${cleanValue(item.location)}</td>
                        <td contenteditable="true" class="notes-cell">${cleanValue(item.notes)}</td>
                    </tr>
                `;
            } else {
                html += `
                    <tr>
                        <td style="padding: 0 10px">${cleanValue(item.number)}</td>
                        <td contenteditable="true" class="notes-cell">${cleanValue(item.notes)}</td>
                    </tr>
                `;
            }
        });
    }

    container.innerHTML = html;

    if (currentPage === 'container') {
        const deliveryCells = container.querySelectorAll('.delivery-date');
        const pickupCells = container.querySelectorAll('.pickup-date');

        deliveryCells.forEach(cell => {
            const initialDate = cell.textContent.trim();
            const fp = flatpickr(cell, {
                dateFormat: "d.m.Y",
                defaultDate: initialDate.match(/^\д{2}\.\д{2}\.\д{4}$/) ? initialDate : null,
                enableTime: false,
                onChange: (selectedDates, dateStr) => cell.textContent = dateStr
            });
            // Handle paste for date
            cell.addEventListener('paste', (e) => {
                e.preventDefault();
                let pasted = (e.clipboardData || window.clipboardData).getData('text');
                pasted = pasted.trim();
                // Support for formats 28.04.2025 and 2025-04-28
                let matchDMY = pasted.match(/^(\д{2})\.(\д{2})\.(\д{4})$/);
                let matchYMD = pasted.match(/^(\д{4})-(\д{2})-(\д{2})$/);
                let newDate = '';
                if (matchDMY) {
                    newDate = `${matchDMY[1]}.${matchDMY[2]}.${matchDMY[3]}`;
                } else if (matchYMD) {
                    newDate = `${matchYMD[3]}.${matchYMD[2]}.${matchYMD[1]}`;
                }
                if (newDate) {
                    cell.textContent = newDate;
                    if (fp && fp.setDate) fp.setDate(newDate, true, "d.m.Y");
                }
            });
        });

        pickupCells.forEach(cell => {
            const initialDate = cell.textContent.trim();
            const fp = flatpickr(cell, {
                dateFormat: "d.m.Y",
                defaultDate: initialDate.match(/^\д{2}\.\д{2}\.\д{4}$/) ? initialDate : null,
                enableTime: false,
                onChange: (selectedDates, dateStr) => cell.textContent = dateStr
            });
            // Handle paste for date
            cell.addEventListener('paste', (e) => {
                e.preventDefault();
                let pasted = (e.clipboardData || window.clipboardData).getData('text');
                pasted = pasted.trim();
                let matchDMY = pasted.match(/^(\д{2})\.(\д{2})\.(\д{4})$/);
                let matchYMD = pasted.match(/^(\д{4})-(\д{2})-(\д{2})$/);
                let newDate = '';
                if (matchDMY) {
                    newDate = `${matchDMY[1]}.${matchDMY[2]}.${matchDMY[3]}`;
                } else if (matchYMD) {
                    newDate = `${matchYMD[3]}.${matchYMD[2]}.${matchYMD[1]}`;
                }
                if (newDate) {
                    cell.textContent = newDate;
                    if (fp && fp.setDate) fp.setDate(newDate, true, "d.m.Y");
                }
            });
        });

        const allKpCells = container.querySelectorAll('.kp-cell');
        const allBookingCells = container.querySelectorAll('.booking-cell');
        let kpSuggestionBox = document.getElementById('kp-suggestion-box') || document.createElement('div');
        if (!kpSuggestionBox.id) {
            kpSuggestionBox.id = 'kp-suggestion-box';
            kpSuggestionBox.className = 'suggestion-box';
            document.body.appendChild(kpSuggestionBox);
        }

        let bookingSuggestionBox = document.getElementById('booking-suggestion-box') || document.createElement('div');
        if (!bookingSuggestionBox.id) {
            bookingSuggestionBox.id = 'booking-suggestion-box';
            bookingSuggestionBox.className = 'suggestion-box';
            document.body.appendChild(bookingSuggestionBox);
        }

        allKpCells.forEach(cell => {
            cell.addEventListener('input', () => showSuggestions(cell, kpNumbers, kpSuggestionBox));
            cell.addEventListener('blur', () => hideSuggestions(kpSuggestionBox));
            cell.addEventListener('keydown', (e) => handleSuggestionNavigation(e, cell, kpSuggestionBox));
        });

        allBookingCells.forEach(cell => {
            cell.addEventListener('input', () => showSuggestions(cell, bookingNumbers, bookingSuggestionBox));
            cell.addEventListener('blur', () => hideSuggestions(bookingSuggestionBox));
            cell.addEventListener('keydown', (e) => handleSuggestionNavigation(e, cell, bookingSuggestionBox));
        });
    }

    let editPopup = document.getElementById('edit-notes-popup') || document.createElement('div');
    if (!editPopup.id) {
        editPopup.id = 'edit-notes-popup';
        editPopup.className = 'notes-popup edit-notes-popup';
        editPopup.innerHTML = '<textarea id="edit-notes-popup-text"></textarea>';
        document.body.appendChild(editPopup);
    }
    const editPopupText = editPopup.querySelector('#edit-notes-popup-text');

    const notesCells = container.querySelectorAll('.notes-cell');
    notesCells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            const rect = cell.getBoundingClientRect();
            editPopup.style.left = `${rect.right + window.scrollX + 5}px`;
            editPopup.style.top = `${rect.top + window.scrollY}px`;
            editPopupText.value = cell.textContent;
            editPopup.style.display = 'block';
            editPopupText.focus();
            // Save reference to current cell for copying text
            editPopupText._linkedCell = cell;
            e.stopPropagation();
        });
    });

    // Copy text from textarea back to the cell on input
    editPopupText.addEventListener('input', function() {
        if (editPopupText._linkedCell) {
            editPopupText._linkedCell.textContent = editPopupText.value;
        }
    });

    // Global handler to hide editPopup when clicking outside
    document.addEventListener('mousedown', function hideEditPopupOnClick(e) {
        if (editPopup.style.display === 'block' && !editPopup.contains(e.target)) {
            editPopup.style.display = 'none';
        }
    });

    if (currentPage === 'container') {
        const statusSelects = container.querySelectorAll('.status-select');
        statusSelects.forEach(select => {
            updateStatusSelectStyle(select); // Set initial style
            select.addEventListener('change', (e) => {
                const row = e.target.closest('tr');
                const kpCell = row.querySelector('.kp-cell');
                const bookingCell = row.querySelector('.booking-cell');
                const deliveryCell = row.querySelector('.delivery-date');
                const pickupCell = row.querySelector('.pickup-date');
                const selectedStatus = e.target.value;

                // Date blocking logic
                if (selectedStatus === "Направлен в Китай" || selectedStatus === "Направлен в Россию") {
                    if (deliveryCell) {
                        deliveryCell.textContent = '';
                        deliveryCell.setAttribute('contenteditable', false);
                        deliveryCell.classList.add('blocked-cell');
                    }
                    if (pickupCell) {
                        pickupCell.setAttribute('contenteditable', true);
                        pickupCell.classList.remove('blocked-cell');
                    }
                } else if (selectedStatus === "В Китае" || selectedStatus === "В России") {
                    if (pickupCell) {
                        pickupCell.textContent = '';
                        pickupCell.setAttribute('contenteditable', false);
                        pickupCell.classList.add('blocked-cell');
                    }
                    if (deliveryCell) {
                        deliveryCell.setAttribute('contenteditable', true);
                        deliveryCell.classList.remove('blocked-cell');
                    }
                } else {
                    if (deliveryCell) {
                        deliveryCell.setAttribute('contenteditable', true);
                        deliveryCell.classList.remove('blocked-cell');
                    }
                    if (pickupCell) {
                        pickupCell.setAttribute('contenteditable', true);
                        pickupCell.classList.remove('blocked-cell');
                    }
                }

                const editable = selectedStatus === "Направлен в Китай";
                kpCell.setAttribute('contenteditable', editable);
                bookingCell.setAttribute('contenteditable', editable);

                // For visual effect, update styles immediately
                if (!editable) {
                    kpCell.textContent = '';
                    bookingCell.textContent = '';
                    kpCell.blur && kpCell.blur();
                    bookingCell.blur && bookingCell.blur();
                }

                updateStatusSelectStyle(e.target); // Update style on change
            });
            // Also set the correct contenteditable on initialization
            const row = select.closest('tr');
            const kpCell = row.querySelector('.kp-cell');
            const bookingCell = row.querySelector('.booking-cell');
            const deliveryCell = row.querySelector('.delivery-date');
            const pickupCell = row.querySelector('.pickup-date');
            const selectedStatus = select.value;
            // Initialize date blocking
            if (selectedStatus === "Направлен в Китай" || selectedStatus === "Направлен в Россию") {
                if (deliveryCell) {
                    deliveryCell.textContent = '';
                    deliveryCell.setAttribute('contenteditable', false);
                    deliveryCell.classList.add('blocked-cell');
                }
                if (pickupCell) {
                    pickupCell.setAttribute('contenteditable', true);
                    pickupCell.classList.remove('blocked-cell');
                }
            } else if (selectedStatus === "В Китае" || selectedStatus === "В России") {
                if (pickupCell) {
                    pickupCell.textContent = '';
                    pickupCell.setAttribute('contenteditable', false);
                    pickupCell.classList.add('blocked-cell');
                }
                if (deliveryCell) {
                    deliveryCell.setAttribute('contenteditable', true);
                    deliveryCell.classList.remove('blocked-cell');
                }
            } else {
                if (deliveryCell) {
                    deliveryCell.setAttribute('contenteditable', true);
                    deliveryCell.classList.remove('blocked-cell');
                }
                if (pickupCell) {
                    pickupCell.setAttribute('contenteditable', true);
                    pickupCell.classList.remove('blocked-cell');
                }
            }
            const editable = selectedStatus === "Направлен в Китай";
            kpCell.setAttribute('contenteditable', editable);
            bookingCell.setAttribute('contenteditable', editable);
        });
    }

    const saveButton = document.querySelector('#edit-data-modal .save');
    if (saveButton) {
        saveButton.onclick = async () => {
            const rows = container.querySelectorAll('tr');
            const updates = [];
            const errors = [];

            rows.forEach((row, i) => {
                const number = row.querySelector('td:first-child').textContent.trim();
                const formData = new URLSearchParams();
                formData.append('number', number);

                if (currentPage === 'container') {
                    const kp = row.querySelector('.kp-cell')?.textContent.trim() || null;
                    const booking = row.querySelector('.booking-cell')?.textContent.trim() || null;
                    const status = row.querySelector('.status-select')?.value || '';
                    const location = row.querySelector('.location')?.textContent.trim() || '';
                    const deliveryDate = row.querySelector('.delivery-date')?.textContent.trim() || null;
                    const pickupDate = row.querySelector('.pickup-date')?.textContent.trim() || null;
                    const notes = row.querySelector('.notes-cell')?.textContent.trim() || '';

                    // KP and booking are no longer required
                    if (kp) formData.append('kp', kp);
                    if (booking) formData.append('booking', booking);
                    formData.append('status', status);
                    formData.append('location', location);
                    if (deliveryDate) formData.append('delivery_date', deliveryDate);
                    if (pickupDate) formData.append('pickup_date', pickupDate);
                    formData.append('notes', notes);
                } else {
                    // Validation error handling
                    const location = row.querySelector('.location')?.textContent.trim() || '';
                    const notes = row.querySelector('.notes-cell')?.textContent.trim() || '';
                    if (location && currentPage === 'kp') formData.append('location', location);
                    formData.append('notes', notes);
                }

                updates.push({ number, formData });
            });

            const errorDiv = document.getElementById('error-message') || document.createElement('div');
            if (!errorDiv.id) {
                errorDiv.id = 'error-message';
                document.querySelector('#edit-data-modal .modal-footer').prepend(errorDiv);
            }

            if (errors.length > 0) {
                errorDiv.innerHTML = `<p>${errors.join(', ')}</p>`;
                errorDiv.classList.add('show');
                return;
            }

            let updatedCount = 0;
            let failedCount = 0;
            const serverErrors = [];

            for (const update of updates) {
                try {
                    const endpoint = currentPage === 'container' ? '/update_container' :
                        currentPage === 'kp' ? '/update_kp' : '/update_booking';
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: update.formData
                    });
                    const result = await response.json();
                    if (result.success > 0) updatedCount++;
                    else {
                        failedCount++;
                        serverErrors.push(result.errors?.join(', ') || 'Ошибка сервера');
                    }
                } catch (error) {
                    failedCount++;
                    serverErrors.push('Ошибка связи с сервером');
                }
            }

            errorDiv.innerHTML = '';
            errorDiv.classList.remove('show');

            if (failedCount > 0) {
                errorDiv.innerHTML = `<p>${serverErrors.join(', ')}</p>`;
                errorDiv.classList.add('show');
            } else if (updatedCount > 0) {
                document.getElementById('edit-data-modal').style.display = 'none';
                showNotification({
                    success: updatedCount,
                    failed: failedCount,
                    errors: serverErrors.length > 0 ? serverErrors : null,
                    status: failedCount > 0 ? 'error' : 'success',
                    action: 'edit'
                });
                await updateTable(getCurrentFilters());
            }
        };
    }

    // Enable selection and copying for the edit table
    attachTableCellListeners('.edit-table');
}

function attachModalListeners() {
    const addButton = document.querySelector('.add');
    const deleteButton = document.querySelector('.delete');
    const editButton = document.querySelector('.edit');
    const addModal = document.getElementById('add-modal');
    const deleteModal = document.getElementById('delete-modal');
    const editNumbersModal = document.getElementById('edit-numbers-modal');
    const editDataModal = document.getElementById('edit-data-modal');

    const addCloseElements = addModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];
    const deleteCloseElements = deleteModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];
    const editNumbersCloseElements = editNumbersModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];
    const editDataCloseElements = editDataModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];

    const addSaveButton = addModal?.querySelector('.modal-footer .save');
    const deleteSaveButton = deleteModal?.querySelector('.modal-footer .save');
    const editNextButton = editNumbersModal?.querySelector('.modal-footer .next');

    if (addButton && addModal) addButton.onclick = () => addModal.style.display = 'block';
    if (deleteButton && deleteModal) deleteButton.onclick = () => deleteModal.style.display = 'block';
    if (editButton && editNumbersModal) editButton.onclick = () => editNumbersModal.style.display = 'block';

    if (addModal) {
        addCloseElements.forEach(el => el.onclick = () => addModal.style.display = 'none');
        if (addSaveButton) {
            addSaveButton.onclick = async () => {
                const textareaId = currentPage === 'container' ? 'container-numbers' :
                    currentPage === 'kp' ? 'kp-numbers' : 'booking-numbers';
                const numbers = document.getElementById(textareaId).value;
                const endpoint = currentPage === 'container' ? '/add_container' :
                    currentPage === 'kp' ? '/add_kp' : '/add_booking';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ [`${currentPage}_numbers`]: numbers })
                });
                const result = await response.json();
                addModal.style.display = 'none';
                showNotification(result);
                if (result.success > 0) updateTable(getCurrentFilters());
            };
        }
    }

    if (deleteModal) {
        deleteCloseElements.forEach(el => el.onclick = () => deleteModal.style.display = 'none');
        if (deleteSaveButton) {
            deleteSaveButton.onclick = async () => {
                const textareaId = `delete-${currentPage}-numbers`;
                const numbers = document.getElementById(textareaId).value;
                const endpoint = currentPage === 'container' ? '/delete_containers' :
                    currentPage === 'kp' ? '/delete_kps' : '/delete_bookings';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ [`${currentPage}_numbers`]: numbers })
                });
                const result = await response.json();
                deleteModal.style.display = 'none';
                showNotification(result);
                if (result.success > 0) updateTable(getCurrentFilters());
            };
        }
    }

    if (editNumbersModal) {
        editNumbersCloseElements.forEach(el => el.onclick = () => editNumbersModal.style.display = 'none');
        if (editNextButton) {
            editNextButton.onclick = async () => {
                const textareaId = `edit-${currentPage}-numbers`;
                const numbers = document.getElementById(textareaId).value;
                const endpoint = currentPage === 'container' ? '/get_container_data' :
                    currentPage === 'kp' ? '/get_kp_data' : '/get_booking_data';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ [`${currentPage}_numbers`]: numbers })
                });
                const result = await response.json();
                editItems = result[currentPage === 'container' ? 'containers' : currentPage === 'kp' ? 'kps' : 'bookings'];
                editNumbersModal.style.display = 'none';
                editDataModal.style.display = 'block';
                await renderEditTable(editItems);
            };
        }
    }

    if (editDataModal) {
        editDataCloseElements.forEach(el => el.onclick = () => {
            editDataModal.style.display = 'none';
            // Hide error notification when closing the edit modal
            const errorDiv = document.getElementById('error-message');
            if (errorDiv) {
                errorDiv.innerHTML = '';
                errorDiv.classList.remove('show');
            }
        });
        const checkbox = document.getElementById('same-data-checkbox');
        if (checkbox) checkbox.onchange = () => renderEditTable(editItems);
    }

    window.onclick = (event) => {
        if (event.target === addModal) addModal.style.display = 'none';
        else if (event.target === deleteModal) deleteModal.style.display = 'none';
        else if (event.target === editNumbersModal) editNumbersModal.style.display = 'none';
        else if (event.target === editDataModal) {
            editDataModal.style.display = 'none';
            // Hide error notification on any edit modal closing
            const errorDiv = document.getElementById('error-message');
            if (errorDiv) {
                errorDiv.innerHTML = '';
                errorDiv.classList.remove('show');
            }
        }
    };
}