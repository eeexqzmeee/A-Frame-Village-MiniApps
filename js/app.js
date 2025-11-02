class App {
    constructor() {
        this.currentScreen = 'main-screen';
        this.selectedDates = {
            checkin: null,
            checkout: null
        };
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.selectedHouse = null;
        this.userData = null;
        
        this.init();
    }

    init() {
        console.log('🚀 App initializing...');
        this.initNavigation();
        this.initCalendar();
        this.initHouses();
        this.initProfile();
        this.loadUserData();
        
        // Показываем главный экран
        this.showScreen('main-screen');
        
        console.log('✅ App initialized');
    }

    initNavigation() {
        console.log('🔧 Initializing navigation...');
        
        // Bottom navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetScreen = item.getAttribute('data-screen');
                console.log('📱 Navigation clicked:', targetScreen);
                this.showScreen(targetScreen);
            });
        });

        // Кнопка "Посмотреть дома"
        document.addEventListener('click', (e) => {
            if (e.target.id === 'view-houses-btn' || e.target.closest('#view-houses-btn')) {
                this.showScreen('calendar-screen');
            }
            if (e.target.id === 'view-houses-btn-2' || e.target.closest('#view-houses-btn-2')) {
                this.showScreen('calendar-screen');
            }
        });

        // Кнопка продолжения в календаре
        document.addEventListener('click', (e) => {
            if (e.target.id === 'continue-to-houses' || e.target.closest('#continue-to-houses')) {
                if (this.selectedDates.checkin && this.selectedDates.checkout) {
                    this.showScreen('houses-screen');
                    this.updateHeaderDates();
                } else {
                    alert('Выберите даты заезда и выезда');
                }
            }
        });

        // Кнопки назад
        document.addEventListener('click', (e) => {
            if (e.target.closest('.header-btn.back')) {
                this.goBack();
            }
        });

        console.log('✅ Navigation initialized');
    }

    showScreen(screenId) {
        console.log('🔄 Showing screen:', screenId);
        
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем целевой экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Обновляем активное состояние навигации
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.classList.remove('active');
                if (nav.getAttribute('data-screen') === screenId) {
                    nav.classList.add('active');
                }
            });
            
            console.log('✅ Screen shown:', screenId);
        } else {
            console.error('❌ Screen not found:', screenId);
        }
    }

    goBack() {
        console.log('↩️ Going back from:', this.currentScreen);
        
        const screenHistory = {
            'calendar-screen': 'main-screen',
            'houses-screen': 'calendar-screen',
            'house-detail-screen': 'houses-screen',
            'booking-screen': 'house-detail-screen',
            'payment-screen': 'booking-screen'
        };

        const previousScreen = screenHistory[this.currentScreen];
        if (previousScreen) {
            this.showScreen(previousScreen);
        } else {
            // Если экран не в истории, возвращаемся на главную
            this.showScreen('main-screen');
        }
    }

    initCalendar() {
        console.log('📅 Initializing calendar...');
        this.renderCalendar();
        
        // Навигация по месяцам
        document.addEventListener('click', (e) => {
            if (e.target.closest('#prev-month')) {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderCalendar();
            }
            
            if (e.target.closest('#next-month')) {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar();
            }
        });
    }

    renderCalendar() {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        const monthElement = document.getElementById('current-month');
        const yearElement = document.getElementById('current-year');
        const calendarGrid = document.getElementById('calendar-grid');

        if (!monthElement || !yearElement || !calendarGrid) return;

        monthElement.textContent = monthNames[this.currentMonth];
        yearElement.textContent = this.currentYear;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

        calendarGrid.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();

            if (currentDate.getMonth() !== this.currentMonth) {
                dayElement.classList.add('disabled');
            } else {
                if (currentDate < today) {
                    dayElement.classList.add('disabled');
                } else {
                    dayElement.addEventListener('click', () => this.selectDate(currentDate));
                }

                if (this.isToday(currentDate)) {
                    dayElement.classList.add('today');
                }

                if (this.isDateSelected(currentDate)) {
                    dayElement.classList.add('selected');
                }
            }

            calendarGrid.appendChild(dayElement);
        }

        this.updateDatesPreview();
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    isDateSelected(date) {
        return (this.selectedDates.checkin && this.isSameDate(date, this.selectedDates.checkin)) ||
               (this.selectedDates.checkout && this.isSameDate(date, this.selectedDates.checkout));
    }

    isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    selectDate(date) {
        if (!this.selectedDates.checkin || (this.selectedDates.checkin && this.selectedDates.checkout)) {
            this.selectedDates.checkin = date;
            this.selectedDates.checkout = null;
        } else if (this.selectedDates.checkin && !this.selectedDates.checkout) {
            if (date > this.selectedDates.checkin) {
                this.selectedDates.checkout = date;
            } else {
                this.selectedDates.checkin = date;
                this.selectedDates.checkout = null;
            }
        }

        this.updateDatesPreview();
        this.renderCalendar();
    }

    updateDatesPreview() {
        const checkinPreview = document.getElementById('checkin-preview');
        const checkoutPreview = document.getElementById('checkout-preview');
        const nightsCount = document.getElementById('nights-count');
        const continueBtn = document.getElementById('continue-to-houses');

        if (!checkinPreview || !checkoutPreview || !nightsCount || !continueBtn) return;

        if (this.selectedDates.checkin) {
            checkinPreview.textContent = this.formatDate(this.selectedDates.checkin);
        } else {
            checkinPreview.textContent = '--';
        }

        if (this.selectedDates.checkout) {
            checkoutPreview.textContent = this.formatDate(this.selectedDates.checkout);
            const nights = Math.ceil((this.selectedDates.checkout - this.selectedDates.checkin) / (1000 * 60 * 60 * 24));
            nightsCount.textContent = `${nights} ночей`;
            continueBtn.disabled = false;
        } else {
            checkoutPreview.textContent = '--';
            nightsCount.textContent = '0 ночей';
            continueBtn.disabled = true;
        }
    }

    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
    }

    updateHeaderDates() {
        const headerDates = document.getElementById('header-dates');
        if (headerDates && this.selectedDates.checkin && this.selectedDates.checkout) {
            headerDates.textContent = 
                `${this.formatDate(this.selectedDates.checkin)} - ${this.formatDate(this.selectedDates.checkout)}`;
        } else if (headerDates) {
            headerDates.textContent = 'Выберите даты';
        }
    }

    initHouses() {
        console.log('🏠 Initializing houses...');
        this.renderLargeHouses();
        
        // Обработчики для домов
        document.addEventListener('click', (e) => {
            const houseCard = e.target.closest('.house-card');
            if (houseCard) {
                const houseId = houseCard.getAttribute('data-house-id');
                const houseType = houseCard.getAttribute('data-type');
                this.selectHouse(houseId, houseType);
            }
        });
    }

    renderLargeHouses() {
        const largeHousesContainer = document.getElementById('large-houses');
        if (!largeHousesContainer) return;
        
        largeHousesContainer.innerHTML = '';

        for (let i = 1; i <= 6; i++) {
            const houseCard = document.createElement('div');
            houseCard.className = 'house-card';
            houseCard.setAttribute('data-house-id', i.toString());
            houseCard.setAttribute('data-type', 'large');
            
            houseCard.innerHTML = `
                <div class="house-image">
                    <div class="image-placeholder">🏠</div>
                    <div class="house-badge">Большой дом</div>
                </div>
                <div class="house-info">
                    <h4>Большой дом ${i}</h4>
                    <div class="house-features">
                        <span class="feature">👥 до 12 гостей</span>
                        <span class="feature">⏰ 13:00-11:00</span>
                    </div>
                    <div class="house-pricing">
                        <span class="price">15 000₽ - 25 000₽</span>
                        <span class="price-note">за ночь</span>
                    </div>
                </div>
            `;
            
            largeHousesContainer.appendChild(houseCard);
        }
    }

    selectHouse(houseId, houseType) {
        console.log('🏠 House selected:', houseId, houseType);
        
        let house;
        if (houseType === 'large') {
            house = {
                id: parseInt(houseId),
                type: 'large',
                name: `Большой дом ${houseId}`,
                description: 'Просторный дом с сауной для больших компаний',
                max_guests: 12,
                base_guests: 6,
                extra_guest_price: 1000,
                price_weekday: 15000,
                price_weekend: 25000,
                checkin_times: ['13:00', '15:00', '17:00'],
                checkout_time: '11:00',
                image: '🏠',
                services: [
                    { name: 'Сауна', description: '3 часа включено', price: 0, unit: 'сеанс' },
                    { name: 'Деревянная купель', description: 'Дополнительные часы', price: 2000, unit: 'час', min_hours: 2 }
                ]
            };
        } else if (houseType === 'couple') {
            house = {
                id: 7,
                type: 'couple',
                name: 'Дом для двоих',
                description: 'Уютный дом для романтического отдыха',
                max_guests: 2,
                base_guests: 2,
                price_weekday: 8000,
                price_weekend: 10000,
                checkin_times: ['13:00'],
                checkout_time: '11:00',
                image: '❤️',
                services: [
                    { name: 'Романтический ужин', description: 'Свечи и цветы', price: 3000 }
                ]
            };
        } else if (houseType === 'family') {
            house = {
                id: 8,
                type: 'family',
                name: 'Дом на четверых',
                description: 'Комфортабельный дом для семейного отдыха',
                max_guests: 4,
                base_guests: 4,
                price_weekday: 10000,
                price_weekend: 12000,
                checkin_times: ['13:00'],
                checkout_time: '11:00',
                image: '👨‍👩‍👧‍👦',
                services: [
                    { name: 'Детская кроватка', description: 'Для маленьких гостей', price: 0 },
                    { name: 'Настольные игры', description: 'Набор для всей семьи', price: 500 }
                ]
            };
        }

        if (house) {
            this.selectedHouse = house;
            this.showHouseDetails(house);
        }
    }

    showHouseDetails(house) {
        console.log('🏠 Showing house details:', house.name);
        
        const screen = document.getElementById('house-detail-screen');
        if (!screen) return;

        const dates = this.selectedDates;
        const nights = dates.checkin && dates.checkout ? 
            Math.ceil((dates.checkout - dates.checkin) / (1000 * 60 * 60 * 24)) : 1;
        const totalPrice = nights * house.price_weekday; // Простой расчет

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
                                    <span>Проживание (${nights} ночей)</span>
                                    <span>${totalPrice.toLocaleString()}₽</span>
                                </div>
                                <div class="price-total">
                                    <span>Итого</span>
                                    <span>${totalPrice.toLocaleString()}₽</span>
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
                            <span class="price-badge">${totalPrice.toLocaleString()}₽</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Обработчики для экрана деталей
        const backBtn = screen.querySelector('.header-btn.back');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        const bookBtn = screen.querySelector('#book-now-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                this.showScreen('booking-screen');
            });
        }

        this.showScreen('house-detail-screen');
    }

    initProfile() {
        console.log('👤 Initializing profile...');
        
        // Реферальная система
        document.addEventListener('click', (e) => {
            if (e.target.id === 'copy-referral-btn' || e.target.closest('#copy-referral-btn')) {
                const referralLink = 'https://t.me/aframe_village_bot?start=ref_' + (this.userData?.id || 'user');
                navigator.clipboard.writeText(referralLink).then(() => {
                    alert('Реферальная ссылка скопирована!');
                });
            }
        });

        // Магазин
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-small');
            if (btn) {
                const offer = btn.getAttribute('data-offer');
                this.purchaseOffer(offer);
            }
        });

        // Обратная связь
        document.addEventListener('click', (e) => {
            if (e.target.id === 'suggestion-btn' || e.target.closest('#suggestion-btn')) {
                this.openFeedback('suggestion');
            }
            if (e.target.id === 'feedback-btn' || e.target.closest('#feedback-btn')) {
                this.openFeedback('review');
            }
        });
    }

    purchaseOffer(offer) {
        const offers = {
            discount_10: { cost: 500, name: 'Скидка 10%' },
            free_sauna: { cost: 300, name: 'Бесплатная сауна' },
            late_checkout: { cost: 200, name: 'Поздний выезд' }
        };

        const selectedOffer = offers[offer];
        if (selectedOffer) {
            if (this.userData.coins >= selectedOffer.cost) {
                this.userData.coins -= selectedOffer.cost;
                this.updateProfileData();
                alert(`Вы приобрели: ${selectedOffer.name}`);
            } else {
                alert('Недостаточно A-Coin');
            }
        }
    }

    openFeedback(type) {
        const message = type === 'suggestion' ? 
            'Напишите ваше предложение по улучшению:' : 
            'Оставьте ваш отзыв:';
        
        const userInput = prompt(message);
        if (userInput) {
            alert('Спасибо за ваш отзыв!');
        }
    }

    loadUserData() {
        this.userData = {
            id: '12345',
            name: 'Алексей Иванов',
            level: 'Bronze',
            coins: 1000,
            referrals: 3,
            earnedCoins: 1500
        };
        
        this.updateProfileData();
    }

    updateProfileData() {
        if (!this.userData) return;

        const userName = document.querySelector('.user-name');
        const userId = document.querySelector('.user-id');
        
        if (userName) userName.textContent = this.userData.name;
        if (userId) userId.textContent = `ID: ${this.userData.id}`;
        
        // Обновляем статистику
        document.querySelectorAll('.stat-card .stat-value').forEach(stat => {
            const label = stat.nextElementSibling.textContent;
            if (label.includes('Уровень')) stat.textContent = this.userData.level;
            if (label.includes('A-Coin')) stat.textContent = this.userData.coins;
            if (label.includes('Рефералы')) stat.textContent = this.userData.referrals;
        });

        const coinBalance = document.querySelector('.coin-balance');
        if (coinBalance) {
            coinBalance.textContent = `Баланс: ${this.userData.coins} A-Coin`;
        }
        
        const referralStats = document.querySelectorAll('.referral-stat strong');
        if (referralStats[0]) referralStats[0].textContent = `${this.userData.referrals} человек`;
        if (referralStats[1]) referralStats[1].textContent = `${this.userData.earnedCoins} A-Coin`;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM Content Loaded');
    window.app = new App();
});