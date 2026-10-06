function getRecipes() {
    let defaultRecipes = {
        1: [{ material: "Biji Kopi", amount: 18, unit: "gram" }]
    };
    return JSON.parse(localStorage.getItem('lk_recipes')) || defaultRecipes;
}
