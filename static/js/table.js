// Table update and management functions
async function updateTable(filters = {}) {
    const endpoints = {
        'container': '/get_containers',
        'kp': '/get_kps',
        'buking': '/get_internal_numbers'  // Новый эндпоинт для получения внутренних номеров в JSON
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
        // Отображаем индикатор загрузки
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Обновление данных...';
        document.body.appendChild(loadingIndicator);

        try {
            // Отправляем запрос на сервер с учетом фильтров
            let url = endpoint + params;
            
            // Для страницы buking, добавим параметры фильтрации в URL если они есть
            if (currentPage === 'buking' && Object.keys(filters).length > 0) {
                const filterParams = new URLSearchParams();
                
                if (filters.number) filterParams.append('internal_number', filters.number);
                if (filters.podDirection) filterParams.append('pod_direction', filters.podDirection);
                if (filters.quantity) filterParams.append('quantity', filters.quantity);
                if (filters.typeSize) filterParams.append('type_size', filters.typeSize);
                if (filters.cargo) filterParams.append('cargo', filters.cargo);
                
                url += '?' + filterParams.toString();
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);

            let filteredItems;
            
            if (currentPage === 'buking') {
                // Для страницы букинга, данные приходят как internal_numbers
                filteredItems = data.internal_numbers || [];
                
                // Обновляем счетчик количества внутренних номеров
                const header = document.querySelector('.header h1');
                if (header) {
                    header.textContent = `Внутренние номера: ${filteredItems.length}`;
                }
                
                // Обновляем содержимое таблицы
                const tbody = document.querySelector('.table-container tbody');
                if (tbody) {
                    tbody.innerHTML = filteredItems.map(item => `
                        <tr class="internal-number-row" data-internal-number="${item.internal_number}" ondblclick="handleRowClick('${item.internal_number}')">
                            <td>${item.internal_number}</td>
                            <td>${item.quantity}</td>
                            <td>${item.type_size}</td>
                            <td>${item.pod_direction}</td>
                            <td>${item.cargo || ''}</td>
                            <td>${item.booking_count}</td>
                        </tr>
                    `).join('');
                }
                
                // Переинициализируем обработчики событий для строк
                setupInternalNumberRows();
            } else {
                // Для остальных страниц оставляем прежнюю логику
                filteredItems = currentPage === 'container' ? data.containers :
                    currentPage === 'kp' ? data.kps : data.bookings;
                
                if (Object.keys(filters).length > 0) {
                    filteredItems = filteredItems.filter(item => {
                        // Преобразуем значения в строки и приводим к нижнему регистру для поиска
                        const convertToSearchString = (value) => {
                            // Сначала обрабатываем значение через cleanValue
                            let cleaned = cleanValue(value);
                            // Затем преобразуем в строку, если это еще не строка
                            if (typeof cleaned !== 'string') {
                                cleaned = String(cleaned);
                            }
                            // И приводим к нижнему регистру
                            return cleaned.toLowerCase();
                        };
                        
                        const notes = convertToSearchString(item.notes);
                        const kp = currentPage === 'container' ? convertToSearchString(item.KP) : '';
                        const booking = currentPage === 'container' ? convertToSearchString(item.booking) : '';
                        const deliveryDate = currentPage === 'container' ? formatDateToISO(item.delivery_date) : '';
                        const pickupDate = currentPage === 'container' ? formatDateToISO(item.pickup_date) : '';
                        const number = convertToSearchString(item.number);
                        const location = convertToSearchString(item.location);
                        const status = currentPage === 'container' ? convertToSearchString(item.status) : '';

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
                            const statusClean = status.replace(/[^\w\sА-Яа-яЁё-]/g, '').trim();
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
            }
            
            attachTableRowListeners();
            attachNotesPopupListeners();
            document.dispatchEvent(new Event('tableUpdated'));
        } catch (error) {
            console.error('Error updating table:', error);
            // В случае ошибки не перезагружаем страницу, а показываем уведомление
            showNotification({
                status: 'error',
                success: 0,
                failed: 1,
                errors: [`Ошибка при обновлении данных: ${error.message}`]
            });
        } finally {
            // Удаляем индикатор загрузки
            document.body.removeChild(loadingIndicator);
        }
    } catch (error) {
        console.error('Error in updateTable:', error);
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
        // Проверяем, не является ли строка строкой внутреннего номера на странице букинга
        if (currentPage === 'buking' && row.classList.contains('internal-number-row')) {
            // Пропускаем обработку для строк внутренних номеров на странице букинга
            // так как для них есть отдельный обработчик
            return;
        }
        
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

    // Create a global document click handler for popup
    const documentClickHandler = function(e) {
        // Only hide the popup if it's visible and the click is outside the popup and the active cell
        if (popup.style.display === 'block' && 
            !popup.contains(e.target) && 
            (!lastCell || !lastCell.contains(e.target))) {
            hidePopup();
        }
    };

    // Remove existing handler if any and add new one
    document.removeEventListener('click', documentClickHandler);
    document.addEventListener('click', documentClickHandler);

    notesCells.forEach(cell => {
        // Skip if the cell is in the quantity column (2nd column) in the buking page
        if (currentPage === 'buking' && cell.cellIndex === 1) {
            return;
        }
        
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
            e.stopPropagation(); // Prevent the global click handler from immediately closing the popup
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

// Добавляем обработчик для строк с внутренними номерами (на странице букингов)
function setupInternalNumberRows() {
    if (currentPage !== 'buking') return;
    
    const internalDetailModal = document.getElementById('internal-number-details-modal');
    if (!internalDetailModal) {
        console.log('Модальное окно internal-number-details-modal не найдено, пропускаем обработку');
        return;
    }
    
    const closeButtons = internalDetailModal.querySelectorAll('.close, .cancel');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            internalDetailModal.style.display = 'none';
        });
    });
    
    // Добавляем обработчики к строкам с внутренними номерами
    const internalRows = document.querySelectorAll('.internal-number-row');
    internalRows.forEach(row => {
        row.addEventListener('click', async function() {
            const internalNumber = this.dataset.internalNumber;
            if (!internalNumber) return;
            
            try {
                console.log('Получаем информацию о букингах для внутреннего номера:', internalNumber);
                
                // Используем функцию showInternalNumberModal из internal_numbers.js, если она доступна
                if (typeof window.showInternalNumberModal === 'function') {
                    window.showInternalNumberModal(internalNumber);
                    return; // Выходим, так как дальнейшая обработка будет в showInternalNumberModal
                }
                
                // Запрос букингов для этого внутреннего номера
                const response = await fetch('/get_bookings_by_internal_number', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ 'internal_number': internalNumber })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Проверка наличия элемента перед обновлением его содержимого
                    const selectedInternalNumberElement = document.getElementById('selected-internal-number');
                    if (selectedInternalNumberElement) {
                        selectedInternalNumberElement.textContent = internalNumber;
                    } else {
                        console.warn('Элемент selected-internal-number не найден');
                    }
                    
                    // Проверка наличия таблицы для букингов
                    const bookingsTable = document.getElementById('internal-number-bookings');
                    if (!bookingsTable) {
                        console.warn('Элемент internal-number-bookings не найден');
                        return;
                    }
                    
                    bookingsTable.innerHTML = '';
                    
                    if (data.bookings && data.bookings.length > 0) {
                        data.bookings.forEach(booking => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${booking.booking}</td>
                                <td>${booking.line}</td>
                                <td>${booking.quantity}</td>
                                <td>${booking.vessel}</td>
                            `;
                            bookingsTable.appendChild(row);
                        });
                        
                        // Если есть хотя бы один букинг, заполняем поля в модальном окне добавления букинга
                        const sampleBooking = data.bookings[0];
                        const bookingLineInput = document.getElementById('booking-line');
                        const bookingQuantityInput = document.getElementById('booking-quantity');
                        const bookingVesselInput = document.getElementById('booking-vessel');
                        
                        if (bookingLineInput) bookingLineInput.value = sampleBooking.line || '';
                        if (bookingQuantityInput) bookingQuantityInput.value = sampleBooking.quantity || '';
                        if (bookingVesselInput) bookingVesselInput.value = sampleBooking.vessel || '';
                    } else {
                        bookingsTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">Нет связанных букингов</td></tr>';
                    }
                    
                    // Добавляем обработчик для кнопки добавления букингов
                    setupAddBookingButton(internalNumber, data.bookings[0]);
                    
                    // Показываем модальное окно
                    internalDetailModal.style.display = 'block';
                } else {
                    showNotification({
                        status: 'error',
                        success: 0,
                        failed: 1,
                        errors: [data.error || 'Ошибка получения данных']
                    });
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                showNotification({
                    status: 'error',
                    success: 0,
                    failed: 1,
                    errors: ['Ошибка загрузки списка букингов']
                });
            }
        });
        
        // Добавляем визуальную подсказку, что на строку можно кликнуть
        row.style.cursor = 'pointer';
    });
}

// Функция для настройки модального окна добавления букингов
function setupAddBookingButton(internalNumber, sampleBooking) {
    const addBookingBtn = document.querySelector('.add-booking-btn');
    const addBookingModal = document.getElementById('add-booking-modal');
    
    if (!addBookingBtn || !addBookingModal) return;
    
    // Настраиваем кнопку открытия модального окна
    addBookingBtn.onclick = function() {
        document.getElementById('add-to-internal-number').textContent = internalNumber;
        document.getElementById('new-booking-numbers').value = '';
        
        // Предзаполняем поля данными из образца, если они доступны
        if (sampleBooking) {
            document.getElementById('booking-line').value = sampleBooking.line || '';
            document.getElementById('booking-quantity').value = sampleBooking.quantity || '';
            document.getElementById('booking-vessel').value = sampleBooking.vessel || '';
        }
        
        addBookingModal.style.display = 'block';
    };
    
    // Настраиваем кнопки закрытия
    const closeButtons = addBookingModal.querySelectorAll('.close, .cancel');
    closeButtons.forEach(btn => {
        btn.onclick = function() {
            addBookingModal.style.display = 'none';
        };
    });
    
    // Настраиваем кнопку сохранения
    const saveButton = addBookingModal.querySelector('.save');
    if (saveButton) {
        saveButton.onclick = async function() {
            const bookingNumbers = document.getElementById('new-booking-numbers').value;
            const line = document.getElementById('booking-line').value;
            const quantity = document.getElementById('booking-quantity').value;
            const vessel = document.getElementById('booking-vessel').value;
            
            // Проверяем заполнение полей
            if (!bookingNumbers || !line || !quantity || !vessel) {
                showNotification({
                    status: 'error',
                    success: 0,
                    failed: 1,
                    errors: ['Заполните все обязательные поля']
                });
                return;
            }
            
            try {
                const response = await fetch('/add_buking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        'booking_numbers': bookingNumbers,
                        'internal_number': internalNumber,
                        'line': line,
                        'quantity': quantity,
                        'vessel': vessel
                    })
                });
                
                const result = await response.json();
                addBookingModal.style.display = 'none';
                
                // Показываем уведомление о результате
                showNotification(result);
                
                if (result.success > 0) {
                    // Перезагружаем список букингов
                    const newResponse = await fetch('/get_bookings_by_internal_number', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ 'internal_number': internalNumber })
                    });
                    
                    const newData = await newResponse.json();
                    
                    if (newData.success) {
                        const bookingsTable = document.getElementById('internal-number-bookings');
                        bookingsTable.innerHTML = '';
                        
                        if (newData.bookings && newData.bookings.length > 0) {
                            newData.bookings.forEach(booking => {
                                const row = document.createElement('tr');
                                row.innerHTML = `
                                    <td>${booking.booking}</td>
                                    <td>${booking.line}</td>
                                    <td>${booking.quantity}</td>
                                    <td>${booking.vessel}</td>
                                `;
                                bookingsTable.appendChild(row);
                            });
                        } else {
                            bookingsTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">Нет связанных букингов</td></tr>';
                        }
                    }
                    
                    // Обновляем общую таблицу внутренних номеров
                    updateTable(getCurrentFilters());
                }
            } catch (error) {
                console.error('Error adding bookings:', error);
                showNotification({
                    status: 'error',
                    success: 0,
                    failed: 1,
                    errors: ['Ошибка при добавлении букингов']
                });
            }
        };
    }
    
    // Закрытие по клику за пределами модального окна
    window.onclick = function(event) {
        if (event.target === addBookingModal) {
            addBookingModal.style.display = 'none';
        }
    };
}

document.addEventListener("DOMContentLoaded", function() {
    // Вызываем функцию при загрузке страницы
    setupInternalNumberRows();
    
    // Обработка кликов на строки с внутренними номерами
    const rows = document.querySelectorAll('.internal-number-row');
    rows.forEach(row => {
        row.addEventListener('click', function() {
            const internalNumber = this.getAttribute('data-internal-number');
            if (internalNumber) {
                console.log('Row clicked. Internal number:', internalNumber);
                // Вызываем нашу функцию для отображения пустого модального окна
                if (typeof window.showInternalNumberModal === 'function') {
                    window.showInternalNumberModal(internalNumber);
                } else {
                    console.error('Функция showInternalNumberModal не найдена');
                }
            } else {
                console.log('Row clicked but data-internal-number attribute is missing');
            }
        });
    });
    console.log('Event listeners attached to table rows.');
});