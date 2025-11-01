const app = {
    currentScreen: 'main-screen',
    selectedDates: {
        checkin: null,
        checkout: null
    },
    selectedHouse: null,
    selectedGuests: 2,
    selectedServices: [],
    currentUser: null,
    currentBooking: null,
    
    init() {
        console.log('App initialized');
        this.currentUser = database.getUser(currentUserId);
        this.bindEvents();
        this.initCalendar();
        this.updateUserInfo();
        this.initTelegram();
        this.renderLargeHouses();
        this.initSwipeNavigation();
        this.updateProfileData();
    },

    initSwipeNavigation() {
        this.setupBottomNavigation();
    },

    setupBottomNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetScreen = e.currentTarget.dataset.screen;
                this.showSwipeScreen(targetScreen);
                
                // Обновляем активное состояние
                navItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Обработчики для кнопок главного экрана
        document.getElementById('view-houses-btn')?.addEventListener('click', () => {
            this.showScreen('houses-screen');
        });
    },

    showSwipeScreen(screenId) {
        document.querySelectorAll('.swipe-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.updateProfileData();
        }
    },

    updateBottomNav(screenId) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.dataset.screen === screenId) {
                nav.classList.add('active');
            }
        });
    },

    updateProfileData() {
        if (window.profileManager) {
            profileManager.renderProfileScreen();
        }
    },

    initTelegram() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            
            Telegram.WebApp.BackButton.hide();
            Telegram.WebApp.MainButton.hide();
            
            console.log('Telegram Web App initialized');
        }
    },

    renderLargeHouses() {
        const container = document.getElementById('large-houses');
        if (!container) return;

        container.innerHTML = '';
        
        housesData.large.forEach(house => {
            const houseCard = document.createElement('div');
            houseCard.className = 'house-card';
            houseCard.dataset.houseId = house.id;
            houseCard.dataset.type = house.type;

            houseCard.innerHTML = `
                <div class="house-image">
                    <div class="image-placeholder">${house.image}</div>
                    <div class="house-badge">До ${house.max_guests} гостей</div>
                </div>
                <div class="house-info">
                    <h4>${house.name}</h4>
                    <div class="house-features">
                        <span class="feature">👥 до ${house.max_guests} чел</span>
                        <span class="feature">⏰ заезд ${house.checkin_times[0]}</span>
                    </div>
                    <div class="house-pricing">
                        <span class="price">${house.price_weekday.toLocaleString()}₽ - ${house.price_weekend.toLocaleString()}₽</span>
                        <span class="price-note">за ночь</span>
                    </div>
                </div>
            `;

            houseCard.addEventListener('click', () => {
                this.handleHouseSelection(houseCard);
            });

            container.appendChild(houseCard);
        });
    },
    
    bindEvents() {
        // Глобальный обработчик для кнопок назад
        document.addEventListener('click', (e) => {
            if (e.target.closest('.header-btn.back')) {
                this.goBack();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('#my-bookings-btn')) {
                this.showMyBookings();
            }
        });
        
        document.addEventListener('click', (e) => {
            const houseCard = e.target.closest('.house-card');
            if (houseCard && !houseCard.querySelector('.unavailable-overlay')) {
                this.handleHouseSelection(houseCard);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('#continue-to-houses')) {
                if (this.selectedDates.checkin && this.selectedDates.checkout) {
                    this.showScreen('houses-screen');
                    this.updateHousesAvailability();
                } else {
                    this.showNotification('Выберите даты заезда и выезда', 'warning');
                }
            }
        });

        // Обработчик для кнопки "Посмотреть дома" на главной
        document.addEventListener('click', (e) => {
            if (e.target.id === 'view-houses-btn' || e.target.closest('#view-houses-btn')) {
                this.showScreen('houses-screen');
            }
        });
    },

    initCalendar() {
        this.currentDate = new Date();
        this.generateCalendar();
        
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.generateCalendar();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.generateCalendar();
        });
    },

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        document.getElementById('current-month').textContent = monthNames[month];
        document.getElementById('current-year').textContent = year;

        calendarGrid.innerHTML = '';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = this.createDayElement(prevMonthLastDay - i, true);
            calendarGrid.appendChild(day);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const isPast = date < today;
            const isBooked = this.isDateBookedGlobally(date);
            
            const day = this.createDayElement(i, false, isPast, isBooked, date);
            calendarGrid.appendChild(day);
        }

        const totalCells = 42;
        const daysInCalendar = firstDayOfWeek + lastDay.getDate();
        const nextMonthDays = totalCells - daysInCalendar;
        
        for (let i = 1; i <= nextMonthDays; i++) {
            const day = this.createDayElement(i, true);
            calendarGrid.appendChild(day);
        }
    },

    createDayElement(dayNumber, isOtherMonth, isPast = false, isBooked = false, date = null) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = dayNumber;

        if (isOtherMonth) {
            day.classList.add('disabled');
        }

        if (isPast) {
            day.classList.add('disabled');
        }

        if (isBooked) {
            day.classList.add('disabled');
            day.title = 'Дата занята';
        }

        if (date) {
            const dateStr = date.toISOString().split('T')[0];
            if (this.selectedDates.checkin === dateStr || this.selectedDates.checkout === dateStr) {
                day.classList.add('selected');
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date.getTime() === today.getTime()) {
                day.classList.add('today');
            }
        }

        if (!isOtherMonth && !isPast && !isBooked && date) {
            day.dataset.date = date.toISOString().split('T')[0];
            day.addEventListener('click', () => this.handleDateSelection(date));
        }

        return day;
    },

    isDateBookedGlobally(date) {
        return false;
    },

    handleDateSelection(date) {
        const dateStr = date.toISOString().split('T')[0];

        if (!this.selectedDates.checkin) {
            this.selectedDates.checkin = dateStr;
            this.selectedDates.checkout = null;
        } else if (!this.selectedDates.checkout && dateStr > this.selectedDates.checkin) {
            this.selectedDates.checkout = dateStr;
        } else {
            this.selectedDates.checkin = dateStr;
            this.selectedDates.checkout = null;
        }

        this.generateCalendar();
        this.updateDatesPreview();
    },

    updateHousesAvailability() {
        document.querySelectorAll('.house-card').forEach(card => {
            const houseId = parseInt(card.dataset.houseId);
            const isAvailable = this.isHouseAvailableForDates(houseId);
            
            if (!isAvailable) {
                card.querySelector('.house-image').classList.add('unavailable');
                if (!card.querySelector('.unavailable-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'unavailable-overlay';
                    overlay.textContent = 'Занят';
                    card.querySelector('.house-image').appendChild(overlay);
                }
            } else {
                card.querySelector('.house-image').classList.remove('unavailable');
                const overlay = card.querySelector('.unavailable-overlay');
                if (overlay) overlay.remove();
            }
        });
    },

    isHouseAvailableForDates(houseId) {
        if (!this.selectedDates.checkin || !this.selectedDates.checkout) return true;

        let currentDate = new Date(this.selectedDates.checkin);
        const checkout = new Date(this.selectedDates.checkout);

        while (currentDate < checkout) {
            if (database.isDateBooked(houseId, currentDate)) {
                return false;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return true;
    },
    
    goBack() {
        const currentScreen = document.querySelector('.screen.active')?.id;
        const swipeScreen = document.querySelector('.swipe-screen.active')?.id;
        
        if (currentScreen && currentScreen !== 'main-screen' && currentScreen !== 'profile-screen') {
            // Находимся на экране бронирования/домов/календаря
            const screens = {
                'calendar-screen': 'main-screen',
                'houses-screen': 'main-screen',
                'house-detail-screen': 'houses-screen',
                'booking-screen': 'house-detail-screen',
                'payment-screen': 'booking-screen',
                'my-bookings-screen': 'main-screen'
            };
            
            if (screens[currentScreen]) {
                this.showScreen(screens[currentScreen]);
            } else {
                this.showScreen('main-screen');
            }
        } else if (swipeScreen === 'profile-screen') {
            // Находимся в профиле - переключаем на главную
            this.showSwipeScreen('main-screen');
            this.updateBottomNav('main-screen');
        }
    },
    
    handleHouseSelection(houseCard) {
        const houseId = parseInt(houseCard.dataset.houseId);
        const houseType = houseCard.dataset.type;
        
        let house;
        if (houseType === 'large') {
            house = housesData.large.find(h => h.id === houseId);
            this.selectedGuests = house.base_guests;
        } else if (houseType === 'couple') {
            house = housesData.couple;
            this.selectedGuests = house.max_guests;
        } else if (houseType === 'family') {
            house = housesData.family;
            this.selectedGuests = house.max_guests;
        }
        
        if (house) {
            this.selectedHouse = house;
            this.selectedServices = house.services.filter(s => s.price === 0);
            this.showHouseDetails(house);
        }
    },
    
    showScreen(screenId) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.querySelectorAll('.swipe-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Показываем/скрываем нижнюю навигацию
            const bottomNav = document.querySelector('.bottom-nav');
            if (screenId === 'main-screen' || screenId === 'profile-screen') {
                bottomNav.style.display = 'flex';
            } else {
                bottomNav.style.display = 'none';
            }
        }
    },

    updateUserInfo() {
    },
    
    showHouseDetails(house) {
        const screen = document.getElementById('house-detail-screen');
        if (!screen) return;
        
        const nights = this.calculateNights();
        const pricing = this.calculateTotalPrice(house, nights, this.selectedGuests, this.selectedServices);
        
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
                                    <div class="feature-title">Вместимость</div>
                                    <div class="feature-value">до ${house.max_guests} гостей</div>
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
                                <span class="guests-count" id="guests-count">${this.selectedGuests}</span>
                                <button class="guest-btn" id="increase-guests">+</button>
                            </div>
                            <div class="guests-note">
                                Включено ${house.base_guests} гостей<br>
                                Доплата за каждого следующего: ${house.extra_guest_price.toLocaleString()}₽/ночь
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
                                                   data-service-id="${service.id}"
                                                   ${service.price === 0 ? 'checked disabled' : ''}
                                                   ${this.selectedServices.some(s => s.id === service.id) ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="service-info">
                                                <div class="service-name">${service.name}</div>
                                                <div class="service-description">${service.description || ''}</div>
                                                <div class="service-price">
                                                    ${service.price === 0 ? 'Включено в стоимость' : service.price.toLocaleString() + '₽' + (service.unit ? ` / ${service.unit}` : '')}
                                                    ${service.note ? `<div class="service-note">${service.note}</div>` : ''}
                                                </div>
                                            </div>
                                        </label>
                                        ${service.id === 'chan' ? this.renderTimeSlider(service) : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="pricing-summary">
                            <div class="price-line">
                                <span>Проживание (${nights} ${this.getNightText(nights)})</span>
                                <span>${pricing.basePrice.toLocaleString()}₽</span>
                            </div>
                            ${pricing.extraGuestsPrice > 0 ? `
                            <div class="price-line">
                                <span>Дополнительные гости</span>
                                <span>${pricing.extraGuestsPrice.toLocaleString()}₽</span>
                            </div>
                            ` : ''}
                            ${pricing.servicesPrice > 0 ? `
                            <div class="price-line">
                                <span>Дополнительные услуги</span>
                                <span>${pricing.servicesPrice.toLocaleString()}₽</span>
                            </div>
                            ` : ''}
                            <div class="price-total">
                                <span>Итого к оплате:</span>
                                <span>${pricing.total.toLocaleString()}₽</span>
                            </div>
                        </div>

                        <button class="book-btn primary large" id="proceed-to-booking-btn">
                            Выбрать даты
                        </button>
                    </div>
                </div>
            </div>
        `;

        const proceedButton = document.getElementById('proceed-to-booking-btn');
        if (proceedButton) {
            proceedButton.onclick = () => {
                this.showCalendarScreen();
            };
        }

        if (house.type === 'large') {
            this.bindHouseDetailEvents(house);
        }

        this.bindServicesEvents(house);
        
        // Добавляем обработчики для ползунка времени
        this.bindTimeSliderEvents(house);

        this.showScreen('house-detail-screen');
    },

    showCalendarScreen() {
        if (!this.selectedHouse) {
            this.showNotification('Выберите дом для бронирования', 'warning');
            return;
        }
        this.showScreen('calendar-screen');
    },

    renderTimeSlider(service) {
        if (service.id !== 'chan') return '';
        
        const selectedChan = this.selectedServices.find(s => s.id === 'chan');
        const initialHours = selectedChan ? selectedChan.hours || 2 : 2;
        const initialPrice = service.price * initialHours;
        
        return `
            <div class="time-slider-section" data-service-id="${service.id}">
                <h5>Продолжительность аренды чана</h5>
                <div class="time-slider">
                    <div class="time-options">
                        <button class="time-option ${initialHours === 2 ? 'active' : ''}" data-hours="2">2 часа</button>
                        <button class="time-option ${initialHours === 4 ? 'active' : ''}" data-hours="4">4 часа</button>
                        <button class="time-option ${initialHours === 8 ? 'active' : ''}" data-hours="8">Вся ночь</button>
                    </div>
                    <div class="slider-container">
                        <input type="range" min="2" max="8" step="2" value="${initialHours}" class="time-slider-input" list="time-ticks">
                        <datalist id="time-ticks">
                            <option value="2" label="2ч"></option>
                            <option value="4" label="4ч"></option>
                            <option value="8" label="Вся ночь"></option>
                        </datalist>
                        <div class="slider-labels">
                            <span>2ч</span>
                            <span>4ч</span>
                            <span>Вся ночь</span>
                        </div>
                    </div>
                </div>
                <div class="selected-time">
                    Выбрано: <strong>${initialHours} ${this.getHourText(initialHours)}</strong> - ${initialPrice}₽
                </div>
            </div>
        `;
    },

    bindTimeSliderEvents(house) {
        const timeOptions = document.querySelectorAll('.time-option');
        const timeSlider = document.querySelector('.time-slider-input');
        
        if (!timeOptions.length) return;
        
        timeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const hours = parseInt(e.target.dataset.hours);
                
                // Обновляем активное состояние
                timeOptions.forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                
                // Обновляем ползунок
                if (timeSlider) {
                    timeSlider.value = hours;
                }
                
                this.updateSelectedTime(hours, house);
            });
        });
        
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                let hours = parseInt(e.target.value);
                // Привязываем к ближайшему значению (2, 4, 8)
                if (hours <= 3) hours = 2;
                else if (hours <= 6) hours = 4;
                else hours = 8;
                
                e.target.value = hours;
                
                // Обновляем активную кнопку
                timeOptions.forEach(opt => {
                    opt.classList.toggle('active', parseInt(opt.dataset.hours) === hours);
                });
                
                this.updateSelectedTime(hours, house);
            });

            // Блокируем промежуточные значения
            timeSlider.addEventListener('change', (e) => {
                let hours = parseInt(e.target.value);
                if (![2, 4, 8].includes(hours)) {
                    if (hours <= 3) hours = 2;
                    else if (hours <= 6) hours = 4;
                    else hours = 8;
                    e.target.value = hours;
                }
            });
        }
    },

    updateSelectedTime(hours, house) {
        const selectedTime = document.querySelector('.selected-time');
        const chanService = house.services.find(s => s.id === 'chan');
        const totalPrice = chanService.price * hours;
        
        if (selectedTime) {
            selectedTime.innerHTML = `Выбрано: <strong>${hours} ${this.getHourText(hours)}</strong> - ${totalPrice}₽`;
        }
        
        // Обновляем стоимость услуги в выбранных услугах
        const chanInSelected = this.selectedServices.find(s => s.id === 'chan');
        if (chanInSelected) {
            chanInSelected.hours = hours;
            chanInSelected.totalPrice = totalPrice;
        } else if (this.selectedServices.some(s => s.id === 'chan')) {
            // Если услуга уже выбрана, обновляем её
            this.selectedServices = this.selectedServices.map(service => {
                if (service.id === 'chan') {
                    return {
                        ...service,
                        hours: hours,
                        totalPrice: totalPrice
                    };
                }
                return service;
            });
        }
        
        this.updateHousePricing(house);
    },

    getHourText(hours) {
        if (hours === 1) return 'час';
        if (hours >= 2 && hours <= 4) return 'часа';
        return 'часов';
    },

    bindServicesEvents(house) {
        const serviceCheckboxes = document.querySelectorAll('#services-list input[type="checkbox"]');
        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const serviceId = e.target.dataset.serviceId;
                const service = house.services.find(s => s.id === serviceId);
                
                if (e.target.checked) {
                    // Для чана добавляем начальное время
                    const serviceToAdd = service.id === 'chan' ? 
                        { ...service, hours: 2, totalPrice: service.price * 2 } : 
                        service;
                    this.selectedServices.push(serviceToAdd);
                } else {
                    this.selectedServices = this.selectedServices.filter(s => s.id !== serviceId);
                }
                
                this.updateHousePricing(house);
            });
        });
    },
    
    bindHouseDetailEvents(house) {
        const decreaseBtn = document.getElementById('decrease-guests');
        const increaseBtn = document.getElementById('increase-guests');
        const guestsCount = document.getElementById('guests-count');

        decreaseBtn?.addEventListener('click', () => {
            if (this.selectedGuests > 1) {
                this.selectedGuests--;
                guestsCount.textContent = this.selectedGuests;
                this.updateHousePricing(house);
            }
        });

        increaseBtn?.addEventListener('click', () => {
            if (this.selectedGuests < house.max_guests) {
                this.selectedGuests++;
                guestsCount.textContent = this.selectedGuests;
                this.updateHousePricing(house);
            }
        });
    },
    
    calculateNights() {
        if (!this.selectedDates.checkin || !this.selectedDates.checkout) return 1;
        const checkinDate = new Date(this.selectedDates.checkin);
        const checkoutDate = new Date(this.selectedDates.checkout);
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    },
    
    calculateBasePrice(house, nights) {
        let total = 0;
        
        for (let i = 0; i < nights; i++) {
            const currentDate = new Date(this.selectedDates.checkin);
            currentDate.setDate(currentDate.getDate() + i);
            const dayOfWeek = currentDate.getDay();
            
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dailyPrice = isWeekend ? house.price_weekend : house.price_weekday;
            total += dailyPrice;
        }
        
        return total;
    },
    
    calculateTotalPrice(house, nights, guestsCount = null, services = []) {
        const basePrice = this.calculateBasePrice(house, nights);
        let extraGuestsPrice = 0;
        let servicesPrice = 0;

        if (house.type === 'large') {
            const actualGuests = guestsCount || house.base_guests;
            if (actualGuests > house.base_guests) {
                extraGuestsPrice = (actualGuests - house.base_guests) * house.extra_guest_price * nights;
            }
        }

        services.forEach(service => {
            if (service.price > 0) {
                // Для чана используем totalPrice если есть
                if (service.id === 'chan' && service.totalPrice) {
                    servicesPrice += service.totalPrice;
                } else if (service.unit === 'час' && service.min_hours) {
                    servicesPrice += service.price * service.min_hours;
                } else {
                    servicesPrice += service.price;
                }
            }
        });

        const total = basePrice + extraGuestsPrice + servicesPrice;

        return {
            basePrice,
            extraGuestsPrice,
            servicesPrice,
            total
        };
    },
    
    updateHousePricing(house) {
        const nights = this.calculateNights();
        const pricing = this.calculateTotalPrice(house, nights, this.selectedGuests, this.selectedServices);
        
        const basePriceElement = document.querySelector('.pricing-summary .price-line:first-child span:last-child');
        const totalElement = document.querySelector('.price-total span:last-child');
        
        if (basePriceElement) basePriceElement.textContent = pricing.basePrice.toLocaleString() + '₽';
        if (totalElement) totalElement.textContent = pricing.total.toLocaleString() + '₽';

        this.updatePricingLines(pricing);
    },

    updatePricingLines(pricing) {
        const pricingSummary = document.querySelector('.pricing-summary');
        if (!pricingSummary) return;
        
        document.querySelectorAll('.pricing-summary .price-line:not(:first-child):not(.price-total)').forEach(el => el.remove());

        if (pricing.extraGuestsPrice > 0) {
            const extraGuestsLine = document.createElement('div');
            extraGuestsLine.className = 'price-line';
            extraGuestsLine.innerHTML = `<span>Дополнительные гости</span><span>${pricing.extraGuestsPrice.toLocaleString()}₽</span>`;
            pricingSummary.insertBefore(extraGuestsLine, document.querySelector('.price-total'));
        }

        if (pricing.servicesPrice > 0) {
            const servicesLine = document.createElement('div');
            servicesLine.className = 'price-line';
            servicesLine.innerHTML = `<span>Дополнительные услуги</span><span>${pricing.servicesPrice.toLocaleString()}₽</span>`;
            pricingSummary.insertBefore(servicesLine, document.querySelector('.price-total'));
        }
    },
    
    getNightText(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    },

    showMyBookings() {
        const screen = document.getElementById('my-bookings-screen');
        if (!screen) return;

        const userBookings = database.getUserBookings(currentUserId);
        
        screen.innerHTML = `
            <header class="header">
                <button class="header-btn back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">Мои бронирования</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="user-info">
                            <div class="user-stats">
                                <div class="stat">
                                    <div class="stat-value">${this.currentUser.acoins}</div>
                                    <div class="stat-label">Acoin</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value">${this.currentUser.bookingsCount || 0}</div>
                                    <div class="stat-label">Броней</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value">${this.currentUser.level}</div>
                                    <div class="stat-label">Уровень</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bookings-list">
                    <h3>История бронирований</h3>
                    ${userBookings.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">📝</div>
                            <p>У вас пока нет бронирований</p>
                            <button class="btn-secondary" onclick="app.showScreen('main-screen')">
                                Забронировать дом
                            </button>
                        </div>
                    ` : `
                        <div class="bookings-container">
                            ${userBookings.map(booking => `
                                <div class="booking-item">
                                    <div class="booking-header">
                                        <span class="booking-number">${booking.bookingNumber}</span>
                                        <span class="booking-status ${booking.status}">${this.getStatusText(booking.status)}</span>
                                    </div>
                                    <div class="booking-details">
                                        <div class="booking-house">${booking.house.name}</div>
                                        <div class="booking-dates">${new Date(booking.dates.checkin).toLocaleDateString('ru-RU')} - ${new Date(booking.dates.checkout).toLocaleDateString('ru-RU')}</div>
                                        <div class="booking-price">${booking.total.toLocaleString()}₽</div>
                                        ${booking.paymentProof ? `
                                            <div class="payment-proof">
                                                <button class="btn-small" onclick="app.viewPaymentProof('${booking.id}')">
                                                    Посмотреть чек
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        this.showScreen('my-bookings-screen');
    },

    getStatusText(status) {
        const statuses = {
            'pending': 'Ожидает оплаты',
            'confirmed': 'Подтверждено',
            'completed': 'Завершено',
            'cancelled': 'Отменено'
        };
        return statuses[status] || status;
    },
    
    showBookingScreen() {
        if (!this.selectedHouse) {
            this.showNotification('Выберите дом для бронирования', 'warning');
            return;
        }

        if (!this.selectedDates.checkin || !this.selectedDates.checkout) {
            this.showNotification('Выберите даты заезда и выезда', 'warning');
            return;
        }
        
        if (!this.isHouseAvailableForDates(this.selectedHouse.id)) {
            this.showNotification('Дом занят на выбранные даты', 'error');
            return;
        }
        
        const screen = document.getElementById('booking-screen');
        if (!screen) return;
        
        const house = this.selectedHouse;
        const nights = this.calculateNights();
        const pricing = this.calculateTotalPrice(house, nights, this.selectedGuests, this.selectedServices);
        const cashback = loyaltySystem.calculateCashback(pricing.total, this.currentUser.level);
        const coinsEarned = this.calculateBookingCoins(pricing.total);
        
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
                <div class="booking-summary-card">
                    <h3>Ваше бронирование</h3>
                    <div class="summary-details">
                        <div class="summary-item">
                            <span>Дом:</span>
                            <span>${house.name}</span>
                        </div>
                        <div class="summary-item">
                            <span>Даты:</span>
                            <span>${new Date(this.selectedDates.checkin).toLocaleDateString('ru-RU')} - ${new Date(this.selectedDates.checkout).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div class="summary-item">
                            <span>Ночи:</span>
                            <span>${nights}</span>
                        </div>
                        <div class="summary-item">
                            <span>Гости:</span>
                            <span>${this.selectedGuests} человек</span>
                        </div>
                        ${this.selectedServices.length > 0 ? `
                        <div class="summary-item">
                            <span>Услуги:</span>
                            <span>${this.selectedServices.map(s => {
                                if (s.id === 'chan' && s.hours) {
                                    return `${s.name} (${s.hours} ${this.getHourText(s.hours)})`;
                                }
                                return s.name;
                            }).join(', ')}</span>
                        </div>
                        ` : ''}
                        <div class="summary-item total">
                            <span>К оплате:</span>
                            <span>${pricing.total.toLocaleString()}₽</span>
                        </div>
                        <div class="summary-item bonus">
                            <span>Вы получите:</span>
                            <span>+${coinsEarned} A-Coin</span>
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
                </div>

                <button class="book-btn primary large" id="confirm-booking-btn">
                    Перейти к оплате
                </button>
            </div>
        `;

        const confirmButton = document.getElementById('confirm-booking-btn');
        if (confirmButton) {
            confirmButton.onclick = () => {
                this.createBooking();
            };
        }

        this.showScreen('booking-screen');
    },

    calculateBookingCoins(bookingTotal) {
        // Минимальное начисление за бронирование: 10-100 коинов
        const minCoins = 10;
        const maxCoins = 100;
        const coins = Math.min(maxCoins, Math.max(minCoins, Math.round(bookingTotal * 0.01)));
        return coins;
    },

    createBooking() {
        const name = document.getElementById('guest-name')?.value.trim();
        const phone = document.getElementById('guest-phone')?.value.trim();
        const email = document.getElementById('guest-email')?.value.trim();

        if (!name || !phone || !email) {
            this.showNotification('Заполните все обязательные поля', 'warning');
            return;
        }

        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
            this.showNotification('Введите корректный номер телефона', 'warning');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Введите корректный email', 'warning');
            return;
        }

        const house = this.selectedHouse;
        const nights = this.calculateNights();
        const pricing = this.calculateTotalPrice(house, nights, this.selectedGuests, this.selectedServices);
        const coinsEarned = this.calculateBookingCoins(pricing.total);

        const booking = {
            id: Date.now().toString(),
            bookingNumber: 'A-' + Date.now().toString().slice(-6),
            userId: currentUserId,
            house: house,
            dates: { ...this.selectedDates },
            guests: this.selectedGuests,
            services: [...this.selectedServices],
            total: pricing.total,
            guestInfo: { name, phone, email },
            status: 'pending',
            createdAt: new Date().toISOString(),
            cashbackAwarded: 0,
            coinsEarned: coinsEarned
        };

        this.currentBooking = database.saveBooking(booking);
        this.showPaymentScreen();
    },

    showPaymentScreen() {
        const screen = document.getElementById('payment-screen');
        if (!screen || !this.currentBooking) return;

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
                <div class="payment-card">
                    <div class="payment-header">
                        <h2>Оплата бронирования</h2>
                        <div class="booking-number">№ ${this.currentBooking.bookingNumber}</div>
                    </div>
                    
                    <div class="payment-summary">
                        <div class="payment-amount">
                            <span>Сумма к оплате:</span>
                            <span class="amount">${this.currentBooking.total.toLocaleString()}₽</span>
                        </div>
                        <div class="payment-details">
                            <div class="detail">
                                <span>${this.currentBooking.house.name}</span>
                                <span>${new Date(this.currentBooking.dates.checkin).toLocaleDateString('ru-RU')} - ${new Date(this.currentBooking.dates.checkout).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    </div>

                    <div class="payment-methods">
                        <h3>Способ оплаты</h3>
                        <div class="payment-option selected">
                            <div class="payment-icon">📱</div>
                            <div class="payment-info">
                                <div class="payment-name">СБП (Система быстрых платежей)</div>
                                <div class="payment-desc">Оплата по номеру телефона</div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-instructions">
                        <h4>Инструкция по оплате:</h4>
                        <ol>
                            <li>Переведите <strong>${this.currentBooking.total.toLocaleString()}₽</strong> по реквизитам СБП</li>
                            <li>Сохраните скриншот чека об оплате</li>
                            <li>Нажмите "Я оплатил" и загрузите чек</li>
                        </ol>
                        
                        <div class="payment-details">
                            <div class="bank-info">
                                <strong>Реквизиты для перевода:</strong>
                                <div>Банк: Тинькофф</div>
                                <div>Номер: +7 (999) 123-45-67</div>
                                <div>Получатель: ИП Иванов А.С.</div>
                                <div>Сумма: ${this.currentBooking.total.toLocaleString()}₽</div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-actions">
                        <button class="btn-secondary" onclick="app.copyPaymentDetails()">
                            Скопировать реквизиты
                        </button>
                        <button class="book-btn primary large" id="confirm-payment-btn">
                            Я оплатил
                        </button>
                    </div>

                    <div class="payment-note">
                        После проверки оплаты бронь будет подтверждена автоматически
                    </div>
                </div>
            </div>
        `;

        const confirmButton = document.getElementById('confirm-payment-btn');
        if (confirmButton) {
            confirmButton.onclick = () => {
                this.confirmPayment();
            };
        }

        this.showScreen('payment-screen');
    },

    copyPaymentDetails() {
        const text = `Реквизиты для оплаты:\nБанк: Тинькофф\nНомер: +7 (999) 123-45-67\nСумма: ${this.currentBooking.total.toLocaleString()}₽\nНазначение: Бронирование ${this.currentBooking.bookingNumber}`;
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Реквизиты скопированы в буфер', 'success');
        });
    },

    confirmPayment() {
        const proofUrl = '';
        
        const payment = {
            bookingId: this.currentBooking.id,
            amount: this.currentBooking.total,
            method: 'sbp',
            status: 'completed',
            proofUrl: proofUrl,
            paidAt: new Date().toISOString()
        };

        database.savePayment(payment);

        const updatedBooking = database.updateBooking(this.currentBooking.id, {
            status: 'confirmed',
            confirmedAt: new Date().toISOString()
        });

        // Начисляем A-Coin за бронирование
        database.addAcoins(currentUserId, this.currentBooking.coinsEarned, `Бронирование ${this.currentBooking.bookingNumber}`);

        const userBookings = database.getUserBookings(currentUserId);
        const confirmedBookings = userBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
        const bookingsCount = confirmedBookings.length;
        const newLevel = loyaltySystem.getUserLevel(bookingsCount);
        
        database.updateUser(currentUserId, {
            bookingsCount: bookingsCount,
            level: newLevel,
            totalSpent: (this.currentUser.totalSpent || 0) + this.currentBooking.total
        });

        this.currentUser = database.getUser(currentUserId);

        this.showNotification(`Бронь подтверждена! Дом "${this.currentBooking.house.name}" забронирован. +${this.currentBooking.coinsEarned} A-Coin`, 'success');

        setTimeout(() => {
            this.showScreen('main-screen');
            this.resetSelection();
        }, 3000);
    },

    viewPaymentProof(bookingId) {
        const payment = database.getPaymentByBookingId(bookingId);
        if (payment && payment.proofUrl) {
            window.open(payment.proofUrl, '_blank');
        } else {
            this.showNotification('Чек оплаты не найден', 'warning');
        }
    },

    resetSelection() {
        this.selectedDates = { checkin: null, checkout: null };
        this.selectedHouse = null;
        this.selectedGuests = 2;
        this.selectedServices = [];
        this.currentBooking = null;
        this.updateDatesPreview();
        this.generateCalendar();
    },
    
    updateDatesPreview() {
        const checkinPreview = document.getElementById('checkin-preview');
        const checkoutPreview = document.getElementById('checkout-preview');
        const nightsCount = document.getElementById('nights-count');
        const continueBtn = document.getElementById('continue-to-houses');
        const headerDates = document.getElementById('header-dates');

        if (this.selectedDates.checkin) {
            const checkinDate = new Date(this.selectedDates.checkin);
            checkinPreview.textContent = checkinDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            
            if (this.selectedDates.checkout) {
                const checkoutDate = new Date(this.selectedDates.checkout);
                checkoutPreview.textContent = checkoutDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                
                const nights = this.calculateNights();
                nightsCount.textContent = `${nights} ${this.getNightText(nights)}`;
                
                if (continueBtn) continueBtn.disabled = false;
                if (headerDates) {
                    headerDates.textContent = `${checkinDate.getDate()}-${checkoutDate.getDate()} ${checkinDate.toLocaleDateString('ru-RU', { month: 'short' })}`;
                }
            } else {
                checkoutPreview.textContent = '--';
                nightsCount.textContent = '0 ночей';
                if (continueBtn) continueBtn.disabled = true;
            }
        } else {
            checkinPreview.textContent = '--';
            checkoutPreview.textContent = '--';
            nightsCount.textContent = '0 ночей';
            if (continueBtn) continueBtn.disabled = true;
        }
    },
    
    showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});