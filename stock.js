function getMaterials() {
    let defaultStock = [
        { id: 1, name: "Biji Kopi", stock: 1000, unit: "gram" },
        { id: 2, name: "Susu Segar", stock: 5000, unit: "ml" }
    ];
    return JSON.parse(localStorage.getItem('lk_materials')) || defaultStock;
}
