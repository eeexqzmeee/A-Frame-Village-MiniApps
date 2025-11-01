const housesData = {
    large: [
        {
            id: 1,
            name: "Дом 1",
            type: "large",
            price_weekday: 16000,
            price_weekend: 20000,
            max_guests: 12,
            base_guests: 8,
            extra_guest_price: 1000,
            checkin_times: ["14:00"],
            checkout_time: "12:00",
            description: "Просторный A-frame дом с панорамными окнами и собственной сауной. Идеально подходит для больших компаний.",
            features: ["Сауна", "Панорамные окна", "Терраса", "Кухня"],
            image: "🏠",
            services: [
                { 
                    id: "chan", 
                    name: "Чан", 
                    price: 2000, 
                    unit: "час", 
                    min_hours: 2,
                    description: "Деревянная купель с подогревом"
                },
                { 
                    id: "sauna", 
                    name: "Сауна", 
                    price: 0, 
                    original_price: 3000, 
                    note: "бесплатно",
                    description: "Финская сауна входит в стоимость"
                }
            ]
        },
        {
            id: 2,
            name: "Дом 2", 
            type: "large",
            price_weekday: 16000,
            price_weekend: 20000,
            max_guests: 12,
            base_guests: 8,
            extra_guest_price: 1000,
            checkin_times: ["14:00"],
            checkout_time: "12:00",
            description: "Уютный дом с камином и видом на лес. Отличное место для отдыха с друзьями.",
            features: ["Камин", "Терраса", "Мангал", "Сауна"],
            image: "🏠",
            services: [
                { 
                    id: "chan", 
                    name: "Чан", 
                    price: 2000, 
                    unit: "час", 
                    min_hours: 2 
                },
                { 
                    id: "sauna", 
                    name: "Сауна", 
                    price: 0, 
                    original_price: 3000, 
                    note: "бесплатно" 
                }
            ]
        },
        {
            id: 3,
            name: "Дом 3",
            type: "large", 
            price_weekday: 16000,
            price_weekend: 20000,
            max_guests: 12,
            base_guests: 8,
            extra_guest_price: 1000,
            checkin_times: ["16:00"],
            checkout_time: "14:00",
            description: "Современный дом с открытой планировкой и большими окнами.",
            features: ["Открытая планировка", "Панорамные окна", "Терраса"],
            image: "🏠",
            services: [
                { 
                    id: "chan", 
                    name: "Чан", 
                    price: 2000, 
                    unit: "час", 
                    min_hours: 2 
                },
                { 
                    id: "sauna", 
                    name: "Сауна", 
                    price: 0, 
                    original_price: 3000, 
                    note: "бесплатно" 
                }
            ]
        },
        {
            id: 4,
            name: "Дом 4",
            type: "large",
            price_weekday: 16000, 
            price_weekend: 20000,
            max_guests: 12,
            base_guests: 8,
            extra_guest_price: 1000,
            checkin_times: ["16:00"],
            checkout_time: "14:00",
            description: "Дом в скандинавском стиле с уютной атмосферой и сауной.",
            features: ["Скандинавский стиль", "Сауна", "Бильярд"],
            image: "🏠",
            services: [
                { 
                    id: "chan", 
                    name: "Чан", 
                    price: 2000, 
                    unit: "час", 
                    min_hours: 2 
                },
                { 
                    id: "sauna", 
                    name: "Сауна", 
                    price: 0, 
                    original_price: 3000, 
                    note: "бесплатно" 
                }
            ]
        },
        {
            id: 5,
            name: "Дом 5",
            type: "large",
            price_weekday: 16000,
            price_weekend: 20000, 
            max_guests: 12,
            base_guests: 8,
            extra_guest_price: 1000,
            checkin_times: ["18:00"],
            checkout_time: "16:00",
            description: "Просторный дом с двумя террасами и зоной отдыха у костра.",
            features: ["Две террасы", "Зона костра", "Сауна"],
            image: "🏠",
            services: [
                { 
                    id: "chan", 
                    name: "Чан", 
                    price: 2000, 
                    unit: "час", 
                    min_hours: 2 
                },
                { 
                    id: "sauna", 
                    name: "Сауна", 
                    price: 0, 
                    original_price: 3000, 
                    note: "бесплатно" 
                }
            ]
        },
        {
            id: 6,
            name: "Дом 6",
            type: "large",
            price_weekday: 16000,
            price_weekend: 20000,
            max_guests: 12, 
            base_guests: 8,
            extra_guest_price: 1000,
            checkin_times: ["18:00"],
            checkout_time: "16:00",
            description: "Эко-дом из натуральных материалов с большими окнами и сауной.",
            features: ["Эко-материалы", "Сауна", "Гамаки"],
            image: "🏠",
            services: [
                { 
                    id: "chan", 
                    name: "Чан", 
                    price: 2000, 
                    unit: "час", 
                    min_hours: 2 
                },
                { 
                    id: "sauna", 
                    name: "Сауна", 
                    price: 0, 
                    original_price: 3000, 
                    note: "бесплатно" 
                }
            ]
        }
    ],
    
    couple: {
        id: 7,
        name: "Дом для двоих",
        type: "couple",
        price_weekday: 8000,
        price_weekend: 10000, 
        max_guests: 2,
        checkin_times: ["13:00"],
        checkout_time: "11:00",
        description: "Уютный романтический домик для пар с камином и приватной террасой.",
        features: ["Романтическая атмосфера", "Камин", "Приватная терраса"],
        image: "❤️",
        services: [
            { 
                id: "chan", 
                name: "Чан", 
                price: 3000, 
                unit: "сеанс",
                description: "Деревянная купель для двоих"
            },
            { 
                id: "banya", 
                name: "Баня", 
                price: 3000, 
                unit: "сеанс",
                description: "Русская баня с вениками"
            }
        ]
    },
    
    family: {
        id: 8,
        name: "Дом на четверых", 
        type: "family",
        price_weekday: 10000,
        price_weekend: 12000,
        max_guests: 4,
        checkin_times: ["13:00"],
        checkout_time: "11:00",
        description: "Комфортный дом для семейного отдыха с детьми. Просторные комнаты и безопасная территория.",
        features: ["Семейный комфорт", "Детская площадка", "Просторные комнаты"],
        image: "👨‍👩‍👧‍👦",
        services: [
            { 
                id: "chan", 
                name: "Чан", 
                price: 3000, 
                unit: "сеанс",
                description: "Большая купель для всей семьи"
            },
            { 
                id: "sauna", 
                name: "Сауна", 
                price: 3000, 
                unit: "3 часа",
                description: "Финская сауна на 3 часа с момента готовности"
            }
        ]
    }
};

// Данные о занятости (в реальном приложении будут с API)
const bookedDates = {
    1: ['2024-11-15', '2024-11-16'],
    2: ['2024-11-20', '2024-11-21'], 
    3: ['2024-11-25'],
    7: ['2024-11-18', '2024-11-19'],
    8: ['2024-11-22', '2024-11-23']
};
// База данных в localStorage
const database = {
    init() {
        if (!localStorage.getItem('bookings')) {
            localStorage.setItem('bookings', JSON.stringify([]));
        }
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify({}));
        }
        if (!localStorage.getItem('acoinTransactions')) {
            localStorage.setItem('acoinTransactions', JSON.stringify([]));
        }
        if (!localStorage.getItem('payments')) {
            localStorage.setItem('payments', JSON.stringify([]));
        }
    },

    saveBooking(booking) {
        const bookings = this.getBookings();
        booking.id = booking.id || Date.now().toString();
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return booking;
    },

    updateBooking(bookingId, updates) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index] = { ...bookings[index], ...updates };
            localStorage.setItem('bookings', JSON.stringify(bookings));
            return bookings[index];
        }
        return null;
    },

    getBookings() {
        return JSON.parse(localStorage.getItem('bookings') || '[]');
    },

    getActiveBookings() {
        const bookings = this.getBookings();
        return bookings.filter(booking => 
            booking.status === 'confirmed' || booking.status === 'completed'
        );
    },

    isDateBooked(houseId, date) {
        const activeBookings = this.getActiveBookings();
        const dateStr = new Date(date).toISOString().split('T')[0];
        
        return activeBookings.some(booking => {
            if (booking.house.id !== houseId) return false;
            
            const checkin = new Date(booking.dates.checkin);
            const checkout = new Date(booking.dates.checkout);
            const targetDate = new Date(dateStr);
            
            return targetDate >= checkin && targetDate < checkout;
        });
    },

    getUserBookings(userId) {
        const bookings = this.getBookings();
        return bookings.filter(booking => booking.userId === userId)
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    updateUser(userId, userData) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[userId] = { ...users[userId], ...userData };
        localStorage.setItem('users', JSON.stringify(users));
    },

    getUser(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return users[userId] || { 
            acoins: 1000, 
            level: 'Bronze', 
            bookingsCount: 0,
            totalSpent: 0 
        };
    },

    addAcoins(userId, amount, reason) {
        const user = this.getUser(userId);
        user.acoins = (user.acoins || 0) + amount;
        this.updateUser(userId, user);

        const transactions = JSON.parse(localStorage.getItem('acoinTransactions') || '[]');
        transactions.push({
            userId,
            amount,
            reason,
            date: new Date().toISOString(),
            balance: user.acoins
        });
        localStorage.setItem('acoinTransactions', JSON.stringify(transactions));

        return user.acoins;
    },

    savePayment(payment) {
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payment.id = payment.id || Date.now().toString();
        payment.createdAt = payment.createdAt || new Date().toISOString();
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
        return payment;
    },

    getPaymentByBookingId(bookingId) {
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        return payments.find(p => p.bookingId === bookingId);
    }
};

// Система уровней лояльности

// Система уровней лояльности
const loyaltySystem = {
    levels: {
        Bronze: { minBookings: 0, cashback: 0.05 },
        Silver: { minBookings: 3, cashback: 0.07 },
        Gold: { minBookings: 6, cashback: 0.10 },
        Platinum: { minBookings: 10, cashback: 0.15 }
    },

    getUserLevel(bookingsCount) {
        if (bookingsCount >= this.levels.Platinum.minBookings) return 'Platinum';
        if (bookingsCount >= this.levels.Gold.minBookings) return 'Gold';
        if (bookingsCount >= this.levels.Silver.minBookings) return 'Silver';
        return 'Bronze';
    },

    calculateCashback(amount, level) {
        const cashbackRate = this.levels[level].cashback;
        return Math.round(amount * cashbackRate);
    }
};

// Генератор ID пользователя (в реальном приложении будет из Telegram)
function generateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
        
        database.updateUser(userId, {
            acoins: 1000,
            level: 'Bronze',
            bookingsCount: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString()
        });
    }
    return userId;
}

// Инициализация базы данных
database.init();
const currentUserId = generateUserId();