class HousesManager {
    constructor() {
        this.selectedHouse = null;
        this.init();
    }

    init() {
        this.renderLargeHouses();
        this.bindHouseEvents();
    }

    renderLargeHouses() {
        const container = document.getElementById('large-houses');
        container.innerHTML = '';

        housesData.large.forEach(house => {
            const houseCard = this.createHouseCard(house);
            container.appendChild(houseCard);
        });
    }

    createHouseCard(house) {
        const div = document.createElement('div');
        div.className = 'house-card';
        div.dataset.houseId = house.id;
        div.dataset.type = house.type;

        const isAvailable = this.isHouseAvailable(house.id);
        const availabilityClass = isAvailable ? '' : 'unavailable';

        div.innerHTML = `
            <div class="house-image ${availabilityClass}">
                <div class="image-placeholder">${house.image}</div>
                <div class="house-badge">До ${house.max_guests} гостей</div>
                ${!isAvailable ? '<div class="unavailable-overlay">Занят</div>' : ''}
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
                ${house.checkin_times.length > 1 ? `
                    <div class="checkin-options">
                        Варианты заезда: ${house.checkin_times.join(', ')}
                    </div>
                ` : ''}
            </div>
        `;

        if (isAvailable) {
            div.addEventListener('click', () => this.selectHouse(house));
        }

        return div;
    }

    isHouseAvailable(houseId) {
        if (!calendar || !calendar.selectedDates.checkin) return true;

        const checkin = new Date(calendar.selectedDates.checkin);
        const checkout = calendar.selectedDates.checkout ? new Date(calendar.selectedDates.checkout) : null;

        // Проверяем занятость на выбранные даты
        const houseBookedDates = bookedDates[houseId] || [];
        
        let currentDate = new Date(checkin);
        while (currentDate < checkout || (!checkout && currentDate.getTime() === checkin.getTime())) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (houseBookedDates.includes(dateStr)) {
                return false;
            }
            
            if (!checkout) break; // Если выбрана только дата заезда
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate >= checkout) break;
        }

        return true;
    }

    bindHouseEvents() {
        // Обработчики для готовых карточек домов
        document.addEventListener('click', (e) => {
            const houseCard = e.target.closest('.house-card');
            if (houseCard && !houseCard.querySelector('.unavailable-overlay')) {
                const houseId = parseInt(houseCard.dataset.houseId);
                const houseType = houseCard.dataset.type;
                
                let house;
                if (houseType === 'large') {
                    house = housesData.large.find(h => h.id === houseId);
                } else if (houseType === 'couple') {
                    house = housesData.couple;
                } else if (houseType === 'family') {
                    house = housesData.family;
                }

                if (house) {
                    this.selectHouse(house);
                }
            }
        });
    }

    selectHouse(house) {
        this.selectedHouse = house;
        
        // Показываем экран деталей дома
        if (window.app) {
            window.app.showHouseDetails(house);
        }
    }

    updateHeaderDates() {
        const headerDates = document.getElementById('header-dates');
        if (calendar && calendar.selectedDates.checkin) {
            const checkin = new Date(calendar.selectedDates.checkin);
            const checkout = calendar.selectedDates.checkout ? new Date(calendar.selectedDates.checkout) : null;
            
            let dateText = checkin.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            if (checkout) {
                dateText += ' - ' + checkout.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            }
            
            headerDates.textContent = dateText;
        } else {
            headerDates.textContent = 'Даты не выбраны';
        }
    }
}

// Инициализация менеджера домов
let housesManager;

document.addEventListener('DOMContentLoaded', () => {
    housesManager = new HousesManager();
});