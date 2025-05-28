// Функционал для выделения и взаимодействия с ячейками таблицы редактирования букингов

// Глобальная переменная для отслеживания выделенных ячеек
let bookingEditSelectedCells = new Set();

// Функция для добавления стилей для выделения ячеек таблицы
function addEditBookingsTableStyles() {
    // Проверяем, есть ли уже тег стилей с id="edit-bookings-table-styles"
    if (!document.getElementById('edit-bookings-table-styles')) {
        const styles = document.createElement('style');
        styles.id = 'edit-bookings-table-styles';
        styles.textContent = `
            .edit-bookings-table {
                border-collapse: collapse;
                width: 100%;
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1);
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .edit-bookings-table th {
                background: #0D1B2A;
                color: #fff;
                font-size: 15px;
                font-weight: 500;
                padding: 10px 8px;
                text-align: center;
                position: sticky;
                top: 0;
                z-index: 2;
                border-bottom: 1.5px solid #e0e0e0;
                vertical-align: bottom;
            }
              .edit-bookings-table td {
                padding: 7px 8px;
                font-size: 16px;
                border-bottom: 1px solid #f0f0f0;
                background: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: left;
                position: relative;
            }/* Стиль для выделенных ячеек с максимальным приоритетом */
            .edit-bookings-table td.custom-selected,
            #edit-bookings-modal .edit-bookings-table td.custom-selected,
            #edit-bookings-modal td.custom-selected {
                background-color: #e0f7fa !important;
                border: 1px solid #2c2e2e !important;
                border-left: 2px solid #2c2e2e !important;
                color: #111 !important;
                transition: background-color 0.3s ease !important;
                box-shadow: inset 0 0 0 1px #2c2e2e !important;
            }
            
            
            .edit-bookings-table [contenteditable]:empty:before {
                content: attr(data-placeholder);
                color: #bbb;
                pointer-events: none;
            }
            
            .edit-bookings-table [contenteditable]:focus {
                outline: none;
                background: #f5f9ff;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Основная функция настройки выделения в таблице редактирования букингов
function setupEditBookingTableSelection() {
    const tableSelector = '.edit-bookings-table';
    const table = document.querySelector(tableSelector);
    if (!table) return;

    // Добавляем стили для таблицы
    addEditBookingsTableStyles();

    const headers = table.querySelectorAll('th');
    const cells = table.querySelectorAll('td');
    let isDragging = false;
    let startCell = null;
    let startColumnIndex = null;

    // Вспомогательные функции
    function getColumnIndex(cell) {
        return Array.from(cell.parentElement.children).indexOf(cell);
    }

    function clearSelection() {
        bookingEditSelectedCells.forEach(cell => cell.classList.remove('custom-selected'));
        bookingEditSelectedCells.clear();
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
            bookingEditSelectedCells.add(cell);
        }
    }

    function selectRectRange(startCell, endCell) {
        clearSelection();
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const startRowIndex = Array.from(rows).indexOf(startCell.parentElement);
        const endRowIndex = Array.from(rows).indexOf(endCell.parentElement);
        const startColIndex = getColumnIndex(startCell);
        const endColIndex = getColumnIndex(endCell);
        const minRow = Math.min(startRowIndex, endRowIndex);
        const maxRow = Math.max(startRowIndex, endRowIndex);
        const minCol = Math.min(startColIndex, endColIndex);
        const maxCol = Math.max(startColIndex, endColIndex);
        for (let i = minRow; i <= maxRow; i++) {
            for (let j = minCol; j <= maxCol; j++) {
                const cell = rows[i].children[j];
                cell.classList.add('custom-selected');
                bookingEditSelectedCells.add(cell);
            }
        }
    }
      function copySelectedCells() {
        const text = Array.from(bookingEditSelectedCells)
            .map(cell => cell.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '').trim())
            .join('\n');
        copyToClipboard(text);
    }
    
    function copyToClipboard(text) {
        const ta = document.createElement('textarea');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }

    // Обработчики событий для ячеек
    cells.forEach(cell => {
        cell.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            startCell = cell;
            startColumnIndex = getColumnIndex(cell);
            clearSelection();
            cell.classList.add('custom-selected');
            bookingEditSelectedCells.add(cell);
        });

        cell.addEventListener('mouseover', (e) => {
            if (!isDragging || startCell === null) return;
            e.preventDefault();
            selectRectRange(startCell, cell);
        });

        // Выделение всей строки по двойному клику
        cell.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const row = cell.parentElement;
            const rowCells = Array.from(row.querySelectorAll('td'));
            clearSelection();
            rowCells.forEach(c => {
                c.classList.add('custom-selected');
                bookingEditSelectedCells.add(c);
            });
        });

        // Обработка вставки из буфера обмена
        cell.addEventListener('paste', (e) => {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            if (text.includes('\n')) {
                e.preventDefault();
                const lines = text.split(/\r?\n/);
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                const colIndex = getColumnIndex(cell);
                const startIndex = rows.indexOf(cell.parentElement);
                lines.forEach((line, idx) => {
                    const targetRow = rows[startIndex + idx];
                    if (targetRow && targetRow.children[colIndex]) {
                        targetRow.children[colIndex].textContent = line.trim();
                    }
                });
            }
        });
    });

    // Обработчики для заголовков (выделение колонки по клику)
    headers.forEach((header, index) => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            clearSelection();
            const columnCells = Array.from(table.querySelectorAll(`tbody td:nth-child(${index + 1})`));
            columnCells.forEach(cell => {
                cell.classList.add('custom-selected');
                bookingEditSelectedCells.add(cell);
            });
        });
    });

    // Обработка нажатия Enter для перехода к следующей ячейке
    table.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (!active || active.tagName !== 'TD') return;
        
        const row = active.parentElement;
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const rowIndex = rows.indexOf(row);
        const colIndex = Array.from(row.children).indexOf(active);
        let nextCell = null;
        
        if (e.key === 'Enter') {
            // Enter: перемещение вниз в той же колонке
            if (rowIndex < rows.length - 1) {
                nextCell = rows[rowIndex + 1].children[colIndex];
            }
        } else if (e.key === 'Tab') {
            // Tab: перемещение вправо или на следующую строку
            e.preventDefault();
            if (colIndex < row.children.length - 1) {
                nextCell = row.children[colIndex + 1];
            } else if (rowIndex < rows.length - 1) {
                nextCell = rows[rowIndex + 1].children[0];
            }
        }
        
        if (nextCell) {
            if (e.key === 'Enter') e.preventDefault();
            clearSelection();
            nextCell.classList.add('custom-selected');
            bookingEditSelectedCells.add(nextCell);
            if (nextCell.getAttribute('contenteditable') === 'true') {
                nextCell.focus();
            } else {
                nextCell.blur && nextCell.blur();
            }
        }
    });

    // Обработка окончания перетаскивания
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            startCell = null;
            startColumnIndex = null;
        }
    });

    // Обработка Ctrl+C для копирования выделенных ячеек
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        const ctrl = e.ctrlKey || e.metaKey;
        const isCopyKey = (
            key === 'c' || key === 'C' ||
            key === 'с' || key === 'С' || // Russian С
            e.keyCode === 67 || // Latin C
            e.keyCode === 1057 // Russian С
        );

        if (ctrl && isCopyKey && bookingEditSelectedCells.size > 0) {
            const editBookingsModalVisible = document.getElementById('edit-bookings-modal')?.style.display === 'block';
            if (editBookingsModalVisible) {
                // Копирование в табличном формате (строки и колонки)
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                let minRow = Infinity, maxRow = -1, minCol = Infinity, maxCol = -1;
                const cellMap = new Map();

                bookingEditSelectedCells.forEach(cell => {
                    const row = cell.parentElement;
                    if (row.parentElement.tagName !== 'TBODY') return;
                    
                    const rowIndex = rows.indexOf(row);
                    if (rowIndex === -1) return;
                    
                    const colIndex = Array.from(row.children).indexOf(cell);
                    minRow = Math.min(minRow, rowIndex);
                    maxRow = Math.max(maxRow, rowIndex);
                    minCol = Math.min(minCol, colIndex);
                    maxCol = Math.max(maxCol, colIndex);
                    cellMap.set(rowIndex + '-' + colIndex, cell.textContent.trim());
                });
                
                if (minRow === Infinity) return;
                
                let result = '';
                for (let i = minRow; i <= maxRow; i++) {
                    let rowArr = [];
                    for (let j = minCol; j <= maxCol; j++) {
                        rowArr.push(cellMap.get(i + '-' + j) || '');
                    }
                    result += rowArr.join('\t') + (i < maxRow ? '\n' : '');
                }
                
                copyToClipboard(result);
                e.preventDefault();
                
                // Не убираем выделение после копирования, это удобнее для пользователя
            }
        }
    });
}
