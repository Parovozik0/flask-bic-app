// Менеджер для управления затемнением фона модальных окон
class ModalBackdropManager {
    constructor() {
        this.modalStack = []; // Стек открытых модальных окон
        this.backdropElement = null; // Элемент затемнения
        this.zIndexCounter = 1000; // Счетчик z-index для модальных окон
    }

    // Создание элемента затемнения фона
    createBackdrop() {
        if (this.backdropElement) {
            return this.backdropElement;
        }

        const backdrop = document.createElement('div');
        backdrop.id = 'modal-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(backdrop);
        this.backdropElement = backdrop;
        return backdrop;
    }

    // Показать затемнение
    showBackdrop() {
        const backdrop = this.createBackdrop();
        backdrop.style.pointerEvents = 'auto';
        // Принудительный reflow для срабатывания анимации
        backdrop.offsetHeight;
        backdrop.style.opacity = '1';
        return backdrop;
    }

    // Скрыть затемнение
    hideBackdrop() {
        if (this.backdropElement) {
            this.backdropElement.style.opacity = '0';
            this.backdropElement.style.pointerEvents = 'none';
            // Удаляем элемент после завершения анимации
            setTimeout(() => {
                if (this.backdropElement && this.modalStack.length === 0) {
                    this.backdropElement.remove();
                    this.backdropElement = null;
                }
            }, 300);
        }
    }

    // Обновить z-index затемнения для текущего модального окна
    updateBackdropZIndex() {
        if (this.backdropElement && this.modalStack.length > 0) {
            const topModal = this.modalStack[this.modalStack.length - 1];
            const modalZIndex = parseInt(window.getComputedStyle(topModal.element).zIndex) || this.zIndexCounter;
            this.backdropElement.style.zIndex = (modalZIndex - 1).toString();
        }
    }

    // Открыть модальное окно
    openModal(modalElement, options = {}) {
        if (!modalElement) return;

        const modalInfo = {
            element: modalElement,
            originalZIndex: modalElement.style.zIndex || window.getComputedStyle(modalElement).zIndex,
            onClose: options.onClose
        };

        // Установить z-index для нового модального окна
        this.zIndexCounter += 10;
        modalElement.style.zIndex = this.zIndexCounter.toString();

        // Если это первое модальное окно, показываем затемнение
        if (this.modalStack.length === 0) {
            this.showBackdrop();
        }

        // Добавляем модальное окно в стек
        this.modalStack.push(modalInfo);

        // Обновляем z-index затемнения
        this.updateBackdropZIndex();

        // Показываем модальное окно
        modalElement.style.display = 'block';

        // Добавляем обработчик клика по затемнению для закрытия верхнего модального окна
        this.addBackdropClickHandler();

        console.log(`Открыто модальное окно: ${modalElement.id || 'неизвестное'}, стек: ${this.modalStack.length}`);
    }

    // Закрыть верхнее модальное окно
    closeTopModal() {
        if (this.modalStack.length === 0) return;

        const modalInfo = this.modalStack.pop();
        
        // Скрываем модальное окно
        modalInfo.element.style.display = 'none';
        
        // Восстанавливаем оригинальный z-index
        if (modalInfo.originalZIndex) {
            modalInfo.element.style.zIndex = modalInfo.originalZIndex;
        }

        // Вызываем callback закрытия, если есть
        if (modalInfo.onClose && typeof modalInfo.onClose === 'function') {
            modalInfo.onClose();
        }

        // Если это было последнее модальное окно, скрываем затемнение
        if (this.modalStack.length === 0) {
            this.hideBackdrop();
        } else {
            // Обновляем z-index затемнения для оставшегося верхнего модального окна
            this.updateBackdropZIndex();
        }

        console.log(`Закрыто модальное окно: ${modalInfo.element.id || 'неизвестное'}, осталось в стеке: ${this.modalStack.length}`);
    }

    // Закрыть конкретное модальное окно
    closeModal(modalElement) {
        if (!modalElement) return;

        const modalIndex = this.modalStack.findIndex(modal => modal.element === modalElement);
        if (modalIndex === -1) return;

        // Если закрываем не верхнее модальное окно, закрываем все что выше
        if (modalIndex < this.modalStack.length - 1) {
            // Закрываем все модальные окна выше текущего
            while (this.modalStack.length > modalIndex + 1) {
                this.closeTopModal();
            }
        }

        // Закрываем само модальное окно
        this.closeTopModal();
    }

    // Добавить обработчик клика по затемнению
    addBackdropClickHandler() {
        if (!this.backdropElement) return;

        // Удаляем старый обработчик, если есть
        this.backdropElement.onclick = null;

        // Добавляем новый обработчик
        this.backdropElement.onclick = (event) => {
            if (event.target === this.backdropElement) {
                this.closeTopModal();
            }
        };
    }

    // Проверить, открыто ли модальное окно
    isModalOpen(modalElement) {
        return this.modalStack.some(modal => modal.element === modalElement);
    }

    // Получить количество открытых модальных окон
    getOpenModalsCount() {
        return this.modalStack.length;
    }

    // Закрыть все модальные окна
    closeAllModals() {
        while (this.modalStack.length > 0) {
            this.closeTopModal();
        }
    }

    // Получить верхнее модальное окно
    getTopModal() {
        return this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1].element : null;
    }
}

// Создаем глобальный экземпляр менеджера
window.modalBackdropManager = new ModalBackdropManager();

// Добавляем обработчик для клавиши Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && window.modalBackdropManager.getOpenModalsCount() > 0) {
        window.modalBackdropManager.closeTopModal();
    }
});

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalBackdropManager;
}