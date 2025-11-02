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
                <button class="header-btn back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">Оплата</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="payment-success">
                    <div class="success-icon">✅</div>
                    <h2>Бронь подтверждена!</h2>
                    <p class="booking-number">Номер брони: <strong>${this.generateBookingNumber()}</strong></p>
                    
                    <div class="payment-details">
                        <div class="detail-item">
                            <span>${bookingData.house.name}</span>
                            <span>${bookingData.total.toLocaleString()}₽</span>
                        </div>
                        <div class="detail-dates">
                            ${new Date(bookingData.dates.checkin).toLocaleDateString('ru-RU')} - ${new Date(bookingData.dates.checkout).toLocaleDateString('ru-RU')}
                        </div>
                    </div>

                    <div class="payment-instructions">
                        <h4>Инструкция по оплате:</h4>
                        <div class="instructions-list">
                            <div class="instruction-item">
                                <span class="step">1</span>
                                <span>Переведите <strong>${bookingData.total.toLocaleString()}₽</strong> по реквизитам СБП</span>
                            </div>
                            <div class="instruction-item">
                                <span class="step">2</span>
                                <span>Сохраните скриншот чека об оплате</span>
                            </div>
                            <div class="instruction-item">
                                <span class="step">3</span>
                                <span>Отправьте чек в чат для подтверждения брони</span>
                            </div>
                        </div>
                        
                        <div class="bank-details">
                            <div class="bank-info">
                                <strong>Реквизиты для перевода:</strong>
                                <div>Банк: Тинькофф</div>
                                <div>Номер: +7 (999) 123-45-67</div>
                                <div>Получатель: ИП Иванов А.С.</div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-actions">
                        <button class="btn-secondary" id="copy-number-btn">
                            Скопировать номер
                        </button>
                        <button class="btn-primary" id="confirm-payment-btn">
                            Я оплатил
                        </button>
                    </div>

                    <div class="payment-note">
                        Бронь будет активна после подтверждения оплаты администратором
                    </div>
                </div>
            </div>
        `;

        this.attachPaymentEvents();
    }

    attachPaymentEvents() {
        const backBtn = document.querySelector('#payment-screen .header-btn.back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.goBack();
                }
            });
        }

        const copyBtn = document.getElementById('copy-number-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard('+79991234567');
            });
        }

        const confirmBtn = document.getElementById('confirm-payment-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.completePayment();
            });
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Номер скопирован в буфер');
        }).catch(() => {
            this.showToast('Не удалось скопировать номер');
        });
    }

    showToast(message) {
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
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }

    completePayment() {
        this.showConfirmationScreen();
    }

    showConfirmationScreen() {
        const screen = document.getElementById('payment-screen');
        if (!screen) return;

        screen.innerHTML = `
            <header class="header">
                <button class="header-btn back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">Подтверждение</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="confirmation-content">
                    <div class="confirmation-icon">🎉</div>
                    <h2>Оплата принята!</h2>
                    <p>Ожидайте подтверждения брони в течение 15 минут</p>
                    
                    <div class="confirmation-details">
                        <div class="detail-item">
                            <span>Номер брони:</span>
                            <strong>${this.generateBookingNumber()}</strong>
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

                    <button class="btn-primary" id="return-home-btn">
                        Вернуться на главную
                    </button>

                    <div class="confirmation-note">
                        По всем вопросам обращайтесь в поддержку
                    </div>
                </div>
            </div>
        `;

        this.attachConfirmationEvents();
    }

    attachConfirmationEvents() {
        const backBtn = document.querySelector('#payment-screen .header-btn.back');
        const returnBtn = document.getElementById('return-home-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.returnToMain();
            });
        }

        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                this.returnToMain();
            });
        }
    }

    returnToMain() {
        if (window.app) {
            window.app.returnToMain();
        }
        
        if (window.bookingManager) {
            window.bookingManager.resetBooking();
        }
    }

    generateBookingNumber() {
        return 'A-' + Date.now().toString().slice(-6);
    }
}

const paymentManager = new PaymentManager();