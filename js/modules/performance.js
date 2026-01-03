// Страница спектакля
class PerformancePage {
    constructor() {
        this.performanceId = this.getPerformanceIdFromUrl();
        this.init();
    }

    getPerformanceIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '1';
    }

    async init() {
        await this.loadPerformanceData();
        this.renderPerformance();
        this.bindEvents();
        this.loadSchedule();
    }

    async loadPerformanceData() {
        // Статические данные для демонстрации
        const performances = {
            1: {
                id: 1,
                title: 'Лишь бы не было детей',
                description: 'История сосуществования в одном пространстве нескольких людей — очень разных. Они пытаются выжить, сохранить своё «я», не сойти с ума. И всё это — через призму клоунады, самого человечного из искусств.',
                age: '18+',
                duration: '90 минут',
                genre: 'Клоунада, Драма',
                price: 1500,
                year: 2019,
                director: 'Сергей «Паганель» Давыдов',
                cast: [
                    { name: 'Сергей «Паганель» Давыдов', role: 'Художественный руководитель' },
                    { name: 'Мария Иванова', role: 'Актриса' },
                    { name: 'Алексей Петров', role: 'Актер' },
                    { name: 'Елена Смирнова', role: 'Актриса' }
                ]
            },
            2: {
                id: 2,
                title: 'Авиаторы',
                description: 'Спектакль о мечтах, полетах и свободе. История о людях, которые стремятся в небо, преодолевая гравитацию и собственные страхи.',
                age: '16+',
                duration: '75 минут',
                genre: 'Клоунада, Драма',
                price: 1200,
                year: 2020,
                director: 'Иван Сидоров',
                cast: [
                    { name: 'Иван Сидоров', role: 'Режиссер' },
                    { name: 'Ольга Ковалева', role: 'Актриса' }
                ]
            },
            3: {
                id: 3,
                title: 'Богатыри',
                description: 'Современная интерпретация былин о русских богатырях. Сила, честь и юмор в одном флаконе.',
                age: '12+',
                duration: '80 минут',
                genre: 'Клоунада, Комедия',
                price: 1400,
                year: 2021,
                director: 'Петр Николаев',
                cast: [
                    { name: 'Петр Николаев', role: 'Режиссер' },
                    { name: 'Дмитрий Волков', role: 'Актер' }
                ]
            },
            4: {
                id: 4,
                title: 'Цирк навсегда',
                description: 'Ностальгическое путешествие в мир цирка. История о том, что настоящее искусство вечно.',
                age: '16+',
                duration: '85 минут',
                genre: 'Клоунада, Драма',
                price: 1300,
                year: 2022,
                director: 'Анна Козлова',
                cast: [
                    { name: 'Анна Козлова', role: 'Режиссер' },
                    { name: 'Сергей Морозов', role: 'Актер' }
                ]
            },
            5: {
                id: 5,
                title: 'Тишина',
                description: 'Моноспектакль о важности тишины в современном шумном мире. Минимализм и глубина.',
                age: '18+',
                duration: '95 минут',
                genre: 'Клоунада, Драма',
                price: 1600,
                year: 2023,
                director: 'Михаил Орлов',
                cast: [
                    { name: 'Михаил Орлов', role: 'Режиссер и актер' }
                ]
            }
        };
        
        this.performance = performances[this.performanceId] || performances[1];
    }

    renderPerformance() {
        // Обновляем заголовок страницы
        document.title = `${this.performance.title} | Театр "Микос"`;
        
        // ОБНОВЛЯЕМ ИЗОБРАЖЕНИЕ СПЕКТАКЛЯ (ДОБАВЛЕН НОВЫЙ КОД)
        const posterImg = document.querySelector('.performance-poster img');
        if (posterImg) {
            // Формируем путь к изображению на основе ID спектакля
            const imagePath = `images/content/${this.performanceId}.jpg`;
            posterImg.src = imagePath;
            posterImg.alt = this.performance.title;
            
            // Обработчик ошибки загрузки изображения
            posterImg.onerror = () => {
                posterImg.src = `https://via.placeholder.com/400x600/2C4068/FFFFFF?text=${encodeURIComponent(this.performance.title)}`;
            };
        }
        
        // Обновляем хлебные крошки
        const breadcrumbs = document.querySelector('.breadcrumbs span');
        if (breadcrumbs) {
            breadcrumbs.textContent = this.performance.title;
        }
        
        // Обновляем основной контент
        const performanceTitle = document.querySelector('.performance-title');
        if (performanceTitle) {
            performanceTitle.textContent = this.performance.title;
        }
        
        // ОБНОВЛЯЕМ МЕТА-ИНФОРМАЦИЮ СПЕКТАКЛЯ (ДОБАВЛЕН НОВЫЙ КОД)
        const ageElement = document.querySelector('.meta-item.age');
        const durationElement = document.querySelector('.performance-meta .meta-item:nth-child(2)');
        const genreElement = document.querySelector('.performance-meta .meta-item:nth-child(3)');
        const yearElement = document.querySelector('.performance-meta .meta-item:nth-child(4)');
        
        if (ageElement) ageElement.textContent = this.performance.age;
        if (durationElement) durationElement.textContent = this.performance.duration;
        if (genreElement) genreElement.textContent = this.performance.genre;
        if (yearElement) yearElement.textContent = `С ${this.performance.year} года`;
        
        // ОБНОВЛЯЕМ ЦЕНУ СПЕКТАКЛЯ (ДОБАВЛЕН НОВЫЙ КОД)
        const priceElement = document.querySelector('.performance-price');
        if (priceElement) {
            priceElement.textContent = `от ${this.performance.price} ₽`;
        }
        
        // ОБНОВЛЯЕМ ССЫЛКУ ДЛЯ БРОНИРОВАНИЯ (ДОБАВЛЕН НОВЫЙ КОД)
        const bookingLink = document.querySelector('.performance-actions a.btn--primary');
        if (bookingLink) {
            bookingLink.href = `booking.html?performance=${this.performanceId}`;
        }
        
        const performanceDescription = document.querySelector('.performance-description');
        if (performanceDescription) {
            performanceDescription.innerHTML = `
                <h3>О спектакле</h3>
                <p>${this.performance.description}</p>
                
                <h3>Режиссёр о спектакле</h3>
                <p>«Это спектакль о нас. О том, как мы пытаемся быть вместе, но оставаться собой. О том, как мы боимся близости, но жаждем её. И о том, что дети — это не всегда буквально дети. Это могут быть наши страхи, мечты, несбывшиеся надежды».</p>
                
                <h3>Критика</h3>
                <blockquote>
                    «${this.performance.title} — это не просто спектакль, это опыт. Опыт проживания чужих жизней, чужих страхов и чужих надежд. Театр «Микос» снова доказывает, что клоунада — это не про смешные носы, а про человеческую душу».
                    <cite>— Театральный обозреватель «Коммерсантъ»</cite>
                </blockquote>
            `;
        }
        
        // Обновляем актерский состав
        const castList = document.querySelector('.cast-list');
        if (castList) {
            castList.innerHTML = this.performance.cast.map(actor => `
                <div class="cast-item">
                    <div class="cast-avatar" style="background: var(--color-blue); color: white; 
                         width: 60px; height: 60px; border-radius: 50%; display: flex; 
                         align-items: center; justify-content: center; font-weight: 600;">
                        ${actor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="cast-info">
                        <h4 style="margin-bottom: 4px;">${actor.name}</h4>
                        <p style="color: var(--color-gray); font-size: 0.9rem;">${actor.role}</p>
                    </div>
                </div>
            `).join('');
        }
        
        // Обновляем техническую информацию
        const technicalInfo = document.querySelector('.technical-info ul');
        if (technicalInfo) {
            technicalInfo.innerHTML = `
                <li><strong>Сцена:</strong> Основная сцена</li>
                <li><strong>Продолжительность:</strong> ${this.performance.duration} без антракта</li>
                <li><strong>Премьера:</strong> ${this.performance.year} год</li>
                <li><strong>Жанр:</strong> ${this.performance.genre}</li>
                <li><strong>Возрастное ограничение:</strong> ${this.performance.age}</li>
                <li><strong>Режиссер:</strong> ${this.performance.director}</li>
            `;
        }
    }

    async loadSchedule() {
        const scheduleList = document.getElementById('schedule-list');
        if (!scheduleList) return;
        
        // Генерируем расписание на ближайшие 7 дней
        const schedule = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Для каждого дня создаем 1-3 сеанса
            const sessions = Math.floor(Math.random() * 3) + 1;
            const times = ['18:00', '19:00', '20:00', '21:00'];
            
            for (let j = 0; j < sessions; j++) {
                const available = Math.random() > 0.3; // 70% шанс, что есть билеты
                const availableSeats = available ? Math.floor(Math.random() * 50) + 10 : 0;
                
                schedule.push({
                    date: date.toISOString().split('T')[0],
                    time: times[Math.floor(Math.random() * times.length)],
                    available: available,
                    availableSeats: availableSeats
                });
            }
        }
        
        // Сортируем по дате и времени
        schedule.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });
        
        // Отображаем расписание
        scheduleList.innerHTML = schedule.map(item => `
            <div class="schedule-item ${!item.available ? 'sold-out' : ''}">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="display: flex; flex-direction: column;">
                        <div style="font-weight: 600; font-size: 1.125rem;">
                            ${this.formatDate(item.date)}
                        </div>
                        <div style="color: var(--color-gray);">
                            ${item.time}
                        </div>
                    </div>
                    ${item.available && item.availableSeats <= 10 ? 
                        `<span style="background: rgba(244, 49, 57, 0.1); color: var(--color-red); 
                          padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; font-weight: 500;">
                            Осталось ${item.availableSeats} мест
                        </span>` : ''}
                </div>
                <div>
                    ${item.available ? 
                        `<a href="booking.html?performance=${this.performance.id}&date=${item.date}&time=${item.time}" 
                           class="btn btn--primary btn--sm">Купить билеты</a>` :
                        `<span style="color: var(--color-red); font-weight: 600;">Билетов нет</span>`
                    }
                </div>
            </div>
        `).join('');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Завтра';
        } else {
            return date.toLocaleDateString('ru-RU', {
                weekday: 'short',
                day: 'numeric',
                month: 'long'
            });
        }
    }

    bindEvents() {
        // Добавление в избранное
        const favoriteBtn = document.getElementById('add-favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                if (!window.authSystem || !window.authSystem.currentUser) {
                    window.showNotification('Для добавления в избранное необходимо войти в аккаунт', 'error');
                    if (window.authSystem) {
                        window.authSystem.showLoginModal();
                    }
                    return;
                }
                
                this.toggleFavorite();
            });
        }
        
        // Загрузка похожих спектаклей
        this.loadSimilarPerformances();
    }

    toggleFavorite() {
        let favorites = JSON.parse(localStorage.getItem('micos_favorites') || '[]');
        const index = favorites.indexOf(this.performance.id);
        
        const favoriteBtn = document.getElementById('add-favorite');
        
        if (index === -1) {
            // Добавляем в избранное
            favorites.push(this.performance.id);
            if (favoriteBtn) {
                favoriteBtn.innerHTML = 'В избранном ✓';
                favoriteBtn.style.background = 'var(--color-blue)';
                favoriteBtn.style.color = 'white';
                favoriteBtn.style.borderColor = 'var(--color-blue)';
            }
            window.showNotification('Спектакль добавлен в избранное', 'success');
        } else {
            // Удаляем из избранного
            favorites.splice(index, 1);
            if (favoriteBtn) {
                favoriteBtn.innerHTML = 'В избранное';
                favoriteBtn.style.background = '';
                favoriteBtn.style.color = '';
                favoriteBtn.style.borderColor = '';
            }
            window.showNotification('Спектакль удален из избранного', 'info');
        }
        
        localStorage.setItem('micos_favorites', JSON.stringify(favorites));
        
        // Проверяем, находимся ли на странице аккаунта
        if (window.location.pathname.includes('account.html')) {
            // Перезагружаем список избранного
            const accountPage = window.accountPage;
            if (accountPage && accountPage.loadFavorites) {
                accountPage.loadFavorites();
            }
        }
    }

    async loadSimilarPerformances() {
        const similarContainer = document.querySelector('.performances-grid');
        if (!similarContainer) return;
        
        // Получаем другие спектакли
        const allPerformanceIds = [1, 2, 3, 4, 5];
        const similarIds = allPerformanceIds.filter(id => id != this.performanceId).slice(0, 3);
        
        const performances = await this.getPerformancesByIds(similarIds);
        
        similarContainer.innerHTML = performances.map(performance => `
            <div class="card">
                <div class="card__image">
                    <img src="images/content/${performance.id}.jpg" alt="${performance.title}"
                         onerror="this.src='https://via.placeholder.com/400x200/2C4068/FFFFFF?text=Микос'">
                    <div class="card__badge">${performance.age}</div>
                </div>
                <div class="card__content">
                    <h3 class="card__title">${performance.title}</h3>
                    <div class="card__meta">
                        <span>${performance.duration}</span>
                        <span>${performance.genre}</span>
                    </div>
                    <p class="card__description" style="font-size: 0.875rem; margin-bottom: 16px;">
                        Краткое описание спектакля...
                    </p>
                    <div class="card__footer">
                        <div style="font-weight: 700; color: var(--color-red);">
                            от ${performance.price} ₽
                        </div>
                        <a href="performance.html?id=${performance.id}" class="btn btn--outline btn--sm">
                            Подробнее
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async getPerformancesByIds(ids) {
        // Имитация запроса к API
        return new Promise(resolve => {
            setTimeout(() => {
                const allPerformances = [
                    { id: 1, title: 'Лишь бы не было детей', age: '18+', duration: '90 мин', genre: 'Клоунада, Драма', price: 1500 },
                    { id: 2, title: 'Авиаторы', age: '16+', duration: '75 мин', genre: 'Клоунада, Драма', price: 1200 },
                    { id: 3, title: 'Богатыри', age: '12+', duration: '80 мин', genre: 'Клоунада, Комедия', price: 1400 },
                    { id: 4, title: 'Цирк навсегда', age: '16+', duration: '85 мин', genre: 'Клоунада, Драма', price: 1300 },
                    { id: 5, title: 'Тишина', age: '18+', duration: '95 мин', genre: 'Клоунада, Драма', price: 1600 }
                ];
                
                const filtered = allPerformances.filter(p => ids.includes(p.id));
                resolve(filtered);
            }, 300);
        });
    }
}

// Инициализация страницы спектакля
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('performance.html')) {
        new PerformancePage();
    }
});