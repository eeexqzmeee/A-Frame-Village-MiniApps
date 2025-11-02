class ProfileManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.renderLoyaltyLevels();
    }

    loadUserData() {
        this.userData = {
            id: '12345',
            name: 'Алексей Иванов',
            level: 'Bronze',
            coins: 1000,
            referrals: 3,
            earnedCoins: 1500,
            progress: 45, // прогресс до следующего уровня в %
            nextLevel: 'Silver',
            nextLevelProgress: 45 // текущий прогресс
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
    }

    renderLoyaltyLevels() {
        const loyaltyLevels = [
            {
                name: 'Bronze',
                icon: '🥉',
                description: 'Базовый уровень с стандартными привилегиями',
                requirements: '0 A-Coin',
                benefits: ['Базовые скидки', 'Поддержка 24/7', 'Доступ ко всем домам'],
                color: 'var(--bronze-color)',
                progress: 100,
                isCurrent: this.userData.level === 'Bronze'
            },
            {
                name: 'Silver',
                icon: '🥈', 
                description: 'Расширенные возможности и привилегии',
                requirements: '5,000 A-Coin',
                benefits: ['Скидка 5% на бронирования', 'Приоритетная поддержка', 'Ранний доступ к акциям', 'Бесплатные улучшения'],
                color: 'var(--silver-color)',
                progress: this.userData.level === 'Bronze' ? this.userData.progress : (this.userData.level === 'Silver' ? 100 : 0),
                isCurrent: this.userData.level === 'Silver'
            },
            {
                name: 'Gold',
                icon: '🥇',
                description: 'Премиальные привилегии для постоянных гостей',
                requirements: '15,000 A-Coin', 
                benefits: ['Скидка 10% на бронирования', 'Персональный менеджер', 'Бесплатные дополнительные услуги', 'Эксклюзивные предложения', 'Приоритетное бронирование'],
                color: 'var(--gold-color)',
                progress: this.userData.level === 'Silver' ? this.userData.progress : (this.userData.level === 'Gold' ? 100 : 0),
                isCurrent: this.userData.level === 'Gold'
            },
            {
                name: 'Brilliant',
                icon: '💎',
                description: 'Максимальный уровень с эксклюзивными возможностями',
                requirements: '30,000 A-Coin',
                benefits: ['Скидка 15% на все бронирования', 'VIP обслуживание', 'Бесплатные дополнительные услуги', 'Доступ к закрытым мероприятиям', 'Персональные скидки', 'Эксклюзивный доступ'],
                color: 'var(--brilliant-color)',
                progress: this.userData.level === 'Gold' ? this.userData.progress : (this.userData.level === 'Brilliant' ? 100 : 0),
                isCurrent: this.userData.level === 'Brilliant'
            }
        ];

        const container = document.querySelector('.loyalty-levels');
        if (!container) {
            // Создаем контейнер если его нет
            const profileSection = document.querySelector('.profile-section');
            if (profileSection) {
                const loyaltySection = document.createElement('div');
                loyaltySection.className = 'profile-section loyalty-section';
                loyaltySection.innerHTML = `
                    <h3 class="section-title">Уровни лояльности</h3>
                    <div class="loyalty-levels"></div>
                `;
                profileSection.parentNode.insertBefore(loyaltySection, profileSection);
            }
            return;
        }

        container.innerHTML = loyaltyLevels.map(level => `
            <div class="loyalty-level ${level.name.toLowerCase()} ${level.isCurrent ? 'active' : ''} scroll-reveal">
                <div class="level-icon">${level.icon}</div>
                <div class="level-info">
                    <div class="level-name">${level.name}</div>
                    <div class="level-description">${level.description}</div>
                    <div class="level-requirements">Требуется: ${level.requirements}</div>
                    
                    <div class="level-benefits">
                        ${level.benefits.map(benefit => `
                            <div class="benefit-item">${benefit}</div>
                        `).join('')}
                    </div>
                    
                    ${level.progress > 0 ? `
                        <div class="level-progress">
                            <div class="progress-bar" style="width: ${level.progress}%; background: ${level.color};"></div>
                        </div>
                        ${level.isCurrent && level.progress < 100 ? `
                            <div class="progress-text">Прогресс до следующего уровня: ${level.progress}%</div>
                        ` : level.isCurrent ? `
                            <div class="progress-text">Максимальный уровень достигнут!</div>
                        ` : ''}
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Инициализируем анимации для новых элементов
        this.initScrollReveal();
    }

    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
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