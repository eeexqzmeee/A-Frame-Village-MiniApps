class BookingManager {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'continue-to-payment') {
                this.showPaymentScreen();
            }
        });
    }

    showBookingScreen() {
        const house = this.app.selectedHouse;
        const dates = this.app.selectedDates;
        const services = this.app.selectedServices;

        if (!house || !dates.checkin || !dates.checkout) {
            return;
        }

        const blackScreen = this.app.showBlackScreen("Формируем бронирование...");
        
        setTimeout(() => {
            this.app.hideBlackScreen(blackScreen);
            
            const totalPrice = this.calculateTotalPrice(house, dates, services);

            const bookingScreen = document.getElementById('booking-screen');
            bookingScreen.innerHTML = this.createBookingScreenHTML(house, dates, services, totalPrice);

            this.app.showScreen('booking-screen');
        }, 1500);
    }

    calculateTotalPrice(house, dates, services) {
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

    createBookingScreenHTML(house, dates, services, totalPrice) {
        const checkinStr = dates.checkin.toLocaleDateString('ru-RU');
        const checkoutStr = dates.checkout.toLocaleDateString('ru-RU');
        const nights = this.calculateNights(dates.checkin, dates.checkout);

        const servicesHTML = services.map(service => `
            <div class="booking-service">
                <span>${service.name} (${service.durationLabel})</span>
                <span>${service.price.toLocaleString()}₽</span>
            </div>
        `).join('');

        return `
            <header class="header">
                <button class="header-btn back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">Бронирование</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="booking-summary">
                    <div class="booking-dates">
                        <div class="booking-date">
                            <div class="booking-date-label">Заезд</div>
                            <div class="booking-date-value">${checkinStr}</div>
                        </div>
                        <div class="booking-nights">${nights} ${this.getNightWord(nights)}</div>
                        <div class="booking-date">
                            <div class="booking-date-label">Выезд</div>
                            <div class="booking-date-value">${checkoutStr}</div>
                        </div>
                    </div>

                    <div class="booking-house">
                        <div class="booking-house-image">
                            <div class="image-placeholder">${house.images[0]}</div>
                        </div>
                        <div class="booking-house-info">
                            <div class="booking-house-name">${house.name}</div>
                            <div class="booking-house-type">
                                ${house.type === 'large' ? 'Большой дом' : 
                                  house.type === 'couple' ? 'Для двоих' : 'Для семьи'}
                            </div>
                        </div>
                    </div>

                    ${services.length > 0 ? `
                        <div class="booking-services">
                            <div class="services-title">Дополнительные услуги:</div>
                            ${servicesHTML}
                        </div>
                    ` : ''}

                    <div class="booking-price">
                        <div class="booking-price-label">Итого к оплате</div>
                        <div class="booking-price-value">${totalPrice.toLocaleString()}₽</div>
                    </div>
                </div>

                <button class="book-btn primary" id="continue-to-payment">
                    Перейти к оплате
                </button>
            </div>
        `;
    }

    getNightWord(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    }

    showPaymentScreen() {
        const blackScreen = this.app.showBlackScreen("Подготовка к оплате...");
        
        setTimeout(() => {
            this.app.hideBlackScreen(blackScreen);
            
            if (this.app.paymentManager) {
                this.app.paymentManager.showPaymentScreen();
            }
        }, 1000);
    }
}