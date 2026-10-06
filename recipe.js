// Data Resep (Menghubungkan Menu dengan Bahan Baku & Takaran)
let menuRecipes = {
    1: [ // ID Menu Caffè Latte
        { material: "Biji Kopi", amount: 18, unit: "gram" },
        { material: "Susu Segar", amount: 150, unit: "ml" }
    ]
};

function getRecipes() {
    return menuRecipes;
}

function addRecipeComponent(menuId, materialName, amount) {
    if (!menuRecipes[menuId]) {
        menuRecipes[menuId] = [];
    }
    menuRecipes[menuId].push({ material: materialName, amount: parseFloat(amount) });
}
