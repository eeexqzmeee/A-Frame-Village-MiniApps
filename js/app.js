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
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        document.querySelectorAll('.header-btn.back').forEach(btn => {
            btn.addEventListener('click', () => {
                this.goBack();
            });
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.swipe-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    showModalScreen(screenId) {
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    goBack() {
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
        }
    }

    initCalendar() {
        this.renderCalendar();
        
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });

        document.getElementById('view-houses-btn').addEventListener('click', () => {
            this.showModalScreen('calendar-screen');
        });

        document.getElementById('continue-to-houses').addEventListener('click', () => {
            if (this.selectedDates.checkin && this.selectedDates.checkout) {
                this.showModalScreen('houses-screen');
                this.updateHeaderDates();
            } else {
                this.showNotification('Выберите даты заезда и выезда');
            }
        });
    }

    renderCalendar() {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        document.getElementById('current-month').textContent = monthNames[this.currentMonth];
        document.getElementById('current-year').textContent = this.currentYear;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

        const calendarGrid = document.getElementById('calendar-grid');
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
        if (this.selectedDates.checkin && this.selectedDates.checkout) {
            headerDates.textContent = 
                `${this.formatDate(this.selectedDates.checkin)} - ${this.formatDate(this.selectedDates.checkout)}`;
        } else {
            headerDates.textContent = 'Выберите даты';
        }
    }

    initHouses() {
        this.renderLargeHouses();
        
        document.querySelectorAll('.house-card').forEach(card => {
            card.addEventListener('click', () => {
                const houseId = card.getAttribute('data-house-id');
                const houseType = card.getAttribute('data-type');
                this.selectHouse(houseId, houseType);
            });
        });
    }

    renderLargeHouses() {
        const largeHousesContainer = document.getElementById('large-houses');
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
        let house;
        if (houseType === 'large') {
            house = housesData.large[0];
            house.id = houseId;
            house.name = `Большой дом ${houseId}`;
        } else if (houseType === 'couple') {
            house = housesData.couple;
        } else if (houseType === 'family') {
            house = housesData.family;
        }

        if (house) {
            this.selectedHouse = house;
            if (window.bookingManager) {
                window.bookingManager.renderHouseDetail(house);
            }
            this.showModalScreen('house-detail-screen');
        }
    }

    initProfile() {
        this.initReferralSystem();
        this.initShop();
        this.initFeedback();
    }

    initReferralSystem() {
        const copyBtn = document.getElementById('copy-referral-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const referralLink = 'https://t.me/aframe_village_bot?start=ref_' + (this.userData?.id || 'user');
                navigator.clipboard.writeText(referralLink).then(() => {
                    this.showNotification('Реферальная ссылка скопирована!');
                });
            });
        }
    }

    initShop() {
        document.querySelectorAll('.btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const offer = e.target.getAttribute('data-offer');
                this.purchaseOffer(offer);
            });
        });
    }

    initFeedback() {
        document.getElementById('suggestion-btn').addEventListener('click', () => {
            this.openFeedback('suggestion');
        });

        document.getElementById('feedback-btn').addEventListener('click', () => {
            this.openFeedback('review');
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