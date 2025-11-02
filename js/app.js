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
        this.initNavigation();
        this.initCalendar();
        this.initHouses();
        this.initProfile();
        this.initEventListeners();
        this.loadUserData();
        
        // Инициализируем менеджеры
        if (window.calendar) {
            window.calendar.selectedDates = this.selectedDates;
        }
    }

    initNavigation() {
        // Инициализация bottom navigation
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetScreen = item.getAttribute('data-screen');
                this.showScreen(targetScreen);
                
                // Обновляем активное состояние навигации
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Обработчики для кнопок назад
        document.addEventListener('click', (e) => {
            if (e.target.closest('.header-btn.back')) {
                this.goBack();
            }
        });

        // Кнопка "Посмотреть дома" на главной
        const viewHousesBtn = document.getElementById('view-houses-btn');
        if (viewHousesBtn) {
            viewHousesBtn.addEventListener('click', () => {
                this.showScreen('calendar-screen');
            });
        }

        // Кнопка продолжения в календаре
        const continueBtn = document.getElementById('continue-to-houses');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                if (this.selectedDates.checkin && this.selectedDates.checkout) {
                    this.showScreen('houses-screen');
                    this.updateHeaderDates();
                    
                    // Обновляем доступность домов
                    if (window.housesManager) {
                        window.housesManager.updateAvailability();
                    }
                } else {
                    this.showNotification('Выберите даты заезда и выезда');
                }
            });
        }
    }

    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        
        // Скрываем все экраны
        document.querySelectorAll('.screen, .swipe-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем целевой экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Обновляем навигацию для основных экранов
            if (screenId === 'main-screen' || screenId === 'profile-screen') {
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.getAttribute('data-screen') === screenId) {
                        nav.classList.add('active');
                    }
                });
            }
        }
    }

    showHouseDetails(house) {
        this.selectedHouse = house;
        if (window.bookingManager) {
            window.bookingManager.renderHouseDetail(house);
        }
        this.showScreen('house-detail-screen');
    }

    goBack() {
        console.log('Going back from:', this.currentScreen);
        
        const screenHistory = {
            'calendar-screen': 'main-screen',
            'houses-screen': 'calendar-screen',
            'house-detail-screen': 'houses-screen',
            'booking-screen': 'house-detail-screen',
            'payment-screen': 'booking-screen',
            'profile-screen': 'main-screen'
        };

        const previousScreen = screenHistory[this.currentScreen];
        if (previousScreen) {
            this.showScreen(previousScreen);
        } else {
            // Если нет в истории, показываем главную
            this.showScreen('main-screen');
        }
    }

    initCalendar() {
        this.renderCalendar();
        
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderCalendar();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar();
            });
        }
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
                } else if (this.isDateInRange(currentDate)) {
                    dayElement.classList.add('range');
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

    isDateInRange(date) {
        if (!this.selectedDates.checkin || !this.selectedDates.checkout) return false;
        
        return date > this.selectedDates.checkin && 
               date < this.selectedDates.checkout &&
               !this.isSameDate(date, this.selectedDates.checkin) &&
               !this.isSameDate(date, this.selectedDates.checkout);
    }

    isSameDate(date1, date2) {
        if (!date1 || !date2) return false;
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
        
        // Синхронизируем с calendar manager
        if (window.calendar) {
            window.calendar.selectedDates = {...this.selectedDates};
            window.calendar.generateCalendar();
        }
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
        this.renderLargeHouses();
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
            
            houseCard.addEventListener('click', () => {
                this.selectHouse(i, 'large');
            });
            
            largeHousesContainer.appendChild(houseCard);
        }

        // Обработчики для готовых домов
        document.querySelectorAll('.house-card[data-house-id="7"], .house-card[data-house-id="8"]').forEach(card => {
            card.addEventListener('click', () => {
                const houseId = card.getAttribute('data-house-id');
                const houseType = card.getAttribute('data-type');
                this.selectHouse(houseId, houseType);
            });
        });
    }

    selectHouse(houseId, houseType) {
        let house;
        if (houseType === 'large') {
            house = housesData.large.find(h => h.id === parseInt(houseId)) || housesData.large[0];
            if (house) {
                house.id = parseInt(houseId);
                house.name = `Большой дом ${houseId}`;
            }
        } else if (houseType === 'couple') {
            house = housesData.couple;
        } else if (houseType === 'family') {
            house = housesData.family;
        }

        if (house) {
            this.selectedHouse = house;
            this.showHouseDetails(house);
        }
    }

    initProfile() {
        this.initReferralSystem();
        this.initShop();
        this.initFeedback();
    }

    initReferralSystem() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'copy-referral-btn' || e.target.closest('#copy-referral-btn')) {
                const referralLink = 'https://t.me/aframe_village_bot?start=ref_' + (this.userData?.id || 'user');
                navigator.clipboard.writeText(referralLink).then(() => {
                    this.showNotification('Реферальная ссылка скопирована!');
                }).catch(() => {
                    this.showNotification('Не удалось скопировать ссылку');
                });
            }
        });
    }

    initShop() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-small');
            if (btn) {
                const offer = btn.getAttribute('data-offer');
                this.purchaseOffer(offer);
            }
        });
    }

    initFeedback() {
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
                this.showNotification(`Вы приобрели: ${selectedOffer.name}`);
            } else {
                this.showNotification('Недостаточно A-Coin');
            }
        }
    }

    openFeedback(type) {
        const message = type === 'suggestion' ? 
            'Напишите ваше предложение по улучшению:' : 
            'Оставьте ваш отзыв:';
        
        const userInput = prompt(message);
        if (userInput) {
            this.showNotification('Спасибо за ваш отзыв!');
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

    initEventListeners() {
        // Global escape handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.goBack();
            }
        });

        // Prevent default form submission
        document.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: var(--accent-primary);
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--border-radius-lg);
            z-index: var(--z-tooltip);
            transition: transform 0.3s ease;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    returnToMain() {
        this.showScreen('main-screen');
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-screen') === 'main-screen') {
                nav.classList.add('active');
            }
        });
    }
}

class ProfileManager {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.initTelegramWebApp();
        this.loadUserProfile();
    }

    initTelegramWebApp() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            
            const user = Telegram.WebApp.initDataUnsafe?.user;
            if (user) {
                this.app.userData = {
                    id: user.id,
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Пользователь',
                    level: 'Bronze',
                    coins: 1000,
                    referrals: 0,
                    earnedCoins: 0
                };
                
                this.app.updateProfileData();
            }
        }
    }

    loadUserProfile() {
        try {
            const savedData = localStorage.getItem('aframe_user_data');
            if (savedData) {
                const userData = JSON.parse(savedData);
                if (this.app.userData) {
                    this.app.userData = { ...this.app.userData, ...userData };
                } else {
                    this.app.userData = userData;
                }
                this.app.updateProfileData();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    saveUserProfile() {
        if (this.app.userData) {
            try {
                localStorage.setItem('aframe_user_data', JSON.stringify(this.app.userData));
            } catch (error) {
                console.error('Error saving user profile:', error);
            }
        }
    }

    addCoins(amount) {
        if (this.app.userData) {
            this.app.userData.coins += amount;
            this.app.updateProfileData();
            this.saveUserProfile();
        }
    }

    addReferral() {
        if (this.app.userData) {
            this.app.userData.referrals += 1;
            this.app.userData.earnedCoins += 500;
            this.addCoins(500);
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.profileManager = new ProfileManager(window.app);
    
    // Инициализируем другие менеджеры
    if (typeof Calendar !== 'undefined') {
        window.calendar = new Calendar();
    }
    if (typeof HousesManager !== 'undefined') {
        window.housesManager = new HousesManager();
    }
    if (typeof BookingManager !== 'undefined') {
        window.bookingManager = new BookingManager();
    }
    if (typeof PaymentManager !== 'undefined') {
        window.paymentManager = new PaymentManager();
    }
});