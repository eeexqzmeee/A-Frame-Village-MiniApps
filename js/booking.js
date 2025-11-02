class BookingManager {
    constructor(app) {
        this.app = app;
        this.selectedServices = [];
        this.totalGuests = 8;
        this.pricePerExtraGuest = 1000;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initScrollReveal();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#continue-to-dates')) {
                this.continueToDates();
            }
        });
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

    renderHouseDetails(house) {
        const screen = document.getElementById('house-detail-screen');
        if (!screen) return;

        const selectedDates = window.calendar ? window.calendar.selectedDates : {};
        const nightsCount = this.calculateNights(selectedDates.checkin, selectedDates.checkout);
        const basePrice = this.calculateBasePrice(house, nightsCount);
        const extraGuestsPrice = this.calculateExtraGuestsPrice();
        const totalPrice = basePrice + extraGuestsPrice;
        
        this.app.bookingData = {
            house: house,
            checkin: selectedDates.checkin,
            checkout: selectedDates.checkout,
            nights: nightsCount,
            guests: this.totalGuests,
            basePrice: basePrice,
            extraGuestsPrice: extraGuestsPrice,
            totalPrice: totalPrice,
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
                    <div class="house-gallery scroll-reveal">
                        <div class="main-image">
                            <div class="image-placeholder large">${house.images && house.images.length > 0 ? house.images[0] : '🏠'}</div>
                        </div>
                    </div>

                    <div class="house-details">
                        <div class="detail-section scroll-reveal">
                            <h3>Количество гостей</h3>
                            <div class="guests-selector-main">
                                <div class="guests-header-main">
                                    <div class="guests-info-main">
                                        <div class="guests-icon">👥</div>
                                        <div class="guests-text">
                                            <div class="guests-label">Сколько гостей будет проживать?</div>
                                            <div class="guests-description">Включено до 8 гостей • Максимум ${house.capacity} гостей</div>
                                        </div>
                                    </div>
                                    <div class="guests-counter-main">
                                        <button class="guest-btn-main minus" ${this.totalGuests <= 1 ? 'disabled' : ''}>−</button>
                                        <span class="guests-count-main">${this.totalGuests}</span>
                                        <button class="guest-btn-main plus" ${this.totalGuests >= house.capacity ? 'disabled' : ''}>+</button>
                                    </div>
                                </div>
                                ${this.totalGuests > 8 ? `
                                    <div class="guests-extra-price">
                                        💰 Доплата за ${this.totalGuests - 8} гостей: ${extraGuestsPrice.toLocaleString()}₽
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <div class="detail-section scroll-reveal">
                            <h3>Описание</h3>
                            <p>${house.description}</p>
                        </div>

                        <div class="detail-section scroll-reveal">
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

                        ${house.services && house.services.length > 0 ? `
                            <div class="detail-section scroll-reveal">
                                <h3>Дополнительные услуги</h3>
                                <div class="services-list">
                                    ${house.services.map(service => this.renderService(service)).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="booking-panel">
                        <div class="price-summary">
                            <div class="price-item">
                                <span>Проживание (${nightsCount} ${this.getNightsText(nightsCount)})</span>
                                <span>${basePrice.toLocaleString()}₽</span>
                            </div>
                            ${this.totalGuests > 8 ? `
                                <div class="price-item">
                                    <span>Доплата за ${this.totalGuests - 8} гостей</span>
                                    <span>${extraGuestsPrice.toLocaleString()}₽</span>
                                </div>
                            ` : ''}
                            ${this.selectedServices.map(service => `
                                <div class="price-item">
                                    <span>${service.name}${service.selectedDuration ? ' - ' + service.selectedDuration.label : service.hours ? ' - ' + service.hours + ' ч' : ''}</span>
                                    <span>${service.totalPrice.toLocaleString()}₽</span>
                                </div>
                            `).join('')}
                            <div class="price-total">
                                <span>Итого</span>
                                <span>${this.calculateTotal(basePrice, extraGuestsPrice).toLocaleString()}₽</span>
                            </div>
                        </div>

                        <button class="book-btn primary" id="continue-to-dates">
                            Выбрать даты
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindHouseDetailEvents(house);
        this.updateServiceSelections();
        this.initScrollReveal();
        this.bindGuestsEvents(house);
    }

    bindGuestsEvents(house) {
        document.querySelectorAll('.guest-btn-main').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isPlus = e.target.classList.contains('plus');
                
                if (isPlus && this.totalGuests < house.capacity) {
                    this.totalGuests++;
                } else if (!isPlus && this.totalGuests > 1) {
                    this.totalGuests--;
                }

                this.updateGuestsDisplay(house);
                this.updateBookingData(house);
            });
        });
    }

    updateGuestsDisplay(house) {
        document.querySelectorAll('.guests-count-main').forEach(el => {
            el.textContent = this.totalGuests;
        });

        document.querySelectorAll('.guest-btn-main.minus').forEach(btn => {
            btn.disabled = this.totalGuests <= 1;
        });
        document.querySelectorAll('.guest-btn-main.plus').forEach(btn => {
            btn.disabled = this.totalGuests >= house.capacity;
        });

        this.updateExtraGuestsInfo();
    }

    updateExtraGuestsInfo() {
        const extraGuestsPrice = this.calculateExtraGuestsPrice();
        const extraPriceElement = document.querySelector('.guests-extra-price');
        const guestsSelector = document.querySelector('.guests-selector-main');
        
        if (this.totalGuests > 8) {
            const extraGuests = this.totalGuests - 8;
            
            if (!extraPriceElement) {
                const extraDiv = document.createElement('div');
                extraDiv.className = 'guests-extra-price';
                guestsSelector.appendChild(extraDiv);
            }
            
            document.querySelector('.guests-extra-price').innerHTML = 
                `💰 Доплата за ${extraGuests} гостей: ${extraGuestsPrice.toLocaleString()}₽`;
        } else if (extraPriceElement) {
            extraPriceElement.remove();
        }
    }

    updateBookingData(house) {
        const selectedDates = window.calendar ? window.calendar.selectedDates : {};
        const nightsCount = this.calculateNights(selectedDates.checkin, selectedDates.checkout);
        const basePrice = this.calculateBasePrice(house, nightsCount);
        const extraGuestsPrice = this.calculateExtraGuestsPrice();
        const totalPrice = basePrice + extraGuestsPrice;

        this.app.bookingData = {
            ...this.app.bookingData,
            guests: this.totalGuests,
            nights: nightsCount,
            basePrice: basePrice,
            extraGuestsPrice: extraGuestsPrice,
            totalPrice: totalPrice
        };

        this.updatePriceDisplay(house, basePrice, extraGuestsPrice);
    }

    calculateExtraGuestsPrice() {
        const extraGuests = Math.max(0, this.totalGuests - 8);
        return extraGuests * this.pricePerExtraGuest;
    }

    calculateBasePrice(house, nights) {
        const basePricePerNight = house.price || 15000;
        return basePricePerNight * nights;
    }

    calculateTotal(basePrice, extraGuestsPrice) {
        let total = basePrice + extraGuestsPrice;
        this.selectedServices.forEach(service => {
            total += service.totalPrice;
        });
        return total;
    }

    updatePriceDisplay(house, basePrice, extraGuestsPrice) {
        const total = this.calculateTotal(basePrice, extraGuestsPrice);
        
        const totalElement = document.querySelector('.booking-panel .price-total span:last-child');
        if (totalElement) {
            totalElement.textContent = `${total.toLocaleString()}₽`;
        }

        const basePriceElement = document.querySelector('.price-item:first-child .price-value-final');
        if (basePriceElement) {
            basePriceElement.textContent = `${basePrice.toLocaleString()}₽`;
        }

        const servicesContainer = document.querySelector('.booking-panel .price-summary');
        if (servicesContainer) {
            const oldExtraGuestsRow = servicesContainer.querySelector('.price-item:nth-child(2)');
            if (oldExtraGuestsRow && oldExtraGuestsRow.textContent.includes('доплата')) {
                oldExtraGuestsRow.remove();
            }

            if (this.totalGuests > 8) {
                const extraGuestsRow = document.createElement('div');
                extraGuestsRow.className = 'price-item';
                extraGuestsRow.innerHTML = `
                    <span>Доплата за ${this.totalGuests - 8} гостей</span>
                    <span>${extraGuestsPrice.toLocaleString()}₽</span>
                `;
                
                const basePriceRow = servicesContainer.querySelector('.price-item:first-child');
                basePriceRow.parentNode.insertBefore(extraGuestsRow, basePriceRow.nextSibling);
            }

            const existingServiceItems = servicesContainer.querySelectorAll('.price-item:not(:first-child):not(:nth-child(2)):not(.price-total)');
            existingServiceItems.forEach(item => {
                if (!item.textContent.includes('доплата')) {
                    item.remove();
                }
            });

            this.selectedServices.forEach(service => {
                const serviceElement = document.createElement('div');
                serviceElement.className = 'price-item';
                serviceElement.innerHTML = `
                    <span>${service.name}${service.selectedDuration ? ' - ' + service.selectedDuration.label : service.hours ? ' - ' + service.hours + ' ч' : ''}</span>
                    <span>${service.totalPrice.toLocaleString()}₽</span>
                `;
                servicesContainer.insertBefore(serviceElement, servicesContainer.querySelector('.price-total'));
            });
        }
    }

    renderService(service) {
        const isChaanService = service.name.toLowerCase().includes('чан') || service.name.toLowerCase().includes('купель');
        
        return `
            <div class="service-item scroll-reveal" data-service="${service.name}">
                <div class="service-header">
                    <div class="service-info">
                        <h4>${service.name}</h4>
                        <p>${service.description}</p>
                    </div>
                    <div class="service-price">
                        ${service.price > 0 ? `${service.price.toLocaleString()}₽/${service.unit}` : 'Бесплатно'}
                    </div>
                </div>
                <div class="service-controls">
                    ${isChaanService ? `
                        <div class="service-option-buttons">
                            <button class="service-option-btn ${!this.isServiceSelected(service.name) ? 'active' : ''}" 
                                    data-option="not-needed">
                                Не нужна услуга
                            </button>
                            ${service.durations ? service.durations.map((duration, index) => `
                                <button class="service-option-btn ${this.isServiceSelectedWithDuration(service.name, duration.value) ? 'active' : ''}" 
                                        data-option="${duration.value}" 
                                        data-price="${duration.price}">
                                    ${duration.label} - ${duration.price.toLocaleString()}₽
                                </button>
                            `).join('') : ''}
                        </div>
                    ` : `
                        <div class="duration-selector">
                            <label>Продолжительность:</label>
                            <div class="duration-options">
                                ${service.durations ? service.durations.map(duration => `
                                    <button class="duration-option ${this.isServiceSelectedWithDuration(service.name, duration.value) ? 'active' : ''}" 
                                            data-duration="${duration.value}" 
                                            data-price="${duration.price}">
                                        ${duration.label} - ${duration.price.toLocaleString()}₽
                                    </button>
                                `).join('') : `
                                    <div class="duration-slider-container">
                                        <input type="range" class="duration-slider" 
                                               min="${service.min_hours || 1}" 
                                               max="6" 
                                               value="${this.getServiceHours(service.name) || service.min_hours || 2}" 
                                               step="1">
                                        <div class="slider-labels">
                                            <span>${service.min_hours || 1} ч</span>
                                            <span class="slider-value">${this.getServiceHours(service.name) || service.min_hours || 2} ч</span>
                                            <span>6 ч</span>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    `}
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

                serviceItem.querySelectorAll('.duration-option').forEach(opt => {
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

        document.querySelectorAll('.service-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceItem = e.target.closest('.service-item');
                const serviceName = serviceItem.dataset.service;
                const option = e.target.dataset.option;
                
                serviceItem.querySelectorAll('.service-option-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');

                if (option === 'not-needed') {
                    this.selectedServices = this.selectedServices.filter(s => s.name !== serviceName);
                } else {
                    const duration = parseInt(option);
                    const price = parseInt(e.target.dataset.price);
                    const service = house.services.find(s => s.name === serviceName);
                    const selectedDuration = service.durations.find(d => d.value === duration);

                    this.updateServiceSelection(house, serviceName, duration, price, selectedDuration);
                }

                this.updatePriceDisplay(house, this.app.bookingData.basePrice, this.app.bookingData.extraGuestsPrice);
            });
        });
    }

    isServiceSelected(serviceName) {
        return this.selectedServices.some(s => s.name === serviceName);
    }

    isServiceSelectedWithDuration(serviceName, duration) {
        return this.selectedServices.some(s => s.name === serviceName && s.hours === duration);
    }

    getServiceHours(serviceName) {
        const service = this.selectedServices.find(s => s.name === serviceName);
        return service ? service.hours : null;
    }

    updateServiceSelection(house, serviceName, duration, totalPrice, selectedDuration = null) {
        const service = house.services.find(s => s.name === serviceName);

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
        this.updatePriceDisplay(house, this.app.bookingData.basePrice, this.app.bookingData.extraGuestsPrice);
    }

    updateServiceSelections() {
        this.selectedServices.forEach(service => {
            const serviceElement = document.querySelector(`[data-service="${service.name}"]`);
            if (serviceElement) {
                const isChaanService = service.name.toLowerCase().includes('чан') || service.name.toLowerCase().includes('купель');
                
                if (isChaanService) {
                    const optionBtn = serviceElement.querySelector(`[data-option="${service.hours}"]`);
                    if (optionBtn) {
                        serviceElement.querySelectorAll('.service-option-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        optionBtn.classList.add('active');
                    }
                } else if (service.selectedDuration) {
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

    continueToDates() {
        if (!this.app.selectedHouse) {
            alert('Пожалуйста, выберите дом');
            return;
        }

        this.app.showScreen('calendar-screen');
    }
}