class PaymentManager {
    constructor() {
        this.paymentData = null;
    }

    showPaymentScreen(bookingData) {
        this.paymentData = bookingData;
        
        const screen = document.getElementById('payment-screen');
        if (!screen) return;

        screen.innerHTML = `
            <header class="header">
                <button class="header-btn back" onclick="app.showScreen('booking-screen')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">Оплата</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="payment-card">
                    <div class="payment-success-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    
                    <h2>Бронь подтверждена!</h2>
                    <p class="payment-subtitle">Номер брони: <strong>${bookingData.bookingNumber}</strong></p>
                    
                    <div class="payment-summary">
                        <div class="summary-item">
                            <span>${bookingData.house.name}</span>
                            <span>${bookingData.total.toLocaleString()}₽</span>
                        </div>
                        <div class="summary-dates">
                            ${new Date(bookingData.dates.checkin).toLocaleDateString('ru-RU')} - ${new Date(bookingData.dates.checkout).toLocaleDateString('ru-RU')}
                        </div>
                    </div>

                    <div class="payment-instructions">
                        <h4>Инструкция по оплате:</h4>
                        <ol>
                            <li>Переведите <strong>${bookingData.total.toLocaleString()}₽</strong> по реквизитам СБП</li>
                            <li>Сохраните скриншот чека об оплате</li>
                            <li>Отправьте чек в чат для подтверждения брони</li>
                        </ol>
                        
                        <div class="payment-details">
                            <div class="bank-info">
                                <strong>Реквизиты для перевода:</strong>
                                <div>Банк: Тинькофф</div>
                                <div>Номер: +7 (999) 123-45-67</div>
                                <div>Получатель: ИП Иванов А.С.</div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-actions">
                        <button class="btn-secondary" onclick="this.copyToClipboard('+79991234567')">
                            Скопировать номер
                        </button>
                        <button class="btn-primary" onclick="paymentManager.completePayment()">
                            Я оплатил
                        </button>
                    </div>

                    <div class="payment-note">
                        Бронь будет активна после подтверждения оплаты администратором
                    </div>
                </div>
            </div>
        `;

        window.app.showScreen('payment-screen');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Номер скопирован в буфер');
        });
    }

    showToast(message) {
        // Простая реализация toast-уведомления
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-primary);
            color: var(--bg-primary);
            padding: 12px 20px;
            border-radius: var(--border-radius);
            z-index: 1000;
            font-weight: 500;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }

    completePayment() {
        // В реальном приложении здесь была бы интеграция с платежной системой
        // и подтверждение оплаты
        
        this.showConfirmationScreen();
    }

    showConfirmationScreen() {
        const screen = document.createElement('div');
        screen.id = 'confirmation-screen';
        screen.className = 'screen active';
        screen.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-icon">✅</div>
                <h2>Оплата принята!</h2>
                <p>Ожидайте подтверждения брони в течение 15 минут</p>
                
                <div class="confirmation-details">
                    <div class="detail-item">
                        <span>Номер брони:</span>
                        <strong>${this.paymentData.bookingNumber}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Дом:</span>
                        <span>${this.paymentData.house.name}</span>
                    </div>
                    <div class="detail-item">
                        <span>Даты:</span>
                        <span>${new Date(this.paymentData.dates.checkin).toLocaleDateString('ru-RU')} - ${new Date(this.paymentData.dates.checkout).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div class="detail-item">
                        <span>Сумма:</span>
                        <strong>${this.paymentData.total.toLocaleString()}₽</strong>
                    </div>
                </div>

                <div class="confirmation-actions">
                    <button class="btn-primary" onclick="app.returnToMain()">
                        Вернуться на главную
                    </button>
                </div>

                <div class="confirmation-note">
                    По всем вопросам обращайтесь в поддержку
                </div>
            </div>
        `;

        document.getElementById('app').appendChild(screen);
    }
}

// Инициализация менеджера платежей
const paymentManager = new PaymentManager();