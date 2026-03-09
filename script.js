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
        card.innerHTML = `
            <button class="delete-btn" onclick="deleteSpecialist(${spec.id})" title="Удалить резюме">
                <i data-lucide="trash-2" size="16"></i>
            </button>
            <div class="card-header">
                <span class="card-role">${spec.category || 'LegalTech'}</span>
                <span class="card-status">${spec.status || 'Active'}</span>
            </div>
            <h3 class="card-title">${spec.name}</h3>
            <div class="card-location"><i data-lucide="map-pin" size="14"></i> ${spec.location || 'Удаленно'}</div>
            <p class="card-desc">${spec.description || ''}</p>
            <div class="card-tags">
                ${(spec.skills || []).map(skill => `<span class="card-tag">${skill.trim()}</span>`).join('')}
            </div>
            <p class="card-desc"><strong>Проект:</strong> ${spec.projects || 'В процессе...'}</p>
            <div class="card-footer">
                <a href="https://t.me/${spec.contact ? spec.contact.replace('@', '') : ''}" target="_blank" class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size: 0.8rem;">
                    <i data-lucide="send" size="14" style="margin-right: 5px;"></i> Написать
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

// 3. ДОБАВЛЕНИЕ РЕЗЮМЕ
document.getElementById('resumeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = 'Добавление...';
    submitBtn.disabled = true;

    const newSpec = {
        name: document.getElementById('formName').value,
        role: document.getElementById('formRole').value,
        category: document.getElementById('formCategory').value,
        description: document.getElementById('formDesc').value,
        skills: document.getElementById('formSkills').value.split(','),
        contact: document.getElementById('formContact').value,
        projects: document.getElementById('formProjects').value,
        location: "Удаленно",
        status: "Available"
    };

    const { error } = await sb.from('specialists').insert([newSpec]);

    if (error) {
        alert('Ошибка добавления: ' + error.message);
    } else {
        closeModal();
        this.reset();
        fetchSpecialists(); // Обновляем список
    }

    submitBtn.innerText = 'Добавить в базу';
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

// 5. ФИЛЬТРАЦИЯ
document.getElementById('specializationFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.getAttribute('data-filter');
        const filteredData = filter === 'all' 
            ? allSpecialists 
            : allSpecialists.filter(s => s.category === filter);
        
        renderSpecialists(filteredData);
    }
});

// Модальное окно
function openModal() { document.getElementById('resumeModal').classList.add('active'); }
function closeModal() { document.getElementById('resumeModal').classList.remove('active'); }

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', fetchSpecialists);
