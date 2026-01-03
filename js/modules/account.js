// Страница личного кабинета
class AccountPage {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadUserData();
        this.bindEvents();
        this.loadBookings();
        this.loadFavorites();
    }

    checkAuth() {
        const userData = localStorage.getItem('micos_user');
        if (!userData) {
            // Сохраняем URL для редиректа после авторизации
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            // Показываем модальное окно авторизации
            if (window.authSystem) {
                window.authSystem.showLoginModal();
            } else {
                window.location.href = 'index.html';
            }
            return;
        }
        
        this.currentUser = JSON.parse(userData);
    }

    loadUserData() {
        if (!this.currentUser) return;
        
        // Обновляем данные пользователя
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userPhone = document.getElementById('user-phone');
        
        if (userAvatar) userAvatar.textContent = this.currentUser.name.charAt(0);
        if (userName) userName.textContent = this.currentUser.name;
        if (userEmail) userEmail.textContent = this.currentUser.email;
        if (userPhone) userPhone.textContent = this.currentUser.phone || 'Не указан';
        
        // Заполняем форму настроек
        const settingsName = document.getElementById('settings-name');
        const settingsEmail = document.getElementById('settings-email');
        const settingsPhone = document.getElementById('settings-phone');
        
        if (settingsName) settingsName.value = this.currentUser.name;
        if (settingsEmail) settingsEmail.value = this.currentUser.email;
        if (settingsPhone) settingsPhone.value = this.currentUser.phone || '';
    }

    bindEvents() {
        // Навигация по разделам
        document.querySelectorAll('.account-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Убираем активный класс у всех ссылок
                document.querySelectorAll('.account-nav a').forEach(a => {
                    a.classList.remove('active');
                });
                
                // Добавляем активный класс текущей ссылке
                link.classList.add('active');
                
                // Показываем соответствующий раздел
                const sectionId = link.dataset.section;
                this.showSection(sectionId);
            });
        });
        
        // Сохранение настроек
        const settingsForm = document.querySelector('.settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
    }

    showSection(sectionId) {
        // Скрываем все разделы
        document.querySelectorAll('.account-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Показываем выбранный раздел
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    async loadBookings() {
        const bookingsList = document.getElementById('bookings-list');
        if (!bookingsList) return;
        
        // Имитация загрузки бронирований
        const bookings = await this.getUserBookings();
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-gray);">
                    <p style="margin-bottom: 16px;">У вас пока нет бронирований</p>
                    <a href="index.html" class="btn btn--primary">Посмотреть афишу</a>
                </div>
            `;
            return;
        }
        
        // Обновляем статистику
        const totalBookings = document.getElementById('total-bookings');
        const upcomingBookings = document.getElementById('upcoming-bookings');
        
        if (totalBookings) totalBookings.textContent = bookings.length;
        if (upcomingBookings) {
            const upcoming = bookings.filter(b => {
                const bookingDate = new Date(b.date.split('.').reverse().join('-'));
                return bookingDate >= new Date() && b.status === 'confirmed';
            }).length;
            upcomingBookings.textContent = upcoming;
        }
        
        // Отображаем бронирования
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <div class="booking-info">
                    <h3 style="margin-bottom: 8px;">${booking.performance}</h3>
                    <div class="booking-meta">
                        <span>${booking.date}</span>
                        <span>${booking.time}</span>
                        <span>${booking.seats} мест</span>
                        <span>${booking.total} ₽</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="booking-status status-${booking.status}">
                        ${this.getStatusText(booking.status)}
                    </span>
                    <button class="btn btn--outline btn--sm" data-booking-id="${booking.id}">
                        Подробнее
                    </button>
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики для кнопок
        bookingsList.querySelectorAll('[data-booking-id]').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.bookingId;
                this.showBookingDetails(bookingId);
            });
        });
    }

    async loadFavorites() {
        const favoritesGrid = document.getElementById('favorites-grid');
        if (!favoritesGrid) return;
        
        // Получаем избранное из localStorage
        const favorites = JSON.parse(localStorage.getItem('micos_favorites') || '[]');
        
        // Обновляем счетчик
        const favoritesCount = document.getElementById('favorites-count');
        if (favoritesCount) favoritesCount.textContent = favorites.length;
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-gray); grid-column: 1 / -1;">
                    <p style="margin-bottom: 16px;">У вас пока нет избранных спектаклей</p>
                    <a href="index.html" class="btn btn--primary">Посмотреть афишу</a>
                </div>
            `;
            return;
        }
        
        // Загружаем данные спектаклей
        const performances = await this.getPerformancesByIds(favorites);
        
        favoritesGrid.innerHTML = performances.map(performance => `
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
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                        <div style="font-weight: 600; color: var(--color-red);">${performance.price} ₽</div>
                        <div style="display: flex; gap: 8px;">
                            <a href="performance.html?id=${performance.id}" class="btn btn--outline btn--sm">Подробнее</a>
                            <button class="btn btn--text remove-favorite" data-id="${performance.id}" 
                                    style="color: var(--color-red);">
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики для кнопок удаления
        favoritesGrid.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.removeFromFavorites(id);
            });
        });
    }

    async getPerformancesByIds(ids) {
        // Имитация запроса к API
        return new Promise(resolve => {
            setTimeout(() => {
                const allPerformances = [
                    { id: 1, title: 'Лишь бы не было детей', age: '18+', duration: '90 мин', price: 1500 },
                    { id: 2, title: 'Авиаторы', age: '16+', duration: '75 мин', price: 1200 },
                    { id: 3, title: 'Богатыри', age: '12+', duration: '80 мин', price: 1400 },
                    { id: 4, title: 'Цирк навсегда', age: '16+', duration: '85 мин', price: 1300 },
                    { id: 5, title: 'Тишина', age: '18+', duration: '95 мин', price: 1600 }
                ];
                
                const filtered = allPerformances.filter(p => ids.includes(p.id.toString()));
                resolve(filtered);
            }, 300);
        });
    }

    async getUserBookings() {
        // Имитация запроса к API
        return new Promise(resolve => {
            setTimeout(() => {
                const bookings = [
                    {
                        id: 1,
                        performance: 'Лишь бы не было детей',
                        date: '15.01.2024',
                        time: '19:00',
                        seats: 2,
                        total: 3000,
                        status: 'confirmed'
                    },
                    {
                        id: 2,
                        performance: 'Авиаторы',
                        date: '18.01.2024',
                        time: '20:00',
                        seats: 4,
                        total: 4800,
                        status: 'confirmed'
                    },
                    {
                        id: 3,
                        performance: 'Богатыри',
                        date: '22.01.2024',
                        time: '19:00',
                        seats: 3,
                        total: 4200,
                        status: 'pending'
                    }
                ];
                resolve(bookings);
            }, 500);
        });
    }

    getStatusText(status) {
        const statusMap = {
            'confirmed': 'Подтверждено',
            'pending': 'Ожидание оплаты',
            'cancelled': 'Отменено'
        };
        return statusMap[status] || status;
    }

    removeFromFavorites(id) {
        let favorites = JSON.parse(localStorage.getItem('micos_favorites') || '[]');
        favorites = favorites.filter(fav => fav.toString() !== id);
        localStorage.setItem('micos_favorites', JSON.stringify(favorites));
        
        // Перезагружаем список избранного
        this.loadFavorites();
        
        window.showNotification('Спектакль удален из избранного', 'success');
    }

    async saveSettings() {
        const name = document.getElementById('settings-name').value;
        const email = document.getElementById('settings-email').value;
        const phone = document.getElementById('settings-phone').value;
        const password = document.getElementById('settings-password').value;
        
        // Валидация
        if (!name || !email) {
            window.showNotification('Заполните обязательные поля', 'error');
            return;
        }
        
        // Обновляем данные пользователя
        this.currentUser.name = name;
        this.currentUser.email = email;
        this.currentUser.phone = phone;
        
        // Если указан новый пароль
        if (password) {
            // В реальном приложении здесь было бы обновление пароля через API
            // Для демо просто сохраняем в localStorage
            const users = JSON.parse(localStorage.getItem('micos_users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].password = password;
                localStorage.setItem('micos_users', JSON.stringify(users));
            }
        }
        
        // Сохраняем обновленные данные
        localStorage.setItem('micos_user', JSON.stringify(this.currentUser));
        
        // Обновляем отображение
        this.loadUserData();
        
        window.showNotification('Настройки сохранены', 'success');
    }

    showBookingDetails(bookingId) {
        // В реальном приложении здесь будет показ деталей бронирования
        window.showNotification('Детали бронирования #' + bookingId, 'info');
    }
}

// Инициализация страницы аккаунта
document.addEventListener('DOMContentLoaded', () => {
    new AccountPage();
});