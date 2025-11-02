// profile.js - ОБНОВЛЕННЫЙ КОД ДЛЯ УРОВНЕЙ
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
            progress: 45,
            nextLevel: 'Silver'
        };
        this.updateProfileDisplay();
    }

    renderLoyaltyLevels() {
        const loyaltyLevels = [
            {
                name: 'Bronze',
                icon: '🥉',
                color: '#CD7F32',
                description: 'Начните свой путь к эксклюзивным привилегиям',
                requirements: '0 A-Coin',
                benefits: ['Базовые скидки на бронирования', 'Круглосуточная поддержка', 'Доступ ко всем домам комплекса'],
                progress: 100,
                isCurrent: this.userData.level === 'Bronze'
            },
            {
                name: 'Silver', 
                icon: '🥈',
                color: '#C0C0C0',
                description: 'Расширенные возможности для постоянных гостей',
                requirements: '5,000 A-Coin',
                benefits: ['Скидка 5% на все бронирования', 'Приоритетная поддержка', 'Ранний доступ к акциям', 'Бесплатные улучшения'],
                progress: this.userData.level === 'Bronze' ? this.userData.progress : (this.userData.level === 'Silver' ? 100 : 0),
                isCurrent: this.userData.level === 'Silver'
            },
            {
                name: 'Gold',
                icon: '🥇',
                color: '#FFD700', 
                description: 'Премиальные привилегии для самых верных гостей',
                requirements: '15,000 A-Coin',
                benefits: ['Скидка 10% на все бронирования', 'Персональный менеджер', 'Бесплатные дополнительные услуги', 'Эксклюзивные предложения', 'Приоритетное бронирование'],
                progress: this.userData.level === 'Silver' ? this.userData.progress : (this.userData.level === 'Gold' ? 100 : 0),
                isCurrent: this.userData.level === 'Gold'
            },
            {
                name: 'Brilliant',
                icon: '💎',
                color: '#52E0FF',
                description: 'Максимальный уровень с эксклюзивными VIP-возможностями',
                requirements: '30,000 A-Coin',
                benefits: ['Скидка 15% на все бронирования', 'VIP обслуживание', 'Все дополнительные услуги бесплатно', 'Доступ к закрытым мероприятиям', 'Персональные скидки', 'Эксклюзивный доступ к новым домам'],
                progress: this.userData.level === 'Gold' ? this.userData.progress : (this.userData.level === 'Brilliant' ? 100 : 0),
                isCurrent: this.userData.level === 'Brilliant'
            }
        ];

        let loyaltySection = document.querySelector('.loyalty-section');
        if (!loyaltySection) {
            loyaltySection = document.createElement('div');
            loyaltySection.className = 'profile-section loyalty-section';
            loyaltySection.innerHTML = `
                <h3 class="section-title">💎 Уровни лояльности</h3>
                <div class="loyalty-levels"></div>
            `;
            document.querySelector('.screen-content').insertBefore(loyaltySection, document.querySelector('.profile-section'));
        }

        const container = document.querySelector('.loyalty-levels');
        if (!container) return;

        container.innerHTML = loyaltyLevels.map(level => `
            <div class="loyalty-level ${level.name.toLowerCase()} ${level.isCurrent ? 'active' : ''} scroll-reveal">
                <div class="level-header">
                    <div class="level-icon" style="background: linear-gradient(135deg, ${level.color}20, ${level.color}40); border: 2px solid ${level.color}40;">
                        ${level.icon}
                    </div>
                    <div class="level-info">
                        <div class="level-name" style="background: linear-gradient(135deg, ${level.color}, ${level.color}CC); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${level.name}
                        </div>
                        <div class="level-description">${level.description}</div>
                        <div class="level-requirements">${level.requirements}</div>
                    </div>
                </div>

                <div class="level-benefits">
                    ${level.benefits.map(benefit => `
                        <div class="benefit-item">${benefit}</div>
                    `).join('')}
                </div>
                    
                ${level.progress > 0 ? `
                    <div class="level-progress">
                        <div class="progress-bar" style="width: ${level.progress}%; background: linear-gradient(90deg, ${level.color}, ${level.color}CC);"></div>
                    </div>
                    ${level.isCurrent && level.progress < 100 ? `
                        <div class="progress-text">Прогресс до ${this.userData.nextLevel}: ${level.progress}%</div>
                    ` : level.isCurrent ? `
                        <div class="progress-text">🎉 Максимальный уровень достигнут!</div>
                    ` : ''}
                ` : ''}
            </div>
        `).join('');

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

    // Остальные методы остаются без изменений
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

        document.querySelectorAll('.stat-value').forEach(stat => {
            const parent = stat.closest('.stat-card');
            if (parent) {
                const label = parent.querySelector('.stat-label').textContent;
                if (label === 'Уровень') stat.textContent = this.userData.level;
                if (label === 'A-Coin') stat.textContent = this.userData.coins;
                if (label === 'Рефералы') stat.textContent = this.userData.referrals;
            }
        });

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
        });
    }

    redeemOffer(offer) {
        const offerConfig = {
            discount_10: { cost: 500, name: 'Скидка 10%' },
            free_sauna: { cost: 300, name: 'Бесплатная сауна' }
        };
        const selectedOffer = offerConfig[offer];
        if (!selectedOffer) return;
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
            alert('Спасибо за ваше предложение! Мы его рассмотрим.');
        }
    }

    sendFeedback() {
        const message = prompt('Поделитесь вашими впечатлениями о сервисе:');
        if (message && message.trim()) {
            alert('Спасибо за ваш отзыв!');
        }
    }
}