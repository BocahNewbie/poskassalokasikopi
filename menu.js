function getMenus() {
    let defaultMenus = [
        { id: 1, name: "Caffè Latte", category: "Kopi", price: 25000 },
        { id: 2, name: "Americano", category: "Kopi", price: 18000 }
    ];
    return JSON.parse(localStorage.getItem('lk_menus')) || defaultMenus;
}
