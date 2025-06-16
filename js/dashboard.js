// js/dashboard.js

import { students, studentAssignments } from './data-management.js';
import { totalStudentsCountSpan, assignedCommentsCountSpan, pendingCommentsCountSpan, completionRateSpan } from './ui-elements.js';

export function updateDashboardCards() {
    const totalStudents = students.length;
    // Yorumu atanmış öğrencileri sayarken, boş string atanmış yorumları hariç tut
    const assignedComments = Object.values(studentAssignments).filter(comment => comment && comment.trim() !== '').length;
    const pendingComments = totalStudents - assignedComments;
    const completionRate = totalStudents > 0 ? ((assignedComments / totalStudents) * 100).toFixed(0) : 0;

    totalStudentsCountSpan.textContent = totalStudents;
    assignedCommentsCountSpan.textContent = assignedComments;
    pendingCommentsCountSpan.textContent = pendingComments;
    completionRateSpan.textContent = `${completionRate}%`;
}