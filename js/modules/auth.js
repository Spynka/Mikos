// Система авторизации
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.createTestUser(); // Создаем тестового пользователя
        this.loadUser();
        this.updateAuthUI();
        this.bindAuthEvents();
    }

    // Создание тестового пользователя
    createTestUser() {
        const users = JSON.parse(localStorage.getItem('micos_users') || '[]');
        
        // Проверяем, существует ли тестовый пользователь
        const testUserExists = users.some(u => u.email === 'test@example.com');
        
        if (!testUserExists) {
            const testUser = {
                id: 1,
                name: 'Тестовый Пользователь',
                email: 'test@example.com',
                phone: '+7 (999) 123-45-67',
                password: 'password123',
                createdAt: new Date().toISOString()
            };
            
            users.push(testUser);
            localStorage.setItem('micos_users', JSON.stringify(users));
            console.log('✅ Тестовый пользователь создан:', testUser.email, '/ password123');
        } else {
            console.log('ℹ️ Тестовый пользователь уже существует');
        }
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
                
                <!-- ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ВХОДА -->
                <div style="background: #f5f5f5; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                    <div style="font-size: 12px; color: #666; line-height: 1.5;">
                        <div style="margin-bottom: 5px;"><strong>Для теста можно использовать:</strong></div>
                        <div><strong>Email:</strong> test@example.com</div>
                        <div><strong>Пароль:</strong> password123</div>
                        <div style="margin-top: 8px; font-size: 11px; font-style: italic;">Или зарегистрируйте нового пользователя</div>
                    </div>
                </div>
                
                <div style="text-align: center; color: var(--color-gray); margin: 20px 0;">
                    <span>Нет аккаунта? </span>
                    <button id="show-register" style="background: none; border: none; color: var(--color-blue); cursor: pointer; font-weight: 600;">Зарегистрироваться</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Автозаполнение тестовыми данными (с небольшой задержкой)
        setTimeout(() => {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            if (emailInput && passwordInput) {
                emailInput.value = 'test@example.com';
                passwordInput.value = 'password123';
            }
        }, 50);
        
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
						<label for="register-name">Имя и фамилия *</label>
						<input type="text" id="register-name" class="form-control" placeholder="Введите имя и фамилию">
					</div>
					
					<div class="form-group">
						<label for="register-email">Email *</label>
						<input type="email" id="register-email" class="form-control" placeholder="example@email.com">
					</div>
					
					<div class="form-group">
						<label for="register-phone">Телефон *</label>
						<input type="text" id="register-phone" class="form-control" placeholder="+7 (999) 123-45-67">
					</div>
					
					<div class="form-group">
						<label for="register-password">Пароль *</label>
						<input type="password" id="register-password" class="form-control" placeholder="Минимум 6 символов">
					</div>
					
					<div class="form-group">
						<label for="register-password-confirm">Подтвердите пароль *</label>
						<input type="password" id="register-password-confirm" class="form-control" placeholder="Повторите пароль">
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
		
		// Автозаполнение для тестирования
		setTimeout(() => {
			document.getElementById('register-name').value = 'Ксения Смирнова';
			document.getElementById('register-email').value = 'smirnovakp2002@gmail.com';
			document.getElementById('register-phone').value = '89610185617';
			document.getElementById('register-password').value = '123456';
			document.getElementById('register-password-confirm').value = '123456';
		}, 100);
		
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
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        console.log('🔐 Попытка входа:', { email, passwordLength: password.length });
        
        // Простая валидация
        if (!email || !password) {
            window.showNotification('Заполните все поля', 'error');
            return;
        }
        
        // Имитация запроса к API
        try {
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
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        
        console.log('📝 Регистрация начата:', { 
            name, 
            email, 
            phone,
            passwordLength: password.length,
            confirmPasswordLength: confirmPassword.length
        });
        
        // Детальная отладка паролей
        console.log('🔍 ДЕТАЛЬНАЯ ПРОВЕРКА ПАРОЛЕЙ:');
        console.log('Пароль как строка:', `"${password}"`);
        console.log('Подтверждение как строка:', `"${confirmPassword}"`);
        console.log('Длина пароля:', password.length);
        console.log('Длина подтверждения:', confirmPassword.length);
        console.log('Побайтовое сравнение:', password === confirmPassword);
        
        // Проверка на невидимые символы
        const passwordCodes = Array.from(password).map(c => c.charCodeAt(0));
        const confirmCodes = Array.from(confirmPassword).map(c => c.charCodeAt(0));
        console.log('Коды символов пароля:', passwordCodes);
        console.log('Коды символов подтверждения:', confirmCodes);
        
        // Валидация
        if (!name || !email || !phone || !password || !confirmPassword) {
            window.showNotification('Заполните все поля', 'error');
            return;
        }
        
        // Проверка совпадения паролей
        if (password !== confirmPassword) {
            console.error('❌ ПАРОЛИ НЕ СОВПАДАЮТ!');
            console.error('Пароль:', JSON.stringify(password));
            console.error('Подтверждение:', JSON.stringify(confirmPassword));
            
            // Показываем более информативное сообщение
            window.showNotification(`Пароли не совпадают. Длина: ${password.length} vs ${confirmPassword.length}`, 'error');
            return;
        }
        
        // Проверка минимальной длины
        if (password.length < 6) {
            window.showNotification('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        // Валидация email
        if (!this.validateEmail(email)) {
            window.showNotification('Введите корректный email', 'error');
            return;
        }
        
        try {
            const response = await this.mockRegisterApi({ name, email, phone, password });
            
            if (response.success) {
                console.log('✅ Регистрация успешна!');
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
                console.log('🔍 Поиск пользователя:', email);
                
                // Проверяем в localStorage
                const users = JSON.parse(localStorage.getItem('micos_users') || '[]');
                console.log('Все пользователи в системе:', users.map(u => ({ email: u.email, name: u.name })));
                
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    console.log('✅ Пользователь найден:', user.name);
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
                    console.log('❌ Пользователь не найден или неверный пароль');
                    
                    // Проверяем, существует ли email
                    const userExists = users.some(u => u.email === email);
                    if (userExists) {
                        console.log('⚠️  Email существует, но пароль неверный');
                    }
                    
                    reject(new Error('Неверный email или пароль'));
                }
            }, 500); // Уменьшил задержку для отладки
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
                    
                    console.log('📋 Новый пользователь сохранен:', newUser);
                    
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
                    console.error('❌ Ошибка сохранения пользователя:', error);
                    reject(new Error('Ошибка сохранения пользователя'));
                }
            }, 800); // Уменьшил задержку для отладки
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
    console.log('🚀 Инициализация системы авторизации...');
    window.authSystem = new AuthSystem();
    
    // Проверяем существующих пользователей
    const users = JSON.parse(localStorage.getItem('micos_users') || '[]');
    console.log('👥 Всего пользователей в системе:', users.length);
    users.forEach((user, i) => {
        console.log(`  ${i+1}. ${user.name} (${user.email})`);
    });
});