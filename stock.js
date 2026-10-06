function getMaterials() {
    let defaultStock = [
        { id: 1, name: "Biji Kopi", stock: 1000, unit: "gram", buyPrice: 150000 },
        { id: 2, name: "Susu Segar", stock: 5000, unit: "ml", buyPrice: 20000 }
    ];
    return JSON.parse(localStorage.getItem('lk_materials')) || defaultStock;
}

function setMaterials(materials) {
    localStorage.setItem('lk_materials', JSON.stringify(materials));
}
