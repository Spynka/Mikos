// Система авторизации
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.updateAuthUI();
        this.bindAuthEvents();
    }

    loadUser() {
        const userData = localStorage.getItem('micos_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    saveUser(user) {
        this.currentUser = user;
        localStorage.setItem('micos_user', JSON.stringify(user));
        this.updateAuthUI();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('micos_user');
        this.updateAuthUI();
        window.showNotification('Вы успешно вышли из системы', 'success');
        
        // Перенаправляем на главную, если находимся на защищенной странице
        if (window.location.pathname.includes('account.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    updateAuthUI() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        if (this.currentUser) {
            authContainer.innerHTML = `
                <div class="user-menu">
                    <button class="user-btn" id="user-menu-btn">
                        <span class="user-avatar">${this.currentUser.name.charAt(0)}</span>
                        <span class="user-name">${this.currentUser.name}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </button>
                    <div class="user-dropdown" id="user-dropdown">
                        <a href="account.html" class="dropdown-item">Личный кабинет</a>
                        <a href="account.html#bookings" class="dropdown-item">Мои билеты</a>
                        <a href="account.html#favorites" class="dropdown-item">Избранное</a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item logout-btn">Выйти</button>
                    </div>
                </div>
            `;
        } else {
            authContainer.innerHTML = `
                <button class="btn btn--outline btn--sm" id="login-btn">
                    Войти
                </button>
            `;
        }
        
        this.bindUserMenuEvents();
    }

    showLoginModal() {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.id = 'login-modal';
        
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Вход в аккаунт</h2>
                    <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="login-password">Пароль</label>
                        <input type="password" id="login-password" class="form-control" required>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="remember-me">
                            <span>Запомнить меня</span>
                        </label>
                        <a href="#" style="color: var(--color-blue);">Забыли пароль?</a>
                    </div>
                    
                    <button type="submit" class="btn btn--primary btn--full" style="margin-bottom: 20px;">Войти</button>
                </form>
                
                <div style="text-align: center; color: var(--color-gray); margin: 20px 0;">
                    <span>Нет аккаунта? </span>
                    <button id="show-register" style="background: none; border: none; color: var(--color-blue); cursor: pointer; font-weight: 600;">Зарегистрироваться</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        modal.querySelector('#show-register').addEventListener('click', () => {
            modal.remove();
            this.showRegisterModal();
        });
    }

    showRegisterModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.id = 'register-modal';
        
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Регистрация</h2>
                    <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                
                <form id="register-form">
                    <div class="form-group">
                        <label for="register-name">Имя и фамилия</label>
                        <input type="text" id="register-name" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-email">Email</label>
                        <input type="email" id="register-email" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-phone">Телефон</label>
                        <input type="tel" id="register-phone" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-password">Пароль</label>
                        <input type="password" id="register-password" class="form-control" required minlength="6">
                    </div>
                    
                    <div class="form-group">
                        <label for="register-password-confirm">Подтвердите пароль</label>
                        <input type="password" id="register-password-confirm" class="form-control" required minlength="6">
                    </div>
                    
                    <label style="display: flex; align-items: center; gap: 8px; margin: 20px 0;">
                        <input type="checkbox" id="terms" required>
                        <span>Я согласен с условиями использования и политикой конфиденциальности</span>
                    </label>
                    
                    <button type="submit" class="btn btn--primary btn--full" style="margin-bottom: 20px;">Зарегистрироваться</button>
                </form>
                
                <div style="text-align: center; color: var(--color-gray); margin: 20px 0;">
                    <span>Уже есть аккаунт? </span>
                    <button id="show-login" style="background: none; border: none; color: var(--color-blue); cursor: pointer; font-weight: 600;">Войти</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        modal.querySelector('#show-login').addEventListener('click', () => {
            modal.remove();
            this.showLoginModal();
        });
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Простая валидация
        if (!email || !password) {
            window.showNotification('Заполните все поля', 'error');
            return;
        }
        
        // Имитация запроса к API
        try {
            // В реальном приложении здесь будет fetch к API
            const response = await this.mockLoginApi(email, password);
            
            if (response.success) {
                this.saveUser(response.user);
                document.getElementById('login-modal')?.remove();
                window.showNotification('Вы успешно вошли в систему', 'success');
                
                // Если есть редирект после авторизации
                const redirect = sessionStorage.getItem('redirectAfterLogin');
                if (redirect) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirect;
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            window.showNotification(error.message, 'error');
        }
    }

    async handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        
        // Валидация
        if (!name || !email || !phone || !password) {
            window.showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            window.showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            window.showNotification('Введите корректный email', 'error');
            return;
        }
        
        try {
            const response = await this.mockRegisterApi({ name, email, phone, password });
            
            if (response.success) {
                this.saveUser(response.user);
                document.getElementById('register-modal')?.remove();
                window.showNotification('Регистрация успешна! Добро пожаловать!', 'success');
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            window.showNotification(error.message, 'error');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    mockLoginApi(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Проверяем в localStorage
                const users = JSON.parse(localStorage.getItem('micos_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    resolve({
                        success: true,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone
                        }
                    });
                } else {
                    reject(new Error('Неверный email или пароль'));
                }
            }, 1000);
        });
    }

    mockRegisterApi(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const users = JSON.parse(localStorage.getItem('micos_users') || '[]');
                    
                    // Проверяем, нет ли уже такого email
                    if (users.find(u => u.email === userData.email)) {
                        reject(new Error('Пользователь с таким email уже существует'));
                        return;
                    }
                    
                    const newUser = {
                        id: Date.now(),
                        ...userData,
                        createdAt: new Date().toISOString()
                    };
                    
                    users.push(newUser);
                    localStorage.setItem('micos_users', JSON.stringify(users));
                    
                    resolve({
                        success: true,
                        user: {
                            id: newUser.id,
                            name: newUser.name,
                            email: newUser.email,
                            phone: newUser.phone
                        }
                    });
                } catch (error) {
                    reject(new Error('Ошибка сохранения пользователя'));
                }
            }, 1500);
        });
    }

    bindAuthEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'login-btn' || e.target.closest('#login-btn')) {
                this.showLoginModal();
            }
        });
    }

    bindUserMenuEvents() {
        const userBtn = document.getElementById('user-menu-btn');
        const dropdown = document.getElementById('user-dropdown');
        
        if (userBtn && dropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            // Закрытие при клике вне меню
            document.addEventListener('click', () => {
                dropdown.classList.remove('show');
            });
            
            // Кнопка выхода
            const logoutBtn = dropdown.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        }
    }
}

// Инициализация системы авторизации
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});