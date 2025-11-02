// payment.js - КРАСИВАЯ ПАНЕЛЬ ОПЛАТЫ
class PaymentManager {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.bindEvents();
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
                <div class="payment-container">
                    <div class="booking-summary scroll-reveal">
                        <h3>Детали бронирования</h3>
                        
                        <div class="summary-item">
                            <div class="summary-label">Дом</div>
                            <div class="summary-value">${bookingData.house.name}</div>
                        </div>
                        
                        <div class="summary-item">
                            <div class="summary-label">Даты</div>
                            <div class="summary-value">
                                ${bookingData.checkin} - ${bookingData.checkout} (${nightsCount} ${this.getNightsText(nightsCount)})
                            </div>
                        </div>
                        
                        <div class="summary-item">
                            <div class="summary-label">Гости</div>
                            <div class="summary-value">${bookingData.guests} человек</div>
                        </div>
                        
                        ${bookingData.services.length > 0 ? `
                            <div class="summary-item">
                                <div class="summary-label">Доп. услуги</div>
                                <div class="summary-value">
                                    ${bookingData.services.map(service => 
                                        `${service.name} - ${service.selectedDuration ? service.selectedDuration.label : service.hours + ' ч'}: ${service.totalPrice.toLocaleString()}₽`
                                    ).join('<br>')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="price-breakdown scroll-reveal">
                        <h3>Стоимость</h3>
                        
                        <div class="price-item">
                            <div class="price-label">Проживание (${nightsCount} ${this.getNightsText(nightsCount)})</div>
                            <div class="price-value">${bookingData.basePrice.toLocaleString()}₽</div>
                        </div>
                        
                        ${bookingData.services.map(service => `
                            <div class="price-item">
                                <div class="price-label">${service.name}${service.selectedDuration ? ' - ' + service.selectedDuration.label : ' - ' + service.hours + ' ч'}</div>
                                <div class="price-value">${service.totalPrice.toLocaleString()}₽</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="payment-methods scroll-reveal">
                        <h3>Способ оплаты</h3>
                        
                        <div class="method-option">
                            <input type="radio" id="card-payment" name="payment-method" checked>
                            <label for="card-payment">
                                <span class="method-icon">💳</span>
                                <span class="method-name">Банковская карта</span>
                            </label>
                        </div>
                        
                        <div class="method-option">
                            <input type="radio" id="sbp-payment" name="payment-method">
                            <label for="sbp-payment">
                                <span class="method-icon">📱</span>
                                <span class="method-name">СБП</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- СУПЕР КРАСИВАЯ ПАНЕЛЬ ОПЛАТЫ -->
                <div class="payment-panel">
                    <div class="payment-total">
                        <div class="total-amount">${totalAmount.toLocaleString()}₽</div>
                        <div class="total-label">Итого к оплате</div>
                    </div>
                    <button class="pay-button" id="confirm-payment">
                        💳 Оплатить бронирование
                    </button>
                </div>
            </div>
        `;

        this.bindPaymentEvents();
        this.initScrollReveal();
    }

    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
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
        const originalText = payBtn.textContent;
        payBtn.textContent = 'Обрабатываем оплату...';
        payBtn.disabled = true;

        setTimeout(() => {
            payBtn.textContent = '✅ Оплата прошла успешно!';
            payBtn.style.background = 'var(--accent-success)';
            
            setTimeout(() => {
                alert('Бронирование успешно оплачено! С вами свяжется менеджер для подтверждения.');
                this.app.showScreen('main-screen');
                this.app.clearBookingData();
            }, 1000);
        }, 2000);
    }
}