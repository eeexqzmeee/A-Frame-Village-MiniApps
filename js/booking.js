class BookingManager {
    constructor() {
        this.bookingData = {
            house: null,
            dates: {},
            guests: 2,
            services: [],
            total: 0,
            guestInfo: {}
        };
    }

    calculateNights(checkin, checkout) {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    calculateTotalPrice(house, dates, guestsCount = null, selectedServices = []) {
        if (!dates.checkin || !dates.checkout) return 0;

        const nights = this.calculateNights(dates.checkin, dates.checkout);
        let total = 0;
        let basePrice = 0;

        for (let i = 0; i < nights; i++) {
            const currentDate = new Date(dates.checkin);
            currentDate.setDate(currentDate.getDate() + i);
            const dayOfWeek = currentDate.getDay();
            
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dailyPrice = isWeekend ? house.price_weekend : house.price_weekday;
            
            basePrice += dailyPrice;
            total += dailyPrice;
        }

        if (house.type === 'large') {
            const actualGuests = guestsCount || house.base_guests;
            if (actualGuests > house.base_guests) {
                const extraGuests = actualGuests - house.base_guests;
                const extraCost = extraGuests * house.extra_guest_price * nights;
                total += extraCost;
            }
        }

        let servicesTotal = 0;
        selectedServices.forEach(service => {
            if (service.unit === 'час' && service.min_hours) {
                servicesTotal += service.price * service.min_hours;
            } else {
                servicesTotal += service.price;
            }
        });
        total += servicesTotal;

        return {
            basePrice,
            servicesTotal,
            total,
            nights
        };
    }

    renderHouseDetail(house) {
        const screen = document.getElementById('house-detail-screen');
        if (!screen) return;

        const dates = window.app?.selectedDates || {};
        const pricing = this.calculateTotalPrice(house, dates);

        screen.innerHTML = `
            <header class="header">
                <button class="header-btn back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">${house.name}</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="house-detail-card">
                    <div class="house-gallery">
                        <div class="gallery-main">
                            <div class="image-placeholder large">${house.image}</div>
                        </div>
                    </div>

                    <div class="house-detail-info">
                        <h2>${house.name}</h2>
                        <p class="house-description">${house.description}</p>

                        <div class="detail-features">
                            <div class="feature-item">
                                <span class="feature-icon">👥</span>
                                <div class="feature-info">
                                    <div class="feature-title">Гости</div>
                                    <div class="feature-value">до ${house.max_guests} человек</div>
                                </div>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">⏰</span>
                                <div class="feature-info">
                                    <div class="feature-title">Заезд / Выезд</div>
                                    <div class="feature-value">${house.checkin_times.join(', ')} / ${house.checkout_time}</div>
                                </div>
                            </div>
                        </div>

                        <div class="pricing-section">
                            <h3>Стоимость</h3>
                            <div class="price-breakdown">
                                <div class="price-row">
                                    <span>Проживание (${pricing.nights} ночей)</span>
                                    <span>${pricing.basePrice.toLocaleString()}₽</span>
                                </div>
                                ${pricing.servicesTotal > 0 ? `
                                <div class="price-row">
                                    <span>Доп. услуги</span>
                                    <span>${pricing.servicesTotal.toLocaleString()}₽</span>
                                </div>
                                ` : ''}
                                <div class="price-total">
                                    <span>Итого</span>
                                    <span>${pricing.total.toLocaleString()}₽</span>
                                </div>
                            </div>
                        </div>

                        ${house.services && house.services.length > 0 ? `
                        <div class="services-section">
                            <h3>Дополнительные услуги</h3>
                            <div class="services-list">
                                ${house.services.map(service => `
                                    <div class="service-item">
                                        <div class="service-info">
                                            <div class="service-name">${service.name}</div>
                                            <div class="service-description">${service.description}</div>
                                        </div>
                                        ${service.price > 0 ? `
                                        <div class="service-price">${service.price.toLocaleString()}₽</div>
                                        ` : `
                                        <div class="service-free">Бесплатно</div>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <button class="book-btn large" id="book-now-btn">
                            <span>Забронировать</span>
                            <span class="price-badge">${pricing.total.toLocaleString()}₽</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachHouseDetailEvents(house);
    }

    attachHouseDetailEvents(house) {
        const backBtn = document.querySelector('#house-detail-screen .header-btn.back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.app.goBack();
            });
        }

        const bookBtn = document.getElementById('book-now-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                this.startBooking(house);
            });
        }
    }

    startBooking(house) {
        this.bookingData.house = house;
        this.bookingData.dates = window.app.selectedDates;
        
        window.app.showModalScreen('booking-screen');
        this.renderBookingForm();
    }

    renderBookingForm() {
        const screen = document.getElementById('booking-screen');
        if (!screen) return;

        const house = this.bookingData.house;
        const dates = this.bookingData.dates;
        const pricing = this.calculateTotalPrice(house, dates);

        screen.innerHTML = `
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
                    <h3>${house.name}</h3>
                    <div class="booking-dates">
                        ${this.formatDateRange(dates.checkin, dates.checkout)}
                    </div>
                    <div class="booking-price">
                        ${pricing.total.toLocaleString()}₽
                    </div>
                </div>

                <form class="booking-form" id="booking-form">
                    <div class="form-section">
                        <h4>Информация о гостях</h4>
                        
                        <div class="form-group">
                            <label>Количество гостей</label>
                            <select class="form-select" id="guests-count">
                                ${Array.from({length: house.max_guests}, (_, i) => {
                                    const count = i + 1;
                                    return `<option value="${count}">${count} ${this.getGuestWord(count)}</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Имя и фамилия</label>
                            <input type="text" class="form-input" required placeholder="Введите ваше имя">
                        </div>

                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-input" required placeholder="your@email.com">
                        </div>

                        <div class="form-group">
                            <label>Телефон</label>
                            <input type="tel" class="form-input" required placeholder="+7 (999) 999-99-99">
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Дополнительные услуги</h4>
                        <div class="services-checkbox">
                            ${house.services ? house.services.map(service => `
                                <label class="checkbox-label">
                                    <input type="checkbox" name="services" value="${service.name}" data-price="${service.price}">
                                    <span class="checkbox-custom"></span>
                                    <div class="service-details">
                                        <div class="service-name">${service.name}</div>
                                        <div class="service-description">${service.description}</div>
                                        <div class="service-price">${service.price > 0 ? service.price.toLocaleString() + '₽' : 'Бесплатно'}</div>
                                    </div>
                                </label>
                            `).join('') : ''}
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Особые пожелания</h4>
                        <textarea class="form-textarea" placeholder="Дополнительные пожелания..."></textarea>
                    </div>

                    <button type="submit" class="book-btn large">
                        <span>Перейти к оплате</span>
                        <span class="price-badge">${pricing.total.toLocaleString()}₽</span>
                    </button>
                </form>
            </div>
        `;

        this.attachBookingEvents();
    }

    attachBookingEvents() {
        const backBtn = document.querySelector('#booking-screen .header-btn.back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.app.goBack();
            });
        }

        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processBooking();
            });
        }

        const guestsSelect = document.getElementById('guests-count');
        if (guestsSelect) {
            guestsSelect.addEventListener('change', (e) => {
                this.updateBookingPrice();
            });
        }

        const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBookingPrice();
            });
        });
    }

    updateBookingPrice() {
        const house = this.bookingData.house;
        const dates = this.bookingData.dates;
        const guestsCount = parseInt(document.getElementById('guests-count').value);
        
        const selectedServices = [];
        document.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
            const service = house.services.find(s => s.name === checkbox.value);
            if (service) selectedServices.push(service);
        });

        const pricing = this.calculateTotalPrice(house, dates, guestsCount, selectedServices);
        
        const priceBadges = document.querySelectorAll('.price-badge');
        priceBadges.forEach(badge => {
            badge.textContent = pricing.total.toLocaleString() + '₽';
        });
    }

    processBooking() {
        const form = document.getElementById('booking-form');
        const formData = new FormData(form);
        
        this.bookingData.guestInfo = {
            name: formData.get('name') || document.querySelector('input[type="text"]').value,
            email: formData.get('email') || document.querySelector('input[type="email"]').value,
            phone: formData.get('phone') || document.querySelector('input[type="tel"]').value,
            guests: parseInt(document.getElementById('guests-count').value),
            notes: document.querySelector('.form-textarea').value
        };

        const selectedServices = [];
        document.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
            selectedServices.push(checkbox.value);
        });
        this.bookingData.services = selectedServices;

        this.showPaymentScreen();
    }

    showPaymentScreen() {
        window.app.showModalScreen('payment-screen');
        this.renderPaymentScreen();
    }

    renderPaymentScreen() {
        const screen = document.getElementById('payment-screen');
        if (!screen) return;

        const house = this.bookingData.house;
        const dates = this.bookingData.dates;
        const guestInfo = this.bookingData.guestInfo;
        const pricing = this.calculateTotalPrice(house, dates, guestInfo.guests, 
            house.services.filter(s => this.bookingData.services.includes(s.name)));

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
                <div class="payment-summary">
                    <h3>Итого к оплате</h3>
                    <div class="total-amount">${pricing.total.toLocaleString()}₽</div>
                    
                    <div class="booking-details">
                        <div class="detail-item">
                            <span>${house.name}</span>
                        </div>
                        <div class="detail-item">
                            <span>${this.formatDateRange(dates.checkin, dates.checkout)}</span>
                        </div>
                        <div class="detail-item">
                            <span>${guestInfo.guests} ${this.getGuestWord(guestInfo.guests)}</span>
                        </div>
                    </div>
                </div>

                <div class="payment-methods">
                    <h4>Способ оплаты</h4>
                    
                    <div class="payment-method">
                        <label class="radio-label">
                            <input type="radio" name="payment-method" value="card" checked>
                            <span class="radio-custom"></span>
                            <div class="method-info">
                                <div class="method-name">Банковская карта</div>
                                <div class="method-description">Visa, Mastercard, МИР</div>
                            </div>
                        </label>
                    </div>

                    <div class="payment-method">
                        <label class="radio-label">
                            <input type="radio" name="payment-method" value="sbp">
                            <span class="radio-custom"></span>
                            <div class="method-info">
                                <div class="method-name">СБП</div>
                                <div class="method-description">Быстрый платеж</div>
                            </div>
                        </label>
                    </div>
                </div>

                <button class="book-btn large" id="confirm-payment">
                    <span>Оплатить</span>
                    <span class="price-badge">${pricing.total.toLocaleString()}₽</span>
                </button>
            </div>
        `;

        this.attachPaymentEvents();
    }

    attachPaymentEvents() {
        const backBtn = document.querySelector('#payment-screen .header-btn.back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.app.goBack();
            });
        }

        const confirmBtn = document.getElementById('confirm-payment');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmPayment();
            });
        }
    }

    confirmPayment() {
        window.app.showNotification('Бронирование подтверждено!');
        
        setTimeout(() => {
            window.app.showScreen('main-screen');
            this.resetBooking();
        }, 2000);
    }

    resetBooking() {
        this.bookingData = {
            house: null,
            dates: {},
            guests: 2,
            services: [],
            total: 0,
            guestInfo: {}
        };
    }

    formatDateRange(checkin, checkout) {
        if (!checkin || !checkout) return '';
        
        const format = (date) => {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long'
            });
        };
        
        return `${format(checkin)} - ${format(checkout)}`;
    }

    getGuestWord(count) {
        if (count === 1) return 'гость';
        if (count >= 2 && count <= 4) return 'гостя';
        return 'гостей';
    }
}