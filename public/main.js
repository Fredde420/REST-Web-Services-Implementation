function $(id) {
    return document.getElementById(id);
}

function createElement(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
        Object.keys(attrs).forEach(function (k) {
            if (k === "class") {
                el.className = attrs[k];
            } else {
                el.setAttribute(k, attrs[k]);
            }
        });
    }
    if (children) {
        children.forEach(function (c) {
            if (typeof c === "string") {
                el.appendChild(document.createTextNode(c));
            } else {
                el.appendChild(c);
            }
        });
    }
    return el;
}

document.addEventListener("DOMContentLoaded", function () {
    init();
});

function init() {
    $("loadBtn").addEventListener("click", loadData);
    $("registerBtn").addEventListener("click", registerResults);

    loadCourses();

    $("course_select").addEventListener("change", function () {
        var course = this.value;
        if (course) {
            loadAssignments(course);
        } else {
            var assignmentSelect = $("assignment_select");
            assignmentSelect.innerHTML = "";
            var opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Välj kurs först";
            assignmentSelect.appendChild(opt);
        }
    });
}

function loadCourses() {
    var courseSelect = $("course_select");
    courseSelect.innerHTML = '<option value="">Laddar kurser...</option>';

    fetch("../api/courses/get_Courses.php")
        .then(function (r) { return r.json(); })
        .then(function (data) {
            courseSelect.innerHTML = "";
            if (!data.courses || data.courses.length === 0) {
                var opt = document.createElement("option");
                opt.value = "";
                opt.textContent = "Inga kurser hittades";
                courseSelect.appendChild(opt);
                return;
            }

            var defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "Välj kurs";
            courseSelect.appendChild(defaultOpt);

            data.courses.forEach(function (c) {
                var opt = document.createElement("option");
                opt.value = c.code;
                opt.textContent = c.code;
                courseSelect.appendChild(opt);
            });
        })
        .catch(function (error) {
            console.error(error);
            courseSelect.innerHTML = "";
            var opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Fel vid hämtning av kurser";
            courseSelect.appendChild(opt);
        });
}

function loadAssignments(courseCode) {
    var assignmentSelect = $("assignment_select");
    assignmentSelect.innerHTML = '<option value="">Laddar uppgifter...</option>';

    var url = "../api/courses/get_Assignments.php?course_code=" + encodeURIComponent(courseCode);

    fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            assignmentSelect.innerHTML = "";
            if (!data.assignments || data.assignments.length === 0) {
                var opt = document.createElement("option");
                opt.value = "";
                opt.textContent = "Inga uppgifter hittades";
                assignmentSelect.appendChild(opt);
                return;
            }

            var defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "Välj uppgift";
            assignmentSelect.appendChild(defaultOpt);

            data.assignments.forEach(function (a) {
                var opt = document.createElement("option");
                opt.value = a.name;
                opt.textContent = a.name;
                assignmentSelect.appendChild(opt);
            });
        })
        .catch(function (error) {
            console.error(error);
            assignmentSelect.innerHTML = "";
            var opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Fel vid hämtning av uppgifter";
            assignmentSelect.appendChild(opt);
        });
}

function loadData() {
    var course = $("course_select").value;
    var assignment = $("assignment_select").value;
    var status = $("load_status");
    var moduleSelect = $("module_select");
    var studentsContainer = $("students_container");

    status.textContent = "";
    status.className = "status";
    studentsContainer.innerHTML = "";
    moduleSelect.innerHTML = '<option value="">Laddar moduler...</option>';

    if (!course || !assignment) {
        status.textContent = "Välj kurs och uppgift.";
        status.className = "status error";
        return;
    }

    var epokUrl = "../api/epok/get_Modul.php?course_code=" + encodeURIComponent(course);
    var canvasUrl = "../api/canvas/get_students.php?course_code=" +
        encodeURIComponent(course) +
        "&assignment=" +
        encodeURIComponent(assignment);

    Promise.all([
        fetch(epokUrl).then(function (r) { return r.json(); }),
        fetch(canvasUrl).then(function (r) { return r.json(); })
    ])
        .then(function (values) {
            var modulesData = values[0];
            var studentsData = values[1];

            moduleSelect.innerHTML = "";
            if (!modulesData.modules || modulesData.modules.length === 0) {
                var opt = document.createElement("option");
                opt.value = "";
                opt.textContent = "Inga moduler hittades";
                moduleSelect.appendChild(opt);
            } else {
                var firstOpt = document.createElement("option");
                firstOpt.value = "";
                firstOpt.textContent = "Välj modul";
                moduleSelect.appendChild(firstOpt);

                modulesData.modules.forEach(function (m) {
                    var o = document.createElement("option");
                    o.value = m.code;
                    o.textContent = m.code + " - " + m.name;
                    moduleSelect.appendChild(o);
                });
            }

            if (!studentsData.students || studentsData.students.length === 0) {
                studentsContainer.textContent = "Inga studenter hittades.";
                status.textContent = "Hämtning klar, men inga studenter hittades.";
                status.className = "status success";
                return;
            }

            var table = createElement("table", null, []);
            var thead = createElement("thead", null, [
                createElement("tr", null, [
                    createElement("th", null, ["Namn"]),
                    createElement("th", null, ["Användarnamn"]),
                    createElement("th", null, ["Personnummer"]),
                    createElement("th", null, ["Datum"]),
                    createElement("th", null, ["Betyg (U/G/VG)"])
                ])
            ]);
            var tbody = createElement("tbody", null, []);

            var studentItsPromises = [];

            studentsData.students.forEach(function (s) {
                var row = createElement("tr", null, []);
                var dateInput = createElement("input", {
                    type: "date",
                    value: new Date().toISOString().slice(0, 10)
                }, []);
                var gradeSelect = createElement("select", null, []);
                ["", "U", "G", "VG"].forEach(function (g) {
                    var opt = createElement("option", { value: g }, [g === "" ? "Välj" : g]);
                    gradeSelect.appendChild(opt);
                });

                dateInput.dataset.username = s.username;
                gradeSelect.dataset.username = s.username;

                var personnummerSpan = createElement("span", null, ["Laddar..."]);

                row.appendChild(createElement("td", null, [s.first_name + " " + s.last_name]));
                row.appendChild(createElement("td", null, [s.username]));
                row.appendChild(createElement("td", null, [personnummerSpan]));
                row.appendChild(createElement("td", null, [dateInput]));
                row.appendChild(createElement("td", null, [gradeSelect]));
                tbody.appendChild(row);

                var url = "../api/studentits/get_Persnummer.php?username=" + encodeURIComponent(s.username);
                var p = fetch(url)
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        if (data.personnummer) {
                            personnummerSpan.textContent = data.personnummer;
                            dateInput.dataset.personnummer = data.personnummer;
                            gradeSelect.dataset.personnummer = data.personnummer;
                        } else {
                            personnummerSpan.textContent = "Saknas";
                        }
                    })
                    .catch(function () {
                        personnummerSpan.textContent = "Fel";
                    });

                studentItsPromises.push(p);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            studentsContainer.innerHTML = "";
            studentsContainer.appendChild(table);

            Promise.all(studentItsPromises).then(function () {
                status.textContent = "Hämtning klar.";
                status.className = "status success";
            });
        })
        .catch(function (error) {
            console.error(error);
            status.textContent = "Fel vid hämtning.";
            status.className = "status error";
            moduleSelect.innerHTML = '<option value="">Fel vid hämtning</option>';
        });
}

function registerResults() {
    var course = $("course_select").value;
    var moduleCode = $("module_select").value;
    var status = $("register_status");

    status.textContent = "";
    status.className = "status";

    if (!course) {
        status.textContent = "Välj en kurs.";
        status.className = "status error";
        return;
    }
    if (!moduleCode) {
        status.textContent = "Välj en modul.";
        status.className = "status error";
        return;
    }

    var rows = document.querySelectorAll("#students_container tbody tr");
    if (!rows || rows.length === 0) {
        status.textContent = "Inga studenter att registrera.";
        status.className = "status error";
        return;
    }

    var payloads = [];

    rows.forEach(function (row) {
        var dateInput = row.cells[3].querySelector("input[type='date']");
        var gradeSelect = row.cells[4].querySelector("select");

        var personnummer = dateInput.dataset.personnummer || gradeSelect.dataset.personnummer || "";
        var date = dateInput.value;
        var grade = gradeSelect.value;

        if (personnummer && date && grade) {
            payloads.push({
                personnummer: personnummer,
                course_code: course,
                modul_code: moduleCode,
                date: date,
                grade: grade
            });
        }
    });

    if (payloads.length === 0) {
        status.textContent = "Inget att registrera. Saknar personnummer eller betyg.";
        status.className = "status error";
        return;
    }

    status.textContent = "Registrerar...";
    status.className = "status";

    var requests = payloads.map(function (p) {
        return fetch("../api/ladok/reg_Resultat.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p)
        }).then(function (r) { return r.json(); });
    });

    Promise.all(requests)
        .then(function (responses) {
            var ok = 0;
            responses.forEach(function (res) {
                if (res && res.status === "registrerad") {
                    ok += 1;
                }
            });
            status.textContent = "Registrering klar. Antal registrerade: " + ok + ".";
            status.className = "status success";
        })
        .catch(function (error) {
            console.error(error);
            status.textContent = "Fel vid registrering.";
            status.className = "status error";
        });
}
