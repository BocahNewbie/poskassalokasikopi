// --- DATA AWAL AKUN PENGGUNA (MONITORING & DATABASE) ---
const defaultUsers = [
    { id: 'usr_admin', name: 'Adzka Ramdhani', username: 'admin', password: 'admin123', role: 'Admin' },
    { id: 'usr_kasir', name: 'Kasir Lokasi', username: 'kasir', password: 'kasir123', role: 'Kasir' },
    { id: 'usr_barista', name: 'Barista Tim', username: 'barista', password: 'barista123', role: 'Barista' }
];

function initUsersStorage() {
    if (!localStorage.getItem('lk_users')) {
        localStorage.setItem('lk_users', JSON.stringify(defaultUsers));
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem('lk_users')) || defaultUsers;
}

function setUsers(users) {
    localStorage.setItem('lk_users', JSON.stringify(users));
}

// Inisialisasi saat file dimuat
initUsersStorage();
