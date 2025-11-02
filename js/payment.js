class PaymentManager {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        console.log('PaymentManager initialized');
    }

    bindEvents() {
        console.log('PaymentManager events bound');
    }

    renderPaymentScreen(bookingData) {
        const screen = document.getElementById('payment-screen');
        if (!screen) return;

        const totalAmount = this.calculateTotal(bookingData);
        const nightsCount = bookingData.nights || 1;

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
                <div class="payment-hero">
                    <div class="payment-icon">💎</div>
                    <h1 class="payment-title">Завершение бронирования</h1>
                    <p class="payment-subtitle">Остался последний шаг для подтверждения вашего отдыха</p>
                </div>

                <div class="payment-container">
                    <!-- Детали бронирования -->
                    <div class="payment-section">
                        <div class="section-header">
                            <div class="section-icon">📋</div>
                            <h3>Детали бронирования</h3>
                        </div>
                        
                        <div class="booking-card">
                            <div class="booking-main">
                                <div class="house-image-mini">
                                    <div class="image-placeholder">${bookingData.house.images && bookingData.house.images.length > 0 ? bookingData.house.images[0] : '🏠'}</div>
                                </div>
                                <div class="booking-info">
                                    <h4>${bookingData.house.name}</h4>
                                    <p class="booking-dates">
                                        <span class="date-icon">📅</span>
                                        ${this.formatDisplayDate(bookingData.checkin)} - ${this.formatDisplayDate(bookingData.checkout)}
                                    </p>
                                    <p class="booking-guests">
                                        <span class="guest-icon">👥</span>
                                        ${bookingData.guests} гостей • ${nightsCount} ${this.getNightsText(nightsCount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Способ оплаты -->
                    <div class="payment-section">
                        <div class="section-header">
                            <div class="section-icon">💳</div>
                            <h3>Способ оплаты</h3>
                        </div>
                        
                        <div class="payment-methods">
                            <div class="method-card active" data-method="card">
                                <div class="method-header">
                                    <div class="method-icon">💳</div>
                                    <div class="method-info">
                                        <div class="method-name">Банковская карта</div>
                                        <div class="method-description">Visa, Mastercard, Мир</div>
                                    </div>
                                    <div class="method-check">
                                        <div class="check-circle"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="method-card" data-method="sbp">
                                <div class="method-header">
                                    <div class="method-icon">📱</div>
                                    <div class="method-info">
                                        <div class="method-name">СБП</div>
                                        <div class="method-description">Быстрый платеж через ваш банк</div>
                                    </div>
                                    <div class="method-check">
                                        <div class="check-circle"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Дополнительная информация -->
                    <div class="payment-section">
                        <div class="info-cards">
                            <div class="info-card">
                                <div class="info-icon">🛡️</div>
                                <div class="info-content">
                                    <div class="info-title">Безопасная оплата</div>
                                    <div class="info-text">Все платежи защищены шифрованием</div>
                                </div>
                            </div>
                            
                            <div class="info-card">
                                <div class="info-icon">↩️</div>
                                <div class="info-content">
                                    <div class="info-title">Легкий возврат</div>
                                    <div class="info-text">Возврат средств по правилам бронирования</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ОБЪЕДИНЕННАЯ ПАНЕЛЬ С ДЕТАЛЯМИ СТОИМОСТИ И КНОПКОЙ ОПЛАТЫ -->
                <div class="payment-summary-panel">
                    <div class="payment-details">
                        <div class="price-breakdown">
                            <div class="price-item-final">
                                <span class="price-label-final">Проживание (${nightsCount} ${this.getNightsText(nightsCount)})</span>
                                <span class="price-value-final">${bookingData.basePrice.toLocaleString()}₽</span>
                            </div>
                            
                            ${bookingData.services && bookingData.services.length > 0 ? 
                                bookingData.services.map(service => `
                                    <div class="price-item-final">
                                        <span class="price-label-final">
                                            ${service.name}
                                            ${service.selectedDuration ? ` • ${service.selectedDuration.label}` : service.hours ? ` • ${service.hours} ч` : ''}
                                        </span>
                                        <span class="price-value-final">${service.totalPrice.toLocaleString()}₽</span>
                                    </div>
                                `).join('') : ''
                            }
                        </div>
                        
                        <div class="price-total-final">
                            <div class="total-left">
                                <div class="total-amount-final">${totalAmount.toLocaleString()}₽</div>
                                <div class="total-label-final">Итого к оплате</div>
                            </div>
                            <div class="total-features">
                                <div class="feature-final">
                                    <span class="feature-icon-final">🔒</span>
                                    <span class="feature-text-final">Безопасно</span>
                                </div>
                                <div class="feature-final">
                                    <span class="feature-icon-final">⚡</span>
                                    <span class="feature-text-final">Мгновенно</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="pay-button-final" id="confirm-payment">
                        <span class="pay-icon-final">💎</span>
                        <span class="pay-text-final">Оплатить бронирование</span>
                        <span class="pay-arrow-final">→</span>
                    </button>
                </div>
            </div>
        `;

        this.bindPaymentEvents();
    }

    formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    }

    calculateTotal(bookingData) {
        let total = bookingData.basePrice || 0;
        if (bookingData.services && bookingData.services.length > 0) {
            bookingData.services.forEach(service => {
                total += service.totalPrice || 0;
            });
        }
        return total;
    }

    getNightsText(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    }

    bindPaymentEvents() {
        const backBtn = document.querySelector('#payment-screen .header-btn.back');
        if (backBtn) {
            backBtn.onclick = () => {
                this.app.showScreen('calendar-screen');
            };
        }

        const confirmBtn = document.getElementById('confirm-payment');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                this.processPayment();
            };
        }

        // Выбор способа оплаты
        document.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.method-card').forEach(c => {
                    c.classList.remove('active');
                });
                card.classList.add('active');
            });
        });
    }

    processPayment() {
        if (!this.app.bookingData) {
            alert('Ошибка: данные бронирования не найдены');
            return;
        }

        const paymentData = {
            booking: this.app.bookingData,
            total: this.calculateTotal(this.app.bookingData),
            timestamp: new Date().toISOString()
        };

        console.log('Processing payment:', paymentData);

        // Эффект загрузки
        const payBtn = document.getElementById('confirm-payment');
        const originalText = payBtn.innerHTML;
        payBtn.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Обрабатываем оплату...</span>
        `;
        payBtn.disabled = true;

        // Имитация процесса оплаты
        setTimeout(() => {
            payBtn.innerHTML = `
                <span class="success-icon">✅</span>
                <span>Оплата прошла успешно!</span>
            `;
            payBtn.style.background = 'var(--accent-success)';
            
            setTimeout(() => {
                alert('🎉 Бронирование успешно оплачено! С вами свяжется менеджер для подтверждения.');
                this.app.showScreen('main-screen');
                this.app.clearBookingData();
            }, 1500);
        }, 3000);
    }
}