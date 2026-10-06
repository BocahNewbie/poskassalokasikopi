function getUsers() {
    let defaultUsers = [
        { username: "Loka-owner", password: "123", name: "Big Boss Owner", role: "Owner" },
        { username: "Loka-admin", password: "123", name: "Administrator", role: "Admin" },
        { username: "Loka-kasir", password: "123", name: "Kasir Toko", role: "Kasir" },
        { username: "Loka-barista", password: "123", name: "Barista Kopi", role: "Barista" },
        { username: "Loka-checker", password: "123", name: "Checker Gudang", role: "Checker" }
    ];
    return JSON.parse(localStorage.getItem('lk_users')) || defaultUsers;
}

function setUsers(users) {
    localStorage.setItem('lk_users', JSON.stringify(users));
}
