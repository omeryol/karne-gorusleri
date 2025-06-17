// js/utils.js

/**
 * Ekranda bilgilendirme mesajı (toast) gösterir.
 * @param {string} message Gösterilecek mesaj.
 * @param {string} type Mesajın türü ('info', 'success', 'error'). CSS sınıflarını belirler.
 */
export function showToast(message, type = 'info') {
    // Hata Ayıklama Logu: showToast fonksiyonunun çağrıldığını ve mesajını kaydet
    console.log(`[utils.js] showToast çağrıldı: Mesaj "${message}", Tip "${type}"`);

    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    // Mesaj türüne göre CSS sınıfı ekler (renklendirme için).
    toast.classList.add(type);

    if (toastContainer) {
        toastContainer.appendChild(toast);

        // Toast'un görünür olmasını sağlayan animasyon sınıfını küçük bir gecikmeyle ekler.
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Toast'u 3 saniye sonra gizle ve DOM'dan kaldır.
        setTimeout(() => {
            toast.classList.remove('show');
            // 'transitionend' olayı, CSS geçişi tamamlandığında tetiklenir.
            // Bu, animasyon bitmeden elemanın DOM'dan kaldırılmasını engeller.
            toast.addEventListener('transitionend', () => {
                console.log(`[utils.js] Toast kaldırıldı: "${message}"`);
                toast.remove();
            }, { once: true }); // 'once: true' dinleyicinin bir kez çalışıp kendini otomatik kaldırmasını sağlar.
        }, 3000);
    } else {
        console.error('[utils.js] Hata: Toast container bulunamadı! Lütfen index.html dosyasında #toast-container elementinin var olduğundan emin olun.');
    }
}

/**
 * Tam isimden sadece ilk ismi alır.
 * @param {string} fullName Tam isim (örn: "Ali Yılmaz").
 * @returns {string} İlk isim (örn: "Ali").
 */
export function getFirstName(fullName) {
    console.log(`[utils.js] getFirstName çağrıldı: Tam Ad "${fullName}"`);

    if (!fullName) {
        console.warn('[utils.js] getFirstName: Boş veya tanımsız tam ad verildi.');
        return '';
    }
    const parts = fullName.trim().split(' ');
    console.log(`[utils.js] getFirstName: Çıkarılan ilk ad "${parts[0]}"`);
    return parts[0];
}

/**
 * Rastgele ve benzersiz bir ID oluşturur.
 * @returns {string} Benzersiz ID.
 */
export function generateUniqueId() {
    console.log('[utils.js] generateUniqueId çağrıldı.');
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    console.log(`[utils.js] generateUniqueId: Oluşturulan ID "${uniqueId}"`);
    return uniqueId;
}

/**
 * Bir elemanın belirtilen seçiciye sahip bir ata elemanı olup olmadığını kontrol eder.
 * @param {HTMLElement} element Kontrol edilecek başlangıç elemanı.
 * @param {string} parentSelector Aranacak ata elemanın CSS seçicisi.
 * @returns {boolean} Ata eleman varsa true, yoksa false döner.
 */
export function hasParent(element, parentSelector) {
    console.log(`[utils.js] hasParent çağrıldı: Eleman ${element ? element.tagName : 'null'}, Ata Seçici "${parentSelector}"`);
    let current = element;
    while (current) {
        if (current.matches(parentSelector)) {
            console.log(`[utils.js] hasParent: "${parentSelector}" bulundu.`);
            return true;
        }
        current = current.parentElement;
    }
    console.log(`[utils.js] hasParent: "${parentSelector}" bulunamadı.`);
    return false;
}

/**
 * Bir modal penceresini açar veya kapatır.
 * @param {HTMLElement} modalElement Açılacak/kapatılacak modal elemanı.
 * @param {boolean} show True ise açar, false ise kapatır.
 */
export function toggleModal(modalElement, show = true) {
    if (!modalElement) {
        console.error('[utils.js] toggleModal: Geçersiz modal elemanı verildi.');
        return;
    }
    console.log(`[utils.js] toggleModal çağrıldı: Modal ID "${modalElement.id}", Durum: ${show ? 'Açılıyor' : 'Kapatılıyor'}`);

    if (show) {
        modalElement.style.display = 'flex';
        // CSS animasyonunun tetiklenmesi için 'show' sınıfı küçük bir gecikme ile eklenir.
        setTimeout(() => {
            modalElement.classList.add('show');
        }, 10);
    } else {
        modalElement.classList.remove('show');
        // 'transitionend' olayı, CSS geçiş animasyonu bittiğinde tetiklenir.
        // Bu, modalın animasyon bitmeden aniden kaybolmasını engeller.
        modalElement.addEventListener('transitionend', function handler() {
            modalElement.style.display = 'none';
            // NOT: { once: true } sayesinde bu dinleyici ilk çalışmadan sonra otomatik olarak kaldırılır.
            // Bu, birden fazla event dinleyicisi birikmesini önler.
            console.log(`[utils.js] toggleModal: Modal "${modalElement.id}" kapatıldı ve DOM'dan gizlendi.`);
        }, { once: true });
    }
}