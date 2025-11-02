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
        
        console.log('App initialized');
    }

    initNavigation() {
        console.log('Initializing navigation...');
        
        // Инициализация bottom navigation - ПРОСТАЯ И РАБОЧАЯ
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetScreen = item.getAttribute('data-screen');
                console.log('Nav item clicked:', targetScreen);
                this.showScreen(targetScreen);
            });
        });

        // Кнопка "Посмотреть дома"
        const viewHousesBtn = document.getElementById('view-houses-btn');
        if (viewHousesBtn) {
            viewHousesBtn.addEventListener('click', () => {
                this.showScreen('calendar-screen');
            });
        }

        // Вторая кнопка "Начать бронирование"
        const viewHousesBtn2 = document.getElementById('view-houses-btn-2');
        if (viewHousesBtn2) {
            viewHousesBtn2.addEventListener('click', () => {
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
                } else {
                    this.showNotification('Выберите даты заезда и выезда');
                }
            });
        }

        // Глобальные обработчики для кнопок назад
        document.addEventListener('click', (e) => {
            if (e.target.closest('.header-btn.back')) {
                this.goBack();
            }
        });
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
            
            // Обновляем активное состояние навигации ТОЛЬКО для главных экранов
            if (screenId === 'main-screen' || screenId === 'profile-screen') {
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.getAttribute('data-screen') === screenId) {
                        nav.classList.add('active');
                    }
                });
            }
            
            console.log('Screen shown:', screenId);
        } else {
            console.error('Screen not found:', screenId);
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

    // ... остальные методы calendar и houses остаются без изменений ...

    initProfile() {
        console.log('Initializing profile...');
        
        // Реферальная система
        document.addEventListener('click', (e) => {
            if (e.target.id === 'copy-referral-btn' || e.target.closest('#copy-referral-btn')) {
                const referralLink = 'https://t.me/aframe_village_bot?start=ref_' + (this.userData?.id || 'user');
                navigator.clipboard.writeText(referralLink).then(() => {
                    this.showNotification('Реферальная ссылка скопирована!');
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

    // ... остальные методы без изменений ...

    returnToMain() {
        this.showScreen('main-screen');
    }
}

// Упрощенный ProfileManager
class ProfileManager {
    constructor(app) {
        this.app = app;
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.app = new App();
    window.profileManager = new ProfileManager(window.app);
    
    // Простая инициализация других менеджеров
    if (typeof Calendar === 'function') {
        window.calendar = new Calendar();
    }
    if (typeof HousesManager === 'function') {
        window.housesManager = new HousesManager();
    }
    if (typeof BookingManager === 'function') {
        window.bookingManager = new BookingManager();
    }
    if (typeof PaymentManager === 'function') {
        window.paymentManager = new PaymentManager();
    }
    
    console.log('All managers initialized');
});