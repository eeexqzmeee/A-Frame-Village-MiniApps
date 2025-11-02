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
        if (!container) return;
        
        container.innerHTML = '';

        for (let i = 1; i <= 6; i++) {
            const houseCard = this.createHouseCard({
                id: i,
                type: 'large',
                name: `Большой дом ${i}`,
                max_guests: 12,
                checkin_times: ['13:00', '15:00'],
                price_weekday: 15000,
                price_weekend: 25000,
                image: '🏠'
            });
            container.appendChild(houseCard);
        }
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
            </div>
        `;

        if (isAvailable) {
            div.addEventListener('click', () => this.selectHouse(house));
        } else {
            div.style.opacity = '0.6';
            div.style.cursor = 'not-allowed';
        }

        return div;
    }

    isHouseAvailable(houseId) {
        if (!window.calendar || !window.calendar.selectedDates.checkin) return true;

        const checkin = new Date(window.calendar.selectedDates.checkin);
        const checkout = window.calendar.selectedDates.checkout ? 
            new Date(window.calendar.selectedDates.checkout) : null;

        if (!checkout) return true;

        const houseBookedDates = bookedDates[houseId] || [];
        
        let currentDate = new Date(checkin);
        while (currentDate < checkout) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (houseBookedDates.includes(dateStr)) {
                return false;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return true;
    }

    bindHouseEvents() {
        document.addEventListener('click', (e) => {
            const houseCard = e.target.closest('.house-card');
            if (houseCard && !houseCard.querySelector('.unavailable-overlay')) {
                const houseId = parseInt(houseCard.dataset.houseId);
                const houseType = houseCard.dataset.type;
                
                let house;
                if (houseType === 'large') {
                    house = housesData.large.find(h => h.id === houseId) || {
                        id: houseId,
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
                            { 
                                name: 'Деревянная купель (чан)', 
                                description: 'Деревянная купель с подогревом воды на улице', 
                                price: 2000, 
                                unit: 'час',
                                min_hours: 2,
                                durations: [
                                    { label: "2 часа", value: 2, price: 4000 },
                                    { label: "4 часа", value: 4, price: 7000 },
                                    { label: "6 часов", value: 6, price: 10000 }
                                ]
                            }
                        ]
                    };
                } else if (houseType === 'couple') {
                    house = housesData.couple[0];
                } else if (houseType === 'family') {
                    house = housesData.family[0];
                }

                if (house) {
                    this.selectHouse(house);
                }
            }
        });
    }

    selectHouse(house) {
        this.selectedHouse = house;
        
        if (window.app) {
            window.app.selectedHouse = house;
            window.app.showHouseDetails(house);
        }
    }

    updateAvailability() {
        this.renderLargeHouses();
    }
}

let housesManager;

document.addEventListener('DOMContentLoaded', () => {
    housesManager = new HousesManager();
});