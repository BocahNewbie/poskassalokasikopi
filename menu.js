function getMenus() {
    let defaultMenus = [
        { id: 1, name: "Caffè Latte", category: "Kopi", price: 25000, desc: "Espresso dengan susu segar pilihan", recipe: [{ material: "Biji Kopi", amount: 18 }, { material: "Susu Segar", amount: 150 }] },
        { id: 2, name: "Americano", category: "Kopi", price: 18000, desc: "Espresso murni dengan air mineral", recipe: [{ material: "Biji Kopi", amount: 20 }] }
    ];
    return JSON.parse(localStorage.getItem('lk_menus')) || defaultMenus;
}

function setMenus(menus) {
    localStorage.setItem('lk_menus', JSON.stringify(menus));
}
