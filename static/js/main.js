// Глобальные переменные
let currentPage = 'container';
let editItems = []; // Универсальная переменная для хранения данных редактирования (контейнеры, КП, букинги)

// Навигация между страницами
function navigateTo(page) {
    const pageUrls = {
        'container': '/container',
        'kp': '/kp',
        'buking': '/buking'
    };

    const url = pageUrls[page];
    if (!url) {
        console.error('Unknown page:', page);
        return;
    }

    currentPage = page;
    window.history.pushState({ page }, '', url);
    updateSidebar(page);
    loadPageContent(url, currentPage === 'container' ? '40/20' : null);
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    currentPage = {
        '/kp': 'kp',
        '/buking': 'buking'
    }[path] || 'container';

    updateSidebar(currentPage);
    loadPageContent(path || '/container', currentPage === 'container' ? '40/20' : null);
    attachSidebarListeners();
    attachModalListeners();
    attachTableRowListeners();
    attachNotesPopupListeners();
    attachFilterListeners();
    attachTableCellListeners();
});

function updateSidebar(activePage) {
    const sidebarItems = document.querySelectorAll('.sidebar nav ul li');
    sidebarItems.forEach(item => {
        const page = item.dataset.page;
        item.classList.toggle('active', page === activePage);
    });
}

function attachSidebarListeners() {
    const sidebarItems = document.querySelectorAll('.sidebar nav ul li');
    sidebarItems.forEach(item => {
        const page = item.dataset.page;
        if (page) {
            item.onclick = () => navigateTo(page);
        }
    });
}

async function loadPageContent(url, selectedValue) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        document.body.innerHTML = doc.body.innerHTML;

        attachSidebarListeners();
        attachModalListeners();
        attachTableRowListeners();
        attachNotesPopupListeners();
        attachFilterListeners();
        attachTableCellListeners();
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

function cleanValue(value) {
    if (value === null || value === undefined || value.toLowerCase() === 'none') {
        return '';
    }
    return value;
}

async function updateTable(filters = {}) {
    const endpoints = {
        'container': '/get_containers',
        'kp': '/get_kps',
        'buking': '/get_bookings'
    };
    const endpoint = endpoints[currentPage];
    const params = currentPage === 'container' ? `?option=${getContainerOption()}` : '';

    function formatDateToISO(dateStr) {
        if (!dateStr) return '';
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('.');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    try {
        const response = await fetch(endpoint + params);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        let filteredItems = currentPage === 'container' ? data.containers : 
                           currentPage === 'kp' ? data.kps : data.bookings;

        if (Object.keys(filters).length > 0) {
            filteredItems = filteredItems.filter(item => {
                const number = cleanValue(item.number).toLowerCase();
                const location = cleanValue(item.location).toLowerCase();
                const notes = cleanValue(item.notes).toLowerCase();
                const kp = currentPage === 'container' ? cleanValue(item.KP).toLowerCase() : '';
                const booking = currentPage === 'container' ? cleanValue(item.booking).toLowerCase() : '';
                const deliveryDate = currentPage === 'container' ? formatDateToISO(item.delivery_date) : '';
                const pickupDate = currentPage === 'container' ? formatDateToISO(item.pickup_date) : '';

                return (
                    (!filters.number || number.includes(filters.number.toLowerCase())) &&
                    (currentPage !== 'container' || !filters.kpNumber || kp.includes(filters.kpNumber.toLowerCase())) &&
                    (currentPage !== 'container' || !filters.bookingNumber || booking.includes(filters.bookingNumber.toLowerCase())) &&
                    (!filters.location || location.includes(filters.location.toLowerCase())) &&
                    (!filters.notes || notes.includes(filters.notes.toLowerCase())) &&
                    (currentPage !== 'container' || !filters.deliveryDate || deliveryDate === filters.deliveryDate) &&
                    (currentPage !== 'container' || !filters.pickupDate || pickupDate === filters.pickupDate)
                );
            });
        }

        const tbody = document.querySelector('.table-container tbody');
        tbody.innerHTML = filteredItems.map(item => {
            if (currentPage === 'container') {
                // Определяем класс для статуса
                let statusClass = '';
                let statusText = cleanValue(item.status);
                switch (statusText) {
                    case 'Направлен в Китай':
                        statusClass = 'status-directed-to-china';
                        statusText += ' &nbsp;🇷🇺➡️🇨🇳';
                        break;
                    case 'В Китае':
                        statusClass = 'status-in-china';
                        statusText += ' &nbsp;🇨🇳';
                        break;
                    case 'Направлен в Россию':
                        statusClass = 'status-directed-to-russia';
                        statusText += ' &nbsp;🇨🇳➡️🇷🇺';
                        break;
                    case 'В России':
                        statusClass = 'status-in-russia';
                        statusText += ' &nbsp;🇷🇺';
                        break;
                    default:
                        statusClass = '';
                }
        
                return `
                    <tr data-number="${cleanValue(item.number)}">
                        <td style="width: 260px;">${cleanValue(item.number)}</td>
                        <td>${cleanValue(item.KP)}</td>
                        <td>${cleanValue(item.booking)}</td>
                        <td class="${statusClass}" style="width: 260px; font-weight: 700; text-align: center; background: #0D1B2A; color: #fff;">
                            ${statusText}
                        </td>
                        <td>${cleanValue(item.location)}</td>
                        <td>${formatDateToISO(item.delivery_date)}</td>
                        <td>${formatDateToISO(item.pickup_date)}</td>
                        <td>${cleanValue(item.notes)}</td>
                    </tr>
                `;
            } else if (currentPage === 'kp') {
                return `
                    <tr data-number="${cleanValue(item.number)}">
                        <td style="width: 260px;">${cleanValue(item.number)}</td>
                        <td>${cleanValue(item.location)}</td>
                        <td>${cleanValue(item.notes)}</td>
                    </tr>
                `;
            } else {
                return `
                    <tr data-number="${cleanValue(item.number)}">
                        <td style="width: 260px;">${cleanValue(item.number)}</td>
                        <td>${cleanValue(item.notes)}</td>
                    </tr>
                `;
            }
        }).join('');

        const header = document.querySelector('.header h1');
        header.textContent = `${currentPage === 'kp' ? 'КП' : currentPage === 'buking' ? 'Букинги' : 'Контейнеры'}: ${filteredItems.length}`;

        attachTableRowListeners();
        attachNotesPopupListeners();
        document.dispatchEvent(new Event('tableUpdated'));
    } catch (error) {
        console.error('Error updating table:', error);
    }
}

function getContainerOption() {
    const select = document.getElementById('container-type-select');
    if (!select) return 'option1';
    const selectedValue = select.value;
    const params = {
        '40': 'option2',
        '20': 'option3',
        '40/20': 'option1'
    };
    return params[selectedValue] || 'option1';
}

function attachSelectListener(selectedValue) {
    const select = document.getElementById('container-type-select');
    if (!select) return;

    select.removeEventListener('change', handleSelectChange);
    select.addEventListener('change', handleSelectChange);
    select.value = selectedValue;
}

function handleSelectChange(event) {
    const selectedValue = event.target.value;
    const params = {
        '40': '?option=option2',
        '20': '?option=option3'
    };
    const url = '/container' + (params[selectedValue] || '?option=option1');
    loadPageContent(url, selectedValue);
}

window.onpopstate = (event) => {
    if (event.state?.page) {
        currentPage = event.state.page;
        updateSidebar(currentPage);
        loadPageContent(event.state.page === 'container' ? '/container' : `/${event.state.page}`, currentPage === 'container' ? '40/20' : null);
    }
};

function attachFilterListeners() {
    const filterInputs = {
        containerNumber: document.getElementById('filter-container-number'),
        kpNumber: document.getElementById('filter-kp-number'),
        bookingNumber: document.getElementById('filter-booking-number'),
        location: document.getElementById('filter-location'),
        notes: document.getElementById('filter-notes'),
        deliveryDate: document.getElementById('filter-delivery-date'),
        pickupDate: document.getElementById('filter-pickup-date')
    };

    Object.values(filterInputs).forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                const filters = {
                    number: filterInputs[currentPage === 'container' ? 'containerNumber' : currentPage === 'kp' ? 'kpNumber' : 'bookingNumber']?.value,
                    kpNumber: currentPage === 'container' ? filterInputs.kpNumber?.value : '',
                    bookingNumber: currentPage === 'container' ? filterInputs.bookingNumber?.value : '',
                    location: filterInputs.location?.value,
                    notes: filterInputs.notes?.value,
                    deliveryDate: filterInputs.deliveryDate?.value,
                    pickupDate: filterInputs.pickupDate?.value
                };
                updateTable(filters);
            });
        }
    });

    const refreshButton = document.querySelector('.refresh');
    if (refreshButton) {
        refreshButton.onclick = () => {
            Object.values(filterInputs).forEach(input => {
                if (input) input.value = '';
            });

            const filterContainer = document.getElementById('filter-container');
            if (filterContainer && filterContainer.classList.contains('active')) {
                filterContainer.classList.remove('active');
            }

            updateTable({});
        };
    }
}

function attachTableRowListeners() {
    const rows = document.querySelectorAll('.table-container tbody tr');
    rows.forEach(row => {
        row.onclick = () => {
            rows.forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            console.log('Selected row:', row.dataset.number);
        };
    });
}

function attachNotesPopupListeners() {
    const notesColumnIndex = currentPage === 'container' ? 8 : currentPage === 'kp' ? 3 : 2;
    const notesCells = document.querySelectorAll(`.table-container tbody td:nth-child(${notesColumnIndex})`);
    const popup = document.getElementById('notes-popup');
    const popupText = document.getElementById('notes-popup-text');

    notesCells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            const rect = cell.getBoundingClientRect();
            popup.style.left = `${rect.left + window.scrollX}px`;
            popup.style.top = `${rect.bottom + window.scrollY}px`;
            popupText.value = cell.textContent.trim();
            popup.style.display = 'block';
            e.stopPropagation();

            document.addEventListener('click', function handler(e) {
                if (!popup.contains(e.target) && !cell.contains(e.target)) {
                    popup.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            }, { once: true });
        });
    });
}

function showNotification(result) {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification ${result.status === 'success' ? 'success' : 'error'}`;
    notification.innerHTML = `
        <div class="notification-content">
            <h3>Результат</h3>
            <p>Успешно: ${result.success}</p>
            <p>Неудачно: ${result.failed}</p>
            ${result.errors ? `<p>Ошибки: ${result.errors.join(', ')}</p>` : ''}
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

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

async function renderEditTable(items) {
    const checkbox = document.getElementById('same-data-checkbox');
    const container = document.getElementById('edit-table-body');
    const isSameData = checkbox.checked;
    const kpNumbers = currentPage === 'container' ? await fetchKpNumbers() : [];
    const bookingNumbers = currentPage === 'container' ? await fetchBookingNumbers() : [];

    const statusOptions = [
        { value: "Направлен в Китай", text: "Направлен в Китай 🇷🇺➡️🇨🇳" },
        { value: "В Китае", text: "В Китае" },
        { value: "Направлен в Россию", text: "Направлен в Россию" },
        { value: "В России", text: "В России" }
    ];
    function formatDate(dateStr) {
        if (!dateStr) return '';
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
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
            flatpickr(cell, {
                dateFormat: "d.m.Y",
                defaultDate: initialDate.match(/^\d{2}\.\d{2}\.\d{4}$/) ? initialDate : null,
                enableTime: false,
                onChange: (selectedDates, dateStr) => cell.textContent = dateStr
            });
        });

        pickupCells.forEach(cell => {
            const initialDate = cell.textContent.trim();
            flatpickr(cell, {
                dateFormat: "d.m.Y",
                defaultDate: initialDate.match(/^\d{2}\.\d{2}\.\d{4}$/) ? initialDate : null,
                enableTime: false,
                onChange: (selectedDates, dateStr) => cell.textContent = dateStr
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
        cell.addEventListener('dblclick', (e) => {
            const rect = cell.getBoundingClientRect();
            editPopup.style.left = `${rect.right + window.scrollX + 5}px`;
            editPopup.style.top = `${rect.top + window.scrollY}px`;
            editPopupText.value = cell.textContent;
            editPopup.style.display = 'block';
            editPopupText.focus();
            e.stopPropagation();

            document.addEventListener('click', function handler(e) {
                if (!editPopup.contains(e.target) && !cell.contains(e.target)) {
                    cell.textContent = editPopupText.value;
                    editPopup.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            }, { once: true });
        });
    });

    if (currentPage === 'container') {
        const statusSelects = container.querySelectorAll('.status-select');
        statusSelects.forEach(select => {
            updateStatusSelectStyle(select); // Устанавливаем начальный стиль
            select.addEventListener('change', (e) => {
                const row = e.target.closest('tr');
                const kpCell = row.querySelector('.kp-cell');
                const bookingCell = row.querySelector('.booking-cell');
                const selectedStatus = e.target.value;

                kpCell.setAttribute('contenteditable', selectedStatus === "Направлен в Китай");
                bookingCell.setAttribute('contenteditable', selectedStatus === "Направлен в Китай");

                if (selectedStatus !== "Направлен в Китай") {
                    kpCell.textContent = '';
                    bookingCell.textContent = '';
                }

                updateStatusSelectStyle(e.target); // Обновляем стиль при изменении
            });
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

                    if (status === "Направлен в Китай" && kp && !kpNumbers.includes(kp)) {
                        errors.push(`КП ${kp} не существует`);
                    }
                    if (status === "Направлен в Китай" && booking && !bookingNumbers.includes(booking)) {
                        errors.push(`Букинг ${booking} не существует`);
                    }

                    if (kp) formData.append('kp', kp);
                    if (booking) formData.append('booking', booking);
                    formData.append('status', status);
                    formData.append('location', location);
                    if (deliveryDate) formData.append('delivery_date', deliveryDate);
                    if (pickupDate) formData.append('pickup_date', pickupDate);
                    formData.append('notes', notes);
                } else {
                    // Обработка ошибок валидации
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
                await updateTable();
            }
        };
    }
}

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

function attachModalListeners() {
    const addButton = document.querySelector('.add');
    const deleteButton = document.querySelector('.delete');
    const editButton = document.querySelector('.edit');
    const inventoryButton = document.querySelector('.inventory');
    const addModal = document.getElementById('add-modal');
    const deleteModal = document.getElementById('delete-modal');
    const editNumbersModal = document.getElementById('edit-numbers-modal');
    const editDataModal = document.getElementById('edit-data-modal');
    const inventoryModal = document.getElementById('inventory-modal');

    const addCloseElements = addModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];
    const deleteCloseElements = deleteModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];
    const editNumbersCloseElements = editNumbersModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];
    const editDataCloseElements = editDataModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];
    const inventoryCloseElements = inventoryModal?.querySelectorAll('.modal-header .close, .modal-footer .cancel') || [];

    const addSaveButton = addModal?.querySelector('.modal-footer .save');
    const deleteSaveButton = deleteModal?.querySelector('.modal-footer .save');
    const editNextButton = editNumbersModal?.querySelector('.modal-footer .next');
    const inventorySaveButton = inventoryModal?.querySelector('.modal-footer .save');

    if (addButton && addModal) addButton.onclick = () => addModal.style.display = 'block';
    if (deleteButton && deleteModal) deleteButton.onclick = () => deleteModal.style.display = 'block';
    if (editButton && editNumbersModal) editButton.onclick = () => editNumbersModal.style.display = 'block';
    if (inventoryButton && inventoryModal) inventoryButton.onclick = () => inventoryModal.style.display = 'block';

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
                if (result.success > 0) updateTable();
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
                if (result.success > 0) updateTable();
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
        editDataCloseElements.forEach(el => el.onclick = () => editDataModal.style.display = 'none');
        const checkbox = document.getElementById('same-data-checkbox');
        if (checkbox) checkbox.onchange = () => renderEditTable(editItems);
    }

    if (inventoryModal) {
        inventoryCloseElements.forEach(el => el.onclick = () => inventoryModal.style.display = 'none');
        
        const fileInput = document.getElementById('inventory-file');
        const kpInput = document.getElementById('inventory-kp-number'); // Только для контейнеров
        
        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const data = await file.arrayBuffer();
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    const numbers = jsonData
                        .map(row => row[0]?.toString().trim())
                        .filter(num => num && (currentPage !== 'container' || /^[A-Za-z]{4}\d{7}$/.test(num)));

                    if (numbers.length === 0) {
                        showNotification({
                            success: 0,
                            failed: 0,
                            errors: [`Не найдено корректных номеров ${currentPage === 'container' ? 'контейнеров' : currentPage === 'kp' ? 'КП' : 'букингов'} в файле`],
                            status: 'error',
                            action: 'inventory'
                        });
                        return;
                    }

                    if (inventorySaveButton) {
                        inventorySaveButton.onclick = async () => {
                            const kpNumber = kpInput?.value.trim() || ''; // Только для контейнеров

                            try {
                                const formData = new FormData();
                                formData.append(`${currentPage}_numbers`, numbers.join('\n'));
                                if (currentPage === 'container' && kpNumber) formData.append('kp_number', kpNumber);

                                const endpoint = currentPage === 'container' ? '/add_from_inventory' :
                                                currentPage === 'kp' ? '/add_kp_from_inventory' : '/add_booking_from_inventory';
                                const response = await fetch(endpoint, {
                                    method: 'POST',
                                    body: formData
                                });

                                const result = await response.json();
                                inventoryModal.style.display = 'none';
                                
                                fileInput.value = '';
                                if (kpInput) kpInput.value = '';
                                
                                showNotification(result);
                                if (result.success > 0) await updateTable();
                            } catch (error) {
                                showNotification({
                                    success: 0,
                                    failed: numbers.length,
                                    errors: ['Ошибка сервера: ' + error.message],
                                    status: 'error',
                                    action: 'inventory'
                                });
                            }
                        };
                    }
                } catch (error) {
                    showNotification({
                        success: 0,
                        failed: 0,
                        errors: ['Ошибка чтения файла: ' + error.message],
                        status: 'error',
                        action: 'inventory'
                    });
                }
            });
        }
    }

    window.onclick = (event) => {
        if (event.target === addModal) addModal.style.display = 'none';
        else if (event.target === deleteModal) deleteModal.style.display = 'none';
        else if (event.target === editNumbersModal) editNumbersModal.style.display = 'none';
        else if (event.target === editDataModal) editDataModal.style.display = 'none';
        else if (event.target === inventoryModal) inventoryModal.style.display = 'none';
    };
}

function toggleFilter() {
    const filterContainer = document.getElementById("filter-container");
    if (!filterContainer) return;
    filterContainer.classList.toggle("active");
}

function attachTableCellListeners() {
    const table = document.querySelector('.table-container table');
    if (!table) return;

    const headers = table.querySelectorAll('th');
    const cells = table.querySelectorAll('td');
    let isDragging = false;
    let startCell = null;
    let startColumnIndex = null;
    let selectedCells = new Set();

    function getColumnIndex(cell) {
        return Array.from(cell.parentElement.children).indexOf(cell);
    }

    function clearSelection() {
        selectedCells.forEach(cell => cell.classList.remove('custom-selected'));
        selectedCells.clear();
    }

    function selectColumnRange(startCell, endCell) {
        clearSelection();
        const columnIndex = getColumnIndex(startCell);
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const startRowIndex = Array.from(rows).indexOf(startCell.parentElement);
        const endRowIndex = Array.from(rows).indexOf(endCell.parentElement);
        const minRow = Math.min(startRowIndex, endRowIndex);
        const maxRow = Math.max(startRowIndex, endRowIndex);

        for (let i = minRow; i <= maxRow; i++) {
            const cell = rows[i].children[columnIndex];
            cell.classList.add('custom-selected');
            selectedCells.add(cell);
        }
    }

    function copySelectedCells() {
        const text = Array.from(selectedCells)
            .map(cell => cell.textContent.trim())
            .join('\n');
        copyToClipboard(text);
    }

    cells.forEach(cell => {
        cell.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            startCell = cell;
            startColumnIndex = getColumnIndex(cell);
            clearSelection();
            cell.classList.add('custom-selected');
            selectedCells.add(cell);
        });

        cell.addEventListener('mouseover', (e) => {
            if (!isDragging || startCell === null || startColumnIndex === null) return;
            e.preventDefault();
            const currentColumnIndex = getColumnIndex(cell);
            if (currentColumnIndex === startColumnIndex) {
                selectColumnRange(startCell, cell);
            }
        });

        cell.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const row = cell.parentElement;
            const rowCells = Array.from(row.querySelectorAll('td'));
            const rowText = rowCells.map(c => c.textContent.trim()).join('\t');
            copyToClipboard(rowText);
            clearSelection();
            rowCells.forEach(c => {
                c.classList.add('custom-selected');
                selectedCells.add(c);
            });
            setTimeout(clearSelection, 1000);
        });
    });

    headers.forEach((header, index) => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            clearSelection();
            const columnCells = Array.from(table.querySelectorAll(`tbody td:nth-child(${index + 1})`));
            const columnText = columnCells.map(cell => cell.textContent.trim()).join('\n');
            copyToClipboard(columnText);
            columnCells.forEach(cell => {
                cell.classList.add('custom-selected');
                selectedCells.add(cell);
            });
            setTimeout(clearSelection, 1000);
        });
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            if (selectedCells.size > 1) {
                copySelectedCells();
                setTimeout(clearSelection, 1000);
            }
            startCell = null;
            startColumnIndex = null;
        }
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => console.log('Скопировано в буфер обмена:', text))
        .catch(err => console.error('Ошибка копирования:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    attachTableCellListeners();
    document.addEventListener('tableUpdated', attachTableCellListeners);
});