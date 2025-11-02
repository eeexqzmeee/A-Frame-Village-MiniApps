class BookingManager {
    constructor(app) {
        this.app = app;
        this.selectedServices = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#continue-to-booking')) {
                this.continueToBooking();
            }
        });
    }

    renderHouseDetails(house) {
        const screen = document.getElementById('house-detail-screen');
        if (!screen) return;

        const selectedDates = window.calendar ? window.calendar.selectedDates : {};
        const nightsCount = this.calculateNights(selectedDates.checkin, selectedDates.checkout);
        const basePrice = this.calculateBasePrice(house, nightsCount);
        
        this.app.bookingData = {
            house: house,
            checkin: selectedDates.checkin,
            checkout: selectedDates.checkout,
            nights: nightsCount,
            guests: house.capacity,
            basePrice: basePrice,
            services: []
        };

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
                <div class="house-detail-container">
                    <div class="house-gallery">
                        <div class="main-image">
                            <div class="image-placeholder large">${house.images && house.images.length > 0 ? house.images[0] : '🏠'}</div>
                        </div>
                    </div>

                    <div class="house-details">
                        <div class="detail-section">
                            <h3>Описание</h3>
                            <p>${house.description}</p>
                        </div>

                        <div class="detail-section">
                            <h3>Особенности</h3>
                            <div class="features-grid">
                                ${house.features ? house.features.map(feature => `
                                    <div class="feature-item">
                                        <span class="feature-icon">${feature.icon}</span>
                                        <div class="feature-info">
                                            <div class="feature-label">${feature.label}</div>
                                            <div class="feature-value">${feature.value}</div>
                                        </div>
                                    </div>
                                `).join('') : ''}
                            </div>
                        </div>

                        ${selectedDates.checkin && selectedDates.checkout ? `
                            <div class="detail-section">
                                <h3>Выбранные даты</h3>
                                <div class="dates-summary">
                                    <div class="date-item">
                                        <span class="date-label">Заезд:</span>
                                        <span class="date-value">${selectedDates.checkin}</span>
                                    </div>
                                    <div class="date-item">
                                        <span class="date-label">Выезд:</span>
                                        <span class="date-value">${selectedDates.checkout}</span>
                                    </div>
                                    <div class="date-item">
                                        <span class="date-label">Ночей:</span>
                                        <span class="date-value">${nightsCount}</span>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        ${house.services && house.services.length > 0 ? `
                            <div class="detail-section">
                                <h3>Дополнительные услуги</h3>
                                <div class="services-list">
                                    ${house.services.map(service => this.renderService(service)).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="booking-summary">
                            <div class="price-summary">
                                <div class="price-item">
                                    <span>Проживание (${nightsCount} ${this.getNightsText(nightsCount)})</span>
                                    <span>${basePrice.toLocaleString()}₽</span>
                                </div>
                                ${this.selectedServices.map(service => `
                                    <div class="price-item">
                                        <span>${service.name}${service.selectedDuration ? ' - ' + service.selectedDuration.label : ' - ' + service.hours + ' ч'}</span>
                                        <span>${service.totalPrice.toLocaleString()}₽</span>
                                    </div>
                                `).join('')}
                                <div class="price-total">
                                    <span>Итого</span>
                                    <span>${this.calculateTotal(basePrice).toLocaleString()}₽</span>
                                </div>
                            </div>

                            <button class="book-btn primary" id="continue-to-booking">
                                Перейти к оплате
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindHouseDetailEvents(house);
        this.updateServiceSelections();
    }

    renderService(service) {
        return `
            <div class="service-item" data-service="${service.name}">
                <div class="service-header">
                    <div class="service-info">
                        <h4>${service.name}</h4>
                        <p>${service.description}</p>
                    </div>
                    <div class="service-price">
                        ${service.price.toLocaleString()}₽/${service.unit}
                    </div>
                </div>
                <div class="service-controls">
                    <div class="duration-selector">
                        <label>Продолжительность:</label>
                        <div class="duration-options">
                            ${service.durations ? service.durations.map(duration => `
                                <button class="duration-option ${duration.value === 2 ? 'active' : ''}" 
                                        data-duration="${duration.value}" 
                                        data-price="${duration.price}">
                                    ${duration.label} - ${duration.price.toLocaleString()}₽
                                </button>
                            `).join('') : `
                                <div class="duration-slider-container">
                                    <input type="range" class="duration-slider" 
                                           min="${service.min_hours || 1}" 
                                           max="6" 
                                           value="${service.min_hours || 2}" 
                                           step="1">
                                    <div class="slider-labels">
                                        <span>${service.min_hours || 1} ч</span>
                                        <span class="slider-value">${service.min_hours || 2} ч</span>
                                        <span>6 ч</span>
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindHouseDetailEvents(house) {
        const backBtn = document.querySelector('#house-detail-screen .header-btn.back');
        if (backBtn) {
            backBtn.onclick = () => {
                this.app.showScreen('houses-screen');
            };
        }

        this.bindServiceEvents(house);
    }

    bindServiceEvents(house) {
        document.querySelectorAll('.duration-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const serviceItem = e.target.closest('.service-item');
                const serviceName = serviceItem.dataset.service;
                const duration = parseInt(e.target.dataset.duration);
                const price = parseInt(e.target.dataset.price);

                document.querySelectorAll('.duration-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.classList.add('active');

                this.updateServiceSelection(house, serviceName, duration, price);
            });
        });

        document.querySelectorAll('.duration-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const serviceItem = e.target.closest('.service-item');
                const serviceName = serviceItem.dataset.service;
                const hours = parseInt(e.target.value);
                const service = house.services.find(s => s.name === serviceName);
                const price = hours * service.price;

                const sliderValue = serviceItem.querySelector('.slider-value');
                if (sliderValue) {
                    sliderValue.textContent = `${hours} ч`;
                }

                this.updateServiceSelection(house, serviceName, hours, price);
            });
        });
    }

    updateServiceSelection(house, serviceName, duration, totalPrice) {
        const service = house.services.find(s => s.name === serviceName);
        const selectedDuration = service.durations ? service.durations.find(d => d.value === duration) : null;

        const existingIndex = this.selectedServices.findIndex(s => s.name === serviceName);
        
        if (existingIndex >= 0) {
            this.selectedServices[existingIndex] = {
                name: serviceName,
                hours: duration,
                totalPrice: totalPrice,
                selectedDuration: selectedDuration
            };
        } else {
            this.selectedServices.push({
                name: serviceName,
                hours: duration,
                totalPrice: totalPrice,
                selectedDuration: selectedDuration
            });
        }

        this.app.bookingData.services = this.selectedServices;
        this.updatePriceDisplay();
    }

    updateServiceSelections() {
        this.selectedServices.forEach(service => {
            const serviceElement = document.querySelector(`[data-service="${service.name}"]`);
            if (serviceElement) {
                if (service.selectedDuration) {
                    const option = serviceElement.querySelector(`[data-duration="${service.selectedDuration.value}"]`);
                    if (option) {
                        serviceElement.querySelectorAll('.duration-option').forEach(opt => {
                            opt.classList.remove('active');
                        });
                        option.classList.add('active');
                    }
                } else {
                    const slider = serviceElement.querySelector('.duration-slider');
                    if (slider) {
                        slider.value = service.hours;
                        const sliderValue = serviceElement.querySelector('.slider-value');
                        if (sliderValue) {
                            sliderValue.textContent = `${service.hours} ч`;
                        }
                    }
                }
            }
        });
        this.updatePriceDisplay();
    }

    updatePriceDisplay() {
        const basePrice = this.app.bookingData.basePrice;
        const total = this.calculateTotal(basePrice);
        
        const totalElement = document.querySelector('.price-total span:last-child');
        if (totalElement) {
            totalElement.textContent = `${total.toLocaleString()}₽`;
        }

        const servicesContainer = document.querySelector('.price-summary');
        if (servicesContainer) {
            const existingServiceItems = servicesContainer.querySelectorAll('.price-item:not(:first-child):not(.price-total)');
            existingServiceItems.forEach(item => item.remove());

            this.selectedServices.forEach(service => {
                const serviceElement = document.createElement('div');
                serviceElement.className = 'price-item';
                serviceElement.innerHTML = `
                    <span>${service.name}${service.selectedDuration ? ' - ' + service.selectedDuration.label : ' - ' + service.hours + ' ч'}</span>
                    <span>${service.totalPrice.toLocaleString()}₽</span>
                `;
                servicesContainer.insertBefore(serviceElement, servicesContainer.querySelector('.price-total'));
            });
        }
    }

    calculateBasePrice(house, nights) {
        const basePricePerNight = house.price || 15000;
        return basePricePerNight * nights;
    }

    calculateTotal(basePrice) {
        let total = basePrice;
        this.selectedServices.forEach(service => {
            total += service.totalPrice;
        });
        return total;
    }

    calculateNights(checkin, checkout) {
        if (!checkin || !checkout) return 1;
        
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const diffTime = checkoutDate - checkinDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 1;
    }

    getNightsText(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    }

    continueToBooking() {
        if (!this.app.bookingData.checkin || !this.app.bookingData.checkout) {
            alert('Пожалуйста, выберите даты заезда и выезда');
            return;
        }

        this.app.showPaymentScreen();
    }
}