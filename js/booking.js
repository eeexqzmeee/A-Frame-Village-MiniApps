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

        // Расчет стоимости проживания по дням
        for (let i = 0; i < nights; i++) {
            const currentDate = new Date(dates.checkin);
            currentDate.setDate(currentDate.getDate() + i);
            const dayOfWeek = currentDate.getDay();
            
            // 0 - воскресенье, 6 - суббота (выходные)
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dailyPrice = isWeekend ? house.price_weekend : house.price_weekday;
            
            basePrice += dailyPrice;
            total += dailyPrice;
        }

        // Дополнительные гости (только для больших домов)
        if (house.type === 'large') {
            const actualGuests = guestsCount || house.base_guests;
            if (actualGuests > house.base_guests) {
                const extraGuests = actualGuests - house.base_guests;
                const extraCost = extraGuests * house.extra_guest_price * nights;
                total += extraCost;
            }
        }

        // Дополнительные услуги
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
        const nights = dates.checkin && dates.checkout ? this.calculateNights(dates.checkin, dates.checkout) : 1;
        const pricing = this.calculateTotalPrice(house, dates);

        screen.innerHTML = `
            <header class="header">
                <button class="header-btn back" onclick="app.showScreen('houses-screen')">
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
                                    <div class="feature-title">Заезд</div>
                                    <div class="feature-value">${house.checkin_times.join(', ')}</div>
                                </div>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🚪</span>
                                <div class="feature-info">
                                    <div class="feature-title">Выезд</div>
                                    <div class="feature-value">${house.checkout_time}</div>
                                </div>
                            </div>
                        </div>

                        ${house.type === 'large' ? `
                        <div class="guests-selector">
                            <h4>Количество гостей</h4>
                            <div class="guests-control">
                                <button class="guest-btn" id="decrease-guests">-</button>
                                <span class="guests-count" id="guests-count">${house.base_guests}</span>
                                <button class="guest-btn" id="increase-guests">+</button>
                            </div>
                            <div class="guests-note" id="guests-note">
                                Включено: ${house.base_guests} гостей, доплата за каждого следующего: ${house.extra_guest_price.toLocaleString()}₽/ночь
                            </div>
                        </div>
                        ` : ''}

                        <div class="services-section">
                            <h4>Дополнительные услуги</h4>
                            <div class="services-list" id="services-list">
                                ${house.services.map(service => `
                                    <div class="service-item">
                                        <label class="service-checkbox">
                                            <input type="checkbox" 
                                                   data-service='${JSON.stringify(service).replace(/'/g, "&apos;")}'
                                                   ${service.price === 0 ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="service-info">
                                                <div class="service-name">${service.name}</div>
                                                <div class="service-description">${service.description || ''}</div>
                                                <div class="service-price">
                                                    ${service.price === 0 ? 'Бесплатно' : service.price.toLocaleString() + '₽'}
                                                    ${service.unit ? ` / ${service.unit}` : ''}
                                                    ${service.note ? ` (${service.note})` : ''}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="pricing-summary">
                            <div class="price-line">
                                <span>Проживание (${pricing.nights} ${this.getNightText(pricing.nights)})</span>
                                <span>${pricing.basePrice.toLocaleString()}₽</span>
                            </div>
                            ${house.type === 'large' ? `
                            <div class="price-line" id="extra-guests-line">
                                <span>Дополнительные гости</span>
                                <span id="extra-guests-price">0₽</span>
                            </div>
                            ` : ''}
                            <div class="price-line" id="services-price-line">
                                <span>Дополнительные услуги</span>
                                <span id="services-price">0₽</span>
                            </div>
                            <div class="price-total">
                                <span>Итого к оплате:</span>
                                <span id="total-price">${pricing.total.toLocaleString()}₽</span>
                            </div>
                        </div>

                        <button class="book-btn primary" onclick="bookingManager.proceedToBooking()">
                            Перейти к бронированию
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindDetailEvents(house);
        this.updatePricing(house);
    }

    bindDetailEvents(house) {
        if (house.type === 'large') {
            const decreaseBtn = document.getElementById('decrease-guests');
            const increaseBtn = document.getElementById('increase-guests');
            const guestsCount = document.getElementById('guests-count');

            let currentGuests = house.base_guests;

            decreaseBtn.addEventListener('click', () => {
                if (currentGuests > 1) {
                    currentGuests--;
                    guestsCount.textContent = currentGuests;
                    this.updatePricing(house, currentGuests);
                }
            });

            increaseBtn.addEventListener('click', () => {
                if (currentGuests < house.max_guests) {
                    currentGuests++;
                    guestsCount.textContent = currentGuests;
                    this.updatePricing(house, currentGuests);
                }
            });
        }

        // Обработчики для услуг
        const serviceCheckboxes = document.querySelectorAll('#services-list input[type="checkbox"]');
        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updatePricing(house);
            });
        });
    }

    updatePricing(house, guestsCount = null) {
        const dates = window.app?.selectedDates || {};
        const selectedServices = this.getSelectedServices();
        
        if (house.type === 'large') {
            guestsCount = guestsCount || parseInt(document.getElementById('guests-count')?.textContent) || house.base_guests;
        }

        const pricing = this.calculateTotalPrice(house, dates, guestsCount, selectedServices);

        // Обновляем отображение цен
        const totalElement = document.getElementById('total-price');
        if (totalElement) {
            totalElement.textContent = pricing.total.toLocaleString() + '₽';
        }

        // Дополнительные гости
        if (house.type === 'large') {
            const extraGuestsLine = document.getElementById('extra-guests-line');
            const extraGuestsPrice = document.getElementById('extra-guests-price');
            
            if (guestsCount > house.base_guests) {
                const extraCost = (guestsCount - house.base_guests) * house.extra_guest_price * pricing.nights;
                extraGuestsLine.style.display = 'flex';
                extraGuestsPrice.textContent = extraCost.toLocaleString() + '₽';
            } else {
                extraGuestsLine.style.display = 'none';
            }
        }

        // Услуги
        const servicesPriceLine = document.getElementById('services-price-line');
        const servicesPrice = document.getElementById('services-price');
        
        if (pricing.servicesTotal > 0) {
            servicesPriceLine.style.display = 'flex';
            servicesPrice.textContent = pricing.servicesTotal.toLocaleString() + '₽';
        } else {
            servicesPriceLine.style.display = 'none';
        }
    }

    getSelectedServices() {
        const selectedServices = [];
        const checkboxes = document.querySelectorAll('#services-list input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            try {
                const serviceData = JSON.parse(checkbox.dataset.service);
                selectedServices.push(serviceData);
            } catch (e) {
                console.error('Error parsing service data:', e);
            }
        });
        
        return selectedServices;
    }

    getNightText(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    }

    proceedToBooking() {
        const house = window.app?.selectedHouse;
        const dates = window.app?.selectedDates;
        
        if (!house || !dates.checkin || !dates.checkout) {
            alert('Пожалуйста, выберите даты и дом');
            return;
        }

        this.bookingData.house = house;
        this.bookingData.dates = dates;
        this.bookingData.services = this.getSelectedServices();
        
        if (house.type === 'large') {
            this.bookingData.guests = parseInt(document.getElementById('guests-count')?.textContent) || house.base_guests;
        }

        const pricing = this.calculateTotalPrice(house, dates, this.bookingData.guests, this.bookingData.services);
        this.bookingData.total = pricing.total;

        this.renderBookingForm();
    }

    renderBookingForm() {
        const screen = document.getElementById('booking-screen');
        if (!screen) return;

        const { house, dates, guests, services, total } = this.bookingData;

        screen.innerHTML = `
            <header class="header">
                <button class="header-btn back" onclick="app.showScreen('house-detail-screen')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">Бронирование</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="booking-summary-card">
                    <h3>Ваше бронирование</h3>
                    <div class="summary-details">
                        <div class="summary-item">
                            <span>Дом:</span>
                            <span>${house.name}</span>
                        </div>
                        <div class="summary-item">
                            <span>Даты:</span>
                            <span>${new Date(dates.checkin).toLocaleDateString('ru-RU')} - ${new Date(dates.checkout).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div class="summary-item">
                            <span>Гости:</span>
                            <span>${guests} человек</span>
                        </div>
                        ${services.length > 0 ? `
                        <div class="summary-item">
                            <span>Услуги:</span>
                            <span>${services.map(s => s.name).join(', ')}</span>
                        </div>
                        ` : ''}
                        <div class="summary-item total">
                            <span>К оплате:</span>
                            <span>${total.toLocaleString()}₽</span>
                        </div>
                    </div>
                </div>

                <div class="guest-info-card">
                    <h3>Ваши данные</h3>
                    <div class="form-group">
                        <input type="text" class="form-input" id="guest-name" placeholder="Имя и фамилия" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" class="form-input" id="guest-phone" placeholder="Телефон" required>
                    </div>
                    <div class="form-group">
                        <input type="email" class="form-input" id="guest-email" placeholder="Email" required>
                    </div>
                    <div class="form-group">
                        <textarea class="form-input" id="guest-comment" placeholder="Комментарий или пожелания (необязательно)" rows="3"></textarea>
                    </div>
                </div>

                <button class="book-btn primary" onclick="bookingManager.submitBooking()">
                    Подтвердить бронирование
                </button>

                <div class="booking-note">
                    После подтверждения вы получите реквизиты для оплаты через СБП
                </div>
            </div>
        `;

        window.app.showScreen('booking-screen');
    }

    submitBooking() {
        if (!this.validateBookingForm()) return;

        // Собираем данные гостя
        this.bookingData.guestInfo = {
            name: document.getElementById('guest-name').value.trim(),
            phone: document.getElementById('guest-phone').value.trim(),
            email: document.getElementById('guest-email').value.trim(),
            comment: document.getElementById('guest-comment').value.trim()
        };

        // Генерируем номер брони
        this.bookingData.bookingNumber = 'A-' + Date.now().toString().slice(-6);
        this.bookingData.createdAt = new Date().toISOString();

        // Переходим к экрану оплаты
        if (window.paymentManager) {
            window.paymentManager.showPaymentScreen(this.bookingData);
        }
    }

    validateBookingForm() {
        const name = document.getElementById('guest-name')?.value.trim();
        const phone = document.getElementById('guest-phone')?.value.trim();
        const email = document.getElementById('guest-email')?.value.trim();

        if (!name) {
            alert('Пожалуйста, введите имя и фамилию');
            return false;
        }

        if (!phone) {
            alert('Пожалуйста, введите телефон');
            return false;
        }

        if (!email) {
            alert('Пожалуйста, введите email');
            return false;
        }

        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Пожалуйста, введите корректный email');
            return false;
        }

        return true;
    }
}

// Инициализация менеджера бронирований
const bookingManager = new BookingManager();