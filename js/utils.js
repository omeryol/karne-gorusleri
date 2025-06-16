// js/utils.js

export function showToast(message, type = 'info') {
    // Hata Ayıklama Logu: showToast fonksiyonunun çağrıldığını ve mesajını kaydet
    console.log(`[utils.js] showToast çağrıldı: Mesaj "${message}", Tip "${type}"`);

    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    // Mevcut tiplere ek olarak success, error, info sınıflarını ekliyoruz
    // CSS'te bu sınıflara göre renkler ayarlandı.
    toast.classList.add(type);

    if (toastContainer) {
        toastContainer.appendChild(toast);

        // Toast'un görünür olmasını sağlayan animasyon sınıfı
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Toast'u belirli bir süre sonra gizle ve DOM'dan kaldır
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                // Hata Ayıklama Logu: Toast kaldırıldı
                console.log(`[utils.js] Toast kaldırıldı: "${message}"`);
                toast.remove();
            }, { once: true }); // Event dinleyicisini bir kez çalıştıktan sonra kaldır
        }, 3000); // 3 saniye sonra kaybolmaya başlar
    } else {
        // Hata Ayıklama Logu: Toast container bulunamadığında hata ver
        console.error('[utils.js] Hata: Toast container bulunamadı! Lütfen index.html dosyasında #toast-container elementinin var olduğundan emin olun.');
    }
}

export function getFirstName(fullName) {
    // Hata Ayıklama Logu: getFirstName fonksiyonunun çağrıldığını ve tam adını kaydet
    console.log(`[utils.js] getFirstName çağrıldı: Tam Ad "${fullName}"`);

    if (!fullName) {
        console.warn('[utils.js] getFirstName: Boş veya tanımsız tam ad verildi.');
        return '';
    }
    const parts = fullName.trim().split(' ');
    // Hata Ayıklama Logu: Çıkarılan ilk ad
    console.log(`[utils.js] getFirstName: Çıkarılan ilk ad "${parts[0]}"`);
    return parts[0];
}

export function generateUniqueId() {
    // Hata Ayıklama Logu: generateUniqueId fonksiyonunun çağrıldığını kaydet
    console.log('[utils.js] generateUniqueId çağrıldı.');
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    // Hata Ayıklama Logu: Oluşturulan benzersiz ID
    console.log(`[utils.js] generateUniqueId: Oluşturulan ID "${uniqueId}"`);
    return uniqueId;
}

// Yeni bir yardımcı fonksiyon: Bir elemanın belirli bir ata elemanı olup olmadığını kontrol eder
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

// Yeni bir yardımcı fonksiyon: Modal açma/kapatma için ortak mantık
export function toggleModal(modalElement, show = true) {
    if (!modalElement) {
        console.error('[utils.js] toggleModal: Geçersiz modal elemanı verildi.');
        return;
    }
    console.log(`[utils.js] toggleModal çağrıldı: Modal ID "${modalElement.id}", Durum: ${show ? 'Açılıyor' : 'Kapatılıyor'}`);

    if (show) {
        modalElement.style.display = 'flex';
        // Küçük bir gecikme ile 'show' sınıfı ekleyerek CSS geçişini tetikle
        setTimeout(() => {
            modalElement.classList.add('show');
        }, 10);
    } else {
        modalElement.classList.remove('show');
        // Geçişin tamamlanmasını bekleyip sonra display: none yap
        modalElement.addEventListener('transitionend', function handler() {
            modalElement.style.display = 'none';
            modalElement.removeEventListener('transitionend', handler);
            console.log(`[utils.js] toggleModal: Modal "${modalElement.id}" kapatıldı ve DOM'dan gizlendi.`);
        }, { once: true });
    }
}