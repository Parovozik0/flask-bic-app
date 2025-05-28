// Table cell selection and clipboard functionality
function attachTableCellListeners(tableSelector = '.table-container table') {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    const headers = table.querySelectorAll('th');
    const cells = table.querySelectorAll('td');
    let isDragging = false;
    let startCell = null;
    let startColumnIndex = null;

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
                selectedCells.add(cell);
            }
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
            if (!isDragging || startCell === null) return;
            e.preventDefault();
            selectRectRange(startCell, cell);
        });

        // Removed double-click copying, left only selection
        cell.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const row = cell.parentElement;
            const rowCells = Array.from(row.querySelectorAll('td'));
            clearSelection();
            rowCells.forEach(c => {
                c.classList.add('custom-selected');
                selectedCells.add(c);
            });
        });

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
                    if (targetRow) {
                        targetRow.children[colIndex].textContent = line.trim();
                    }
                });
            }
        });
    });

    headers.forEach((header, index) => {
        header.addEventListener('click', (e) => {
            // The e.stopPropagation() in lines 9-10 for the 'container-type-select'
            // already prevents this listener from firing if the SELECT itself is clicked.
            // Therefore, if this listener fires, it means the TH area *outside* the SELECT was clicked,
            // and we SHOULD select the column.
            e.preventDefault();
            clearSelection();
            const columnCells = Array.from(table.querySelectorAll(`tbody td:nth-child(${index + 1})`));
            columnCells.forEach(cell => {
                cell.classList.add('custom-selected');
                selectedCells.add(cell);
            });
        });
    });

    table.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (!active || active.tagName !== 'TD') return;
        const row = active.parentElement;
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const rowIndex = rows.indexOf(row);
        const colIndex = Array.from(row.children).indexOf(active);
        let nextCell = null;
        if (e.key === 'Enter') {
            // Enter: move down in the same column, skip notes
            if (!active.classList.contains('notes-cell') && rowIndex < rows.length - 1) {
                nextCell = rows[rowIndex + 1].children[colIndex];
            }
        }
        if (nextCell) {
            e.preventDefault();
            clearSelection();
            nextCell.classList.add('custom-selected');
            selectedCells.add(nextCell);
            if (nextCell.getAttribute('contenteditable') === 'true') {
                nextCell.focus();
            } else {
                nextCell.blur && nextCell.blur();
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
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

// Handle Ctrl+C for copying selected cells
document.addEventListener('keydown', (e) => {
    // Check for Ctrl+C in Latin and Cyrillic (Russian/Ukrainian/Belarusian C)
    const key = e.key;
    const ctrl = e.ctrlKey || e.metaKey;
    // Latin C, Russian С (lowercase and uppercase), keyCode for C and С
    const isCopyKey = (
        key === 'c' || key === 'C' ||
        key === 'с' || key === 'С' || // Russian/Ukrainian/Belarusian С
        e.keyCode === 67 || // Latin C
        e.keyCode === 1057 // Russian С
    );

    if (ctrl && isCopyKey) {
        let table = null;
        let selectedCellsInTable = [];
        const inventoryModalVisible = document.getElementById('inventory-modal')?.style.display === 'block';
        const editModalVisible = document.getElementById('edit-data-modal')?.style.display === 'block';

        // Determine which table is active for copying
        if (inventoryModalVisible) {
            table = document.querySelector('.inventory-preview-table');
            selectedCellsInTable = table ? table.querySelectorAll('td.custom-selected') : [];
        } else if (editModalVisible) {
            table = document.querySelector('.edit-table');
            selectedCellsInTable = table ? table.querySelectorAll('td.custom-selected') : [];
        } else {
            table = document.querySelector('.table-container table');
            selectedCellsInTable = table ? table.querySelectorAll('td.custom-selected') : [];
        }

        if (table && selectedCellsInTable.length > 0) {
            // Copy in tabular format (rows and columns)
            const rows = Array.from(table.querySelectorAll('tbody tr')); // Look for rows only in tbody
            let minRow = Infinity, maxRow = -1, minCol = Infinity, maxCol = -1;
            const cellMap = new Map();

            selectedCellsInTable.forEach(cell => {
                const row = cell.parentElement;
                // Make sure the row belongs to tbody
                if (row.parentElement.tagName !== 'TBODY') return;

                const rowIndex = rows.indexOf(row);
                // If row not found in tbody (e.g., it's a header), skip
                if (rowIndex === -1) return;

                const colIndex = Array.from(row.children).indexOf(cell);
                minRow = Math.min(minRow, rowIndex);
                maxRow = Math.max(maxRow, rowIndex);
                minCol = Math.min(minCol, colIndex);
                maxCol = Math.max(minCol, colIndex);
                cellMap.set(rowIndex + '-' + colIndex, cell.textContent.trim());
            });

            // If no cell was found in tbody
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

            // Clear highlights after copy
            document.querySelectorAll('td.custom-selected, th.custom-selected')
                .forEach(el => el.classList.remove('custom-selected'));
            if (window.selectedCells && typeof window.selectedCells.clear === 'function') {
                window.selectedCells.clear();
            }
        }
    }
});