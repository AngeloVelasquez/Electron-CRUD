const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("products");

function displayResults(results) {
    let html = "";
    let currentLetter = "";

    if (results.length === 0) {
        html = "<h2>No se encontraron resultados</h2>";
    } else {
        results.forEach((product, index) => {
            const productInitial = product.name.charAt(0).toUpperCase();

            // Si es un producto nuevo con una letra inicial diferente, creamos una nueva fila y mostramos la letra inicial
            if (productInitial !== currentLetter) {
                currentLetter = productInitial;

                html += `<h2 class="letter-row">${currentLetter}</h2>`;
            }

            html += `
              <div class="card border-primary col-md mb-3 animate__animated animate__backInLeft product-card">
                  <div class="card-body">
                      <h4 class="card-title">${product.name}</h4>
                      <p>${product.gender}</p>
                      <h4>${product.quantity} gr</h4>
      
                      <!-- Acciones para editar y eliminar -->
      
                      <p>
                        <button class="btn btn-primary" onclick="deleteProduct('${product.id}')">
                            BORRAR
                        </button>
                        <button class="btn btn-info" onclick="enterProduct('${product.id}')">
                            ENTRADA PRODUCTO
                        </button>
                        <button class="btn btn-success" style="margin: 10px" onclick="sellProduct('${product.id}')">
                            SALIDA PRODUCTO
                        </button>
                      </p>
                  </div>
              </div>
            `;
        });
    }

    // Asignar el contenido HTML acumulado a searchResults
    searchResults.innerHTML = html;
}


function performSearch(products, searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTerm.trim() === "") {
        // Si el término de búsqueda está vacío, mostrar todos los productos
        displayResults(products);
    } else {
        const results = products.filter((product) => {
            const productNameLower = product.name.toLowerCase();

            return productNameLower.includes(searchTermLower);
        });

        displayResults(results);
    }
}

module.exports = {
    performSearch,
};
