// Table update and management functions
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
        if (/^\d{2}\.\д{2}\.\д{4}$/.test(dateStr)) {
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
                const notes = cleanValue(item.notes).toLowerCase();
                const kp = currentPage === 'container' ? cleanValue(item.KP).toLowerCase() : '';
                const booking = currentPage === 'container' ? cleanValue(item.booking).toLowerCase() : '';
                const deliveryDate = currentPage === 'container' ? formatDateToISO(item.delivery_date) : '';
                const pickupDate = currentPage === 'container' ? formatDateToISO(item.pickup_date) : '';
                const number = cleanValue(item.number).toLowerCase();
                const location = cleanValue(item.location).toLowerCase();
                const status = currentPage === 'container' ? cleanValue(item.status).toLowerCase() : '';

                // Support filtering by multiple numbers separated by space
                let numberMatch = true;
                if (filters.number) {
                    const numbersArray = filters.number
                        .split(/\s+/)
                        .map(n => n.trim().toLowerCase())
                        .filter(n => n.length > 0);

                    if (numbersArray.length > 1) {
                        // If multiple numbers are entered, look for exact match with any of them
                        numberMatch = numbersArray.includes(number);
                    } else if (numbersArray.length === 1) {
                        // If only one number or part is entered - search by substring
                        numberMatch = number.includes(numbersArray[0]);
                    }
                }

                let statusMatch = true;
                if (currentPage === 'container' && filters.status && filters.status.trim() !== '') {
                    const statusClean = status.replace(/[^\w\sА-Яа-яЁё-]/g, '').trim().toLowerCase();
                    const filterStatusClean = filters.status.trim().toLowerCase();
                    statusMatch = statusClean === filterStatusClean;
                }

                return (
                    numberMatch &&
                    statusMatch &&
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
                // Define class for status
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

    let lastCell = null;
    let lastRect = null;
    let repositionPopup = null;

    function hidePopup() {
        popup.style.display = 'none';
        lastCell = null;
        lastRect = null;
        repositionPopup = null;
    }

    notesCells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            const rect = cell.getBoundingClientRect();
            lastCell = cell;
            lastRect = rect;
            popupText.value = cell.textContent.trim();
            popup.style.width = `${rect.width}px`;
            repositionPopup = function () {
                const newRect = lastCell.getBoundingClientRect();
                popup.style.left = `${newRect.left + window.scrollX}px`;
                popup.style.top = `${newRect.bottom + window.scrollY}px`;
                popup.style.width = `${newRect.width}px`;
            };
            repositionPopup();
            popup.style.display = 'block';
            e.stopPropagation();

            document.addEventListener('click', function handler(e) {
                if (!popup.contains(e.target) && !cell.contains(e.target)) {
                    hidePopup();
                    document.removeEventListener('click', handler);
                }
            }, { once: true });
        });
    });

    // Reposition popup on window resize
    window.addEventListener('resize', () => {
        if (popup.style.display === 'block' && repositionPopup) {
            repositionPopup();
        }
    });

    // Hide popup on tbody scroll
    const tbody = document.querySelector('.table-container tbody');
    if (tbody) {
        tbody.addEventListener('scroll', () => {
            if (popup.style.display === 'block') {
                hidePopup();
            }
            const editPopup = document.getElementById('edit-notes-popup');
            if (editPopup && editPopup.style.display === 'block') {
                editPopup.style.display = 'none';
            }
        });
    }
}

function attachFilterListeners() {
    const filterInputs = {
        containerNumber: document.getElementById('filter-container-number'),
        kpNumber: document.getElementById('filter-kp-number'),
        bookingNumber: document.getElementById('filter-booking-number'),
        location: document.getElementById('filter-location'),
        notes: document.getElementById('filter-notes'),
        deliveryDate: document.getElementById('filter-delivery-date'),
        pickupDate: document.getElementById('filter-pickup-date'),
        status: document.getElementById('filter-status')
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
                    pickupDate: filterInputs.pickupDate?.value,
                    status: currentPage === 'container' ? filterInputs.status?.value : ''
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

function toggleFilter() {
    const filterContainer = document.getElementById("filter-container");
    if (!filterContainer) return;
    filterContainer.classList.toggle("active");
}

// Get current filters from input fields
function getCurrentFilters() {
    const inputs = {
        number: document.getElementById('filter-container-number'),
        kpNumber: document.getElementById('filter-kp-number'),
        bookingNumber: document.getElementById('filter-booking-number'),
        location: document.getElementById('filter-location'),
        notes: document.getElementById('filter-notes'),
        deliveryDate: document.getElementById('filter-delivery-date'),
        pickupDate: document.getElementById('filter-pickup-date'),
        status: document.getElementById('filter-status')
    };
    return {
        number: inputs.number?.value || '',
        kpNumber: inputs.kpNumber?.value || '',
        bookingNumber: inputs.bookingNumber?.value || '',
        location: inputs.location?.value || '',
        notes: inputs.notes?.value || '',
        deliveryDate: inputs.deliveryDate?.value || '',
        pickupDate: inputs.pickupDate?.value || '',
        status: inputs.status?.value || ''
    };
}