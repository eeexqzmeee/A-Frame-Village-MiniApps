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
        this.generateCalendar();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('prev-month').addEventListener('click', () => this.prevMonth());
        document.getElementById('next-month').addEventListener('click', () => this.nextMonth());
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthElement = document.getElementById('current-month');
        const yearElement = document.getElementById('current-year');

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Обновляем заголовок
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        monthElement.textContent = monthNames[month];
        yearElement.textContent = year;

        // Очищаем календарь
        calendarGrid.innerHTML = '';

        // Получаем первый и последний день месяца
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // День недели первого дня (0 - воскресенье, 1 - понедельник)
        let firstDayOfWeek = firstDay.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Воскресенье становится 7
        
        // Дни предыдущего месяца
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 2; i >= 0; i--) {
            const day = this.createDayElement(prevMonthLastDay - i, true);
            calendarGrid.appendChild(day);
        }

        // Дни текущего месяца
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const isPast = date < today;
            const isBooked = this.isDateBooked(date);
            const isSelected = this.isDateSelected(date);
            
            const day = this.createDayElement(i, false, isPast, isBooked, isSelected, date);
            calendarGrid.appendChild(day);
        }

        // Дни следующего месяца
        const totalCells = 42; // 6 недель * 7 дней
        const daysInCalendar = firstDayOfWeek - 1 + lastDay.getDate();
        const nextMonthDays = totalCells - daysInCalendar;
        
        for (let i = 1; i <= nextMonthDays; i++) {
            const day = this.createDayElement(i, true);
            calendarGrid.appendChild(day);
        }

        this.updateDatesPreview();
    }

    createDayElement(dayNumber, isOtherMonth, isPast = false, isBooked = false, isSelected = false, date = null) {
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

        if (isSelected) {
            day.classList.add('selected');
        }

        // Проверяем, сегодня ли это
        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date.getTime() === today.getTime()) {
                day.classList.add('today');
            }
        }

        if (!isOtherMonth && !isPast && !isBooked && date) {
            day.dataset.date = date.toISOString().split('T')[0];
            day.addEventListener('click', () => this.selectDate(date));
        }

        return day;
    }

    isDateBooked(date) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Проверяем занятость для всех домов
        for (const houseId in bookedDates) {
            if (bookedDates[houseId].includes(dateStr)) {
                return true;
            }
        }
        return false;
    }

    isDateSelected(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.selectedDates.checkin === dateStr || this.selectedDates.checkout === dateStr;
    }

    selectDate(date) {
        const dateStr = date.toISOString().split('T')[0];

        if (!this.selectedDates.checkin) {
            // Выбор даты заезда
            this.selectedDates.checkin = dateStr;
            this.selectedDates.checkout = null;
        } else if (!this.selectedDates.checkout && dateStr > this.selectedDates.checkin) {
            // Выбор даты выезда
            this.selectedDates.checkout = dateStr;
        } else {
            // Сброс выбора
            this.selectedDates.checkin = dateStr;
            this.selectedDates.checkout = null;
        }

        this.generateCalendar();
        this.updateDatesPreview();
        
        // Сохраняем в глобальное состояние
        if (window.app) {
            window.app.selectedDates = {...this.selectedDates};
        }
    }

    updateDatesPreview() {
        const checkinPreview = document.getElementById('checkin-preview');
        const checkoutPreview = document.getElementById('checkout-preview');
        const nightsCount = document.getElementById('nights-count');
        const continueBtn = document.getElementById('continue-to-houses');

        if (this.selectedDates.checkin) {
            const checkinDate = new Date(this.selectedDates.checkin);
            checkinPreview.textContent = this.formatDate(checkinDate);
            
            if (this.selectedDates.checkout) {
                const checkoutDate = new Date(this.selectedDates.checkout);
                checkoutPreview.textContent = this.formatDate(checkoutDate);
                
                const nights = this.calculateNights(this.selectedDates.checkin, this.selectedDates.checkout);
                nightsCount.textContent = `${nights} ${this.getNightText(nights)}`;
                
                continueBtn.disabled = false;
            } else {
                checkoutPreview.textContent = '--';
                nightsCount.textContent = '0 ночей';
                continueBtn.disabled = true;
            }
        } else {
            checkinPreview.textContent = '--';
            checkoutPreview.textContent = '--';
            nightsCount.textContent = '0 ночей';
            continueBtn.disabled = true;
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    }

    calculateNights(checkin, checkout) {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    getNightText(nights) {
        if (nights === 1) return 'ночь';
        if (nights >= 2 && nights <= 4) return 'ночи';
        return 'ночей';
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generateCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generateCalendar();
    }
}

// Инициализация календаря
let calendar;

document.addEventListener('DOMContentLoaded', () => {
    calendar = new Calendar();
});