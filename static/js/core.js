// Global variables
let currentPage = 'container';
let editItems = []; // Universal variable for storing edit data (containers, KP, bookings)
let selectedCells = new Set(); // Global variable for selected cells

// Clean null/undefined/none values
function cleanValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    // Проверяем, является ли value строкой перед вызовом toLowerCase
    if (typeof value === 'string' && value.toLowerCase() === 'none') {
        return '';
    }
    
    return value;
}

// Show notification with success/error message
function showNotification(result) {
    // Remove any existing notifications first
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.classList.remove('show');
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'notification';
    
    // Определяем класс уведомления в зависимости от статуса
    let notificationClass = 'error';
    if (result.status === 'success') {
        notificationClass = 'success';
    } else if (result.status === 'warning') {
        notificationClass = 'warning'; // Новый класс для предупреждений
    }
    
    notification.className = `notification ${notificationClass}`;
    
    // Build notification content with truncated error list and toggle
    let content = `<div class="notification-content">
        <h3>Результат</h3>`;
    
    // Если есть специальное сообщение, показываем его
    if (result.message) {
        content += `<p class="notification-message">${result.message}</p>`;
    } else {
        // Иначе показываем стандартную информацию
        content += `<p>Успешно: ${result.success}</p>
        <p>Неудачно: ${result.failed}</p>`;
    }
    
    if (result.errors && result.errors.length) {
        const errors = result.errors;
        const threshold = 3;
        content += `<div class="error-list">`;
        errors.slice(0, threshold).forEach(err => {
            content += `<p class="error-item">${err}</p>`;
        });
        if (errors.length > threshold) {
            content += `<p class="error-toggle">...еще</p><div class="all-errors" style="display:none;">`;
            errors.slice(threshold).forEach(err => {
                content += `<p class="error-item">${err}</p>`;
            });
            content += `</div>`;
        }
        content += `</div>`;
    }
    content += `</div>`;
    notification.innerHTML = content;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    // Toggle full error list
    const toggle = notification.querySelector('.error-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const allErrorsDiv = notification.querySelector('.all-errors');
            const errorList = notification.querySelector('.error-list');
            const isHidden = allErrorsDiv.style.display === 'none';
            allErrorsDiv.style.display = isHidden ? 'block' : 'none';
            toggle.textContent = isHidden ? '...свернуть' : '...еще';
            if (isHidden) {
                // при раскрытии перемещаем кнопку вниз
                errorList.appendChild(toggle);
            } else {
                // при сворачивании возвращаем на прежнее место перед всеми ошибками
                errorList.insertBefore(toggle, allErrorsDiv);
            }
        });
    }
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Setup socket connection for real-time updates
function setupSocket() {
    if (window.socketIOInitialized) return;
    window.socketIOInitialized = true;
    if (typeof io === 'undefined') {
        console.error('Socket.IO client (io) is not loaded!');
        return;
    }
    const socket = io({
        transports: ['websocket', 'polling'],
        upgrade: true,
        pingTimeout: 60000, // 60 секунд
        pingInterval: 25000 // 25 секунд
    });
    socket.on('connect', function() {
        console.log('Socket.IO connected');
    });
    socket.on('containers_updated', function(data) {
        console.log('Получено событие containers_updated:', data);
        window.currentPage = currentPage;
        if (window.currentPage === 'container') updateTable(getCurrentFilters());
    });
}