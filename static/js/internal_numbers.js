console.log('Скрипт internal_numbers.js загружен');

// Добавляем CSS стили для модального окна
function addModalStyles() {
    // Проверка на существование стилей
    if (document.getElementById('internal-number-modal-styles')) {
        return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'internal-number-modal-styles';
    styleElement.textContent = `
        /* === GENERAL MODAL STYLES === */
        #internal-number-details-modal,
        #add-internal-number-modal,
        #edit-bookings-modal {
            display: none;
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
        }        #internal-number-details-modal {
        }        #add-internal-number-modal {
        }        #edit-bookings-modal {
        }        #add-booking-modal {
            background-color: transparent;
        }

        /* === MODAL CONTENT CONTAINERS === */
        #internal-number-details-modal .internal-modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 60%;
            max-width: 800px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        #add-internal-number-modal .internal-modal-content {
            background-color: white;
            margin: 10% auto;
            padding: 20px;
            border-radius: 8px;
            width: 400px;
            max-width: 800px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        #edit-bookings-modal .modal-content {
            background-color: white;
            margin: 0% auto;
            border-radius: 10px;
            width: 60%;
            max-width: 800px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }        #add-booking-modal .modal-content {
            width: 450px;
            max-width: 800px;
        }

        /* === MODAL HEADERS === */
        .internal-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .internal-modal-header h2 {
            margin: 0;
            color: #333;
        }

        .internal-modal-close {
            font-size: 28px;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
            transition: color 0.2s;
        }

        .internal-modal-close:hover {
            color: #333;
        }

        /* === MODAL BODIES === */
        .internal-modal-body {
            padding: 10px 0;
        }

        #internal-number-details-modal .internal-modal-body {
            max-height: 60vh;
            overflow-y: auto;
        }

        /* === MODAL FOOTERS === */
        .internal-modal-footer {
            padding-top: 10px;
            text-align: right;
        }

        #add-internal-number-modal .internal-modal-footer {
            padding-top: 15px;
            border-top: 1px solid #ccc;
        }

        /* === TABLE STYLES === */
        #internal-number-details-modal table,
        #edit-bookings-modal table {
            border-collapse: collapse;
            width: 100%;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-bottom: 10px;
        }

        #internal-number-details-modal th,
        #edit-bookings-modal th {
            background: #0D1B2A;
            color: #fff;
            font-size: 15px;
            font-weight: 500;
            padding: 10px 8px;
            text-align: center;
            position: sticky;            top: 0;
            border-bottom: 1.5px solid #e0e0e0;
            vertical-align: bottom;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        #edit-bookings-modal th {
            font-size: 16px;
            font-weight: bold;
            padding: 10px;
            border: 1px solid #ddd;
            vertical-align: middle;
        }

        #internal-number-details-modal td,
        #edit-bookings-modal td {
            padding: 7px 8px;
            font-size: 14px;
            border-bottom: 1px solid #f0f0f0;
            background: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
        }

        #edit-bookings-modal td {
            padding: 10px;
            border: 1px solid #ddd;
            vertical-align: middle;
        }

        .custom-selected {
            background-color: #e0f7fa !important;
            border: 1px solid #2c2e2e !important;
            color: #111;
            transition: background-color 0.3s ease;
        }

        #edit-bookings-modal .custom-selected {
            border-left: 2px solid #2c2e2e !important;
        }

        /* === INTERACTIVE ELEMENTS === */
        button {
            padding: 8px 16px;
            background: #0A1F44;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
            transition: background-color 0.2s;
        }

        button.cancel {
            background: #ccc;
            color: #333;
        }

        button:hover {
            opacity: 0.9;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }

        input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }

        /* === UTILITY STYLES === */
        .error-row {
            background-color: #ffdddd !important;
        }

        .empty-bookings-message {
            padding: 20px;
            text-align: center;
            color: #888;
            background: #fff;
        }

        .error-message {
            color: #f44336;
            font-size: 14px;
            margin-top: 10px;
        }

        h3 {
            margin-bottom: 10px;
            font-size: 16px;
            color: #333;
        }

        [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #bbb;
            pointer-events: none;
        }

        [contenteditable]:focus {
            outline: none;
            box-shadow: none;
            caret-color: black;
        }
    `;
    
    document.head.appendChild(styleElement);
    console.log('Стили для модальных окон добавлены');
}

// Создаём модальное окно для внутренних номеров
function createInternalNumberModal() {
    console.log('Создание модального окна для внутренних номеров');
    
    // Проверяем, существует ли уже модальное окно
    if (document.getElementById('internal-number-details-modal')) {
        console.log('Модальное окно уже существует');
        return;
    }
    
    // Добавляем стили для модального окна
    addModalStyles();
    
    // Создаем элемент модального окна
    const modal = document.createElement('div');
    modal.id = 'internal-number-details-modal';
    
    modal.innerHTML = `
        <div class="internal-modal-content">
            <div class="internal-modal-header">
                <h2>Внутренний номер: <span id="modal-internal-number"></span></h2>
                <span class="internal-modal-close">&times;</span>
            </div>
            <div class="internal-modal-body">
                <h3>Связанные букинги</h3>
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Номер букинга</th>
                                <th>Количество</th>
                                <th>Линия</th>
                                <th>Судно</th>
                                <th>Заметки</th>
                            </tr>
                        </thead>
                        <tbody id="bookings-table-body">
                            <!-- Здесь будут отображаться букинги для данного внутреннего номера -->
                            <tr id="loading-row">
                                <td colspan="5" style="text-align: center;">Загрузка данных...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>            <div class="internal-modal-footer">
                <div id="error-message"></div>
                <button id="edit-internal-number-btn" class="save">Добавить букинг</button>
                <button class="cancel">Отмена</button>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    document.body.appendChild(modal);
    
    // Добавляем обработчики для закрытия модального окна
    const closeElements = modal.querySelectorAll('.internal-modal-close, .cancel');
    closeElements.forEach(element => {
        element.addEventListener('click', function() {
            closeInternalNumberModal();
        });
    });
    
    console.log('Модальное окно для внутренних номеров создано');
}

// Функция для отображения модального окна с внутренним номером
window.showInternalNumberModal = function(internalNumber) {
    console.log('Вызвана функция showInternalNumberModal с номером:', internalNumber);
    
    // Создаем модальное окно, если оно ещё не создано
    if (!document.getElementById('internal-number-details-modal')) {
        createInternalNumberModal();
    }
    
    const modal = document.getElementById('internal-number-details-modal');
    if (modal) {
        // Устанавливаем номер в заголовке
        const numberSpan = document.getElementById('modal-internal-number');
        if (numberSpan) {
            numberSpan.textContent = internalNumber;
        }
        
        // Загружаем букинги для выбранного внутреннего номера
        loadBookingsForInternalNumber(internalNumber);
        
        // Заменяем обработчик кнопки "Добавить букинг" на открытие модального окна добавления букинга
        const editBtn = document.getElementById('edit-internal-number-btn');
        if (editBtn) {
            editBtn.onclick = function() {
                openAddBookingModal(internalNumber);
            };
        }
          // Отображаем модальное окно
        window.modalBackdropManager.openModal(modal);
    } else {
        console.error('Модальное окно не найдено');
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded в internal_numbers.js');
    
    // Добавляем стили для модальных окон
    addModalStyles();
    
    // Создаем модальные окна заранее
    createInternalNumberModal();
    
    // Инициализация модуля внутренних номеров
    if (window.internalNumbersModule) {
        window.internalNumbersModule.init();
    }
});

// Если DOM уже загружен, создадим модальное окно сразу
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('DOM уже загружен, создаем модальные окна немедленно');
    addModalStyles();
    createInternalNumberModal();
    
    // Инициализация модуля внутренних номеров
    if (window.internalNumbersModule) {
        window.internalNumbersModule.init();
    }
}

// Функция закрытия модального окна
function closeInternalNumberModal() {
    console.log('Вызвана функция closeInternalNumberModal');
    const modal = document.getElementById('internal-number-details-modal');
    if (modal) {
        window.modalBackdropManager.closeModal(modal);
    }
}

// Функция для загрузки букингов по внутреннему номеру
async function loadBookingsForInternalNumber(internalNumber) {
    console.log(`Загрузка букингов для внутреннего номера: ${internalNumber}`);
    const tableBody = document.getElementById('bookings-table-body');
    
    try {
        // Запрос к серверу для получения букингов по внутреннему номеру
        const response = await fetch('/get_bookings_by_internal_number', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `internal_number=${encodeURIComponent(internalNumber)}`
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Очищаем таблицу от строки загрузки
        tableBody.innerHTML = '';
        
        if (data.bookings && data.bookings.length > 0) {
            // Добавляем строки с букингами
            data.bookings.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.booking || '-'}</td>
                    <td>${booking.quantity || '-'}</td>
                    <td>${booking.line || '-'}</td>
                    <td>${booking.vessel || '-'}</td>
                    <td>${booking.notes || '-'}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            // Если букингов нет, показываем сообщение в стиле ошибки импорта
            const emptyMessage = document.createElement('tr');
            emptyMessage.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 20px;">
                    <div class="empty-bookings-message" style="padding: 20px; text-align: center; color: #888;">
                        <p>У данного внутреннего номера нет связанных букингов</p>
                        <p>Вы можете добавить букинги, используя кнопку "Добавить букинг"</p>
                    </div>
                </td>
            `;
            tableBody.appendChild(emptyMessage);
        }
    } catch (error) {
        console.error('Ошибка при загрузке букингов:', error);
        
        // Показываем сообщение об ошибке
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: red;">
                    Ошибка при загрузке букингов: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Функция для создания модального окна добавления букинга (только одно поле)
function createAddBookingModal() {
    if (document.getElementById('add-booking-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'add-booking-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Добавить букинги к <span id="add-to-internal-number"></span></h2>
                <button class="close">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="new-booking-numbers">Номера букингов</label>
                    <textarea id="container-numbers" placeholder="Введите номера букингов, каждый на новой строке или через запятую" rows="5" required style="width:100%"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel">Отмена</button>
                <button class="save">Добавить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);    // Обработчики закрытия
    modal.querySelector('.close').onclick = () => { window.modalBackdropManager.closeModal(modal); };
    modal.querySelector('.cancel').onclick = () => { window.modalBackdropManager.closeModal(modal); };
}

// Функция для открытия модального окна добавления букинга
function openAddBookingModal(internalNumber) {
    createAddBookingModal();
    const modal = document.getElementById('add-booking-modal');
    document.getElementById('add-to-internal-number').textContent = internalNumber;    document.getElementById('container-numbers').value = '';

    window.modalBackdropManager.openModal(modal);

    // Обработчик сохранения
    const saveBtn = modal.querySelector('.save');
    saveBtn.onclick = function() {
        const bookingNumbers = document.getElementById('container-numbers').value;
        if (!bookingNumbers) {
            window.showNotification({
                status: 'error',
                success: 0,
                failed: 1,
                errors: ['Введите хотя бы один номер букинга']
            });
            return;        }
        
        // Парсим введённые букинги (по запятой или по строкам)
        const bookingsArr = bookingNumbers.split(/\n|,/).map(b => b.trim()).filter(Boolean).map(b => ({ booking: b }));
        
        window.modalBackdropManager.closeModal(modal);
        openEditBookingsModal(bookingsArr);
    };
    
    // Обработчики закрытия
    modal.querySelector('.close').onclick = () => {
        window.modalBackdropManager.closeModal(modal);
    };
    
    modal.querySelector('.cancel').onclick = () => {
        window.modalBackdropManager.closeModal(modal);
    };
    
    // Закрытие по клику вне окна
    window.onclick = function(event) {
        if (event.target === modal) {
            window.modalBackdropManager.closeModal(modal);
        }
    };
}

// === МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ БУКИНГОВ ===
// Функции для управления модальным окном редактирования букингов находятся в edit_bookings_modal.js

// Module for handling internal numbers functionality
window.internalNumbersModule = (function() {
    // Modal templates
    const addModalHTML = `
        <div class="modal" id="add-internal-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Добавить/Изменить внутренний номер</h2>
                    <button class="close">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="internal-number">Внутренний номер *</label>
                        <input type="text" id="internal-number" placeholder="Введите внутренний номер" required>
                    </div>
                    <div class="form-group">
                        <label for="pod-direction">POD/Направление *</label>
                        <input type="text" id="pod-direction" placeholder="Введите POD/направление" required>
                        </div>
                        <div class="form-group">
                            <label for="pol-sending">POL/Отправка</label>
                            <input type="text" id="pol-sending" placeholder="Введите POL/отправку">
                        </div>
                    <div class="form-group">
                        <label for="quantity">Количество *</label>
                        <input type="number" id="quantity" placeholder="Введите количество" min="0">
                    </div>                    <div class="form-group">
                        <label for="cargo">Груз *</label>
                        <input type="text" id="cargo" placeholder="Введите тип груза" required>
                    </div><div class="form-group">
                        <label for="type-size">Тип/Размер</label>
                        <select id="type-size" class="filter-input" style="height: 33px; padding: 8px; width: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Выберите тип/размер</option>
                            <option value="20COC">20COC</option>
                            <option value="20SOC">20SOC</option>
                            <option value="40COC">40COC</option>
                            <option value="40SOC">40SOC</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel">Отмена</button>
                    <button class="save">Сохранить</button>
                </div>
            </div>
        </div>
    `;    // Function to get current filter values
    function getCurrentFilters() {
        return {
            internalNumber: document.getElementById('filter-internal-number')?.value.trim() || '',
            podDirection: document.getElementById('filter-pod-direction')?.value.trim() || '',
            polSending: document.getElementById('filter-pol-sending')?.value.trim() || '',
            quantity: document.getElementById('filter-quantity')?.value.trim() || '',
            typeSize: document.getElementById('filter-type-size')?.value.trim() || '',
            cargo: document.getElementById('filter-cargo')?.value.trim() || ''
        };
    }

    // Function to update the table with current data
    async function updateTable(filters) {
        console.log('Updating internal numbers table with filters:', filters);
        
        try {
            // Используем существующую функцию для обновления таблицы 
            // из вашего основного файла table.js
            if (typeof window.updateTable === 'function') {
                // Это вызовет функцию updateTable из table.js
                window.updateTable(filters);
                return;
            }
            
            // Если основной функции updateTable нет, используем свою логику
            const response = await fetch('/get_internal_numbers', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Обновляем содержимое таблицы
            updateTableDOM(data.internal_numbers || []);
        } catch (error) {
            console.error('Error updating table:', error);
            showNotification({
                status: 'error',
                success: 0,
                failed: 1,
                errors: ['Ошибка при обновлении таблицы']
            });
        }
    }
    
    // Helper function to update table DOM with received data
    function updateTableDOM(internalNumbers) {
        // Получаем тело таблицы
        const tableBody = document.querySelector('.table-container tbody');
        if (!tableBody) {
            console.error('Table body not found');
            return;
        }
        
        // Обновляем счетчик
        const header = document.querySelector('.header h1');
        if (header) {
            header.textContent = `Букинги: ${internalNumbers.length}`;
        }
        
        // Если нет данных, показываем пустую таблицу
        if (!internalNumbers.length) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Нет данных</td></tr>';
            return;
        }
          // Обновляем строки таблицы
        tableBody.innerHTML = internalNumbers.map(item => `
            <tr class="internal-number-row" data-internal-number="${item.internal_number}" ondblclick="handleRowClick('${item.internal_number}')">
                <td style="width: 120px; min-width: 120px; max-width: 120px;">${item.internal_number}</td>
                <td style="width: 65px; min-width: 65px; max-width: 65px;">${item.quantity}</td>
                <td style="width: 110px; min-width: 110px; max-width: 110px;">${item.type_size || ''}</td>
                <td style="width: 160px; min-width: 160px; max-width: 160px;">${item.pol_sending || ''}</td>
                <td style="width: 160px; min-width: 160px; max-width: 160px;">${item.pod_direction}</td>
                <td style="width: 120px; min-width: 120px; max-width: 120px;">${item.cargo || ''}</td>
                <td style="width: 120px; min-width: 120px; max-width: 120px;">${item.booking_count}</td>
            </tr>
        `).join('');
        
        // Повторно добавлять обработчики событий для строк не нужно — открытие модального окна теперь только по ondblclick (см. разметку строки)
    }

    // Helper function to show notifications
    function showNotification(result) {
        // Используем глобальную функцию showNotification
        if (typeof window.showNotification === 'function') {
            window.showNotification(result);
            return;
        }
        
        // Check if notification system exists as fallback
        if (typeof window.showImportNotification === 'function') {
            window.showImportNotification(result);
            return;
        }

        // Fallback: create a basic notification
        let message = '';
        let statusClass = '';
        
        if (result.status === 'success') {
            message = `Успешно! Добавлено: ${result.success}`;
            statusClass = 'success';
        } else {
            message = `Ошибка: ${result.errors ? result.errors.join(', ') : 'Неизвестная ошибка'}`;
            statusClass = 'error';
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${statusClass}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${statusClass === 'success' ? '#4CAF50' : '#f44336'};
            color: white;            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s, fadeOut 0.3s 3.7s;
            max-width: 300px;
        `;
        notification.innerHTML = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Create modals if they don't exist
    function createModals() {
        if (!document.getElementById('add-internal-modal')) {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = addModalHTML;
            document.body.appendChild(modalContainer.firstElementChild);
        }
    }

    // Setup event handlers for the add modal
    function setupAddModalHandlers() {
        const addModal = document.getElementById('add-internal-modal');
        if (!addModal) return;

        const closeButtons = addModal.querySelectorAll('.close, .cancel');        closeButtons.forEach(button => {
            button.onclick = () => {
                window.modalBackdropManager.closeModal(addModal);
            };
        });

        // --- ДОБАВЛЕНО: автозаполнение по внутреннему номеру ---
        const internalNumberInput = document.getElementById('internal-number');
        if (internalNumberInput) {
            let lastValue = '';
            internalNumberInput.addEventListener('blur', async function() {
                const value = this.value.trim();
                if (value && value !== lastValue) {
                    try {
                        const response = await fetch('/get_internal_number_details', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `internal_number=${encodeURIComponent(value)}`
                        });                        if (response.ok) {
                            const data = await response.json();
                            if (data.details) {
                                document.getElementById('pod-direction').value = data.details.pod_direction || '';
                                document.getElementById('quantity').value = data.details.quantity || '';
                                document.getElementById('type-size').value = data.details.type_size || '';
                                document.getElementById('cargo').value = data.details.cargo || '';
                                document.getElementById('pol-sending').value = data.details.pol_sending || '';
                            } else {
                                // Очищаем поля, так как внутренний номер не найден
                                document.getElementById('pod-direction').value = '';
                                document.getElementById('quantity').value = '';
                                document.getElementById('type-size').value = '';
                                document.getElementById('cargo').value = '';
                                document.getElementById('pol-sending').value = '';
                            }
                        }
                    } catch (e) {
                        // Не найден или ошибка — не заполняем
                    }
                    lastValue = value;
                }
            });
        }
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---

        const saveButton = addModal.querySelector('.save');
        if (saveButton) {            saveButton.onclick = async () => {                // Get input values
                const internalNumber = document.getElementById('internal-number').value.trim();
                const podDirection = document.getElementById('pod-direction').value.trim();
                const quantity = document.getElementById('quantity').value.trim();
                let typeSize = document.getElementById('type-size').value.trim();
                // Если выбрано значение пустое или "Выберите тип/размер", устанавливаем пустую строку
                // Сервер преобразует её в NULL для PostgreSQL
                if (typeSize === "Выберите тип/размер" || typeSize === "") {
                    typeSize = "";
                }
                const cargo = document.getElementById('cargo').value.trim();
                  // Validate required fields
                if (!internalNumber || !podDirection || !cargo) {
                    showNotification({
                        status: 'error',
                        success: 0,
                        failed: 1,
                        errors: ['Необходимо заполнить обязательные поля (отмечены *)']
                    });
                    return;                }
                  try {
                    // Get the POL/Sending value
                    const polSending = document.getElementById('pol-sending')?.value.trim() || '';
                    
                    // Show loading indicator or disable submit button
                    const submitButton = document.querySelector('#addInternalNumberModal .submit-btn');
                    if (submitButton) {
                        submitButton.disabled = true;
                        submitButton.textContent = 'Отправка...';
                    }
                    
                    // Send data to the server with timeout and retry logic
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                    
                    // Send data to the server
                    const response = await fetch('/add_internal_number', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            'internal_number': internalNumber,
                            'pod_direction': podDirection,
                            'quantity': quantity,
                            'type_size': typeSize,
                            'cargo': cargo,
                            'pol_sending': polSending
                        }),
                        signal: controller.signal,
                        credentials: 'same-origin' // Include cookies
                    });
                    
                    clearTimeout(timeoutId);
                    
                    // Reset button state
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Добавить';
                    }
                    
                    // Проверяем успешность HTTP-ответа
                    if (!response.ok) {
                        const errorText = await response.text();
                        let errorMessage;
                        try {
                            // Пробуем разобрать ответ как JSON
                            const errorData = JSON.parse(errorText);
                            errorMessage = errorData.errors ? errorData.errors.join(', ') : `Ошибка сервера: ${response.status}`;
                        } catch (e) {
                            // Если не JSON, используем текст или статус
                            errorMessage = errorText || `Ошибка сервера: ${response.status}`;
                        }
                        
                        throw new Error(errorMessage);
                    }
                    
                    const result = await response.json();
                    
                    // Проверяем, было ли это обновление существующего номера или добавление нового
                    if (result.message && result.message.includes('обновлен')) {
                        // Это обновление существующего внутреннего номера
                        showNotification({
                            status: 'warning',
                            success: 1,
                            failed: 0,
                            errors: null,
                            message: result.message || 'Внимание! Внутренний номер уже существовал и был обновлен'
                        });
                    } else {
                        // Это новый внутренний номер или другой тип успеха
                        showNotification(result);
                    }
                      // Закрываем модальное окно и обновляем таблицу в любом случае
                    if (result.status === 'success' && result.success > 0) {
                        window.modalBackdropManager.closeModal(addModal);
                        // Обновляем таблицу
                        updateTable(getCurrentFilters());
                    }
                } catch (error) {
                    console.error('Error adding internal number:', error);
                    showNotification({
                        status: 'error',
                        success: 0,
                        failed: 1,
                        errors: [error.message || 'Ошибка при добавлении внутреннего номера']
                    });
                }
            };
        }        // Close the modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === addModal) {
                window.modalBackdropManager.closeModal(addModal);
            }
        });
    }    // Setup event handler for the "Add" button
    function setupAddButton() {
        const addButton = document.querySelector('.buttons .add');        if (addButton) {
            addButton.onclick = () => {
                // Открываем модальное окно добавления/изменения внутреннего номера
                const addModal = document.getElementById('add-internal-modal');
                if (addModal) {
                    window.modalBackdropManager.openModal(addModal);
                } else {
                    console.error('Модальное окно add-internal-modal не найдено');
                }
            };
        }
    }

    // Setup filter event handlers
    function setupFilterHandlers() {
        // Основной фильтр по внутреннему номеру
        const internalNumberFilter = document.getElementById('filter-internal-number');
        if (internalNumberFilter) {
            internalNumberFilter.addEventListener('input', function() {
                updateTable(getCurrentFilters());
            });
        }
        
        // Дополнительные фильтры
        const additionalFilters = [
            'filter-pod-direction',
            'filter-quantity',
            'filter-type-size',
            'filter-cargo'
        ];
        
        additionalFilters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('input', function() {
                    updateTable(getCurrentFilters());
                });
            }
        });
        
        // Кнопка обновления
        const refreshButton = document.querySelector('.refresh');
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                // Очистка всех фильтров
                if (internalNumberFilter) internalNumberFilter.value = '';
                additionalFilters.forEach(filterId => {
                    const filter = document.getElementById(filterId);
                    if (filter) filter.value = '';
                });
                
                // Обновление таблицы
                updateTable({});
            });
        }
    }

    // Export public methods
    return {
        init: function() {
            createModals();
            setupAddModalHandlers();
            setupAddButton();
            setupFilterHandlers();  // Добавлен вызов новой функции
        },
        updateTable: updateTable,
        getCurrentFilters: getCurrentFilters
    };
})();

// Global function to handle row clicks from HTML onclick attribute
function handleRowClick(internalNumber) {
    console.log('handleRowClick called with internal number:', internalNumber);
    if (typeof window.showInternalNumberModal === 'function') {
        window.showInternalNumberModal(internalNumber);
    } else {
        console.error('Function showInternalNumberModal not found');
    }
}

// Открытие модального окна по кнопке "Добавить" на странице букингов теперь
// реализовано через internalNumbersModule.init()