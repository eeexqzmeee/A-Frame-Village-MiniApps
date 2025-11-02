class PaymentManager {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    showPaymentScreen() {
        const house = this.app.selectedHouse;
        const dates = this.app.selectedDates;
        const services = this.app.selectedServices;

        if (!house || !dates.checkin || !dates.checkout) {
            return;
        }

        const total = this.calculateTotal(house, dates, services);

        const paymentScreen = document.getElementById('payment-screen');
        paymentScreen.innerHTML = this.createPaymentScreenHTML(house, dates, services, total);

        this.app.showScreen('payment-screen');
    }

    calculateTotal(house, dates, services) {
        const nights = this.calculateNights(dates.checkin, dates.checkout);
        let total = house.price * nights;

        services.forEach(service => {
            total += service.price;
        });

        return total;
    }

    calculateNights(checkin, checkout) {
        const timeDiff = checkout.getTime() - checkin.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    createPaymentScreenHTML(house, dates, services, total) {
        const checkinStr = dates.checkin.toLocaleDateString('ru-RU');
        const checkoutStr = dates.checkout.toLocaleDateString('ru-RU');
        const nights = this.calculateNights(dates.checkin, dates.checkout);

        return `
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
                <div class="payment-summary">
                    <h3>Подтверждение бронирования</h3>
                    
                    <div class="payment-details">
                        <div class="payment-detail">
                            <span>Дом:</span>
                            <span>${house.name}</span>
                        </div>
                        <div class="payment-detail">
                            <span>Даты:</span>
                            <span>${checkinStr} - ${checkoutStr}</span>
                        </div>
                        <div class="payment-detail">
                            <span>Ночей:</span>
                            <span>${nights}</span>
                        </div>
                        ${services.length > 0 ? `
                            <div class="payment-detail">
                                <span>Услуги:</span>
                                <span>${services.map(s => s.name).join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="payment-total">
                        <span>Итого:</span>
                        <span class="total-amount">${total.toLocaleString()}₽</span>
                    </div>
                </div>

                <div class="payment-methods">
                    <h4>Выберите способ оплаты</h4>
                    
                    <div class="payment-method">
                        <input type="radio" id="card-payment" name="payment" checked>
                        <label for="card-payment">
                            <span class="method-icon">💳</span>
                            <span class="method-name">Банковская карта</span>
                        </label>
                    </div>
                    
                    <div class="payment-method">
                        <input type="radio" id="sbp-payment" name="payment">
                        <label for="sbp-payment">
                            <span class="method-icon">📱</span>
                            <span class="method-name">СБП</span>
                        </label>
                    </div>
                </div>

                <button class="book-btn primary" id="confirm-payment">
                    Оплатить ${total.toLocaleString()}₽
                </button>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'confirm-payment') {
                this.processPayment();
            }
        });
    }

    processPayment() {
        const blackScreen = this.app.showBlackScreen("Обрабатываем платеж...");
        
        setTimeout(() => {
            this.app.hideBlackScreen(blackScreen);
            alert('Бронирование успешно подтверждено!');
            this.app.showScreen('main-screen');
        }, 2000);
    }
}