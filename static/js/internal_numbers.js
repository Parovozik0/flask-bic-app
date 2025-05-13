// Скрипт для управления внутренними номерами на странице Букинг

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
        /* Стили для модального окна внутренних номеров - с !important для перекрытия других стилей */
        #internal-number-details-modal {
            display: none !important;
            position: fixed !important;
            z-index: 1000 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
        }
        
        #internal-number-details-modal.show-modal {
            display: block !important;
        }

        #internal-number-details-modal .internal-modal-content {
            background-color: white !important;
            padding: 20px !important;
            border-radius: 8px !important;
            width: 60% !important;
            max-width: 800px !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
        }

        #internal-number-details-modal .internal-modal-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 1px solid #ccc !important;
            padding-bottom: 10px !important;
            margin-bottom: 20px !important;
        }

        #internal-number-details-modal .internal-modal-header h2 {
            margin: 0 !important;
            color: #333 !important;
        }

        #internal-number-details-modal .internal-modal-close {
            font-size: 28px !important;
            font-weight: bold !important;
            color: #aaa !important;
            cursor: pointer !important;
            transition: color 0.2s !important;
        }

        #internal-number-details-modal .internal-modal-close:hover {
            color: #333 !important;
        }

        #internal-number-details-modal .internal-modal-body {
            padding: 10px 0 !important;
            max-height: 60vh !important;
            overflow-y: auto !important;
        }

        #internal-number-details-modal .internal-modal-footer {
            padding-top: 10px !important;
            text-align: right !important;
        }

        #internal-number-details-modal button {
            padding: 8px 16px !important;
            background-color: #4CAF50 !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            margin-left: 10px !important;
            transition: background-color 0.2s !important;
        }

        #internal-number-details-modal button.cancel {
            background-color: #f44336 !important;
        }

        #internal-number-details-modal button:hover {
            opacity: 0.9 !important;
        }
        
        /* Стили для таблицы букингов внутри модального окна - в стиле таблицы импорта */
        #internal-number-details-modal table {
            border-collapse: collapse !important;
            width: 100% !important;
            background: #fff !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1) !important;
            overflow: hidden !important;
            margin-bottom: 10px !important;
        }
        
        #internal-number-details-modal th {
            background: #0D1B2A !important;
            color: #fff !important;
            font-size: 15px !important;
            font-weight: 500 !important;
            padding: 10px 8px !important;
            text-align: center !important; 
            position: sticky !important;
            top: 0 !important;
            z-index: 2 !important;
            border-bottom: 1.5px solid #e0e0e0 !important;
            vertical-align: bottom !important;
            position: relative !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }
        
        #internal-number-details-modal td {
            padding: 7px 8px !important;
            font-size: 14px !important;
            border-bottom: 1px solid #f0f0f0 !important;
            background: #fff !important; 
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            text-align: center !important;
        }
        
        #internal-number-details-modal tr:nth-child(even) td {
            background: #fff !important;
        }
        
        #internal-number-details-modal tr:nth-child(odd) td {
            background: #fff !important;
        }
        
        #internal-number-details-modal td.custom-selected {
            background-color: #e0f7fa !important;
            border: 1px solid #81d4fa !important;
            color: #111 !important;
            transition: background-color 0.3s ease !important;
            box-shadow: inset 0 0 2px #4fc3f7 !important;
        }
        
        #internal-number-details-modal h3 {
            margin-bottom: 10px !important;
            font-size: 16px !important;
            color: #333 !important;
        }
        
        /* Стили для модального окна добавления внутреннего номера */
        #add-internal-number-modal {
            display: none !important;
            position: fixed !important;
            z-index: 1000 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
        }
        
        #add-internal-number-modal.show-modal {
            display: block !important;
        }

        #add-internal-number-modal .internal-modal-content {
            background-color: white !important;
            margin: 10% auto !important;
            padding: 20px !important;
            border-radius: 8px !important;
            width: 400px !important;
            max-width: 800px !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
        }

        #add-internal-number-modal .internal-modal-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 1px solid #ccc !important;
            padding-bottom: 10px !important;
            margin-bottom: 20px !important;
        }

        #add-internal-number-modal .internal-modal-header h2 {
            margin: 0 !important;
            color: #333 !important;
        }

        #add-internal-number-modal .internal-modal-close {
            font-size: 28px !important;
            font-weight: bold !important;
            color: #aaa !important;
            cursor: pointer !important;
            transition: color 0.2s !important;
        }

        #add-internal-number-modal .internal-modal-close:hover {
            color: #333 !important;
        }

        #add-internal-number-modal .internal-modal-body {
            padding: 10px 0 !important;
        }

        #add-internal-number-modal .form-group {
            margin-bottom: 15px !important;
        }

        #add-internal-number-modal label {
            display: block !important;
            margin-bottom: 5px !important;
            font-weight: 600 !important;
        }

        #add-internal-number-modal input {
            width: 100% !important;
            padding: 8px !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
            box-sizing: border-box !important;
        }

        #add-internal-number-modal .internal-modal-footer {
            padding-top: 15px !important;
            border-top: 1px solid #ccc !important;
            text-align: right !important;
        }

        #add-internal-number-modal button {
            padding: 8px 16px !important;
            background-color: #4CAF50 !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            margin-left: 10px !important;
            transition: background-color 0.2s !important;
        }

        #add-internal-number-modal button.cancel {
            background-color: #f44336 !important;
        }

        #add-internal-number-modal button:hover {
            opacity: 0.9 !important;
        }
        
        #add-internal-number-modal .error-message {
            color: #f44336 !important;
            font-size: 14px !important;
            margin-top: 10px !important;
        }
        
        /* Стиль для строк с ошибками */
        #internal-number-details-modal .error-row {
            background-color: #ffdddd !important;
        }
        
        /* Стиль для пустых данных */
        #internal-number-details-modal .empty-bookings-message {
            padding: 20px !important;
            text-align: center !important;
            color: #888 !important;
            background: #fff !important;
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
            </div>
            <div class="internal-modal-footer">
                <div id="error-message"></div>
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
        
        // Отображаем модальное окно
        modal.classList.add('show-modal');
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
        modal.classList.remove('show-modal');
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

// Добавляем обработчик для закрытия модального окна при клике вне его области
document.addEventListener('mousedown', function(event) {
    const modal = document.getElementById('internal-number-details-modal');
    if (modal && modal.classList.contains('show-modal')) {
        const modalContent = modal.querySelector('.internal-modal-content');
        if (!modalContent.contains(event.target) && event.target === modal) {
            closeInternalNumberModal();
        }
    }
});

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
                        <label for="quantity">Количество</label>
                        <input type="number" id="quantity" placeholder="Введите количество" min="0">
                    </div>
                    <div class="form-group">
                        <label for="cargo">Груз</label>
                        <input type="text" id="cargo" placeholder="Введите тип груза">
                    </div>
                    <div class="form-group">
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
    `;

    // Function to get current filter values
    function getCurrentFilters() {
        return {
            internalNumber: document.getElementById('filter-internal-number')?.value.trim() || '',
            podDirection: document.getElementById('filter-pod-direction')?.value.trim() || '',
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
                <td>${item.internal_number}</td>
                <td>${item.quantity}</td>
                <td>${item.type_size || ''}</td>
                <td>${item.pod_direction}</td>
                <td>${item.cargo || ''}</td>
                <td>${item.booking_count}</td>
            </tr>
        `).join('');
        
        // Повторно добавляем обработчики событий для строк
        const rows = tableBody.querySelectorAll('.internal-number-row');
        rows.forEach(row => {
            row.addEventListener('click', function() {
                const internalNumber = this.getAttribute('data-internal-number');
                if (internalNumber && typeof window.showInternalNumberModal === 'function') {
                    window.showInternalNumberModal(internalNumber);
                }
            });
            
            // Добавляем визуальную подсказку, что на строку можно кликнуть
            row.style.cursor = 'pointer';
        });
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
            color: white;
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
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

        const closeButtons = addModal.querySelectorAll('.close, .cancel');
        closeButtons.forEach(button => {
            button.onclick = () => {
                addModal.style.display = 'none';
            };
        });

        const saveButton = addModal.querySelector('.save');
        if (saveButton) {
            saveButton.onclick = async () => {
                // Get input values
                const internalNumber = document.getElementById('internal-number').value.trim();
                const podDirection = document.getElementById('pod-direction').value.trim();
                const quantity = document.getElementById('quantity').value.trim();
                const typeSize = document.getElementById('type-size').value.trim();
                const cargo = document.getElementById('cargo').value.trim();
                
                // Validate required fields
                if (!internalNumber || !podDirection) {
                    showNotification({
                        status: 'error',
                        success: 0,
                        failed: 1,
                        errors: ['Необходимо заполнить обязательные поля (отмечены *)']
                    });
                    return;
                }
                
                try {
                    // Send data to the server
                    const response = await fetch('/add_internal_number', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            'internal_number': internalNumber,
                            'pod_direction': podDirection,
                            'quantity': quantity,
                            'type_size': typeSize,
                            'cargo': cargo
                        })
                    });
                    
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
                        addModal.style.display = 'none';
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
        }

        // Close the modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === addModal) {
                addModal.style.display = 'none';
            }
        });
    }

    // Setup event handler for the "Add" button
    function setupAddButton() {
        const addButton = document.querySelector('.buttons .add');
        if (addButton) {
            addButton.onclick = () => {
                const addModal = document.getElementById('add-internal-modal');
                if (addModal) {
                    // Reset form
                    document.getElementById('internal-number').value = '';
                    document.getElementById('pod-direction').value = '';
                    document.getElementById('quantity').value = '';
                    document.getElementById('type-size').value = '';
                    document.getElementById('cargo').value = '';
                    
                    // Show modal
                    addModal.style.display = 'block';
                }
            };
        }
    }

    // Export public methods
    return {
        init: function() {
            createModals();
            setupAddModalHandlers();
            setupAddButton();
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