const { ipcRenderer } = require("electron")
const search = require("./searchController")

const productsList = document.getElementById("products")

// Reiniciar Buscador

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value;
    performSearch(products, searchTerm)
});

// Funciones

async function deleteProduct(id) {
    await ipcRenderer.invoke("deleteProduct", id)
    getAllProducts()
    formProduct.reset()
    productName.focus()
    return;
}

async function sellProduct(id) {
    const product = await ipcRenderer.invoke("editProduct", id)
    await ipcRenderer.invoke("sellProductWindow", product)
    
    ipcRenderer.send("productData", product)
}

async function enterProduct(id) {
    const product = await ipcRenderer.invoke("editProduct", id)
    await ipcRenderer.invoke("enterProductWindow", product)

    ipcRenderer.send("productData2", product)
}

// Renderizar Productos

function renderProducts(products) {
    productsList.innerHTML = "";

    let currentLetter = null;

    products.forEach(product => {
        // Obtener la primera letra del nombre del producto
        const firstLetter = product.name.charAt(0).toUpperCase();

        // Si la letra actual es diferente de la letra anterior, agregar el encabezado de sección
        if (firstLetter !== currentLetter) {
            productsList.innerHTML += `<h2>${firstLetter}</h2>`;
            currentLetter = firstLetter;
        }

        // Agregar el contenido de la tarjeta del producto con la clase product-card
        productsList.innerHTML += `
            <div class="card border-primary mb-3 animate__animated animate__backInLeft product-card">
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
                        <button class="btn btn-success" onclick="sellProduct('${product.id}')">
                            SALIDA PRODUCTO
                        </button>
                    </p>
                </div>
            </div>
        `;
    })
}


// Obtener Productos

const getAllProducts = async () => {
    try {
        products = await ipcRenderer.invoke("getAllProductsOrderH");
        // Puedes utilizar los datos de los productos como necesites
        renderProducts(products)
    } catch (error) {
        console.error("Error al obtener los productos:", error.message);
    }
}

async function init() {
    await getAllProducts()
}

ipcRenderer.on("refreshMainWindow", () => {
    location.reload();
});

window.addEventListener('DOMContentLoaded', init)