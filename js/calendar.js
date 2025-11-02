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

        document.getElementById('continue-to-houses')?.addEventListener('click', () => {
            if (this.selectedDates.checkin && this.selectedDates.checkout) {
                window.app.showScreen('houses-screen');
            }
        });
    }

    renderCalendar() {
        const monthElement = document.getElementById('current-month');
        const yearElement = document.getElementById('current-year');
        const gridElement = document.getElementById('calendar-grid');

        if (!monthElement || !yearElement || !gridElement) return;

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

        for (let i = 0; i < adjustedStartingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            gridElement.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const dateString = this.formatDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day));
            
            if (this.isDateBooked(dateString)) {
                dayElement.classList.add('booked');
            } else {
                dayElement.addEventListener('click', () => this.selectDate(dateString));
            }

            if (dateString === this.selectedDates.checkin) {
                dayElement.classList.add('selected', 'checkin');
            } else if (dateString === this.selectedDates.checkout) {
                dayElement.classList.add('selected', 'checkout');
            } else if (this.isDateInRange(dateString)) {
                dayElement.classList.add('in-range');
            }

            gridElement.appendChild(dayElement);
        }

        this.updateDatesPreview();
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
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
            
            if (selectedDate < checkinDate) {
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
        const continueBtn = document.getElementById('continue-to-houses');

        if (checkinPreview) {
            checkinPreview.textContent = this.selectedDates.checkin || '--';
        }
        if (checkoutPreview) {
            checkoutPreview.textContent = this.selectedDates.checkout || '--';
        }
        if (nightsCount) {
            const nights = this.calculateNights();
            nightsCount.textContent = `${nights} ${this.getNightsText(nights)}`;
        }
        if (continueBtn) {
            continueBtn.disabled = !(this.selectedDates.checkin && this.selectedDates.checkout);
        }
    }

    calculateNights() {
        if (!this.selectedDates.checkin || !this.selectedDates.checkout) return 0;
        
        const checkinDate = new Date(this.selectedDates.checkin);
        const checkoutDate = new Date(this.selectedDates.checkout);
        const diffTime = checkoutDate - checkinDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    getNightsText(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    }
}