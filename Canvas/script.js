document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("login-form");
    const loginSection = document.getElementById("login-section");
    const appSection = document.getElementById("app-section");
    const welcome = document.getElementById("welcome");
    const logoutButton = document.getElementById("logout");

    const courseSelect = document.getElementById("course-select");
    const assignmentSelect = document.getElementById("assignment-select");
    const resultSection = document.getElementById("result-section");
    const resultInfo = document.getElementById("result-info");
    const resultsTableBody = document.querySelector("#results-table tbody");

    let students = [];
    let results = [];
    let currentStudent = null;

    // Normalize personnummer to avoid formatting issues
    function normalizePersonnummer(pnr) {
        return pnr.replace(/\s+/g, '');
    }

    // Load students.json
    async function loadStudents() {
        try {
            students = await fetch("../data/students.json").then(r => r.json());
            console.log("Students loaded:", students);
        } catch (err) {
            console.error("Error loading students.json:", err);
        }
    }

    // Load ladok_results.json
    async function loadResults() {
        try {
            results = await fetch("../data/ladok_results.json").then(r => r.json());
            console.log("Results loaded:", results);
        } catch (err) {
            console.error("Error loading ladok_results.json:", err);
        }
    }

    // Populate courses for logged-in student
    function populateCourses() {
        courseSelect.innerHTML = '<option value="">— select —</option>';
        assignmentSelect.innerHTML = '<option value="">— select —</option>';
        assignmentSelect.disabled = true;

        const myResults = results.filter(
            r => normalizePersonnummer(r.personnummer) === normalizePersonnummer(currentStudent.personnummer)
        );
        const courses = [...new Set(myResults.map(r => r.course_code))];

        courses.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            courseSelect.appendChild(opt);
        });
    }

    // Show assignment results for logged-in student
    function showResultsFor(course, modul) {
        resultSection.classList.remove("hidden");
        resultInfo.textContent = `Course: ${course} — Assignment: ${modul}`;
        resultsTableBody.innerHTML = "";

        const filtered = results.filter(
            r => normalizePersonnummer(r.personnummer) === normalizePersonnummer(currentStudent.personnummer) &&
                 r.course_code === course &&
                 r.modul_code === modul
        );

        filtered.forEach(r => {
            const stu = students.find(
                s => normalizePersonnummer(s.personnummer) === normalizePersonnummer(r.personnummer)
            ) || {};

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${r.personnummer}</td>
                <td>${stu.first_name || "Unknown"} ${stu.last_name || ""}</td>
                <td>${r.course_code}</td>
                <td>${r.modul_code}</td>
                <td>${r.grade}</td>
                <td>${r.date}</td>
                <td>${r.created_at}</td>
            `;
            resultsTableBody.appendChild(tr);
        });
    }

    // Course dropdown change
    courseSelect.addEventListener("change", () => {
        const course = courseSelect.value;
        assignmentSelect.innerHTML = '<option value="">— select —</option>';
        assignmentSelect.disabled = true;

        if (!course || !currentStudent) return;

        const assignments = [...new Set(
            results
                .filter(
                    r => normalizePersonnummer(r.personnummer) === normalizePersonnummer(currentStudent.personnummer) &&
                         r.course_code === course
                )
                .map(r => r.modul_code)
        )];

        assignments.forEach(a => {
            const opt = document.createElement("option");
            opt.value = a;
            opt.textContent = a;
            assignmentSelect.appendChild(opt);
        });

        assignmentSelect.disabled = assignments.length === 0;
    });

    // Assignment dropdown change
    assignmentSelect.addEventListener("change", () => {
        const course = courseSelect.value;
        const modul = assignmentSelect.value;
        if (!course || !modul) return;
        showResultsFor(course, modul);
    });

    // Login form submit
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        await loadResults(); // ensure latest results

        const student = students.find(
            s => s.username === username && normalizePersonnummer(s.personnummer) === normalizePersonnummer(password)
        );

        if (student) {
            currentStudent = student;
            loginSection.classList.add("hidden");
            appSection.classList.remove("hidden");
            welcome.textContent = `Welcome, ${student.first_name} ${student.last_name}!`;

            populateCourses();
        } else {
            document.getElementById("login-error").textContent = "Invalid username or personnummer";
        }
    });

    // Logout
    logoutButton.addEventListener("click", () => {
        currentStudent = null;
        loginSection.classList.remove("hidden");
        appSection.classList.add("hidden");
        loginForm.reset();
        document.getElementById("login-error").textContent = "";
        courseSelect.innerHTML = '<option value="">— select —</option>';
        assignmentSelect.innerHTML = '<option value="">— select —</option>';
        assignmentSelect.disabled = true;
        resultSection.classList.add("hidden");
        resultsTableBody.innerHTML = "";
    });

    // Initial load of students
    loadStudents();
});
