const { ipcRenderer } = require("electron")
const search = require("../search")


// Iniciar Buscador

searchInput.addEventListener("keyup", () => {
    const searchTerm = searchInput.value;
    search.performSearch(products, searchTerm);
});