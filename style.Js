/* style.Js
    Handles student registration, marks upload, promotions and simple i18n.
    - `students` is an in-memory array holding student objects
    - translations are defined in `i18n` and applied to elements with `data-i18n`
    This file intentionally keeps data in-memory (no persistence) for simplicity.
*/
let students = [];

let form = document.getElementById('studentForm');
let table = document.getElementById('studentTable');
let marksForm = document.getElementById('marksForm');
let marksSelect = document.getElementById('marksStudentSelect');
/* searchStudents
   Search for students by name, ID, or form level and display results.
   Filters the students array and shows matching results.
*/
let filteredStudents = [];
function searchStudents() {
    let searchTerm = document.getElementById('search').value.toLowerCase();
    if (!searchTerm) {
        document.getElementById('searchResults').style.display = 'none';
        updateTable();
        return;
    }
    
    filteredStudents = students.filter(function(student) {
        let matchesName = student.name.toLowerCase().includes(searchTerm);
        let matchesId = student.studentId.toLowerCase().includes(searchTerm);
        let matchesForm = student.formLevel.toLowerCase().includes(searchTerm);
        return matchesName || matchesId || matchesForm;
    });
    
    if (filteredStudents.length === 0) {
        document.getElementById('searchResults').style.display = 'block';
        document.getElementById('searchResultsText').textContent = 'No student records found matching your search.';
        table.innerHTML = '';
        return;
    }
    
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('searchResultsText').textContent = 'Found ' + filteredStudents.length + ' result(s)';
    displaySearchResults();
}

/* displaySearchResults
   Display filtered search results in the student table.
*/
function displaySearchResults() {
    table.innerHTML = '';
    filteredStudents.forEach(function(student, index) {
        let actualIndex = students.indexOf(student);
        let row = table.insertRow();
        row.insertCell().textContent = student.name;
        row.insertCell().textContent = student.age;
        row.insertCell().textContent = student.studentId;
        row.insertCell().textContent = student.gender;
        row.insertCell().textContent = displayFormLevel(student.formLevel);
        row.insertCell().textContent = student.math;
        row.insertCell().textContent = student.english;
        row.insertCell().textContent = student.science;
        row.insertCell().textContent = student.socialStudies;

        let avgCell = row.insertCell();
        if (student.math === '' || student.english === '' || student.science === '' || student.socialStudies === '') {
            avgCell.textContent = 'N/A';
        } else {
            let avg = (parseFloat(student.math) + parseFloat(student.english) + parseFloat(student.science) + parseFloat(student.socialStudies)) / 4;
            avgCell.textContent = avg.toFixed(2);
        }

        let actionCell = row.insertCell();
        let promoteBtn = document.createElement('button');
        promoteBtn.textContent = 'Promote';
        promoteBtn.addEventListener('click', function() { promoteStudent(actualIndex); });

        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function() { deleteStudent(actualIndex); });

        actionCell.appendChild(promoteBtn);
        actionCell.appendChild(deleteBtn);
    });
}

function clearSearch() {
    document.getElementById('search').value = '';
    document.getElementById('searchResults').style.display = 'none';
    filteredStudents = [];
    updateTable();
}

// Handle student registration form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm()) return;

    let name = document.getElementById('name').value;
    let age = document.getElementById('age').value;
    let studentId = document.getElementById('studentId').value;
    let gender = document.getElementById('gender').value;
    let formLevel = document.getElementById('formlevel').value;

    students.push({
        name: name,
        age: age,
        studentId: studentId,
        gender: gender,
        formLevel: formLevel,
        math: '',
        english: '',
        science: '',
        socialStudies: ''
    });

    updateTable();
    updateStudentSelect();
});

// Handle marks upload form submission for a selected student
marksForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateMarksForm()) return;
    let sel = marksSelect.value;
    if (sel === '') { alert('Please select a student to upload marks for.'); return; }
    let idx = parseInt(sel);
    let math = document.getElementById('math').value;
    let english = document.getElementById('english').value;
    let science = document.getElementById('science').value;
    let socialStudies = document.getElementById('socialStudies').value;

    let student = students[idx];
    if (!student) { alert('Please select a student to upload marks for.'); return; }
    student.math = math;
    student.english = english;
    student.science = science;
    student.socialStudies = socialStudies;

    updateTable();
    alert('Marks uploaded for ' + student.name);
    marksForm.reset();
});

/* updateTable
   Rebuild the student table from the `students` array. Uses `t()` to localize
   action button labels and display strings where needed.
*/
function updateTable() {
    table.innerHTML = '';
    students.forEach(function(student, index) {
        let row = table.insertRow();
        row.insertCell().textContent = student.name;
        row.insertCell().textContent = student.age;
        row.insertCell().textContent = student.studentId;
        row.insertCell().textContent = student.gender;
        row.insertCell().textContent = displayFormLevel(student.formLevel);
        row.insertCell().textContent = student.math;
        row.insertCell().textContent = student.english;
        row.insertCell().textContent = student.science;
        row.insertCell().textContent = student.socialStudies;

        let avgCell = row.insertCell();
        let average = 'N/A';
        if (student.math !== '' && student.english !== '' && student.science !== '' && student.socialStudies !== '') {
            let avg = (parseFloat(student.math) + parseFloat(student.english) + parseFloat(student.science) + parseFloat(student.socialStudies)) / 4;
            average = avg.toFixed(2);
        }
        avgCell.textContent = average;
        
        let actionCell = row.insertCell();
        actionCell.innerHTML = '<button class="promote-btn" onclick="promoteStudent(' + index + ')">Promote</button> '
            + '<button onclick="deleteStudent(' + index + ')">Delete</button>';
    });
    
    form.reset();
}

// Recreate the select options used to pick a student when uploading marks
function updateStudentSelect() {
    if (!marksSelect) return;

    marksSelect.innerHTML = '<option value="">-- Select student --</option>';
    students.forEach(function(s, i) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.textContent = s.name + ' (' + s.studentId + ')';
        marksSelect.appendChild(opt);
    });
}

function deleteStudent(index) {
    students.splice(index, 1);
    updateTable();
    updateStudentSelect();
}

function displayFormLevel(level) {
    switch(level) {
        case 'form1': return 'Form 1';
        case 'form2': return 'Form 2';
        case 'form3': return 'Form 3';
        case 'form4': return 'Form 4';
        default: return level;
    }
}

function nextForm(level) {
    switch(level) {
        case 'form1': return 'form2';
        case 'form2': return 'form3';
        case 'form3': return 'form4';
        default: return null;
    }
}

function promoteStudent(index) {
    let student = students[index];
    if (student.math === '' || student.english === '' || student.science === '' || student.socialStudies === '') {
        alert('Cannot promote. Marks are missing for ' + student.name + '.');
        return;
    }
    let avg = (parseFloat(student.math) + parseFloat(student.english) + parseFloat(student.science) + parseFloat(student.socialStudies)) / 4;
    if (avg >= 50) {
        let next = nextForm(student.formLevel);
        if (next) {
            student.formLevel = next;
            updateTable();
            alert(student.name + ' has been promoted to ' + displayFormLevel(student.formLevel));
        } else {
            alert(student.name + ' is already in the highest form.');
        }
    } else {
        alert(student.name + ' is not eligible for promotion (average < 50).');
    }
}

// Also translate the promoteAllEligible alerts
function promoteAllEligibleFixed() {
    let anyPromoted = false;
    students.forEach(function(student) {
        if (student.math === '' || student.english === '' || student.science === '' || student.socialStudies === '') return;
        let avg = (parseFloat(student.math) + parseFloat(student.english) + parseFloat(student.science) + parseFloat(student.socialStudies)) / 4;
        let next = nextForm(student.formLevel);
        if (avg >= 50 && next) {
            student.formLevel = next;
            anyPromoted = true;
        }
    });
    if (anyPromoted) {
        updateTable();
        alert('All eligible students have been promoted.');
    } else {
        alert('No eligible students found for promotion.');
    }
}

function promoteAllEligible() {
    promoteAllEligibleFixed();
}


document.addEventListener('DOMContentLoaded', function() {
    let btn = document.getElementById('promoteAllBtn');
    if (btn) btn.addEventListener('click', promoteAllEligible);
    
    // Add search button listeners
    let searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', searchStudents);
    
    let clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
    
    let search = document.getElementById('search');
    if (search) search.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchStudents();
    });
    
    updateStudentSelect();
});

function validateForm() {
    let name = document.getElementById('name');
    let age = document.getElementById('age');
    let id = document.getElementById('studentId');
    let gender = document.getElementById('gender');
    let form = document.getElementById('formlevel');

    if (!name.value) { alert("Please enter the student's full name.");  return false; }
    if (!age.value) { alert("Please enter the student's age."); return false; }
    if (isNaN(age.value) || parseInt(age.value) <= 0) { alert("Please enter a valid age."); return false; }
    if (!id.value) { alert("Please enter the Student ID."); return false; }
    if (!gender.value) { alert("Please select the student's gender."); return false; }
    if (!form.value) { alert("Please select the student's form level."); return false; }
    return true;
}

function validateMarksForm() {
    let math = document.getElementById('math');
    let english = document.getElementById('english');
    let science = document.getElementById('science');
    let socialStudies = document.getElementById('socialStudies');

    if (math.value == '') { alert('Please enter the Mathematics score.'); return false; }
    if (english.value == '') { alert('Please enter the English score.'); return false; }
    if (science.value == '') { alert('Please enter the Science score.'); return false; }
    if (socialStudies.value == '') { alert('Please enter the Social Studies score.'); return false; }
    return true;
}