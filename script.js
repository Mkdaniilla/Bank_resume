// ==========================================
// 🚨 ВСТАВЬТЕ ВАШИ КЛЮЧИ ЗДЕСЬ (из Supabase)
// ==========================================
const SUPABASE_URL = 'https://hfspfffbyukqetbxvofn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0fHgLFVLLNDdobUEyn58vw_0i1kxlGJ';

// Инициализация Supabase
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let allSpecialists = [];

// 1. ЗАГРУЗКА ДАННЫХ
async function fetchSpecialists() {
    const grid = document.getElementById('specialistsGrid');
    grid.innerHTML = '<div class="loader">Синхронизация с базой данных...</div>';

    const { data, error } = await sb
        .from('specialists')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Ошибка:', error);
        grid.innerHTML = '<div class="loader">Ошибка подключения к Supabase. Проверьте ключи!</div>';
        return;
    }

    allSpecialists = data;
    renderSpecialists(allSpecialists);
}

// 2. РЕНДЕР КАРТОЧЕК
function renderSpecialists(data) {
    const grid = document.getElementById('specialistsGrid');
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<div class="loader">База пуста. Добавьте первого специалиста!</div>';
        return;
    }

    data.forEach(spec => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Обработка нескольких категорий
        const categories = (spec.category || 'LegalTech').split(',').map(c => c.trim());
        
        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn edit-btn" onclick="editSpecialist(${spec.id})" title="Редактировать">
                    <i data-lucide="edit-3" size="16"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteSpecialist(${spec.id})" title="Удалить">
                    <i data-lucide="trash-2" size="16"></i>
                </button>
            </div>
            <div class="card-header">
                <div class="card-categories">
                    ${categories.map(cat => `<span class="card-role">${cat}</span>`).join('')}
                </div>
                <span class="card-status">${spec.status || 'Active'}</span>
            </div>
            <h3 class="card-title">${spec.name}</h3>
            <div class="card-location"><i data-lucide="map-pin" size="14"></i> ${spec.location || 'Удаленно'}</div>
            <p class="card-desc">${spec.description || ''}</p>
            <div class="card-tags">
                ${(spec.skills || []).map(skill => `<span class="card-tag">${skill.trim()}</span>`).join('')}
            </div>
            <p class="card-desc"><strong>Проекты:</strong> ${spec.projects || 'В процессе...'}</p>
            
            <div class="card-links">
                ${spec.case_link ? `<a href="${spec.case_link}" target="_blank" class="card-link"><i data-lucide="external-link" size="14"></i> Кейс/Проект</a>` : ''}
                ${spec.resume_link ? `<a href="${spec.resume_link}" target="_blank" class="card-link"><i data-lucide="file-text" size="14"></i> Резюме/LI</a>` : ''}
            </div>

            <div class="card-footer">
                <a href="https://t.me/${spec.contact ? spec.contact.replace('@', '') : ''}" target="_blank" class="btn btn-secondary btn-sm" style="width: 100%; justify-content: center;">
                    <i data-lucide="send" size="14" style="margin-right: 5px;"></i> Написать в Telegram
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

// 3. ДОБАВЛЕНИЕ / РЕДАКТИРОВАНИЕ РЕЗЮМЕ
document.getElementById('resumeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const editId = document.getElementById('editId').value;
    
    submitBtn.innerText = editId ? 'Сохранение...' : 'Добавление...';
    submitBtn.disabled = true;

    const newSpec = {
        name: document.getElementById('formName').value,
        role: document.getElementById('formRole').value,
        category: document.getElementById('formCategory').value,
        description: document.getElementById('formDesc').value,
        skills: document.getElementById('formSkills').value.split(','),
        contact: document.getElementById('formContact').value,
        projects: document.getElementById('formProjects').value,
        case_link: document.getElementById('formCaseLink').value,
        resume_link: document.getElementById('formResumeLink').value,
        location: "Удаленно",
        status: "Available"
    };

    let result;
    if (editId) {
        result = await sb.from('specialists').update(newSpec).eq('id', editId);
    } else {
        result = await sb.from('specialists').insert([newSpec]);
    }

    if (result.error) {
        alert('Ошибка: ' + result.error.message);
    } else {
        closeModal();
        this.reset();
        document.getElementById('editId').value = '';
        submitBtn.innerText = 'Добавить в базу';
        fetchSpecialists();
    }

    submitBtn.disabled = false;
});

// 4. УДАЛЕНИЕ РЕЗЮМЕ
async function deleteSpecialist(id) {
    if (confirm('Вы уверены, что хотите удалить это резюме? Оно исчезнет для всех пользователей.')) {
        const { error } = await sb.from('specialists').delete().eq('id', id);
        if (error) {
            alert('Ошибка удаления: ' + error.message);
        } else {
            fetchSpecialists();
        }
    }
}

// 5. РЕДАКТИРОВАНИЕ (ПРЕДЗАПОЛНЕНИЕ ФОРМЫ)
function editSpecialist(id) {
    const spec = allSpecialists.find(s => s.id === id);
    if (!spec) return;

    document.getElementById('editId').value = spec.id;
    document.getElementById('formName').value = spec.name || '';
    document.getElementById('formRole').value = spec.role || '';
    document.getElementById('formCategory').value = spec.category || '';
    document.getElementById('formDesc').value = spec.description || '';
    document.getElementById('formSkills').value = (spec.skills || []).join(', ');
    document.getElementById('formContact').value = spec.contact || '';
    document.getElementById('formProjects').value = spec.projects || '';
    document.getElementById('formCaseLink').value = spec.case_link || '';
    document.getElementById('formResumeLink').value = spec.resume_link || '';

    document.getElementById('submitBtn').innerText = 'Сохранить изменения';
    document.querySelector('.modal-header h2').innerText = 'Редактировать профиль';
    openModal();
}

// 6. ФИЛЬТРАЦИЯ
document.getElementById('specializationFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.getAttribute('data-filter');
        const filteredData = filter === 'all' 
            ? allSpecialists 
            : allSpecialists.filter(s => (s.category || '').toLowerCase().includes(filter.toLowerCase()));
        
        renderSpecialists(filteredData);
    }
});

// Дополнительная очистка формы при закрытии модалки (чтобы сбросить режим редактирования)
function closeModal() {
    document.getElementById('resumeModal').classList.remove('active');
    document.getElementById('resumeForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('submitBtn').innerText = 'Добавить в базу';
    document.querySelector('.modal-header h2').innerText = 'Разместить свой профиль';
}

function openModal() { 
    document.getElementById('resumeModal').classList.add('active'); 
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', fetchSpecialists);
