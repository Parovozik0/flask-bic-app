// Inventory import functionality for Excel files
// Convert Excel serial date to string in dd.mm.yyyy format
function excelDateToString(excelDate) {
    if (typeof excelDate !== 'number') return excelDate;
    if (excelDate < 40000 || excelDate > 60000) return excelDate; // simple filtering
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    if (isNaN(date.getTime())) return excelDate;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Validate imported Excel data to check if it's empty or invalid
function validateExcelData(json, currentPage) {
    const errors = [];
    
    // Check if there's any data at all
    if (!json || json.length <= 1) {
        errors.push('Таблица пуста или не содержит данных');
        return { valid: false, errors };
    }
    
    // Check if headers exist
    const headers = json[0];
    if (!headers || headers.length === 0) {
        errors.push('В таблице отсутствуют заголовки столбцов');
        return { valid: false, errors };
    }
    
    // Check if there's actual data in rows (not just empty rows)
    const dataRows = json.slice(1);
    const nonEmptyRows = dataRows.filter(row => 
        row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')
    );
    
    if (nonEmptyRows.length === 0) {
        errors.push('Таблица не содержит данных в строках');
        return { valid: false, errors };
    }
    
    // Check for required columns based on the current page
    // For now, we just validate that there's enough data to work with
    // More specific validations can be added later
    
    return { valid: true, errors };
}

// Validate date format to prevent database errors
function validateDate(dateStr) {
    if (!dateStr) return { valid: true, dateStr };
    
    // Convert to string if it's not already
    dateStr = String(dateStr).trim();
    
    // Catch common errors - single or double digit values
    if (/^\d{1,2}$/.test(dateStr)) {
        return { 
            valid: false, 
            error: `Неверный формат даты: "${dateStr}". Необходим полный формат даты (ДД.ММ.ГГГГ)`
        };
    }
    
    // Check for proper date format DD.MM.YYYY
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!dateRegex.test(dateStr)) {
        return { 
            valid: false, 
            error: `Неверный формат даты: "${dateStr}". Ожидаемый формат: ДД.ММ.ГГГГ`
        };
    }
    
    // Further validate the date is real
    const parts = dateStr.match(dateRegex);
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    const date = new Date(year, month, day);
    
    if (
        date.getFullYear() !== year || 
        date.getMonth() !== month || 
        date.getDate() !== day
    ) {
        return { 
            valid: false, 
            error: `Недействительная дата: "${dateStr}". Дата не существует в календаре`
        };
    }
    
    return { valid: true, dateStr };
}

// Setup inventory modal functionality
function setupInventoryModal() {
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        console.error('XLSX library not loaded. Excel import functionality will not work.');
    }
    
    // Only proceed with setup on container page
    if (currentPage !== 'container') {
        return; // Exit the function if not on container page
    }
    
    const inventoryButton = document.querySelector('.inventory');
    const inventoryModal = document.getElementById('inventory-modal');
    const inventoryClose = inventoryModal?.querySelector('.modal-header .close');
    const inventoryCancel = inventoryModal?.querySelector('.modal-footer .cancel');
    const inventorySave = inventoryModal?.querySelector('.modal-footer .save');
    const inventoryFile = document.getElementById('inventory-file');
    const inventoryPreview = document.getElementById('inventory-preview-wrapper');
    const inventoryColumnsSelect = document.getElementById('inventory-columns-select');
    let inventoryData = [];
    let inventoryHeaders = [];
    let selectedColumns = [];

    if (!inventoryModal || !inventoryFile || !inventoryPreview) {
        console.warn('Inventory modal elements not found. Import functionality may not work correctly.');
        return;
    }

    if (inventoryButton && inventoryModal) {
        inventoryButton.onclick = () => {
            inventoryModal.style.display = 'block';
            inventoryPreview.innerHTML = '';
            inventoryColumnsSelect.innerHTML = '';
            inventoryFile.value = '';
            inventoryData = [];
            inventoryHeaders = [];
            selectedColumns = [];
        };
    }
    if (inventoryClose) inventoryClose.onclick = () => inventoryModal.style.display = 'none';
    if (inventoryCancel) inventoryCancel.onclick = () => inventoryModal.style.display = 'none';

    if (inventoryFile) {
        inventoryFile.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check if XLSX is available before proceeding
            if (typeof XLSX === 'undefined') {
                showNotification({
                    status: 'error',
                    success: 0,
                    failed: 1,
                    errors: ['Excel библиотека не загружена. Пожалуйста, обновите страницу или обратитесь в поддержку.']
                });
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Add support for switching sheets
                    let currentSheetIndex = 0;
                    function renderSheet(sheetIndex) {
                        const sheetName = workbook.SheetNames[sheetIndex];
                        const sheet = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                        
                        // Validate the imported data
                        const validationResult = validateExcelData(json, currentPage);
                        if (!validationResult.valid) {
                            // Убираем уведомление о проблеме с данными листа
                            // showNotification({
                            //     status: 'error',
                            //     success: 0,
                            //     failed: 1,
                            //     errors: [`В листе "${sheetName}" ${validationResult.errors[0].toLowerCase()}`]
                            // });
                            
                            // Генерируем только вкладки листов, без отображения данных текущего листа
                            let tabs = '<div id="import-sheet-tabs">';
                            workbook.SheetNames.forEach((name, idx) => {
                                tabs += `<div class="sheet-tab${idx === sheetIndex ? ' active' : ''}" data-sheet="${idx}">${name}</div>`;
                            });
                            tabs += '</div>';
                            
                            // Добавим информационное сообщение для наглядности
                            let emptyMessage = '<div class="empty-sheet-message" style="padding: 20px; text-align: center; color: #888;">';
                            emptyMessage += `<p>Лист "${sheetName}" не подходит для импорта</p>`;
                            emptyMessage += '<p>Пожалуйста, выберите другой лист или загрузите корректную таблицу</p>';
                            
                            inventoryPreview.innerHTML = tabs + emptyMessage;
                            
                            // Сохраняем обработчики для вкладок
                            inventoryPreview.querySelectorAll('.sheet-tab').forEach(tab => {
                                tab.onclick = function() {
                                    renderSheet(+tab.dataset.sheet);
                                };
                            });
                            
                            // Сбрасываем данные для этого листа
                            inventoryData = [];
                            inventoryHeaders = [];
                            selectedColumns = [];
                            
                            return;
                        }

                        if (!json.length) return;
                        inventoryHeaders = json[0];
                        inventoryData = json.slice(1);
                        // Render preview table with comboboxes
                        let html = '<table class="inventory-preview-table"><thead><tr>';
                        inventoryHeaders.forEach((h, i) => {
                            html += `<th>${h || 'Столбец ' + (i+1)}<br><select class='inventory-col-combo' data-col='${i}' style='margin-top:4px;'>`;
                            html += `<option value=\"none\">Не использовать</option>`;
                            if (currentPage === 'container') {
                                html += `<option value=\"number\">Номер контейнера</option>`;
                                html += `<option value=\"kp\">КП</option>`;
                                html += `<option value=\"booking\">Букинг</option>`;
                                html += `<option value=\"status\">Статус</option>`;
                                html += `<option value=\"location\">Локация</option>`;
                                html += `<option value=\"delivery_date\">Дата сдачи</option>`;
                                html += `<option value=\"pickup_date\">Дата pick up</option>`;
                                html += `<option value=\"notes\">Заметки</option>`;
                            } else if (currentPage === 'kp') {
                                html += `<option value=\"number\">Номер КП</option>`;
                                html += `<option value=\"location\">Станция назначения</option>`;
                                html += `<option value=\"notes\">Заметки</option>`;
                            } else {
                                html += `<option value=\"number\">Номер букинга</option>`;
                                html += `<option value=\"notes\">Заметки</option>`;
                            }
                            html += `</select></th>`;
                        });
                        html += '</tr></thead><tbody>';
                        inventoryData.slice(0, 10).forEach(row => {
                            if (row.some(cell => cell !== undefined && String(cell).trim() !== '')) {
                                html += '<tr>';
                                inventoryHeaders.forEach((_, i) => {
                                    let val = row[i];
                                    if (typeof val === 'number' && /date|дата|in-date/i.test(inventoryHeaders[i])) {
                                        val = excelDateToString(val);
                                    }
                                    html += `<td>${val !== undefined ? val : ''}</td>`;
                                });
                                html += '</tr>';
                            }
                        });
                        html += '</tbody></table>';
                        // Sheet tabs
                        let tabs = '<div id="import-sheet-tabs">';
                        workbook.SheetNames.forEach((name, idx) => {
                            tabs += `<div class="sheet-tab${idx === sheetIndex ? ' active' : ''}" data-sheet="${idx}">${name}</div>`;
                        });
                        tabs += '</div>';
                        inventoryPreview.innerHTML = tabs + html;

                        // Clear previous selection before rendering the new table
                        if (selectedCells && typeof selectedCells.clear === 'function') {
                            selectedCells.forEach(cell => cell.classList.remove('custom-selected'));
                            selectedCells.clear();
                        }

                        // Add handlers for the new preview table
                        attachTableCellListeners('.inventory-preview-table');
                        
                        // Sheet tabs handler
                        inventoryPreview.querySelectorAll('.sheet-tab').forEach(tab => {
                            tab.onclick = function() {
                                renderSheet(+tab.dataset.sheet);
                            };
                        });
                        // Combobox handlers
                        selectedColumns = Array(inventoryHeaders.length).fill('none');
                        inventoryPreview.querySelectorAll('.inventory-col-combo').forEach(combo => {
                            combo.onchange = function() {
                                const col = +combo.dataset.col;
                                selectedColumns[col] = combo.value;
                                // Disable already selected statuses in other combos
                                inventoryPreview.querySelectorAll('.inventory-col-combo').forEach(otherCombo => {
                                    const currentVal = otherCombo.value;
                                    otherCombo.querySelectorAll('option').forEach(opt => {
                                        // Always allow 'none'
                                        if (opt.value !== 'none' && opt.value !== currentVal && selectedColumns.includes(opt.value)) {
                                            opt.disabled = true;
                                        } else {
                                            opt.disabled = false;
                                        }
                                    });
                                });
                            };
                        });
                    }
                    renderSheet(0);
                } catch (error) {
                    console.error('Error processing Excel file:', error);
                    showNotification({
                        status: 'error',
                        success: 0,
                        failed: 1,
                        errors: ['Ошибка при обработке Excel-файла: ' + error.message]
                    });
                }
            };
            reader.onerror = function(evt) {
                console.error('Error reading file:', evt);
                showNotification({
                    status: 'error',
                    success: 0,
                    failed: 1,
                    errors: ['Ошибка чтения файла']
                });
            };
            reader.readAsArrayBuffer(file);
        };
    }

    if (inventorySave) {
        inventorySave.onclick = async () => {
            // Collect data by selected types
            const colMap = {};
            selectedColumns.forEach((type, i) => {
                if (type && type !== 'none') colMap[type] = i;
            });
            if (!inventoryData.length || colMap.number === undefined) {
                showNotification({
                    status: 'error',
                    success: 0,
                    failed: 1,
                    errors: ['Выберите хотя бы столбец с номерами!']
                });
                return;
            }
            // Form TSV for sending
            const columns = Object.keys(colMap);
            const tsvRows = inventoryData.map(row => {
                return columns.map(col => {
                    let val = row[colMap[col]];
                    if (typeof val === 'number' && /date|дата|in-date/i.test(col)) {
                        val = excelDateToString(val);
                    }
                    return val !== undefined ? val : '';
                }).join('\t');
            }).filter(row => row.split('\t')[0]); // filter empty numbers
            const tsvData = tsvRows.join('\n');
            // Send to server
            const formData = new FormData();
            formData.append('tsv_data', tsvData);
            formData.append('columns', columns.join(','));
            const resp = await fetch('/add_containers_from_inventory', {
                method: 'POST',
                body: formData
            });
            const result = await resp.json();
            if (result.status === 'success') {
                inventoryModal.style.display = 'none';
                showNotification(result);
                await updateTable(getCurrentFilters());
            } else {
                showNotification({
                    status: 'error',
                    success: result.success || 0,
                    failed: result.failed || 0,
                    errors: result.errors || ['Ошибка импорта']
                });
            }
        };
    }

    // Global handler for closing inventory-modal when clicking outside
    if (inventoryModal) {
        inventoryModal.addEventListener('mousedown', function(event) {
            const modalContent = inventoryModal.querySelector('.modal-content');
            if (modalContent && !modalContent.contains(event.target)) {
                inventoryModal.style.display = 'none';
            }
        });
    }
}