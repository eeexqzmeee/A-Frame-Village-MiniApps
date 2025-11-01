class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = database.getUser(currentUserId);
        this.bindProfileEvents();
        this.renderProfileScreen();
    }

    bindProfileEvents() {
        // Обработчики будут добавлены после рендера
        document.addEventListener('click', (e) => {
            if (e.target.id === 'copy-referral-btn' || e.target.closest('#copy-referral-btn')) {
                this.copyReferralLink();
            }
            
            if (e.target.closest('[data-offer]')) {
                const offerId = e.target.closest('[data-offer]').dataset.offer;
                this.purchaseOffer(offerId);
            }
            
            if (e.target.id === 'suggestion-btn' || e.target.closest('#suggestion-btn')) {
                this.openSuggestion();
            }
            
            if (e.target.id === 'feedback-btn' || e.target.closest('#feedback-btn')) {
                this.openFeedback();
            }
        });
    }

    renderProfileScreen() {
        const screen = document.getElementById('profile-screen');
        if (!screen) return;

        const userStats = this.getUserStats();
        const levelInfo = this.getLevelInfo(this.currentUser.level);
        
        screen.innerHTML = `
            <div class="profile-header" style="border-color: ${levelInfo.color}40; background: ${levelInfo.color}10;">
                <div class="user-avatar" style="background: ${levelInfo.color}20; color: ${levelInfo.color};">
                    <div class="avatar-placeholder">${levelInfo.icon}</div>
                </div>
                <div class="user-info">
                    <h2 class="user-name">${this.currentUser.name || 'Пользователь'}</h2>
                    <p class="user-id">ID: ${currentUserId.slice(0, 8)}</p>
                    <div class="user-level-badge" style="background: ${levelInfo.color};">
                        ${this.currentUser.level}
                    </div>
                </div>
            </div>

            <div class="profile-stats">
                <div class="stat-card level-card" style="border-color: ${levelInfo.color}40;">
                    <div class="stat-value" style="color: ${levelInfo.color};">${this.currentUser.level}</div>
                    <div class="stat-label">Уровень</div>
                    <div class="level-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${levelInfo.progress}%; background: ${levelInfo.color};"></div>
                        </div>
                        <div class="level-stats">
                            <span>${this.currentUser.bookingsCount || 0} из ${levelInfo.nextLevelBookings} бронирований</span>
                        </div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.currentUser.acoins}</div>
                    <div class="stat-label">A-Coin</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${userStats.referrals}</div>
                    <div class="stat-label">Рефералы</div>
                </div>
            </div>

            <div class="levels-section">
                <h3 class="section-title">Система уровней</h3>
                <div class="levels-container">
                    ${this.renderLevelsProgress()}
                </div>
            </div>

            <div class="profile-section">
                <h3 class="section-title">Реферальная система</h3>
                <div class="referral-card">
                    <div class="referral-info">
                        <h4>Пригласите друзей</h4>
                        <p>Получите 500 A-Coin за каждого друга, который совершит бронирование</p>
                    </div>
                    <div class="referral-stats">
                        <div class="referral-stat">
                            <span>Приглашено:</span>
                            <strong>${userStats.referrals} человек</strong>
                        </div>
                        <div class="referral-stat">
                            <span>Заработано:</span>
                            <strong>${userStats.referralEarnings} A-Coin</strong>
                        </div>
                    </div>
                    <button class="btn-primary" id="copy-referral-btn">
                        Скопировать реферальную ссылку
                    </button>
                </div>
            </div>

            <div class="profile-section">
                <h3 class="section-title">Магазин A-Coin</h3>
                <div class="shop-card">
                    <div class="shop-header">
                        <h4>Доступные предложения</h4>
                        <div class="coin-balance">Баланс: ${this.currentUser.acoins} A-Coin</div>
                    </div>
                    
                    <div class="offers-list">
                        <div class="offer-item">
                            <div class="offer-info">
                                <h5>Скидка 10% на бронирование</h5>
                                <p>Действует на все дома до конца месяца</p>
                            </div>
                            <div class="offer-price">
                                <span class="coin-cost">500 A-Coin</span>
                                <button class="btn-small" data-offer="discount_10" ${this.currentUser.acoins < 500 ? 'disabled' : ''}>
                                    ${this.currentUser.acoins < 500 ? 'Недостаточно' : 'Обменять'}
                                </button>
                            </div>
                        </div>
                        
                        <div class="offer-item">
                            <div class="offer-info">
                                <h5>Бесплатная сауна</h5>
                                <p>3 часа сауны в подарок к бронированию</p>
                            </div>
                            <div class="offer-price">
                                <span class="coin-cost">300 A-Coin</span>
                                <button class="btn-small" data-offer="free_sauna" ${this.currentUser.acoins < 300 ? 'disabled' : ''}>
                                    ${this.currentUser.acoins < 300 ? 'Недостаточно' : 'Обменять'}
                                </button>
                            </div>
                        </div>
                        
                        <div class="offer-item">
                            <div class="offer-info">
                                <h5>Поздний выезд</h5>
                                <p>Выезд до 14:00 вместо 12:00</p>
                            </div>
                            <div class="offer-price">
                                <span class="coin-cost">200 A-Coin</span>
                                <button class="btn-small" data-offer="late_checkout" ${this.currentUser.acoins < 200 ? 'disabled' : ''}>
                                    ${this.currentUser.acoins < 200 ? 'Недостаточно' : 'Обменять'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="shop-note">
                        ⚠️ A-Coin сгорают в конце каждого месяца. Используйте их до ${this.getNextMonth()}
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h3 class="section-title">Обратная связь</h3>
                <div class="feedback-buttons">
                    <button class="btn-secondary" id="suggestion-btn">
                        💡 Написать предложение по улучшению
                    </button>
                    <button class="btn-secondary" id="feedback-btn">
                        ⭐ Оставить отзыв
                    </button>
                </div>
            </div>

            <div class="profile-section">
                <h3 class="section-title">История операций</h3>
                <div class="transactions-list" id="transactions-list">
                    ${this.renderTransactions()}
                </div>
            </div>
        `;

        // Применяем цвет темы уровня
        this.applyLevelTheme(levelInfo.color);
    }

    getLevelInfo(level) {
        const levels = {
            'Bronze': {
                color: '#CD7F32',
                icon: '🥉',
                nextLevel: 'Silver',
                nextLevelBookings: 3,
                progress: 0
            },
            'Silver': {
                color: '#C0C0C0', 
                icon: '🥈',
                nextLevel: 'Gold',
                nextLevelBookings: 6,
                progress: 33
            },
            'Gold': {
                color: '#FFD700',
                icon: '🥇',
                nextLevel: 'Diamond',
                nextLevelBookings: 10,
                progress: 66
            },
            'Diamond': {
                color: '#B9F2FF',
                icon: '💎',
                nextLevel: null,
                nextLevelBookings: null,
                progress: 100
            }
        };

        const levelInfo = levels[level] || levels['Bronze'];
        
        // Рассчитываем прогресс для текущего уровня
        if (level !== 'Diamond') {
            const currentBookings = this.currentUser.bookingsCount || 0;
            const prevLevelBookings = level === 'Silver' ? 3 : level === 'Gold' ? 6 : 0;
            const neededForNext = levelInfo.nextLevelBookings - prevLevelBookings;
            const progress = Math.min(100, Math.max(0, ((currentBookings - prevLevelBookings) / neededForNext) * 100));
            levelInfo.progress = Math.round(progress);
        }

        return levelInfo;
    }

    renderLevelsProgress() {
        const levels = [
            { name: 'Bronze', bookings: 0, color: '#CD7F32', icon: '🥉' },
            { name: 'Silver', bookings: 3, color: '#C0C0C0', icon: '🥈' },
            { name: 'Gold', bookings: 6, color: '#FFD700', icon: '🥇' },
            { name: 'Diamond', bookings: 10, color: '#B9F2FF', icon: '💎' }
        ];

        const currentBookings = this.currentUser.bookingsCount || 0;

        return levels.map(level => `
            <div class="level-item ${this.currentUser.level === level.name ? 'current' : ''} ${currentBookings >= level.bookings ? 'unlocked' : 'locked'}">
                <div class="level-icon" style="background: ${level.color}20; color: ${level.color};">
                    ${level.icon}
                </div>
                <div class="level-info">
                    <div class="level-name">${level.name}</div>
                    <div class="level-requirement">
                        ${level.bookings === 0 ? 'Стартовый уровень' : `От ${level.bookings} бронирований`}
                    </div>
                </div>
                <div class="level-status">
                    ${this.currentUser.level === level.name ? 
                        '<span class="current-badge">Текущий</span>' : 
                        currentBookings >= level.bookings ? 
                        '<span class="unlocked-badge">✓ Открыт</span>' : 
                        '<span class="locked-badge">🔒 Заблокирован</span>'
                    }
                </div>
            </div>
        `).join('');
    }

    applyLevelTheme(color) {
        // Применяем цвет уровня к различным элементам
        const style = document.createElement('style');
        style.textContent = `
            .profile-section .section-title {
                border-left: 3px solid ${color};
            }
            .level-item.current {
                border-color: ${color};
            }
        `;
        document.head.appendChild(style);
    }

    getUserStats() {
        const transactions = JSON.parse(localStorage.getItem('acoinTransactions') || '[]');
        const userTransactions = transactions.filter(t => t.userId === currentUserId);
        
        const referrals = userTransactions.filter(t => t.reason?.includes('реферал')).length;
        const referralEarnings = userTransactions
            .filter(t => t.reason?.includes('реферал'))
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            referrals,
            referralEarnings,
            totalTransactions: userTransactions.length
        };
    }

    renderTransactions() {
        const transactions = JSON.parse(localStorage.getItem('acoinTransactions') || '[]');
        const userTransactions = transactions
            .filter(t => t.userId === currentUserId)
            .slice(0, 10)
            .reverse();

        if (userTransactions.length === 0) {
            return `<div class="empty-state">Нет операций</div>`;
        }

        return userTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-reason">${transaction.reason}</div>
                    <div class="transaction-date">${new Date(transaction.date).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount} A-Coin
                </div>
            </div>
        `).join('');
    }

    copyReferralLink() {
        const referralLink = `https://t.me/your_bot?start=${currentUserId}`;
        navigator.clipboard.writeText(referralLink).then(() => {
            this.showNotification('Реферальная ссылка скопирована');
        }).catch(() => {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Реферальная ссылка скопирована');
        });
    }

    purchaseOffer(offerId) {
        const offers = {
            'discount_10': { cost: 500, name: 'Скидка 10%' },
            'free_sauna': { cost: 300, name: 'Бесплатная сауна' },
            'late_checkout': { cost: 200, name: 'Поздний выезд' }
        };

        const offer = offers[offerId];
        if (!offer) return;

        if (this.currentUser.acoins < offer.cost) {
            this.showNotification('Недостаточно A-Coin', 'error');
            return;
        }

        if (!confirm(`Вы уверены, что хотите обменять ${offer.cost} A-Coin на "${offer.name}"?`)) {
            return;
        }

        // Списание коинов
        database.addAcoins(currentUserId, -offer.cost, `Покупка: ${offer.name}`);
        this.currentUser = database.getUser(currentUserId);
        
        this.showNotification(`Успешно приобретено: ${offer.name}`);
        this.renderProfileScreen();
        
        // Обновляем данные в основном приложении
        if (window.app) {
            window.app.currentUser = this.currentUser;
        }
    }

    openSuggestion() {
        const message = "Предложение по улучшению сервиса A-Frame Village:\n\n";
        this.openTelegramChat(message);
    }

    openFeedback() {
        const message = "Отзыв о сервисе A-Frame Village:\n\n";
        this.openTelegramChat(message);
    }

    openTelegramChat(message) {
        if (window.Telegram && Telegram.WebApp) {
            const url = `https://t.me/your_support_bot?start=${encodeURIComponent(message)}`;
            Telegram.WebApp.openTelegramLink(url);
        } else {
            // Fallback для браузера
            const emailSubject = encodeURIComponent("Обратная связь - A-Frame Village");
            const emailBody = encodeURIComponent(message);
            window.open(`mailto:support@aframe-village.ru?subject=${emailSubject}&body=${emailBody}`, '_blank');
        }
    }

    getNextMonth() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(0); // Последний день текущего месяца
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }

    showNotification(message, type = 'success') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback уведомление
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 500;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
    }
}

// Инициализация менеджера профиля
const profileManager = new ProfileManager();