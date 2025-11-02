class ProfileManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
    }

    loadUserData() {
        this.userData = {
            id: '12345',
            name: 'Алексей Иванов',
            level: 'Bronze',
            coins: 1000,
            referrals: 3,
            earnedCoins: 1500,
            progress: 45 // прогресс до следующего уровня в %
        };
        this.updateProfileDisplay();
    }

    bindEvents() {
        document.getElementById('copy-referral-btn')?.addEventListener('click', () => {
            this.copyReferralLink();
        });

        document.querySelectorAll('[data-offer]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const offer = e.target.dataset.offer;
                this.redeemOffer(offer);
            });
        });

        document.getElementById('suggestion-btn')?.addEventListener('click', () => {
            this.sendSuggestion();
        });

        document.getElementById('feedback-btn')?.addEventListener('click', () => {
            this.sendFeedback();
        });
    }

    updateProfileDisplay() {
        const userName = document.querySelector('.user-name');
        const userId = document.querySelector('.user-id');
        const coinBalance = document.querySelector('.coin-balance');

        if (userName) userName.textContent = this.userData.name;
        if (userId) userId.textContent = `ID: ${this.userData.id}`;
        if (coinBalance) coinBalance.textContent = `Баланс: ${this.userData.coins} A-Coin`;

        // Обновляем статистику
        document.querySelectorAll('.stat-value').forEach(stat => {
            const parent = stat.closest('.stat-card');
            if (parent) {
                const label = parent.querySelector('.stat-label').textContent;
                if (label === 'Уровень') stat.textContent = this.userData.level;
                if (label === 'A-Coin') stat.textContent = this.userData.coins;
                if (label === 'Рефералы') stat.textContent = this.userData.referrals;
            }
        });

        // Обновляем реферальную статистику
        const referralStats = document.querySelectorAll('.referral-stat');
        referralStats.forEach(stat => {
            const text = stat.querySelector('span').textContent;
            if (text === 'Приглашено:') {
                stat.querySelector('strong').textContent = `${this.userData.referrals} человек`;
            }
            if (text === 'Заработано:') {
                stat.querySelector('strong').textContent = `${this.userData.earnedCoins} A-Coin`;
            }
        });

        // Обновляем уровни лояльности
        this.renderLoyaltyLevels();
    }

    renderLoyaltyLevels() {
        const loyaltyLevels = [
            {
                name: 'Bronze',
                icon: '🥉',
                description: 'Базовый уровень',
                requirements: '0 A-Coin',
                color: 'var(--bronze-color)'
            },
            {
                name: 'Silver',
                icon: '🥈',
                description: 'Серебряный уровень',
                requirements: '5,000 A-Coin',
                color: 'var(--silver-color)'
            },
            {
                name: 'Gold',
                icon: '🥇',
                description: 'Золотой уровень',
                requirements: '15,000 A-Coin',
                color: 'var(--gold-color)'
            },
            {
                name: 'Brilliant',
                icon: '💎',
                description: 'Бриллиантовый уровень',
                requirements: '30,000 A-Coin',
                color: 'var(--brilliant-color)'
            }
        ];

        const container = document.querySelector('.loyalty-levels');
        if (!container) return;

        container.innerHTML = loyaltyLevels.map(level => `
            <div class="loyalty-level ${level.name.toLowerCase()} ${this.userData.level === level.name ? 'active' : ''}">
                <div class="level-icon">${level.icon}</div>
                <div class="level-info">
                    <div class="level-name">${level.name}</div>
                    <div class="level-description">${level.description} • ${level.requirements}</div>
                    ${this.userData.level === level.name ? `
                        <div class="level-progress">
                            <div class="progress-bar" style="width: ${this.userData.progress}%"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    copyReferralLink() {
        const referralLink = `https://t.me/aframevillage_bot?start=ref_${this.userData.id}`;
        
        navigator.clipboard.writeText(referralLink).then(() => {
            const btn = document.getElementById('copy-referral-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Ссылка скопирована!';
            btn.style.background = 'var(--accent-success)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            alert('Не удалось скопировать ссылку');
        });
    }

    redeemOffer(offer) {
        const offerConfig = {
            discount_10: { cost: 500, name: 'Скидка 10%' },
            free_sauna: { cost: 300, name: 'Бесплатная сауна' }
        };

        const selectedOffer = offerConfig[offer];
        
        if (!selectedOffer) {
            alert('Предложение не найдено');
            return;
        }

        if (this.userData.coins < selectedOffer.cost) {
            alert('Недостаточно A-Coin для обмена');
            return;
        }

        if (confirm(`Обменять ${selectedOffer.cost} A-Coin на "${selectedOffer.name}"?`)) {
            this.userData.coins -= selectedOffer.cost;
            this.updateProfileDisplay();
            alert(`Предложение "${selectedOffer.name}" успешно активировано!`);
        }
    }

    sendSuggestion() {
        const message = prompt('Напишите ваше предложение по улучшению сервиса:');
        if (message && message.trim()) {
            console.log('Предложение отправлено:', message);
            alert('Спасибо за ваше предложение! Мы его рассмотрим.');
        }
    }

    sendFeedback() {
        const message = prompt('Поделитесь вашими впечатлениями о сервисе:');
        if (message && message.trim()) {
            console.log('Отзыв отправлен:', message);
            alert('Спасибо за ваш отзыв!');
        }
    }
}