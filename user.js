function getUsers() {
    let defaultUsers = [
        { username: "admin", password: "123", name: "Administrator", role: "Admin" },
        { username: "kasir", password: "123", name: "Kasir Toko", role: "Kasir" },
        { username: "barista", password: "123", name: "Barista Kopi", role: "Barista" }
    ];
    return JSON.parse(localStorage.getItem('lk_users')) || defaultUsers;
}
function setUsers(users) {
    localStorage.setItem('lk_users', JSON.stringify(users));
}
