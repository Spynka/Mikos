// Система бронирования билетов
class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.selectedSeats = [];
        this.performanceData = null;
        this.seatPrice = 1500; // Цена за место
        this.totalRows = 10;
        this.seatsPerRow = 15;
        this.init();
    }

    init() {
        this.loadPerformanceData();
        this.bindEvents();
        this.generateSeats();
        this.updateStep();
    }

    loadPerformanceData() {
        const urlParams = new URLSearchParams(window.location.search);
        const performanceId = urlParams.get('performance');
        const date = urlParams.get('date');
        const time = urlParams.get('time');
        
        // Имитация загрузки данных о спектакле
        const performances = {
            1: { title: 'Лишь бы не было детей', age: '18+', duration: '90 мин' },
            2: { title: 'Авиаторы', age: '16+', duration: '75 мин' },
            3: { title: 'Богатыри', age: '12+', duration: '80 мин' },
            4: { title: 'Цирк навсегда', age: '16+', duration: '85 мин' },
            5: { title: 'Тишина', age: '18+', duration: '95 мин' }
        };
        
        this.performanceData = performances[performanceId] || performances[1];
        
        // Обновляем информацию о спектакле
        const performanceInfo = document.getElementById('performance-info');
        if (performanceInfo) {
            let info = `Спектакль: ${this.performanceData.title}`;
            if (date) {
                const formattedDate = this.formatDate(date);
                info += `, ${formattedDate}`;
            }
            if (time) {
                info += `, ${time}`;
            }
            performanceInfo.textContent = info;
        }
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }

    generateSeats() {
        const seatsGrid = document.getElementById('seats-grid');
        if (!seatsGrid) return;
        
        seatsGrid.innerHTML = '';
        
        // Генерируем занятые места случайным образом (30% заняты)
        const occupiedSeats = new Set();
        for (let row = 1; row <= this.totalRows; row++) {
            for (let seat = 1; seat <= this.seatsPerRow; seat++) {
                if (Math.random() < 0.3) {
                    occupiedSeats.add(`${row}-${seat}`);
                }
            }
        }
        
        // Создаем сетку мест
        for (let row = 1; row <= this.totalRows; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';
            
            // Добавляем номер ряда
            const rowNumber = document.createElement('div');
            rowNumber.className = 'seat';
            rowNumber.style.border = 'none';
            rowNumber.textContent = row;
            rowElement.appendChild(rowNumber);
            
            // Создаем места в ряду
            for (let seat = 1; seat <= this.seatsPerRow; seat++) {
                const seatElement = document.createElement('div');
                seatElement.className = 'seat';
                seatElement.dataset.row = row;
                seatElement.dataset.seat = seat;
                seatElement.dataset.id = `${row}-${seat}`;
                
                // Проверяем, занято ли место
                if (occupiedSeats.has(`${row}-${seat}`)) {
                    seatElement.classList.add('unavailable');
                    seatElement.title = 'Место занято';
                } else {
                    seatElement.title = `Ряд ${row}, Место ${seat}`;
                    seatElement.addEventListener('click', () => this.toggleSeat(row, seat));
                }
                
                seatElement.textContent = seat;
                rowElement.appendChild(seatElement);
            }
            
            seatsGrid.appendChild(rowElement);
        }
    }

    toggleSeat(row, seat) {
        const seatId = `${row}-${seat}`;
        const seatIndex = this.selectedSeats.findIndex(s => s.id === seatId);
        const seatElement = document.querySelector(`[data-id="${seatId}"]`);
        
        if (seatIndex === -1) {
            // Добавляем место
            if (this.selectedSeats.length >= 10) {
                window.showNotification('Можно выбрать не более 10 мест', 'error');
                return;
            }
            
            this.selectedSeats.push({
                id: seatId,
                row: row,
                seat: seat,
                price: this.seatPrice
            });
            
            if (seatElement) {
                seatElement.classList.add('selected');
            }
        } else {
            // Удаляем место
            this.selectedSeats.splice(seatIndex, 1);
            
            if (seatElement) {
                seatElement.classList.remove('selected');
            }
        }
        
        this.updateSelectedSeats();
        this.updateNextButton();
    }

    updateSelectedSeats() {
        const selectedCount = document.getElementById('selected-count');
        const selectedTotal = document.getElementById('selected-total');
        const selectedList = document.getElementById('selected-seats-list');
        
        if (selectedCount) {
            selectedCount.textContent = this.selectedSeats.length;
        }
        
        if (selectedTotal) {
            const total = this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
            selectedTotal.textContent = total.toLocaleString();
        }
        
        if (selectedList) {
            selectedList.innerHTML = this.selectedSeats.map(seat => `
                <div class="selected-seat">
                    Ряд ${seat.row}, Место ${seat.seat}
                </div>
            `).join('');
        }
    }

    updateNextButton() {
        const nextButton = document.getElementById('next-step-1');
        if (nextButton) {
            nextButton.disabled = this.selectedSeats.length === 0;
        }
    }

    updateStep() {
        // Обновляем шаги
        document.querySelectorAll('.step').forEach(step => {
            const stepNumber = parseInt(step.dataset.step);
            if (stepNumber <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Показываем текущий шаг
        document.querySelectorAll('.booking-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const currentSection = document.getElementById(`step-${this.currentStep}`);
        if (currentSection) {
            currentSection.classList.add('active');
        }
        
        // На шаге 3 показываем итоги
        if (this.currentStep === 3) {
            this.showConfirmation();
        }
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStep();
            
            // Если переходим на шаг 2, заполняем форму данными пользователя
            if (this.currentStep === 2) {
                this.fillUserData();
                this.updateOrderDetails();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
        }
    }

    fillUserData() {
        const currentUser = JSON.parse(localStorage.getItem('micos_user'));
        if (!currentUser) return;
        
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        
        if (currentUser.name) {
            const nameParts = currentUser.name.split(' ');
            if (firstName && nameParts[0]) firstName.value = nameParts[0];
            if (lastName && nameParts[1]) lastName.value = nameParts[1];
        }
        
        if (email && currentUser.email) email.value = currentUser.email;
        if (phone && currentUser.phone) phone.value = currentUser.phone;
    }

    updateOrderDetails() {
        const orderDetails = document.getElementById('order-details');
        if (!orderDetails) return;
        
        const total = this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
        
        orderDetails.innerHTML = `
            <div class="summary-item">
                <span>Спектакль:</span>
                <span>${this.performanceData.title}</span>
            </div>
            <div class="summary-item">
                <span>Количество мест:</span>
                <span>${this.selectedSeats.length}</span>
            </div>
            <div class="summary-item">
                <span>Выбранные места:</span>
                <span>${this.selectedSeats.map(s => `Р${s.row}М${s.seat}`).join(', ')}</span>
            </div>
            <div class="summary-item">
                <span>Цена за место:</span>
                <span>${this.seatPrice} ₽</span>
            </div>
            <div class="summary-total">
                <span>Итого:</span>
                <span>${total.toLocaleString()} ₽</span>
            </div>
        `;
    }

    showConfirmation() {
        const orderNumber = document.getElementById('order-number');
        if (orderNumber) {
            // Генерируем случайный номер заказа
            const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            orderNumber.textContent = `#${randomNum}`;
            
            // Сохраняем бронирование в localStorage
            this.saveBooking(randomNum);
        }
    }

    saveBooking(orderNumber) {
        const bookings = JSON.parse(localStorage.getItem('micos_bookings') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('micos_user'));
        
        const newBooking = {
            id: orderNumber,
            performance: this.performanceData.title,
            date: new Date().toLocaleDateString('ru-RU'),
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            seats: this.selectedSeats.length,
            selectedSeats: this.selectedSeats.map(s => `Ряд ${s.row}, Место ${s.seat}`),
            total: this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            userId: currentUser ? currentUser.id : null
        };
        
        bookings.push(newBooking);
        localStorage.setItem('micos_bookings', JSON.stringify(bookings));
    }

    bindEvents() {
        // Кнопки навигации
        const nextStep1 = document.getElementById('next-step-1');
        const prevStep2 = document.getElementById('prev-step-2');
        const nextStep2 = document.getElementById('next-step-2');
        
        if (nextStep1) {
            nextStep1.addEventListener('click', () => this.nextStep());
        }
        
        if (prevStep2) {
            prevStep2.addEventListener('click', () => this.prevStep());
        }
        
        if (nextStep2) {
            nextStep2.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Проверяем форму
                const form = document.getElementById('booking-form');
                if (form && form.checkValidity()) {
                    this.nextStep();
                } else {
                    window.showNotification('Заполните все обязательные поля', 'error');
                }
            });
        }
        
        // Проверка авторизации при начале бронирования
        if (!localStorage.getItem('micos_user')) {
            window.showNotification('Для бронирования билетов необходимо войти в аккаунт', 'error');
            
            // Сохраняем текущий URL для редиректа
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            
            // Показываем модальное окно авторизации
            if (window.authSystem) {
                window.authSystem.showLoginModal();
            }
        }
    }
}

// Инициализация системы бронирования
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('booking.html')) {
        new BookingSystem();
    }
});