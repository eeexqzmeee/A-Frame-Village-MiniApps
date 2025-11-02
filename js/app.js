class AFrameApp {
    constructor() {
        this.currentScreen = 'main-screen';
        this.selectedHouse = null;
        this.bookingData = null;
        this.init();
    }

    init() {
        this.bindNavigation();
        this.bindHouseSelection();
        this.initCalendar();
        this.initProfile();
        this.initBooking();
        this.initPayment();
        
        console.log('A-Frame Village App initialized');
    }

    bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.showScreen(screen);
                
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });

        document.querySelectorAll('.header-btn.back').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goBack();
            });
        });

        // Кнопка "Посмотреть дома" - сразу переходим к выбору домов
        document.getElementById('view-houses-btn')?.addEventListener('click', () => {
            this.showScreen('houses-screen');
        });

        // Кнопка "Мои брони"
        document.getElementById('my-bookings-btn')?.addEventListener('click', () => {
            alert('Функция "Мои брони" в разработке');
        });
    }

    bindHouseSelection() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.house-card')) {
                const card = e.target.closest('.house-card');
                if (card.querySelector('.unavailable-overlay')) return;
                
                const houseId = card.dataset.houseId;
                const houseType = card.dataset.type;
                
                let house;
                if (houseType === 'large') {
                    house = housesData.large.find(h => h.id === parseInt(houseId));
                } else if (houseType === 'couple') {
                    house = housesData.couple[0];
                } else if (houseType === 'family') {
                    house = housesData.family[0];
                }
                
                if (house) {
                    this.selectedHouse = house;
                    this.showHouseDetails(house);
                }
            }
        });
    }

    initCalendar() {
        if (typeof Calendar !== 'undefined') {
            window.calendar = new Calendar();
        }
    }

    initProfile() {
        if (typeof ProfileManager !== 'undefined') {
            window.profileManager = new ProfileManager();
        }
    }

    initBooking() {
        if (typeof BookingManager !== 'undefined') {
            window.bookingManager = new BookingManager(this);
        }
    }

    initPayment() {
        if (typeof PaymentManager !== 'undefined') {
            window.paymentManager = new PaymentManager(this);
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        if (screenId === 'houses-screen' && window.calendar) {
            this.updateHeaderDates();
        }
    }

    showHouseDetails(house) {
        if (window.bookingManager) {
            window.bookingManager.renderHouseDetails(house);
        }
        this.showScreen('house-detail-screen');
    }

    showPaymentScreen() {
        if (window.paymentManager && this.bookingData) {
            window.paymentManager.renderPaymentScreen(this.bookingData);
            this.showScreen('payment-screen');
        } else {
            console.error('Payment manager or booking data not available');
            alert('Ошибка: данные бронирования не найдены');
        }
    }

    continueToDates() {
        if (!this.selectedHouse) {
            alert('Пожалуйста, выберите дом');
            return;
        }

        this.showScreen('calendar-screen');
    }

    continueToPayment() {
        if (!window.calendar || !window.calendar.selectedDates.checkin || !window.calendar.selectedDates.checkout) {
            alert('Пожалуйста, выберите даты заезда и выезда');
            return;
        }

        if (!this.selectedHouse) {
            alert('Пожалуйста, выберите дом');
            return;
        }

        // Обновляем bookingData с выбранными датами
        if (this.bookingData) {
            this.bookingData.checkin = window.calendar.selectedDates.checkin;
            this.bookingData.checkout = window.calendar.selectedDates.checkout;
            this.bookingData.nights = window.calendar.calculateNights();
            this.bookingData.basePrice = this.bookingData.house.price * this.bookingData.nights;
            
            console.log('✅ Переход к оплате с данными:', this.bookingData);
        }

        this.showPaymentScreen();
    }

    goBack() {
        const screenHistory = {
            'profile-screen': 'main-screen',
            'calendar-screen': 'house-detail-screen',
            'houses-screen': 'main-screen',
            'house-detail-screen': 'houses-screen',
            'payment-screen': 'calendar-screen'
        };

        const previousScreen = screenHistory[this.currentScreen];
        if (previousScreen) {
            this.showScreen(previousScreen);
        }
    }

    updateHeaderDates() {
        const headerDates = document.getElementById('header-dates');
        if (headerDates && window.calendar && window.calendar.selectedDates.checkin) {
            const dates = window.calendar.selectedDates;
            headerDates.textContent = `${dates.checkin} - ${dates.checkout}`;
        }
    }

    clearBookingData() {
        this.bookingData = null;
        this.selectedHouse = null;
        if (window.bookingManager) {
            window.bookingManager.selectedServices = [];
        }
        if (window.calendar) {
            window.calendar.selectedDates = {};
            window.calendar.renderCalendar();
        }
    }
    showPaymentScreen() {
        console.log('🔄 showPaymentScreen вызван');
        console.log('📦 bookingData:', this.bookingData);
        console.log('🏠 selectedHouse:', this.selectedHouse);
        
        if (window.paymentManager && this.bookingData) {
            window.paymentManager.renderPaymentScreen(this.bookingData);
            this.showScreen('payment-screen');
            console.log('✅ Экран оплаты показан');
        } else {
            console.error('❌ Payment manager или booking data не доступны');
            console.error('paymentManager:', window.paymentManager);
            console.error('bookingData:', this.bookingData);
            alert('Ошибка: данные бронирования не найдены');
        }
    }
}
// Отладка ошибок
window.addEventListener('error', function(e) {
    console.error('❌ Global error:', e.error);
});

console.log('🚀 App starting...');
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new AFrameApp();
    window.app = app;
});