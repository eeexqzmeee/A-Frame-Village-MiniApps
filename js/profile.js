const housesData = {
    large: {
        minPrice: 15000,
        maxPrice: 25000,
        capacity: 12,
        features: ['Сауна', 'Парковка', 'Кухня', 'Терраса'],
        description: 'Просторные дома с собственной сауной для больших компаний'
    },
    couple: {
        minPrice: 8000,
        maxPrice: 10000,
        capacity: 2,
        features: ['Джакузи', 'Балкон', 'Мини-кухня'],
        description: 'Уютные дома для романтического отдыха'
    },
    family: {
        minPrice: 10000,
        maxPrice: 12000,
        capacity: 4,
        features: ['Две спальни', 'Детская зона', 'Кухня'],
        description: 'Комфортабельные дома для семейного отдыха'
    }
};

const bookingRules = {
    checkin: '13:00',
    checkout: '11:00',
    minNights: 1,
    maxNights: 30,
    prepayment: 0.3
};

const seasons = {
    low: {
        multiplier: 1,
        months: [0, 1, 2, 10, 11]
    },
    medium: {
        multiplier: 1.2,
        months: [3, 4, 9]
    },
    high: {
        multiplier: 1.5,
        months: [5, 6, 7, 8]
    }
};

function getSeasonMultiplier(month) {
    for (const [season, data] of Object.entries(seasons)) {
        if (data.months.includes(month)) {
            return data.multiplier;
        }
    }
    return 1;
}

function calculatePrice(houseType, nights, month) {
    const house = housesData[houseType];
    const seasonMultiplier = getSeasonMultiplier(month);
    const basePrice = (house.minPrice + house.maxPrice) / 2;
    return Math.round(basePrice * nights * seasonMultiplier);
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + '₽';
}

function validateDates(checkin, checkout) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkin < today) {
        return 'Дата заезда не может быть в прошлом';
    }
    
    if (checkout <= checkin) {
        return 'Дата выезда должна быть после даты заезда';
    }
    
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    if (nights < bookingRules.minNights) {
        return `Минимальное количество ночей: ${bookingRules.minNights}`;
    }
    
    if (nights > bookingRules.maxNights) {
        return `Максимальное количество ночей: ${bookingRules.maxNights}`;
    }
    
    return null;
}

function generateBookingId() {
    return 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function saveBooking(bookingData) {
    try {
        const bookings = JSON.parse(localStorage.getItem('aframe_bookings') || '[]');
        bookingData.id = generateBookingId();
        bookingData.createdAt = new Date().toISOString();
        bookingData.status = 'confirmed';
        bookings.push(bookingData);
        localStorage.setItem('aframe_bookings', JSON.stringify(bookings));
        return bookingData;
    } catch (error) {
        console.error('Ошибка сохранения брони:', error);
        return null;
    }
}

function getBookings() {
    try {
        return JSON.parse(localStorage.getItem('aframe_bookings') || '[]');
    } catch (error) {
        console.error('Ошибка загрузки броней:', error);
        return [];
    }
}

function cancelBooking(bookingId) {
    try {
        const bookings = getBookings();
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'cancelled';
            localStorage.setItem('aframe_bookings', JSON.stringify(bookings));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Ошибка отмены брони:', error);
        return false;
    }
}

function getUserStats() {
    const bookings = getBookings();
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
    return {
        totalBookings: confirmedBookings.length,
        totalSpent: confirmedBookings.reduce((sum, booking) => sum + (booking.total || 0), 0),
        favoriteHouse: getFavoriteHouse(confirmedBookings)
    };
}

function getFavoriteHouse(bookings) {
    if (bookings.length === 0) return null;
    
    const houseCount = {};
    bookings.forEach(booking => {
        const houseName = booking.house?.name || 'Неизвестно';
        houseCount[houseName] = (houseCount[houseName] || 0) + 1;
    });
    
    return Object.keys(houseCount).reduce((a, b) => 
        houseCount[a] > houseCount[b] ? a : b
    );
}