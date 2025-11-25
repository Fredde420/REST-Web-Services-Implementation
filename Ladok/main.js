const API_BASE = '../api';
const DEFAULT_COURSE = 'D0031N';
const DEFAULT_ASSIGNMENT = 'Inlämningsuppgift 1';

let currentUser = null;
let currentStudent = null;
let currentEnrolments = [];
let currentStudents = [];
let lastCourseCode = null;
let lastAssignment = null;

function $(id) {
    return document.getElementById(id);
}

async function apiGet(path, params = {}) {
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

async function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const msg = $('loginMsg');
    msg.textContent = '';

    console.log('Login attempt:', { username });

    if (!username || !password) {
        msg.textContent = 'Fyll i både användarnamn och lösenord.';
        return;
    }

    try {
        const result = await apiPost(`${API_BASE}/teachers/login.php`, {
            username,
            password
        });

        console.log('Login response:', result);

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
    const profileDiv = $('profileContent');
    if (!currentUser) {
        profileDiv.textContent = 'Du är inte inloggad.';
        return;
    }
    profileDiv.innerHTML = `
        <p><strong>Användarnamn:</strong> ${currentUser.username}</p>
        <p><strong>Namn:</strong> ${currentUser.first_name} ${currentUser.last_name}</p>
        <p><strong>Roll:</strong> ${currentUser.role}</p>
    `;
}

async function loadStudents(courseCode, assignment) {
    const list = $('studentList');
    list.innerHTML = '<li class="list-item muted">Laddar...</li>';

    lastCourseCode = courseCode;
    lastAssignment = assignment;

    console.log(`Hämtar studenter: course=${courseCode}, assignment=${assignment}`);

    try {
        const data = await apiGet(`${API_BASE}/canvas/get_students.php`, {
            course_code: courseCode,
            assignment: assignment
        });

        console.log('Studentdata mottagen:', data);

        currentStudents = data.students || [];
        renderStudentList(currentStudents);
    } catch (err) {
        console.error(err);
        list.innerHTML = '<li class="list-item muted">Fel vid hämtning av studenter.</li>';
    }
}

function renderStudentList(students) {
    const list = $('studentList');

    if (!students || students.length === 0) {
        list.innerHTML = '<li class="list-item muted">Inga studenter hittades.</li>';
        return;
    }

    list.innerHTML = '';

    students.forEach(s => {
        const li = document.createElement('li');
        li.className = 'list-item';

        const firstName = s.first_name || s.fname || '';
        const lastName = s.last_name || s.lname || '';
        const name = `${firstName} ${lastName}`.trim();
        const username = s.username || '';
        const personnummer = s.personnummer || s.id || '';

        const displayName = name || username || 'Okänt namn';

        li.textContent =
            displayName +
            (username ? ` (${username})` : '') +
            (personnummer ? ` – ${personnummer}` : '');

        li.addEventListener('click', () => {
            openStudentDetail(
                {
                    name: displayName,
                    personnummer: personnummer,
                    program: s.program || s.programme || ''
                }
            );
        });

        list.appendChild(li);
    });
}

function loadStudentsForDefaultCourse() {
    loadStudents(DEFAULT_COURSE, DEFAULT_ASSIGNMENT);
}

function openStudentDetail(student) {
    currentStudent = {
        name: student.name || '',
        personnummer: student.personnummer || '',
        program: student.program || '',
        course_code: lastCourseCode || DEFAULT_COURSE
    };
    currentEnrolments = [];

    $('sd-name').textContent = currentStudent.name || '';
    $('sd-id').textContent = currentStudent.personnummer || '';
    $('sd-program').textContent = currentStudent.program || '-';

    $('regMsg').textContent = '';
    $('enrolments').innerHTML = '';

    showSection('studentDetail');
}

function renderEnrolments() {
    const ul = $('enrolments');
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

async function handleRegisterCourse(e) {
    e.preventDefault();
    if (!currentStudent) return;

    const form = e.target;
    const courseCodeInput = form.course_code.value.trim();
    const courseCode = courseCodeInput || currentStudent.course_code || DEFAULT_COURSE;
    const msg = $('regMsg');
    msg.textContent = '';

    console.log('Registrerar resultat för:', currentStudent);

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
        console.log('Registreringssvar:', res);

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

async function loadCoursesView() {
    const list = $('courseList');
    list.innerHTML = '';

    const courseCode = prompt('Ange kurskod för att hämta moduler (EPOK):', DEFAULT_COURSE);
    if (!courseCode) {
        list.innerHTML = '<li class="list-item muted">Ingen kurskod angiven.</li>';
        return;
    }

    console.log('Hämtar EPOK-moduler för:', courseCode);

    try {
        const data = await apiGet(`${API_BASE}/epok/get_Modul.php`, {
            course_code: courseCode
        });

        console.log('Epok-svar:', data);

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

$('refresh').addEventListener('click', () => {
    const term = $('search').value.trim().toLowerCase();

    console.log('Sökterm:', term);

    if (!currentStudents || currentStudents.length === 0) {
        console.log('Inga studenter laddade ännu — hämtar standardkurs.');
        loadStudentsForDefaultCourse();
        return;
    }

    if (!term) {
        console.log('Tom sökterm — visar alla studenter.');
        renderStudentList(currentStudents);
        return;
    }

    const filtered = currentStudents.filter(s => {
        const firstName = s.first_name || s.fname || '';
        const lastName = s.last_name || s.lname || '';
        const name = `${firstName} ${lastName}`.toLowerCase();
        const username = (s.username || '').toLowerCase();
        const pnr = (s.personnummer || s.id || '').toLowerCase();
        return name.includes(term) || username.includes(term) || pnr.includes(term);
    });

    console.log(`Antal matchande studenter: ${filtered.length}`);
    filtered.forEach((s, i) => {
        const firstName = s.first_name || s.fname || '';
        const lastName = s.last_name || s.lname || '';
        const name = `${firstName} ${lastName}`.trim();
        const username = s.username || '';
        const pnr = s.personnummer || s.id || '';
        console.log(`Match ${i + 1}:`, { namn: name, username: username, personnummer: pnr });
    });

    renderStudentList(filtered);
});

document.addEventListener('DOMContentLoaded', () => {
    $('loginForm').addEventListener('submit', handleLogin);
    $('regForm').addEventListener('submit', handleRegisterCourse);

    $('backToList').addEventListener('click', () => {
        showSection('students');
    });

    $('btn-students').addEventListener('click', () => {
        showSection('students');
        if (currentUser && currentStudents.length === 0) {
            loadStudentsForDefaultCourse();
        }
    });

    $('btn-courses').addEventListener('click', () => {
        showSection('courses');
        loadCoursesView();
    });

    $('btn-profile').addEventListener('click', () => {
        showSection('profile');
        updateProfileView();
    });
});
