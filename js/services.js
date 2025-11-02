// services.js - исправленная версия
class ServicesManager {
    constructor() {
        this.selectedServices = [];
        this.selectedHouse = null;
    }

    showServicesScreen(house) {
        this.selectedHouse = house;
        this.selectedServices = []; // Сбрасываем при каждом открытии
        
        const screen = document.getElementById('services-screen');
        if (!screen) return;

        screen.innerHTML = `
            <header class="header">
                <button class="header-btn back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="header-title">Дополнительные услуги</div>
                <div class="header-actions"></div>
            </header>

            <div class="screen-content">
                <div class="house-summary-with-photos">
                    <div class="house-photos">
                        <div class="main-photo">
                            <div class="photo-placeholder">${house.image}</div>
                        </div>
                        <div class="photo-thumbnails">
                            <div class="thumbnail active">${house.image}</div>
                            <div class="thumbnail">🛋️</div>
                            <div class="thumbnail">🍳</div>
                            <div class="thumbnail">🌳</div>
                        </div>
                    </div>
                    
                    <div class="house-summary">
                        <h2>${house.name}</h2>
                        <p class="house-description">${house.description}</p>
                        <div class="house-features-mini">
                            <span class="feature-mini">👥 до ${house.max_guests} гостей</span>
                            <span class="feature-mini">⏰ ${house.checkin_times.join(', ')}</span>
                        </div>
                    </div>
                </div>

                <div class="services-container">
                    ${this.renderServicesList(house)}
                    
                    ${this.hasChaanService(house) ? this.renderChaanSlider() : ''}
                </div>

                <div class="selected-services-summary">
                    <h3>Выбранные услуги</h3>
                    <div class="services-list" id="selected-services-list">
                        ${this.renderSelectedServices()}
                    </div>
                    <div class="services-total">
                        <span>Итого за услуги:</span>
                        <span id="services-total-price">0₽</span>
                    </div>
                </div>

                <button class="book-btn large primary" id="continue-to-dates">
                    <span>Перейти к выбору дат</span>
                    <span class="price-badge" id="continue-price-badge">0₽</span>
                </button>
            </div>
        `;

        this.attachServicesEvents();
        this.updateServicesTotal();
    }

    hasChaanService(house) {
        return house.services && house.services.some(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель') ||
            s.name.toLowerCase().includes('чан')
        );
    }

    renderServicesList(house) {
        if (!house.services || house.services.length === 0) {
            return '<div class="no-services">Нет дополнительных услуг</div>';
        }

        // Фильтруем чан из основного списка, т.к. он будет в слайдере
        const filteredServices = house.services.filter(service => 
            !service.name.toLowerCase().includes('чан') && 
            !service.name.toLowerCase().includes('купель')
        );

        if (filteredServices.length === 0) return '';

        return `
            <div class="services-section">
                <h3>Дополнительные услуги</h3>
                <div class="services-list">
                    ${filteredServices.map(service => `
                        <div class="service-item" data-service="${service.name}">
                            <div class="service-info">
                                <div class="service-name">${service.name}</div>
                                <div class="service-description">${service.description}</div>
                            </div>
                            <div class="service-controls">
                                ${service.price > 0 ? `
                                    <div class="service-price">${service.price.toLocaleString()}₽</div>
                                    <button class="service-toggle ${this.isServiceSelected(service.name) ? 'active' : ''}" 
                                            data-service="${service.name}">
                                        ${this.isServiceSelected(service.name) ? '✓' : '+'}
                                    </button>
                                ` : `
                                    <div class="service-free">Бесплатно</div>
                                    <button class="service-toggle ${this.isServiceSelected(service.name) ? 'active' : ''}" 
                                            data-service="${service.name}">
                                        ${this.isServiceSelected(service.name) ? '✓' : '+'}
                                    </button>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderChaanSlider() {
        const chaanService = this.selectedHouse.services.find(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );
        
        if (!chaanService) return '';

        const selectedOption = this.getSelectedChaanOption();
        const hours = selectedOption.value;
        const price = chaanService.price * hours;

        return `
            <div class="chan-slider-section">
                <h3>${chaanService.name}</h3>
                <p class="service-description">${chaanService.description}</p>
                
                <div class="slider-container">
                    <div class="slider-labels">
                        <div class="slider-label ${hours === 2 ? 'active' : ''}" data-hours="2">
                            <div class="label-title">2 часа</div>
                            <div class="label-price">${(chaanService.price * 2).toLocaleString()}₽</div>
                        </div>
                        <div class="slider-label ${hours === 4 ? 'active' : ''}" data-hours="4">
                            <div class="label-title">4 часа</div>
                            <div class="label-price">${(chaanService.price * 4).toLocaleString()}₽</div>
                        </div>
                        <div class="slider-label ${hours === 8 ? 'active' : ''}" data-hours="8">
                            <div class="label-title">Вся ночь</div>
                            <div class="label-price">${(chaanService.price * 8).toLocaleString()}₽</div>
                        </div>
                    </div>
                    
                    <div class="slider-track-container">
                        <div class="slider-track">
                            <div class="slider-progress" style="width: ${((hours - 2) / 6) * 100}%"></div>
                            <div class="slider-thumb" style="left: ${((hours - 2) / 6) * 100}%"></div>
                        </div>
                        <input type="range" 
                               class="chan-slider" 
                               min="2" 
                               max="8" 
                               step="2" 
                               value="${hours}"
                               id="chan-hours-slider">
                    </div>
                    
                    <div class="slider-value">
                        <span>Выбрано:</span>
                        <strong>${selectedOption.hoursText}</strong>
                        <span class="slider-price">${price.toLocaleString()}₽</span>
                    </div>

                    <button class="chan-toggle-btn ${this.isChaanSelected() ? 'active' : ''}" id="chan-toggle">
                        ${this.isChaanSelected() ? '✓ Услуга выбрана' : 'Выбрать услугу'}
                    </button>
                </div>
            </div>
        `;
    }

    renderSelectedServices() {
        if (this.selectedServices.length === 0) {
            return '<div class="no-selected-services">Услуги не выбраны</div>';
        }

        return this.selectedServices.map(service => `
            <div class="selected-service-item">
                <div class="service-details">
                    <div class="service-name">${service.name}</div>
                    ${service.hours ? `<div class="service-hours">${service.hoursText}</div>` : ''}
                </div>
                <div class="service-price">
                    ${service.totalPrice > 0 ? service.totalPrice.toLocaleString() + '₽' : 'Бесплатно'}
                </div>
            </div>
        `).join('');
    }

    attachServicesEvents() {
        // Кнопка назад
        const backBtn = document.querySelector('#services-screen .header-btn.back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.showScreen('houses-screen');
                }
            });
        }

        // Переключение обычных услуг
        document.querySelectorAll('.service-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceName = e.target.getAttribute('data-service');
                this.toggleService(serviceName);
            });
        });

        // Слайдер для чана
        const slider = document.getElementById('chan-hours-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                this.updateChaanHours(parseInt(e.target.value));
            });
        }

        // Клик по меткам слайдера
        document.querySelectorAll('.slider-label').forEach(label => {
            label.addEventListener('click', (e) => {
                const hours = parseInt(e.currentTarget.getAttribute('data-hours'));
                this.updateChaanHours(hours);
                const slider = document.getElementById('chan-hours-slider');
                if (slider) slider.value = hours;
            });
        });

        // Кнопка переключения чана
        const chanToggle = document.getElementById('chan-toggle');
        if (chanToggle) {
            chanToggle.addEventListener('click', () => {
                this.toggleChaanService();
            });
        }

        // Кнопка продолжения
        const continueBtn = document.getElementById('continue-to-dates');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.continueToDates();
            });
        }
    }

    toggleService(serviceName) {
        const service = this.selectedHouse.services.find(s => s.name === serviceName);
        if (!service) return;

        const existingIndex = this.selectedServices.findIndex(s => s.name === serviceName);
        
        if (existingIndex >= 0) {
            this.selectedServices.splice(existingIndex, 1);
        } else {
            this.selectedServices.push({
                name: service.name,
                description: service.description,
                price: service.price,
                totalPrice: service.price
            });
        }

        this.updateServicesUI();
    }

    toggleChaanService() {
        const chaanService = this.selectedHouse.services.find(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );
        
        if (!chaanService) return;

        const existingIndex = this.selectedServices.findIndex(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );

        if (existingIndex >= 0) {
            this.selectedServices.splice(existingIndex, 1);
        } else {
            const hours = this.getSelectedChaanOption().value;
            this.selectedServices.push({
                name: chaanService.name,
                description: chaanService.description,
                price: chaanService.price,
                hours: hours,
                hoursText: this.getHoursText(hours),
                totalPrice: chaanService.price * hours
            });
        }

        this.updateServicesUI();
    }

    updateChaanHours(hours) {
        const chaanService = this.selectedHouse.services.find(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );
        
        if (!chaanService) return;

        const existingIndex = this.selectedServices.findIndex(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );

        if (existingIndex >= 0) {
            this.selectedServices[existingIndex].hours = hours;
            this.selectedServices[existingIndex].hoursText = this.getHoursText(hours);
            this.selectedServices[existingIndex].totalPrice = chaanService.price * hours;
        }

        this.updateChaanSliderUI(hours);
        this.updateServicesTotal();
    }

    updateChaanSliderUI(hours) {
        // Обновляем активные метки
        document.querySelectorAll('.slider-label').forEach(label => {
            const labelHours = parseInt(label.getAttribute('data-hours'));
            label.classList.toggle('active', labelHours === hours);
        });

        // Обновляем прогресс слайдера
        const progress = document.querySelector('.slider-progress');
        const thumb = document.querySelector('.slider-thumb');
        
        if (progress && thumb) {
            const progressWidth = ((hours - 2) / 6) * 100;
            progress.style.width = `${progressWidth}%`;
            thumb.style.left = `${progressWidth}%`;
        }

        // Обновляем отображаемое значение
        const valueDisplay = document.querySelector('.slider-value strong');
        const priceDisplay = document.querySelector('.slider-price');
        const chaanService = this.selectedHouse.services.find(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );
        
        if (valueDisplay && priceDisplay && chaanService) {
            valueDisplay.textContent = this.getHoursText(hours);
            priceDisplay.textContent = (chaanService.price * hours).toLocaleString() + '₽';
        }
    }

    getHoursText(hours) {
        switch(hours) {
            case 2: return '2 часа';
            case 4: return '4 часа';
            case 8: return 'Вся ночь';
            default: return `${hours} часов`;
        }
    }

    getSelectedChaanOption() {
        const chaanService = this.selectedServices.find(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );

        if (chaanService && chaanService.hours) {
            return {
                value: chaanService.hours,
                hoursText: chaanService.hoursText
            };
        }

        return { value: 2, hoursText: '2 часа' };
    }

    isServiceSelected(serviceName) {
        return this.selectedServices.some(s => s.name === serviceName);
    }

    isChaanSelected() {
        return this.selectedServices.some(s => 
            s.name.toLowerCase().includes('чан') || 
            s.name.toLowerCase().includes('купель')
        );
    }

    updateServicesUI() {
        // Обновляем кнопки переключения
        document.querySelectorAll('.service-toggle').forEach(btn => {
            const serviceName = btn.getAttribute('data-service');
            const isSelected = this.isServiceSelected(serviceName);
            btn.classList.toggle('active', isSelected);
            btn.textContent = isSelected ? '✓' : '+';
        });

        // Обновляем кнопку чана
        const chanToggle = document.getElementById('chan-toggle');
        if (chanToggle) {
            const isSelected = this.isChaanSelected();
            chanToggle.classList.toggle('active', isSelected);
            chanToggle.textContent = isSelected ? '✓ Услуга выбрана' : 'Выбрать услугу';
        }

        // Обновляем список выбранных услуг
        const selectedList = document.getElementById('selected-services-list');
        if (selectedList) {
            selectedList.innerHTML = this.renderSelectedServices();
        }

        // Обновляем общую стоимость
        this.updateServicesTotal();
    }

    updateServicesTotal() {
        const total = this.selectedServices.reduce((sum, service) => sum + (service.totalPrice || 0), 0);
        
        const totalElement = document.getElementById('services-total-price');
        const continueBadge = document.getElementById('continue-price-badge');
        
        if (totalElement) totalElement.textContent = total.toLocaleString() + '₽';
        if (continueBadge) continueBadge.textContent = total > 0 ? total.toLocaleString() + '₽' : 'Бесплатно';
    }

    continueToDates() {
        if (window.app) {
            // Сохраняем выбранные услуги
            window.app.selectedServices = this.selectedServices;
            window.app.selectedHouse = this.selectedHouse;
            
            // Переходим в календарь
            window.app.showScreen('calendar-screen');
            console.log('✅ Переход в календарь с услугами:', this.selectedServices);
        } else {
            console.error('❌ App not found');
        }
    }

    resetServices() {
        this.selectedServices = [];
        this.selectedHouse = null;
    }
}

// Создаем глобальный экземпляр
const servicesManager = new ServicesManager();