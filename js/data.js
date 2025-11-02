const housesData = {
    large: [
        {
            id: 1,
            type: 'large',
            name: 'Большой дом 1',
            description: 'Просторный дом с сауной для больших компаний',
            max_guests: 12,
            base_guests: 6,
            extra_guest_price: 1000,
            price_weekday: 15000,
            price_weekend: 25000,
            checkin_times: ['13:00', '15:00', '17:00'],
            checkout_time: '11:00',
            image: '🏠',
            photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
            services: [
                { name: 'Сауна', description: '3 часа включено', price: 0, unit: 'сеанс' },
                { name: 'Деревянная купель', description: 'Дополнительные часы', price: 2000, unit: 'час', min_hours: 2 },
                { name: 'Завтрак', description: 'Континентальный завтрак', price: 500, unit: 'человек' }
            ]
        },
        {
            id: 2,
            type: 'large',
            name: 'Большой дом 2',
            description: 'Просторный дом с сауной для больших компаний',
            max_guests: 12,
            base_guests: 6,
            extra_guest_price: 1000,
            price_weekday: 15000,
            price_weekend: 25000,
            checkin_times: ['13:00', '15:00', '17:00'],
            checkout_time: '11:00',
            image: '🏠',
            photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
            services: [
                { name: 'Сауна', description: '3 часа включено', price: 0, unit: 'сеанс' },
                { name: 'Деревянная купель', description: 'Дополнительные часы', price: 2000, unit: 'час', min_hours: 2 },
                { name: 'Завтрак', description: 'Континентальный завтрак', price: 500, unit: 'человек' }
            ]
        },
        {
            id: 3,
            type: 'large',
            name: 'Большой дом 3',
            description: 'Просторный дом с сауной для больших компаний',
            max_guests: 12,
            base_guests: 6,
            extra_guest_price: 1000,
            price_weekday: 15000,
            price_weekend: 25000,
            checkin_times: ['13:00', '15:00', '17:00'],
            checkout_time: '11:00',
            image: '🏠',
            photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
            services: [
                { name: 'Сауна', description: '3 часа включено', price: 0, unit: 'сеанс' },
                { name: 'Деревянная купель', description: 'Дополнительные часы', price: 2000, unit: 'час', min_hours: 2 },
                { name: 'Завтрак', description: 'Континентальный завтрак', price: 500, unit: 'человек' }
            ]
        },
        {
            id: 4,
            type: 'large',
            name: 'Большой дом 4',
            description: 'Просторный дом с сауной для больших компаний',
            max_guests: 12,
            base_guests: 6,
            extra_guest_price: 1000,
            price_weekday: 15000,
            price_weekend: 25000,
            checkin_times: ['13:00', '15:00', '17:00'],
            checkout_time: '11:00',
            image: '🏠',
            photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
            services: [
                { name: 'Сауна', description: '3 часа включено', price: 0, unit: 'сеанс' },
                { name: 'Деревянная купель', description: 'Дополнительные часы', price: 2000, unit: 'час', min_hours: 2 },
                { name: 'Завтрак', description: 'Континентальный завтрак', price: 500, unit: 'человек' }
            ]
        },
        {
            id: 5,
            type: 'large',
            name: 'Большой дом 5',
            description: 'Просторный дом с сауной для больших компаний',
            max_guests: 12,
            base_guests: 6,
            extra_guest_price: 1000,
            price_weekday: 15000,
            price_weekend: 25000,
            checkin_times: ['13:00', '15:00', '17:00'],
            checkout_time: '11:00',
            image: '🏠',
            photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
            services: [
                { name: 'Сауна', description: '3 часа включено', price: 0, unit: 'сеанс' },
                { name: 'Деревянная купель', description: 'Дополнительные часы', price: 2000, unit: 'час', min_hours: 2 },
                { name: 'Завтрак', description: 'Континентальный завтрак', price: 500, unit: 'человек' }
            ]
        },
        {
            id: 6,
            type: 'large',
            name: 'Большой дом 6',
            description: 'Просторный дом с сауной для больших компаний',
            max_guests: 12,
            base_guests: 6,
            extra_guest_price: 1000,
            price_weekday: 15000,
            price_weekend: 25000,
            checkin_times: ['13:00', '15:00', '17:00'],
            checkout_time: '11:00',
            image: '🏠',
            photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
            services: [
                { name: 'Сауна', description: '3 часа включено', price: 0, unit: 'сеанс' },
                { name: 'Деревянная купель', description: 'Дополнительные часы', price: 2000, unit: 'час', min_hours: 2 },
                { name: 'Завтрак', description: 'Континентальный завтрак', price: 500, unit: 'человек' }
            ]
        },
    ],
    couple: {
        id: 7,
        type: 'couple',
        name: 'Дом для двоих',
        description: 'Уютный дом для романтического отдыха',
        max_guests: 2,
        base_guests: 2,
        price_weekday: 8000,
        price_weekend: 10000,
        checkin_times: ['13:00'],
        checkout_time: '11:00',
        image: '❤️',
        services: [
            { name: 'Романтический ужин', description: 'Свечи и цветы', price: 3000 },
            { name: 'Джакузи', description: '2 часа включено', price: 0 }
        ]
    },
    family: {
        id: 8,
        type: 'family',
        name: 'Дом на четверых',
        description: 'Комфортабельный дом для семейного отдыха',
        max_guests: 4,
        base_guests: 4,
        price_weekday: 10000,
        price_weekend: 12000,
        checkin_times: ['13:00'],
        checkout_time: '11:00',
        image: '👨‍👩‍👧‍👦',
        services: [
            { name: 'Детская кроватка', description: 'Для маленьких гостей', price: 0 },
            { name: 'Настольные игры', description: 'Набор для всей семьи', price: 500 }
        ]
    }
};

const bookedDates = {
    1: ['2024-12-25', '2024-12-26'],
    2: ['2024-12-20', '2024-12-21'],
    7: ['2024-12-15'],
    8: ['2024-12-10', '2024-12-11']
};