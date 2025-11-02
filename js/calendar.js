class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDates = {
            checkin: null,
            checkout: null
        };
        this.init();
    }

    init() {
        this.renderCalendar();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Обработчик для кнопки продолжения
        document.addEventListener('click', (e) => {
            if (e.target.closest('#continue-to-payment')) {
                this.continueToPayment();
            }
        });
    }

    renderCalendar() {
        const monthElement = document.getElementById('current-month');
        const yearElement = document.getElementById('current-year');
        const gridElement = document.getElementById('calendar-grid');
        const previewElement = document.getElementById('dates-preview');

        if (!monthElement || !yearElement || !gridElement || !previewElement) return;

        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        monthElement.textContent = monthNames[this.currentDate.getMonth()];
        yearElement.textContent = this.currentDate.getFullYear();

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startingDay = firstDay.getDay();
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;

        gridElement.innerHTML = '';

        // Пустые дни предыдущего месяца
        for (let i = 0; i < adjustedStartingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            gridElement.appendChild(emptyDay);
        }

        // Дни текущего месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const dateString = this.formatDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day));
            
            if (this.isDateBooked(dateString)) {
                dayElement.classList.add('disabled');
                dayElement.title = 'Дата занята';
            } else {
                dayElement.addEventListener('click', () => this.selectDate(dateString));
            }

            if (dateString === this.selectedDates.checkin) {
                dayElement.classList.add('selected');
            } else if (dateString === this.selectedDates.checkout) {
                dayElement.classList.add('selected');
            } else if (this.isDateInRange(dateString)) {
                dayElement.classList.add('in-range');
            }

            // Проверяем сегодняшний день
            const today = new Date();
            if (dateString === this.formatDate(today)) {
                dayElement.classList.add('today');
            }

            gridElement.appendChild(dayElement);
        }

        this.updateDatesPreview();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    isDateBooked(dateString) {
        for (const houseId in bookedDates) {
            if (bookedDates[houseId].includes(dateString)) {
                return true;
            }
        }
        return false;
    }

    selectDate(dateString) {
        if (!this.selectedDates.checkin || (this.selectedDates.checkin && this.selectedDates.checkout)) {
            this.selectedDates.checkin = dateString;
            this.selectedDates.checkout = null;
        } else {
            const checkinDate = new Date(this.selectedDates.checkin);
            const selectedDate = new Date(dateString);
            
            if (selectedDate <= checkinDate) {
                this.selectedDates.checkin = dateString;
                this.selectedDates.checkout = null;
            } else {
                this.selectedDates.checkout = dateString;
            }
        }

        this.renderCalendar();
        this.updateDatesPreview();
    }

    isDateInRange(dateString) {
        if (!this.selectedDates.checkin || !this.selectedDates.checkout) return false;
        
        const currentDate = new Date(dateString);
        const checkinDate = new Date(this.selectedDates.checkin);
        const checkoutDate = new Date(this.selectedDates.checkout);
        
        return currentDate > checkinDate && currentDate < checkoutDate;
    }

    updateDatesPreview() {
        const checkinPreview = document.getElementById('checkin-preview');
        const checkoutPreview = document.getElementById('checkout-preview');
        const nightsCount = document.getElementById('nights-count');
        const continueBtn = document.getElementById('continue-to-payment');
        const previewElement = document.getElementById('dates-preview');

        if (checkinPreview) {
            checkinPreview.textContent = this.selectedDates.checkin ? this.formatDisplayDate(this.selectedDates.checkin) : '--';
        }
        if (checkoutPreview) {
            checkoutPreview.textContent = this.selectedDates.checkout ? this.formatDisplayDate(this.selectedDates.checkout) : '--';
        }
        if (nightsCount) {
            const nights = this.calculateNights();
            nightsCount.textContent = `${nights} ${this.getNightsText(nights)}`;
        }
        if (continueBtn) {
            continueBtn.disabled = !(this.selectedDates.checkin && this.selectedDates.checkout);
            continueBtn.textContent = this.selectedDates.checkin && this.selectedDates.checkout ? 
                `Перейти к оплате • ${this.calculateTotalPrice().toLocaleString()}₽` : 
                'Выберите даты';
        }

        // Превращаем превью в sticky панель если есть выбранные даты
        if (previewElement) {
            if (this.selectedDates.checkin && this.selectedDates.checkout) {
                previewElement.classList.add('sticky-panel', 'compact');
            } else {
                previewElement.classList.remove('sticky-panel', 'compact');
            }
        }
    }

    formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    }

    calculateNights() {
        if (!this.selectedDates.checkin || !this.selectedDates.checkout) return 0;
        
        const checkinDate = new Date(this.selectedDates.checkin);
        const checkoutDate = new Date(this.selectedDates.checkout);
        const diffTime = checkoutDate - checkinDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    calculateTotalPrice() {
        if (!window.app || !window.app.bookingData) return 0;
        
        const nights = this.calculateNights();
        const basePrice = window.app.bookingData.house.price * nights;
        const servicesTotal = window.app.bookingData.services.reduce((sum, service) => sum + service.totalPrice, 0);
        
        return basePrice + servicesTotal;
    }

    getNightsText(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    }

    continueToPayment() {
        if (!this.selectedDates.checkin || !this.selectedDates.checkout) {
            alert('Пожалуйста, выберите даты заезда и выезда');
            return;
        }

        if (!window.app || !window.app.selectedHouse) {
            alert('Пожалуйста, выберите дом');
            return;
        }

        // Обновляем bookingData с выбранными датами
        if (window.app.bookingData) {
            window.app.bookingData.checkin = this.selectedDates.checkin;
            window.app.bookingData.checkout = this.selectedDates.checkout;
            window.app.bookingData.nights = this.calculateNights();
            window.app.bookingData.basePrice = window.app.bookingData.house.price * window.app.bookingData.nights;
        }

        window.app.showPaymentScreen();
    }
}