// js/dashboard.js

import { students, studentAssignments } from './data-management.js';
import {
    totalStudentsCountSpan,
    assignedCommentsCountSpan,
    pendingCommentsCountSpan,
    completionRateSpan
} from './ui-elements.js';

/*
    Hata Ayıklama Notu:
    Bu dosya, dashboard kartlarındaki istatistikleri günceller.
    `updateDashboardCards` fonksiyonunun çağrıldığını ve hesaplanan değerlerin (toplam öğrenci, atanan yorum vb.)
    doğru olduğunu konsol loglarından kontrol edin.
    Ayrıca, bu değerlerin HTML'deki ilgili `<span>` elementlerine doğru bir şekilde yansıyıp yansımadığını
    tarayıcıda görsel olarak kontrol edin.
*/
console.log('[dashboard.js] Dashboard modülü yükleniyor...');

/**
 * Ana ekrandaki istatistik kartlarını (Toplam Öğrenci, Atanan Yorum vb.) günceller.
 * Bu fonksiyon, öğrenci verisi değiştiğinde çağrılır.
 */
export function updateDashboardCards() {
    console.log('[dashboard.js] updateDashboardCards çağrıldı: Dashboard kartları güncelleniyor.');

    const totalStudents = students.length;
    // Yorumu atanmış öğrencileri sayarken, boş string atanmış yorumları hariç tut
    const assignedComments = Object.values(studentAssignments).filter(comment => comment && comment.trim() !== '').length;
    const pendingComments = totalStudents - assignedComments;
    // Sıfıra bölme hatasını engellemek için kontrol
    const completionRate = totalStudents > 0 ? ((assignedComments / totalStudents) * 100).toFixed(0) : 0;

    console.log(`[dashboard.js] Hesaplanan değerler: Toplam: ${totalStudents}, Atanan: ${assignedComments}, Bekleyen: ${pendingComments}, Oran: ${completionRate}%`);

    // İYİLEŞTİRME: UI elemanlarının varlığını kontrol ederek "null" hatalarını önle.
    // Bu, HTML'den bir ID silinse bile uygulamanın çökmesini engeller.
    if (totalStudentsCountSpan) {
        totalStudentsCountSpan.textContent = totalStudents;
    } else {
        console.error('[dashboard.js] totalStudentsCountSpan bulunamadı.');
    }
    if (assignedCommentsCountSpan) {
        assignedCommentsCountSpan.textContent = assignedComments;
    } else {
        console.error('[dashboard.js] assignedCommentsCountSpan bulunamadı.');
    }
    if (pendingCommentsCountSpan) {
        pendingCommentsCountSpan.textContent = pendingComments;
    } else {
        console.error('[dashboard.js] pendingCommentsCountSpan bulunamadı.');
    }
    if (completionRateSpan) {
        completionRateSpan.textContent = `${completionRate}%`;
    } else {
        console.error('[dashboard.js] completionRateSpan bulunamadı.');
    }

    console.log('[dashboard.js] Dashboard kartları güncellemesi tamamlandı.');
}

console.log('[dashboard.js] Dashboard modülü başarıyla yüklendi.');