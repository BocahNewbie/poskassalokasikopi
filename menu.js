// Data Menu & Kategori Lokasi Kopi
let activeMenus = [
    { id: 1, name: "Caffè Latte", category: "Kopi", price: 25000 },
    { id: 2, name: "Americano", category: "Kopi", price: 18000 },
    { id: 3, name: "Manual Brew V60", category: "Kopi", price: 22000 }
];

function getMenus() {
    return activeMenus;
}

function saveNewMenu(name, category, price) {
    const newMenu = {
        id: Date.now(),
        name: name,
        category: category,
        price: parseInt(price)
    };
    activeMenus.push(newMenu);
    return activeMenus;
}
