const API_BASE = '../api';

let currentUser = null;
let currentStudent = null;
let currentEnrolments = [];

// ------------------ HJÄLPFUNKTIONER ------------------
async function apiGet(path, params = {}) {
    // använd full URL baserat på nuvarande sida
    const url = new URL(path, window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function apiPost(path, data) {
    const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

function showSection(id) {
    document.querySelectorAll('main section').forEach(sec => {
        sec.classList.add('hidden');
    });
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

// ------------------ LOGIN ------------------
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const msg = document.getElementById('loginMsg');
    msg.textContent = '';

    if (!username || !password) {
        msg.textContent = 'Fyll i både användarnamn och lösenord.';
        return;
    }

    try {
        const result = await apiPost(`${API_BASE}/teachers/login.php`, {
            username,
            password
        });

        if (!result.authenticated) {
            msg.textContent = result.message || 'Ogiltigt användarnamn eller lösenord.';
            currentUser = null;
            updateProfileView();
            return;
        }

        currentUser = {
            username: result.username,
            first_name: result.first_name,
            last_name: result.last_name,
            role: 'lärare'
        };

        msg.textContent = `Inloggad som ${result.first_name} ${result.last_name}.`;
        updateProfileView();

        showSection('students');
        loadStudentsForDefaultCourse();
    } catch (err) {
        console.error(err);
        msg.textContent = 'Fel vid inloggning.';
        currentUser = null;
        updateProfileView();
    }
}

function updateProfileView() {
    const profileDiv = document.getElementById('profileContent');
    if (!currentUser) {
        profileDiv.textContent = 'Du är inte inloggad.';
        return;
    }
    profileDiv.innerHTML = `
      <p><strong>Användarnamn:</strong> ${currentUser.username}</p>
      ${currentUser.first_name ? `<p><strong>Namn:</strong> ${currentUser.first_name} ${currentUser.last_name}</p>` : ''}
      <p><strong>Roll:</strong> ${currentUser.role}</p>
    `;
}

// ------------------ STUDENTER ------------------
async function loadStudents(courseCode, assignment) {
    const list = document.getElementById('studentList');
    list.innerHTML = '<li class="list-item muted">Laddar...</li>';

    try {
        const data = await apiGet(`${API_BASE}/canvas/get_students.php`, {
            course_code: courseCode,
            assignment: assignment
        });

        const students = data.students || [];
        if (!students.length) {
            list.innerHTML = '<li class="list-item muted">Inga studenter hittades.</li>';
            return;
        }

        list.innerHTML = '';
        students.forEach(s => {
            const li = document.createElement('li');
            li.className = 'list-item';
            const name = s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim();
            const id = s.personnummer || s.id || '';
            li.textContent = name + (id ? ` (${id})` : '');
            li.addEventListener('click', () => {
                openStudentDetail(
                    {
                        name: name,
                        personnummer: s.personnummer || '',
                        program: s.program || s.programme || ''
                    },
                    courseCode
                );
            });
            list.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        list.innerHTML = '<li class="list-item muted">Fel vid hämtning av studenter.</li>';
    }
}

function loadStudentsForDefaultCourse() {
    const defaultCourse = 'DV001';
    const defaultAssignment = 'Lab1';
    loadStudents(defaultCourse, defaultAssignment);
}

function openStudentDetail(student, courseCode) {
    currentStudent = { ...student, course_code: courseCode };
    currentEnrolments = [];

    document.getElementById('sd-name').textContent = student.name || '';
    document.getElementById('sd-id').textContent =
        student.personnummer || student.id || '';
    document.getElementById('sd-program').textContent =
        student.program || student.programme || '-';

    document.getElementById('regMsg').textContent = '';
    document.getElementById('enrolments').innerHTML = '';

    showSection('studentDetail');
}

function renderEnrolments() {
    const ul = document.getElementById('enrolments');
    if (!currentEnrolments.length) {
        ul.innerHTML = '<li class="list-item muted">Inga registrerade kurser än.</li>';
        return;
    }
    ul.innerHTML = '';
    currentEnrolments.forEach(e => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.textContent = `${e.course_code} (${e.modul_code}) – betyg ${e.grade} ${e.date}`;
        ul.appendChild(li);
    });
}

// ------------------ REGISTRERA KURS/RESULTAT ------------------
async function handleRegisterCourse(e) {
    e.preventDefault();
    if (!currentStudent) return;

    const form = e.target;
    const courseCode = form.course_code.value.trim();
    const msg = document.getElementById('regMsg');
    msg.textContent = '';

    if (!courseCode) {
        msg.textContent = 'Ange kurskod.';
        return;
    }

    const payload = {
        personnummer: currentStudent.personnummer,
        course_code: courseCode,
        modul_code: 'MOD1',
        date: new Date().toISOString().slice(0, 10),
        grade: 'G'
    };

    try {
        const res = await apiPost(`${API_BASE}/ladok/reg_Resultat.php`, payload);
        if (res.status === 'registrerad') {
            msg.textContent = 'Kurs/resultat registrerat i mock-Ladok.';
            currentEnrolments.push(payload);
            renderEnrolments();
            form.reset();
        } else {
            msg.textContent = 'Något gick fel vid registreringen.';
        }
    } catch (err) {
        console.error(err);
        msg.textContent = 'Fel vid anrop till Ladok-API.';
    }
}

// ------------------ KURSER / MODULER ------------------
async function loadCoursesView() {
    const list = document.getElementById('courseList');
    list.innerHTML = '';

    const courseCode = prompt('Ange kurskod för att hämta moduler (EPOK):');
    if (!courseCode) {
        list.innerHTML = '<li class="list-item muted">Ingen kurskod angiven.</li>';
        return;
    }

    try {
        const data = await apiGet(`${API_BASE}/epok/get_Modul.php`, {
            course_code: courseCode
        });

        const modules = data.modules || [];
        if (!modules.length) {
            list.innerHTML = '<li class="list-item muted">Inga moduler hittades.</li>';
            return;
        }

        modules.forEach(m => {
            const li = document.createElement('li');
            li.className = 'list-item';
            li.textContent = `${m.code} – ${m.name}`;
            list.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        list.innerHTML = '<li class="list-item muted">Fel vid hämtning av moduler.</li>';
    }
}

// ------------------ INIT & NAVIGATION ------------------
document.addEventListener('DOMContentLoaded', () => {
    document
        .getElementById('loginForm')
        .addEventListener('submit', handleLogin);

    document
        .getElementById('regForm')
        .addEventListener('submit', handleRegisterCourse);

    document.getElementById('backToList').addEventListener('click', () => {
        showSection('students');
    });

    document.getElementById('btn-students').addEventListener('click', () => {
        showSection('students');
        if (currentUser) {
            loadStudentsForDefaultCourse();
        }
    });

    document.getElementById('btn-courses').addEventListener('click', () => {
        showSection('courses');
        loadCoursesView();
    });

    document.getElementById('btn-profile').addEventListener('click', () => {
        showSection('profile');
        updateProfileView();
    });

    document.getElementById('refresh').addEventListener('click', () => {
        const search = document.getElementById('search').value.trim();
        if (!search.includes(',')) {
            alert('Ange "kurskod,uppgift" i sökfältet, t.ex. "DV001,Lab1".');
            return;
        }
        const parts = search.split(',').map(s => s.trim());
        const course = parts[0];
        const assignment = parts[1];
        if (!course || !assignment) {
            alert('Ange både kurskod och uppgiftsnamn t.ex. "DV001,Lab1".');
            return;
        }
        loadStudents(course, assignment);
    });
});
