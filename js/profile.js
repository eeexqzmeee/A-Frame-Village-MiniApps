class ProfileManager {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
    }

    loadUserData() {
        // Загрузка данных пользователя
        const userName = document.querySelector('.user-name');
        const userId = document.querySelector('.user-id');
        
        if (userName) {
            userName.textContent = 'Алексей Иванов';
        }
        
        if (userId) {
            userId.textContent = 'ID: 12345';
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'copy-referral-btn') {
                this.copyReferralLink();
            }

            if (e.target.classList.contains('btn-small')) {
                const offer = e.target.dataset.offer;
                this.handleOfferPurchase(offer);
            }

            if (e.target.id === 'suggestion-btn') {
                this.sendSuggestion();
            }

            if (e.target.id === 'feedback-btn') {
                this.sendFeedback();
            }
        });
    }

    copyReferralLink() {
        const referralLink = 'https://t.me/aframe_village_bot?start=ref12345';
        
        navigator.clipboard.writeText(referralLink).then(() => {
            alert('Реферальная ссылка скопирована!');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Реферальная ссылка скопирована!');
        });
    }

    handleOfferPurchase(offer) {
        alert(`Предложение "${offer}" приобретено!`);
    }

    sendSuggestion() {
        alert('Функция отправки предложения');
    }

    sendFeedback() {
        alert('Функция отправки отзыва');
    }
}