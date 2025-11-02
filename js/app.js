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
    }

    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
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
    }

    showScreen(screenId) {
        // Скрываем все экраны
        document.querySelectorAll('.swipe-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем целевой экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    showModalScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    goBack() {
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
            
            // Обновляем навигацию
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.classList.remove('active');
                if (nav.getAttribute('data-screen') === previousScreen) {
                    nav.classList.add('active');
                }
            });
        }
    }

    // ... остальные методы остаются без изменений ...

    initProfile() {
        this.initReferralSystem();
        this.initShop();
        this.initFeedback();
        this.updateProfileData(); // Добавил принудительное обновление
    }

    initReferralSystem() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'copy-referral-btn' || e.target.closest('#copy-referral-btn')) {
                const referralLink = 'https://t.me/aframe_village_bot?start=ref_' + (this.userData?.id || 'user');
                navigator.clipboard.writeText(referralLink).then(() => {
                    this.showNotification('Реферальная ссылка скопирована!');
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
            name: 'Пользователь',
            level: 'Bronze',
            coins: 1000,
            referrals: 0,
            earnedCoins: 0
        };
        
        this.updateProfileData();
    }

    updateProfileData() {
        if (!this.userData) return;

        document.querySelector('.user-name').textContent = this.userData.name;
        document.querySelector('.user-id').textContent = `ID: ${this.userData.id}`;
        
        document.querySelectorAll('.stat-card .stat-value').forEach(stat => {
            const label = stat.nextElementSibling.textContent;
            if (label.includes('Уровень')) stat.textContent = this.userData.level;
            if (label.includes('A-Coin')) stat.textContent = this.userData.coins;
            if (label.includes('Рефералы')) stat.textContent = this.userData.referrals;
        });

        document.querySelector('.coin-balance').textContent = `Баланс: ${this.userData.coins} A-Coin`;
        
        const referralStats = document.querySelectorAll('.referral-stat strong');
        referralStats[0].textContent = `${this.userData.referrals} человек`;
        referralStats[1].textContent = `${this.userData.earnedCoins} A-Coin`;
    }

    initEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.book-btn') || e.target.closest('.book-btn')) {
                if (e.target.id !== 'view-houses-btn') {
                    this.showModalScreen('calendar-screen');
                }
            }
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
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
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
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
    }

    saveUserProfile() {
        if (this.app.userData) {
            localStorage.setItem('aframe_user_data', JSON.stringify(this.app.userData));
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

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.profileManager = new ProfileManager(window.app);
    window.bookingManager = new BookingManager();
});