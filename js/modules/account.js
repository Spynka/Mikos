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
        
        // ЗАГРУЖАЕМ РЕАЛЬНЫЕ БРОНИРОВАНИЯ ИЗ LOCALSTORAGE
        const bookings = await this.getUserBookings();
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-gray);">
                    <p style="margin-bottom: 16px;">У вас пока нет бронирований</p>
                    <p style="margin-bottom: 20px; color: var(--color-gray); font-size: 0.9rem;">
                        После покупки билетов они появятся здесь
                    </p>
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
            // Считаем предстоящие бронирования (начиная с сегодняшнего дня)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Сбрасываем время для точного сравнения
            
            const upcoming = bookings.filter(b => {
                try {
                    // Пытаемся разобрать дату бронирования
                    let bookingDate;
                    if (b.date.includes('.')) {
                        // Формат "дд.мм.гггг" из бронирования
                        const [day, month, year] = b.date.split('.');
                        bookingDate = new Date(`${year}-${month}-${day}`);
                    } else if (b.date.includes('-')) {
                        // Формат ISO "гггг-мм-дд" из календаря
                        bookingDate = new Date(b.date);
                    } else {
                        // Формат "дд месяц год" из localStorage
                        bookingDate = new Date(b.date);
                    }
                    
                    bookingDate.setHours(0, 0, 0, 0);
                    return bookingDate >= today && b.status === 'confirmed';
                } catch (error) {
                    console.error('Ошибка при обработке даты бронирования:', b.date, error);
                    return false;
                }
            }).length;
            
            upcomingBookings.textContent = upcoming;
        }
        
        // СОРТИРУЕМ БРОНИРОВАНИЯ: сначала предстоящие, потом прошедшие
        bookings.sort((a, b) => {
            try {
                const dateA = this.parseBookingDate(a.date);
                const dateB = this.parseBookingDate(b.date);
                const today = new Date();
                
                // Сначала сравниваем, какое бронирование ближе к сегодняшнему дню
                const diffA = Math.abs(dateA - today);
                const diffB = Math.abs(dateB - today);
                
                return diffA - diffB;
            } catch (error) {
                return 0;
            }
        });
        
        // ОТОБРАЖАЕМ РЕАЛЬНЫЕ БРОНИРОВАНИЯ
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-card" style="
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: transform 0.2s ease;
            ">
                <div class="booking-info" style="flex: 1;">
                    <h3 style="margin: 0 0 8px 0; color: var(--color-blue);">${booking.performance}</h3>
                    <div class="booking-meta" style="
                        display: flex;
                        flex-wrap: wrap;
                        gap: 16px;
                        color: var(--color-gray);
                        font-size: 0.9rem;
                    ">
                        <span>
                            <strong>Дата:</strong> ${booking.date}
                        </span>
                        <span>
                            <strong>Время:</strong> ${booking.time || 'Не указано'}
                        </span>
                        <span>
                            <strong>Места:</strong> ${booking.seats || booking.selectedSeats?.length || 0}
                        </span>
                        <span>
                            <strong>Сумма:</strong> ${booking.total ? booking.total.toLocaleString() + ' ₽' : 'Не указана'}
                        </span>
                        ${booking.selectedSeats ? `
                            <span style="flex-basis: 100%; margin-top: 8px;">
                                <strong>Выбранные места:</strong> ${Array.isArray(booking.selectedSeats) ? booking.selectedSeats.join(', ') : booking.selectedSeats}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
                    <span class="booking-status status-${booking.status}" style="
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: 600;
                        background: ${this.getStatusColor(booking.status)};
                        color: white;
                        white-space: nowrap;
                    ">
                        ${this.getStatusText(booking.status)}
                    </span>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn--outline btn--sm" data-booking-id="${booking.id}" 
                                style="padding: 6px 12px; font-size: 0.85rem;">
                            Подробнее
                        </button>
                        ${this.isUpcomingBooking(booking) ? `
                            <button class="btn btn--primary btn--sm cancel-booking" data-booking-id="${booking.id}"
                                    style="padding: 6px 12px; font-size: 0.85rem;">
                                Отменить
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики для кнопок
        bookingsList.querySelectorAll('[data-booking-id]').forEach(button => {
            if (!button.classList.contains('cancel-booking')) {
                button.addEventListener('click', (e) => {
                    const bookingId = e.target.dataset.bookingId;
                    this.showBookingDetails(bookingId);
                });
            }
        });
        
        // Добавляем обработчики для кнопок отмены
        bookingsList.querySelectorAll('.cancel-booking').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.bookingId;
                this.cancelBooking(bookingId);
            });
        });
    }

    // МЕТОД ДЛЯ ПОЛУЧЕНИЯ РЕАЛЬНЫХ БРОНИРОВАНИЙ ПОЛЬЗОВАТЕЛЯ
    async getUserBookings() {
        // Имитация задержки сети (как будто запрос к серверу)
        return new Promise(resolve => {
            setTimeout(() => {
                try {
                    // 1. ПОЛУЧАЕМ ВСЕ БРОНИРОВАНИЯ ИЗ LOCALSTORAGE
                    const allBookings = JSON.parse(localStorage.getItem('micos_bookings') || '[]');
                    
                    // 2. ПОЛУЧАЕМ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
                    const currentUser = JSON.parse(localStorage.getItem('micos_user'));
                    
                    if (!currentUser) {
                        console.log('Пользователь не авторизован, показываем пустой список');
                        resolve([]);
                        return;
                    }
                    
                    console.log('Все бронирования в системе:', allBookings.length);
                    console.log('Текущий пользователь ID:', currentUser.id);
                    
                    // 3. ФИЛЬТРУЕМ БРОНИРОВАНИЯ ТОЛЬКО ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
                    const userBookings = allBookings.filter(booking => {
                        // Проверяем разными способами, принадлежит ли бронирование пользователю
                        const isUserBooking = 
                            booking.userId === currentUser.id || 
                            (currentUser.email && booking.email === currentUser.email) ||
                            (currentUser.phone && booking.phone === currentUser.phone);
                        
                        if (isUserBooking) {
                            console.log('Найдено бронирование пользователя:', {
                                id: booking.id,
                                performance: booking.performance,
                                userId: booking.userId,
                                userEmail: booking.email
                            });
                        }
                        
                        return isUserBooking;
                    });
                    
                    console.log('Найдено бронирований пользователя:', userBookings.length);
                    
                    // 4. ЕСЛИ У ПОЛЬЗОВАТЕЛЯ НЕТ БРОНИРОВАНИЙ - ВОЗВРАЩАЕМ ПУСТОЙ МАССИВ
                    if (userBookings.length === 0) {
                        console.log('У пользователя нет бронирований');
                        resolve([]);
                        return;
                    }
                    
                    // 5. ДОБАВЛЯЕМ ДОПОЛНИТЕЛЬНУЮ ИНФОРМАЦИЮ К БРОНИРОВАНИЯМ
                    const enrichedBookings = userBookings.map(booking => {
                        // Определяем статус на основе даты
                        let status = booking.status || 'confirmed';
                        try {
                            const bookingDate = this.parseBookingDate(booking.date);
                            const today = new Date();
                            
                            if (bookingDate < today) {
                                status = 'completed'; // Прошедшее
                            }
                        } catch (error) {
                            console.error('Ошибка при определении статуса:', error);
                        }
                        
                        return {
                            ...booking,
                            status: status,
                            // Гарантируем наличие всех необходимых полей
                            id: booking.id || 'unknown',
                            performance: booking.performance || 'Неизвестный спектакль',
                            date: booking.date || 'Дата не указана',
                            time: booking.time || 'Время не указано',
                            seats: booking.seats || (Array.isArray(booking.selectedSeats) ? booking.selectedSeats.length : 0),
                            total: booking.total || 0,
                            selectedSeats: booking.selectedSeats || []
                        };
                    });
                    
                    console.log('Обогащенные бронирования:', enrichedBookings.length);
                    resolve(enrichedBookings);
                    
                } catch (error) {
                    console.error('Ошибка при загрузке бронирований:', error);
                    // Возвращаем пустой массив в случае ошибки
                    resolve([]);
                }
            }, 300); // Имитация задержки сети
        });
    }

    // МЕТОД ДЛЯ ПАРСИНГА ДАТЫ ИЗ РАЗНЫХ ФОРМАТОВ
    parseBookingDate(dateString) {
        if (!dateString) return new Date();
        
        try {
            // Попробуем разные форматы дат
            if (dateString.includes('.')) {
                // Формат "дд.мм.гггг"
                const [day, month, year] = dateString.split('.');
                return new Date(`${year}-${month}-${day}`);
            } else if (dateString.includes('-')) {
                // Формат ISO "гггг-мм-дд"
                return new Date(dateString);
            } else {
                // Пытаемся распарсить как есть
                return new Date(dateString);
            }
        } catch (error) {
            console.error('Не удалось распарсить дату:', dateString, error);
            return new Date(); // Возвращаем сегодняшнюю дату по умолчанию
        }
    }

    // МЕТОД ДЛЯ ПРОВЕРКИ, ЯВЛЯЕТСЯ ЛИ БРОНИРОВАНИЕ ПРЕДСТОЯЩИМ
    isUpcomingBooking(booking) {
        try {
            const bookingDate = this.parseBookingDate(booking.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            bookingDate.setHours(0, 0, 0, 0);
            
            return bookingDate >= today && booking.status === 'confirmed';
        } catch (error) {
            return false;
        }
    }

    // МЕТОД ДЛЯ ПОЛУЧЕНИЯ ЦВЕТА СТАТУСА
    getStatusColor(status) {
        const colorMap = {
            'confirmed': '#4CAF50',    // Зеленый
            'pending': '#FF9800',      // Оранжевый
            'cancelled': '#F44336',    // Красный
            'completed': '#9E9E9E'     // Серый
        };
        return colorMap[status] || '#757575'; // Серый по умолчанию
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

    getStatusText(status) {
        const statusMap = {
            'confirmed': 'Подтверждено',
            'pending': 'Ожидание оплаты',
            'cancelled': 'Отменено',
            'completed': 'Завершено'
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

    // МЕТОД ДЛЯ ОТМЕНЫ БРОНИРОВАНИЯ
    cancelBooking(bookingId) {
        if (!confirm('Вы уверены, что хотите отменить это бронирование?')) {
            return;
        }
        
        try {
            // Получаем все бронирования
            const allBookings = JSON.parse(localStorage.getItem('micos_bookings') || '[]');
            
            // Находим индекс бронирования
            const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
            
            if (bookingIndex === -1) {
                window.showNotification('Бронирование не найдено', 'error');
                return;
            }
            
            // Обновляем статус бронирования
            allBookings[bookingIndex].status = 'cancelled';
            allBookings[bookingIndex].cancelledAt = new Date().toISOString();
            
            // Сохраняем обновленный массив
            localStorage.setItem('micos_bookings', JSON.stringify(allBookings));
            
            // Перезагружаем список бронирований
            this.loadBookings();
            
            window.showNotification('Бронирование успешно отменено', 'success');
            
        } catch (error) {
            console.error('Ошибка при отмене бронирования:', error);
            window.showNotification('Ошибка при отмене бронирования', 'error');
        }
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
            // Обновляем пароль в массиве всех пользователей
            const users = JSON.parse(localStorage.getItem('micos_users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].password = password;
                localStorage.setItem('micos_users', JSON.stringify(users));
            }
        }
        
        // Сохраняем обновленные данные текущего пользователя
        localStorage.setItem('micos_user', JSON.stringify(this.currentUser));
        
        // Обновляем отображение
        this.loadUserData();
        
        window.showNotification('Настройки сохранены', 'success');
    }

    showBookingDetails(bookingId) {
        try {
            // Получаем все бронирования
            const allBookings = JSON.parse(localStorage.getItem('micos_bookings') || '[]');
            const booking = allBookings.find(b => b.id === bookingId);
            
            if (!booking) {
                window.showNotification('Бронирование не найдено', 'error');
                return;
            }
            
            // Создаем модальное окно с деталями бронирования
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal" style="max-width: 500px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: var(--color-blue);">Детали бронирования</h2>
                        <button class="modal-close" style="
                            background: none; 
                            border: none; 
                            font-size: 24px; 
                            cursor: pointer;
                            color: var(--color-gray);
                        ">&times;</button>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: var(--color-blue);">${booking.performance || 'Неизвестный спектакль'}</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                            <div>
                                <div style="color: var(--color-gray); font-size: 0.9rem;">Номер заказа</div>
                                <div style="font-weight: 600;">${booking.id}</div>
                            </div>
                            <div>
                                <div style="color: var(--color-gray); font-size: 0.9rem;">Статус</div>
                                <div style="font-weight: 600; color: ${this.getStatusColor(booking.status || 'confirmed')}">
                                    ${this.getStatusText(booking.status || 'confirmed')}
                                </div>
                            </div>
                            <div>
                                <div style="color: var(--color-gray); font-size: 0.9rem;">Дата</div>
                                <div style="font-weight: 600;">${booking.date || 'Не указана'}</div>
                            </div>
                            <div>
                                <div style="color: var(--color-gray); font-size: 0.9rem;">Время</div>
                                <div style="font-weight: 600;">${booking.time || 'Не указано'}</div>
                            </div>
                            <div>
                                <div style="color: var(--color-gray); font-size: 0.9rem;">Количество мест</div>
                                <div style="font-weight: 600;">${booking.seats || (Array.isArray(booking.selectedSeats) ? booking.selectedSeats.length : 0)}</div>
                            </div>
                            <div>
                                <div style="color: var(--color-gray); font-size: 0.9rem;">Сумма</div>
                                <div style="font-weight: 600; color: var(--color-red);">
                                    ${booking.total ? booking.total.toLocaleString() + ' ₽' : 'Не указана'}
                                </div>
                            </div>
                        </div>
                        
                        ${booking.selectedSeats ? `
                            <div>
                                <div style="color: var(--color-gray); font-size: 0.9rem; margin-bottom: 8px;">Выбранные места</div>
                                <div style="
                                    display: flex;
                                    flex-wrap: wrap;
                                    gap: 8px;
                                ">
                                    ${Array.isArray(booking.selectedSeats) 
                                        ? booking.selectedSeats.map(seat => `
                                            <span style="
                                                background: var(--color-beige);
                                                padding: 6px 12px;
                                                border-radius: 4px;
                                                font-size: 0.9rem;
                                            ">
                                                ${seat}
                                            </span>
                                        `).join('')
                                        : `<span style="
                                            background: var(--color-beige);
                                            padding: 6px 12px;
                                            border-radius: 4px;
                                            font-size: 0.9rem;
                                        ">
                                            ${booking.selectedSeats}
                                        </span>`
                                    }
                                </div>
                            </div>
                        ` : ''}
                        
                        ${booking.createdAt ? `
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <div style="color: var(--color-gray); font-size: 0.85rem;">
                                    Бронирование создано: ${new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button class="btn btn--outline" id="close-modal-btn">
                            Закрыть
                        </button>
                        ${this.isUpcomingBooking(booking) ? `
                            <button class="btn btn--primary" id="cancel-booking-modal-btn" data-booking-id="${booking.id}">
                                Отменить бронирование
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Обработчики для модального окна
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('#close-modal-btn').addEventListener('click', () => {
                modal.remove();
            });
            
            const cancelBtn = modal.querySelector('#cancel-booking-modal-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    const bookingId = cancelBtn.dataset.bookingId;
                    modal.remove();
                    this.cancelBooking(bookingId);
                });
            }
            
            // Закрытие по клику на фон
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
        } catch (error) {
            console.error('Ошибка при показе деталей бронирования:', error);
            window.showNotification('Ошибка при загрузке деталей бронирования', 'error');
        }
    }
}

// Инициализация страницы аккаунта
document.addEventListener('DOMContentLoaded', () => {
    new AccountPage();
});