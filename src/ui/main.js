const { ipcRenderer } = require("electron")
const search = require("./search")

// Elementos del formulario

const formProduct = document.getElementById("formProduct")
const productName = document.getElementById("name")
const productQuantity = document.getElementById("quantity")
const productGender = document.getElementById("gender")
const productsList = document.getElementById("products")

let products = []
let editingStatus = false
let editProductId = ""

// Formulario Producto

formProduct.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
        name: productName.value,
        quantity: productQuantity.value,
        gender: productGender.value
    }

    if (!editingStatus) {
        try {
            const insertedProduct = await ipcRenderer.invoke("callCreateNewProduct", newProduct);
            console.log("Producto insertado correctamente:", insertedProduct);
        } catch (error) {
            console.error("Error al crear el producto:", error.message);
        }
    } else {
        try {
            const result = await ipcRenderer.invoke("updateProductById", newProduct, editProductId);
            console.log("Producto actualizado correctamente:", result);

            editingStatus = false
            editProductId = "";
        } catch (error) {
            console.error("Error al actualizar el producto:", error.message);
        }
    }

    getAllProducts()

    formProduct.reset()
    productName.focus()
});


async function deleteProduct(id) {
    await ipcRenderer.invoke("deleteProduct", id)
    getAllProducts()
    formProduct.reset()
    productName.focus()
    return;
}

async function editProduct(id) {
    const product = await ipcRenderer.invoke("editProduct", id)
    productName.value = product.name
    productQuantity.value = product.quantity
    productGender.value = product.gender

    editingStatus = true
    editProductId = product.id
}

function renderProducts(products) {
    productsList.innerHTML = "";
    products.forEach(product => {
        productsList.innerHTML += `
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
    })
}

const getAllProducts = async () => {
    try {
        products = await ipcRenderer.invoke("getAllProducts");
        // Puedes utilizar los datos de los productos como necesites
        renderProducts(products)
    } catch (error) {
        console.error("Error al obtener los productos:", error.message);
    }
}

async function init() {
    await getAllProducts()
}

// Inicializar el buscador
searchInput.addEventListener("keyup", () => {
    const searchTerm = searchInput.value;
    search.performSearch(products, searchTerm);
});

window.addEventListener('DOMContentLoaded', init)