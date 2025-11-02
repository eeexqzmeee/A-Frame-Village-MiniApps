/* Добавляем в конец файла */

/* FIXED Sticky панель - всегда в самом низу */
.sticky-panel {
    position: fixed !important;
    bottom: 90px !important;
    left: var(--space-md) !important;
    right: var(--space-md) !important;
    background: rgba(255, 255, 255, 0.15) !important;
    backdrop-filter: blur(40px) saturate(200%) !important;
    -webkit-backdrop-filter: blur(40px) saturate(200%) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: var(--border-radius-xl) !important;
    padding: var(--space-lg) !important;
    z-index: 1000 !important;
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.5),
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.1) !important;
    animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Стили для кнопок опций услуг */
.service-option-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-sm);
    margin-top: var(--space-md);
}

.service-option-btn {
    padding: var(--space-md) var(--space-lg);
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-lg);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-normal);
    text-align: center;
    backdrop-filter: blur(10px);
}

.service-option-btn:hover {
    border-color: var(--accent-primary);
    transform: translateY(-2px);
}

.service-option-btn.active {
    background: var(--accent-primary);
    color: var(--bg-primary);
    border-color: var(--accent-primary);
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

/* Улучшенные карточки уровней лояльности */
.loyalty-section {
    margin-bottom: var(--space-xl);
}

.loyalty-levels {
    display: grid;
    gap: var(--space-md);
}

.loyalty-level {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-xl);
    padding: var(--space-lg);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
    margin-bottom: var(--space-md);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.loyalty-level::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-primary), #00D4FF);
    opacity: 0;
    transition: opacity var(--transition-normal);
}

.loyalty-level:hover::before {
    opacity: 1;
}

.loyalty-level:hover {
    transform: translateY(-4px);
    border-color: var(--accent-primary);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.loyalty-level.active {
    border-color: var(--accent-primary);
    background: rgba(0, 122, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
}

.loyalty-level.active::before {
    opacity: 1;
}

.level-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
}

.level-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    backdrop-filter: blur(10px);
}

.level-info {
    flex: 1;
}

.level-name {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-xs);
    background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.level-description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.4;
}

.level-requirements {
    font-size: var(--font-size-xs);
    color: var(--accent-primary);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.level-benefits {
    display: grid;
    gap: var(--space-xs);
    margin: var(--space-md) 0;
}

.benefit-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.benefit-item::before {
    content: '✓';
    color: var(--accent-success);
    font-weight: bold;
    font-size: var(--font-size-sm);
}

.level-progress {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    margin: var(--space-md) 0 var(--space-sm);
    overflow: hidden;
    position: relative;
}

.progress-bar {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--accent-primary), #00D4FF);
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
}

.progress-text {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    text-align: center;
    font-weight: var(--font-weight-medium);
}

/* Эффекты как на примере карточки */
.house-card, .feature-card, .overview-item, .loyalty-level {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.house-card::before, .feature-card::before, .overview-item::before, .loyalty-level::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
}

.house-card:hover::before, .feature-card:hover::before, .overview-item:hover::before, .loyalty-level:hover::before {
    left: 100%;
}

/* Анимации */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}

/* Анимация появления при скролле */
.scroll-reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-reveal.revealed {
    opacity: 1;
    transform: translateY(0);
}

/* Специфичные анимации для разных элементов */
.scroll-reveal:nth-child(1) { transition-delay: 0.1s; }
.scroll-reveal:nth-child(2) { transition-delay: 0.2s; }
.scroll-reveal:nth-child(3) { transition-delay: 0.3s; }
.scroll-reveal:nth-child(4) { transition-delay: 0.4s; }

/* Улучшаем кнопку продолжить в календаре */
#continue-to-payment:not(:disabled) {
    background: linear-gradient(135deg, var(--accent-primary), #0056CC);
    color: white;
    font-weight: var(--font-weight-bold);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { 
        transform: scale(1);
        box-shadow: 0 8px 32px rgba(0, 122, 255, 0.4);
    }
    50% { 
        transform: scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 122, 255, 0.6);
    }
}