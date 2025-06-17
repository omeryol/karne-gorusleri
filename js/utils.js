// js/utils.js

/**
 * Ekranda bilgilendirme mesajı (toast) gösterir.
 * @param {string} message Gösterilecek mesaj.
 * @param {string} type Mesajın türü ('info', 'success', 'error'). Bu, CSS ile rengi belirler.
 */
export function showToast(message, type = 'info') {
    console.log(`[utils.js] showToast çağrıldı: Mesaj "${message}", Tip "${type}"`);

    const toastContainer = document.getElementById('toast-container');
    
    // İYİLEŞTİRME: Toast konteyneri DOM'da yoksa hata ver ve işlemi durdur.
    if (!toastContainer) {
        console.error('[utils.js] Hata: Toast container (#toast-container) bulunamadı!');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // Sınıfları tek seferde ata
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Toast'un görünür olmasını sağlayan animasyon sınıfını küçük bir gecikmeyle ekle.
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Toast'u 3 saniye sonra gizle ve DOM'dan kaldır.
    setTimeout(() => {
        toast.classList.remove('show');
        // 'transitionend' olayı, CSS geçişi tamamlandığında tetiklenir.
        // Bu, animasyon bitmeden elemanın DOM'dan kaldırılmasını engeller.
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
}

/**
 * Verilen tam isimden (örn: "Ahmet Yılmaz") sadece ilk ismi ("Ahmet") alır.
 * @param {string} fullName - İşlenecek tam isim.
 * @returns {string} - İlk isim.
 */
export function getFirstName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
        console.warn('[utils.js] getFirstName: Geçersiz veya boş bir tam ad verildi.');
        return '';
    }
    return fullName.trim().split(' ')[0];
}

/**
 * Zaman damgası ve rastgele bir dize kullanarak benzersiz bir ID oluşturur.
 * @returns {string} Benzersiz ID.
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Bir HTML elemanının, belirtilen CSS seçicisine uyan bir üst elemanı olup olmadığını kontrol eder.
 * @param {HTMLElement} element - Kontrol edilecek başlangıç elemanı.
 * @param {string} parentSelector - Aranacak üst elemanın CSS seçicisi.
 * @returns {boolean} Üst eleman bulunursa true, bulunmazsa false döner.
 */
export function hasParent(element, parentSelector) {
    let current = element;
    while (current) {
        if (current.matches(parentSelector)) {
            return true;
        }
        current = current.parentElement;
    }
    return false;
}

/**
 * Bir modal penceresini (açılır pencere) açar veya kapatır.
 * @param {HTMLElement} modalElement - Açılacak veya kapatılacak modal HTML elemanı.
 * @param {boolean} show - True ise modalı açar, false ise kapatır.
 */
export function toggleModal(modalElement, show = true) {
    // İYİLEŞTİRME: Fonksiyonun en başında, verilen modal elemanının geçerli olup olmadığını kontrol eder.
    // Eğer `modalElement` null veya undefined ise, hata vermeden fonksiyondan çıkar.
    if (!modalElement) {
        console.error('[utils.js] toggleModal: Geçersiz veya null bir modal elemanı verildi. İşlem durduruldu.');
        return;
    }

    console.log(`[utils.js] toggleModal çağrıldı: Modal ID "${modalElement.id}", Durum: ${show ? 'Açılıyor' : 'Kapatılıyor'}`);

    if (show) {
        modalElement.style.display = 'flex';
        setTimeout(() => {
            modalElement.classList.add('show');
        }, 10); // CSS animasyonunun tetiklenmesi için küçük bir gecikme.
    } else {
        modalElement.classList.remove('show');
        // Animasyonun bitmesini bekle ve sonra display: none yap.
        // { once: true } sayesinde bu dinleyici sadece bir kez çalışır ve kendini kaldırır.
        modalElement.addEventListener('transitionend', function handler() {
            modalElement.style.display = 'none';
        }, { once: true });
    }
}