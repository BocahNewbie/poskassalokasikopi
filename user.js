function getUsers() {
    let defaultUsers = [
        { username: "owner", password: "123", name: "Big Boss Owner", role: "Owner" },
        { username: "admin", password: "123", name: "Administrator", role: "Admin" },
        { username: "kasir", password: "123", name: "Kasir Toko", role: "Kasir" },
        { username: "barista", password: "123", name: "Barista Kopi", role: "Barista" },
        { username: "checker", password: "123", name: "Checker Gudang", role: "Checker" }
    ];
    return JSON.parse(localStorage.getItem('lk_users')) || defaultUsers;
}

function setUsers(users) {
    localStorage.setItem('lk_users', JSON.stringify(users));
}
