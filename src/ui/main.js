const { ipcRenderer } = require("electron")

const formProduct = document.getElementById("formProduct");

const productName = document.getElementById("name")
const productPrice = document.getElementById("price")
const productDesc = document.getElementById("description")
const productsList = document.getElementById("products")

let products = []
let editingStatus = false
let editProductId = ""

formProduct.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
        name: productName.value,
        price: productPrice.value,
        description: productDesc.value
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
    productPrice.value = product.price
    productDesc.value = product.description

    editingStatus = true
    editProductId = product.id
}

function renderProducts(products) {
    productsList.innerHTML = "";
    products.forEach(product => {
        productsList.innerHTML += `
            <div class="card card-body my-2 animate__animated animate__backInLeft">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <h5>${product.price}</h5>

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

init()