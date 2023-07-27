const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("products");

function displayResults(results) {
    searchResults.innerHTML = "";

    if (results.length === 0) {
        searchResults.innerHTML = "<h2>No se encontraron resultados</h2>";
    } else {
        results.forEach((product) => {
            const resultDiv = document.createElement("div");
            resultDiv.innerHTML = `
        <div class="card card-body my-2 animate__animated animate__backInLeft">
            <h4>${product.name}</h4>
            <p>${product.gender}</p>
            <h4>${product.quantity} gr</h4>

            <!-- Acciones para editar y eliminar -->

            <p>
                <button class="btn btn-primary" onclick="deleteProduct('${product.id}')">
                    BORRAR
                </button>
                <button class="btn btn-secondary" onclick="editProduct('${product.id}')">
                    EDITAR
                </button>
            </p>
        </div>
      `;
      // Añadir el div a la lista de resultados
      searchResults.appendChild(resultDiv);
        });
    }
}

function performSearch(products, searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();

    const results = products.filter((product) => {
        const productNameLower = product.name.toLowerCase();
        const productGenderLower = product.gender.toLowerCase();
        const productQuantityLower = product.quantity.toString().toLowerCase();

        return (
            productNameLower.includes(searchTermLower) ||
            productGenderLower.includes(searchTermLower) ||
            productQuantityLower.includes(searchTermLower)
        );
    });

    displayResults(results);
}

module.exports = {
    performSearch,
};
