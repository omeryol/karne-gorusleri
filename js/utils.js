// js/utils.js

export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    if (type === 'success') {
        toast.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        toast.style.backgroundColor = '#dc3545';
    } else {
        toast.style.backgroundColor = '#333';
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

export function getFirstName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[0];
}

export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}