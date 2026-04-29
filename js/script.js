



// js/script.js
document.getElementById('gradeForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const studentID = document.getElementById('studentID').value.trim();
  const gradeDisplay = document.getElementById('gradeDisplay');

  if (!studentID) {
    gradeDisplay.innerHTML = '<p>Please enter your student ID.</p>';
    return;
  }

  const API_URL = 'https://api.sheetbest.com/sheets/7f6f6ee8-e58b-4ad6-a2ef-39b05109f3d1';

  try {
    const res = await fetch(API_URL);
    console.log("ok1", res);

    if (!res.ok) throw new Error('Failed to fetch grades (status ' + res.status + ')');

    const rows = await res.json();
    console.log("ok2", rows);

    // Build map { ID: {name, grades[], hasMissing} }
    const gradesMap = {};

    rows.forEach(row => {
      const id = String(row.ID ?? row.Id ?? row.id ?? '').trim();
      if (!id) return;

      const studentName = row.Student ?? row.student ?? "Unknown";

      // Get grades
      let grade1 = row.Grade1 ?? row.grade1 ?? '';
      let grade2 = row.Grade2 ?? row.grade2 ?? '';

      grade1 = (grade1 === null || grade1 === undefined) ? '' : String(grade1).trim();
      grade2 = (grade2 === null || grade2 === undefined) ? '' : String(grade2).trim();

      // Normalize grades
      const g1 = grade1 === '' ? 'No grade recorded' : (isNaN(Number(grade1)) ? grade1 : Number(grade1));
      const g2 = grade2 === '' ? 'No grade recorded' : (isNaN(Number(grade2)) ? grade2 : Number(grade2));

      // Check if any grade is missing
      const hasMissing = (grade1 === '' || grade2 === '');

      gradesMap[id] = {
        name: studentName,
        grades: [g1, g2],
        hasMissing: hasMissing
      };
    });

    // Lookup and display
    if (studentID in gradesMap) {
      const student = gradesMap[studentID];

      let html = `<h2>Student Info</h2>`;
      html += `<p><strong>Name:</strong> ${student.name}</p>`;
      html += `<p><strong>ID:</strong> ${studentID}</p>`;

      html += `<h3>Grades</h3><ul>`;
      student.grades.forEach((g, i) => {
        html += `<li>Quiz ${i + 1}: ${g}</li>`;
      });
      html += `</ul>`;

      // Feedback logic
      if (student.hasMissing) {
        html += `<p style="color:red;"><strong>⚠ Please contact the doctor</strong></p>`;
      } else {
        html += `<p style="color:green;">Great job! Keep going </p>`;
      }

      gradeDisplay.innerHTML = html;

    } else {
      gradeDisplay.innerHTML = '<p>Student ID not found</p>';
    }

  } catch (err) {
    console.error('Error fetching or processing grades:', err);
    gradeDisplay.innerHTML = '<p>Error fetching grades. Check console for details.</p>';
  }
});
