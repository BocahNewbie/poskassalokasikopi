// Data Stok Bahan Baku
let materialStock = [
    { id: 1, name: "Biji Kopi", stock: 1000, unit: "gram" },
    { id: 2, name: "Susu Segar", stock: 5000, unit: "ml" },
    { id: 3, name: "Gula Aren", stock: 2000, unit: "gram" }
];

function getMaterials() {
    return materialStock;
}

function updateStock(materialId, qtyAdded) {
    const material = materialStock.find(m => m.id === parseInt(materialId));
    if (material) {
        material.stock += parseFloat(qtyAdded);
    }
}
