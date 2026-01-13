// Календарь-слайдер
class CalendarSlider {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.daysToShow = 7;
        this.events = {};
        this.activeFilters = {
            performance: 'all',
            time: 'all',
            age: 'all'
        };
        console.log('CalendarSlider: конструктор вызван');
        this.init();
    }

    init() {
        console.log('CalendarSlider: init()');
        this.loadEvents();
        this.render();
        this.bindEvents();
    }

    loadEvents() {
        console.log('CalendarSlider: загрузка событий...');
        const today = new Date();
        this.events = {};
        
        // Создаем спектакли на ближайшие 30 дней
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayEvents = [];
            const eventCount = Math.floor(Math.random() * 5);
            
            for (let j = 0; j < eventCount; j++) {
                const performances = [
                    { 
                        id: 1, 
                        title: 'Лишь бы не было детей', 
                        time: '19:00', 
                        age: '18+', 
                        price: 1500,
                        duration: '90 мин'
                    },
                    { 
                        id: 2, 
                        title: 'Авиаторы', 
                        time: '20:00', 
                        age: '16+', 
                        price: 1200,
                        duration: '75 мин'
                    },
                    { 
                        id: 3, 
                        title: 'Богатыри', 
                        time: '19:00', 
                        age: '12+', 
                        price: 1400,
                        duration: '80 мин'
                    },
                    { 
                        id: 4, 
                        title: 'Цирк навсегда', 
                        time: '19:00', 
                        age: '16+', 
                        price: 1300,
                        duration: '85 мин'
                    },
                    { 
                        id: 5, 
                        title: 'Тишина', 
                        time: '20:00', 
                        age: '18+', 
                        price: 1600,
                        duration: '95 мин'
                    }
                ];
                
                const performance = performances[Math.floor(Math.random() * performances.length)];
                
                // Добавляем разные времена для разнообразия
                const times = ['18:00', '19:00', '20:00', '21:00'];
                const randomTime = times[Math.floor(Math.random() * times.length)];
                
                const availableSeats = Math.floor(Math.random() * 50) + 10;
                
                dayEvents.push({
                    ...performance,
                    time: randomTime,
                    availableSeats: availableSeats,
                    totalSeats: 100
                });
            }
            
            if (dayEvents.length > 0) {
                this.events[dateStr] = dayEvents;
            }
        }
        
        // Гарантированные события на сегодня и завтра
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        // Гарантируем события на сегодня
        if (!this.events[todayStr]) {
            this.events[todayStr] = [];
        }
        this.events[todayStr].push(
            {
                id: 1,
                title: 'Лишь бы не было детей',
                time: '19:00',
                age: '18+',
                price: 1500,
                duration: '90 мин',
                availableSeats: 45,
                totalSeats: 100
            },
            {
                id: 4,
                title: 'Цирк навсегда',
                time: '20:00',
                age: '16+',
                price: 1300,
                duration: '85 мин',
                availableSeats: 67,
                totalSeats: 100
            },
            {
                id: 5,
                title: 'Тишина',
                time: '21:00',
                age: '18+',
                price: 1600,
                duration: '95 мин',
                availableSeats: 25,
                totalSeats: 100
            }
        );
        
        // Гарантируем события на завтра
        if (!this.events[tomorrowStr]) {
            this.events[tomorrowStr] = [];
        }
        this.events[tomorrowStr].push(
            {
                id: 2,
                title: 'Авиаторы',
                time: '19:00',
                age: '16+',
                price: 1200,
                duration: '75 мин',
                availableSeats: 32,
                totalSeats: 100
            },
            {
                id: 3,
                title: 'Богатыри',
                time: '18:00',
                age: '12+',
                price: 1400,
                duration: '80 мин',
                availableSeats: 48,
                totalSeats: 100
            },
            {
                id: 5,
                title: 'Тишина',
                time: '21:00',
                age: '18+',
                price: 1600,
                duration: '95 мин',
                availableSeats: 28,
                totalSeats: 100
            }
        );
        
        console.log('CalendarSlider: события загружены. Всего дней со событиями:', Object.keys(this.events).length);
    }

    render() {
        console.log('CalendarSlider: render()');
        this.renderCalendar();
        this.renderSelectedDatePerformances();
    }

    renderCalendar() {
        const container = document.querySelector('.calendar-slider__days');
        if (!container) return;
        
        container.innerHTML = '';
        
        const days = this.getVisibleDays();
        
        days.forEach(date => {
            const dayElement = this.createDayElement(date);
            container.appendChild(dayElement);
        });
        
        const title = document.querySelector('.calendar-slider__title');
        if (title) {
            const firstDay = days[0];
            const lastDay = days[days.length - 1];
            title.textContent = this.formatDateRange(firstDay, lastDay);
        }
        
        this.updateNavButtons();
    }
    
    getMonthNameGenitive(monthIndex) {
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                       'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        return months[monthIndex];
    }
    
    getVisibleDays() {
        const days = [];
        const startDate = new Date(this.currentDate);
        
        const dayOfWeek = startDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + diff);
        
        for (let i = 0; i < this.daysToShow; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }
        
        return days;
    }

    createDayElement(date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = date.toISOString().split('T')[0];
        
        const dateStr = date.toISOString().split('T')[0];
        const events = this.events[dateStr] || [];
        const hasEvents = events.length > 0;
        
        const isSelected = date.toDateString() === this.selectedDate.toDateString();
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        if (isSelected) dayElement.classList.add('calendar-day--selected');
        if (isToday) dayElement.classList.add('calendar-day--today');
        if (hasEvents) dayElement.classList.add('calendar-day--has-events');
        if (isWeekend) dayElement.classList.add('calendar-day--weekend');
        
        const weekdays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
        const weekday = weekdays[date.getDay()];
        
        const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
        const month = months[date.getMonth()];
        
        dayElement.innerHTML = `
            <div class="calendar-day__weekday">${weekday}</div>
            <div class="calendar-day__number">${date.getDate()}</div>
            <div class="calendar-day__month">${month}</div>
        `;
        
        // Обновляем подсчет событий с учетом фильтров
        const filteredEvents = this.applyFiltersToEvents(events);
        const hasFilteredEvents = filteredEvents.length > 0;
        
        if (hasFilteredEvents) {
            const eventsCount = Math.min(filteredEvents.length, 3);
            const eventsDots = document.createElement('div');
            eventsDots.className = 'calendar-day__events';
            
            for (let i = 0; i < eventsCount; i++) {
                const dot = document.createElement('div');
                dot.className = 'calendar-day__event-dot';
                eventsDots.appendChild(dot);
            }
            
            dayElement.appendChild(eventsDots);
            
            if (filteredEvents.length > 3) {
                const count = document.createElement('div');
                count.className = 'calendar-day__event-count';
                count.textContent = filteredEvents.length;
                dayElement.appendChild(count);
            }
        } else if (hasEvents) {
            // Если есть события, но они все отфильтрованы - показываем серые точки
            const eventsDots = document.createElement('div');
            eventsDots.className = 'calendar-day__events calendar-day__events--filtered';
            eventsDots.title = 'События отфильтрованы';
            
            const dot = document.createElement('div');
            dot.className = 'calendar-day__event-dot calendar-day__event-dot--filtered';
            eventsDots.appendChild(dot);
            
            dayElement.appendChild(eventsDots);
        }
        
        dayElement.addEventListener('click', () => {
            this.selectDate(date);
        });
        
        return dayElement;
    }

    selectDate(date) {
        this.selectedDate = date;
        this.render();
        this.scrollToSelectedDate();
    }

    scrollToSelectedDate() {
        const selectedElement = document.querySelector('.calendar-day--selected');
        if (selectedElement) {
            selectedElement.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }

    renderSelectedDatePerformances() {
        const container = document.querySelector('.selected-date-performances__grid');
        const dateElement = document.querySelector('.selected-date-performances__date');
        
        if (!container) return;
        
        const dateStr = this.selectedDate.toISOString().split('T')[0];
        const events = this.events[dateStr] || [];
        
        // Применяем фильтры к событиям
        const filteredEvents = this.applyFiltersToEvents(events);
        
        if (dateElement) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            let dateText;
            if (this.selectedDate.toDateString() === today.toDateString()) {
                dateText = 'Сегодня';
            } else if (this.selectedDate.toDateString() === tomorrow.toDateString()) {
                dateText = 'Завтра';
            } else {
                dateText = this.selectedDate.toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                });
            }
            
            // Добавляем информацию о фильтрах
            const filterInfo = this.getFilterInfo();
            if (filterInfo) {
                dateText += ` (${filterInfo})`;
            }
            
            dateElement.textContent = dateText;
        }
        
        container.innerHTML = '';
        
        if (filteredEvents.length === 0) {
            let message = 'На выбранную дату нет спектаклей';
            const filterInfo = this.getFilterInfo();
            if (filterInfo && events.length > 0) {
                message = `Нет спектаклей по выбранным фильтрам (${filterInfo})`;
            }
            
            container.innerHTML = `
                <div class="no-performances">
                    <p>${message}</p>
                    <p><small>Попробуйте выбрать другую дату или изменить фильтры</small></p>
                </div>
            `;
            return;
        }
        
        // Сортируем по времени
        filteredEvents.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });
        
        filteredEvents.forEach(event => {
            const card = this.createPerformanceCard(event);
            container.appendChild(card);
        });
    }

    createPerformanceCard(event) {
        const card = document.createElement('div');
        card.className = 'performance-card';
        
        const isSoldOut = event.availableSeats === 0;
        const fewSeatsLeft = event.availableSeats > 0 && event.availableSeats <= 10;
        
        card.innerHTML = `
            <div class="performance-card__header">
                <h3 class="performance-card__title">${event.title}</h3>
                <span class="performance-card__time">${event.time}</span>
            </div>
            <div class="performance-card__meta">
                <span class="performance-card__age">${event.age}</span>
                <span>${event.duration}</span>
                ${fewSeatsLeft ? `<span style="color: var(--color-red); font-weight: 600;">Осталось ${event.availableSeats} мест</span>` : ''}
                ${isSoldOut ? `<span style="color: var(--color-red); font-weight: 600;">Билетов нет</span>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                <div class="performance-card__price">${event.price} ₽</div>
                ${!isSoldOut ? `
                    <a href="booking.html?performance=${event.id}&date=${this.selectedDate.toISOString().split('T')[0]}&time=${event.time}" 
                       class="btn btn--primary btn--sm">Купить билеты</a>
                ` : `
                    <button class="btn btn--outline btn--sm" disabled>Билетов нет</button>
                `}
            </div>
        `;
        
        return card;
    }

    // МЕТОД ДЛЯ ПРИМЕНЕНИЯ ФИЛЬТРОВ К СОБЫТИЯМ
    applyFiltersToEvents(events) {
        if (!events || events.length === 0) return [];
        
        return events.filter(event => {
            // Фильтр по спектаклю
            if (this.activeFilters.performance !== 'all') {
                if (event.id.toString() !== this.activeFilters.performance) {
                    return false;
                }
            }
            
            // Фильтр по времени
            if (this.activeFilters.time !== 'all') {
                if (event.time !== this.activeFilters.time) {
                    return false;
                }
            }
            
            // Фильтр по возрасту
            if (this.activeFilters.age !== 'all') {
                if (event.age !== this.activeFilters.age) {
                    return false;
                }
            }
            
            return true;
        });
    }

    // МЕТОД ДЛЯ ПОЛУЧЕНИЯ ТЕКСТОВОГО ОПИСАНИЯ АКТИВНЫХ ФИЛЬТРОВ
    getFilterInfo() {
        const activeFilters = [];
        
        if (this.activeFilters.performance !== 'all') {
            const performanceSelect = document.getElementById('performance-filter');
            const selectedOption = performanceSelect?.options[performanceSelect.selectedIndex];
            activeFilters.push(selectedOption?.text || '');
        }
        
        if (this.activeFilters.time !== 'all') {
            activeFilters.push(`в ${this.activeFilters.time}`);
        }
        
        if (this.activeFilters.age !== 'all') {
            activeFilters.push(this.activeFilters.age);
        }
        
        return activeFilters.length > 0 ? activeFilters.join(', ') : null;
    }

    prevWeek() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() - 7);
        this.currentDate = newDate;
        this.render();
    }

    nextWeek() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + 7);
        this.currentDate = newDate;
        this.render();
    }

    updateNavButtons() {
        const prevBtn = document.querySelector('.calendar-slider__btn--prev');
        const nextBtn = document.querySelector('.calendar-slider__btn--next');
        
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
    }

    formatDateRange(startDate, endDate) {
        const startMonth = this.getMonthNameGenitive(startDate.getMonth());
        const endMonth = this.getMonthNameGenitive(endDate.getMonth());
        
        if (startMonth === endMonth) {
            return `${startDate.getDate()} - ${endDate.getDate()} ${startMonth}`;
        } else {
            return `${startDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth}`;
        }
    }

    bindEvents() {
        const prevBtn = document.querySelector('.calendar-slider__btn--prev');
        const nextBtn = document.querySelector('.calendar-slider__btn--next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevWeek());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextWeek());
        }
        
        setTimeout(() => this.scrollToSelectedDate(), 300);
        
        // ПРИВЯЗКА ФИЛЬТРОВ
        const performanceFilter = document.getElementById('performance-filter');
        const timeFilter = document.getElementById('time-filter');
        const ageFilter = document.getElementById('age-filter');
        const resetFilters = document.getElementById('reset-filters');
        
        if (performanceFilter) {
            performanceFilter.addEventListener('change', (e) => {
                this.activeFilters.performance = e.target.value;
                console.log('Фильтр спектакля изменен на:', e.target.value);
                this.applyFilters();
            });
        }
        
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.activeFilters.time = e.target.value;
                console.log('Фильтр времени изменен на:', e.target.value);
                this.applyFilters();
            });
        }
        
        if (ageFilter) {
            ageFilter.addEventListener('change', (e) => {
                this.activeFilters.age = e.target.value;
                console.log('Фильтр возраста изменен на:', e.target.value);
                this.applyFilters();
            });
        }
        
        if (resetFilters) {
            resetFilters.addEventListener('click', () => this.resetFilters());
        }
    }

    // ОСНОВНОЙ МЕТОД ПРИМЕНЕНИЯ ФИЛЬТРОВ
    applyFilters() {
        console.log('Применение фильтров:', this.activeFilters);
        
        // Обновляем визуализацию календаря (точки событий)
        this.renderCalendar();
        
        // Обновляем отображение спектаклей
        this.renderSelectedDatePerformances();
        
        // Показываем уведомление о применении фильтров
        const filterInfo = this.getFilterInfo();
        if (filterInfo) {
            window.showNotification(`Применены фильтры: ${filterInfo}`, 'info', 2000);
        }
    }

    resetFilters() {
        console.log('Сброс фильтров');
        
        // Сбрасываем фильтры в DOM
        const performanceFilter = document.getElementById('performance-filter');
        const timeFilter = document.getElementById('time-filter');
        const ageFilter = document.getElementById('age-filter');
        
        if (performanceFilter) performanceFilter.value = 'all';
        if (timeFilter) timeFilter.value = 'all';
        if (ageFilter) ageFilter.value = 'all';
        
        // Сбрасываем активные фильтры
        this.activeFilters = {
            performance: 'all',
            time: 'all',
            age: 'all'
        };
        
        // Перерисовываем интерфейс
        this.renderCalendar();
        this.renderSelectedDatePerformances();
        
        // Уведомление о сбросе
        window.showNotification('Все фильтры сброшены', 'success', 2000);
    }
}

// Инициализация календаря
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: Инициализация календаря...');
    const calendarSlider = document.querySelector('.calendar-slider');
    if (calendarSlider) {
        window.calendarSliderInstance = new CalendarSlider();
        console.log('calendarSliderInstance создан и сохранен в window');
        console.log('Событий в календаре:', Object.keys(window.calendarSliderInstance.events).length);
    } else {
        console.log('Календарь не найден на странице');
    }
});