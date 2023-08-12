const { ipcRenderer } = require("electron");

// Obtener elementos del formulario de la ventana "Modificar Producto"
const productName = document.getElementById("name");
const productQuantity = document.getElementById("quantity");
const productGender = document.getElementById("gender")

let editProductId = ""

// Escucha el evento "productData" y utiliza los datos para llenar el formulario
ipcRenderer.on("productData2", (event, product) => {

    productName.value = product.name;
    productGender.value = product.gender;
    productQuantity.value = product.quantity

    editProductId = product.id;

    const productNameHeading = document.getElementById("name");
    const productGenderHeading = document.getElementById("gender");
    const productQuantityHeading = document.getElementById("quantity")

    productNameHeading.textContent = `Nombre: ${product.name}`;
    productGenderHeading.textContent = `Género: ${product.gender}`;
    productQuantityHeading.textContent = `Cantidad: ${product.quantity}`;
});

// Escucha el envío de formulario para realizar la venta
document.getElementById("updateForm2").addEventListener("submit", async (e) => {
    e.preventDefault();

    const enterQuantity = parseFloat(document.getElementById("enterQuantity").value);

    try {
        const productToUpdate = await ipcRenderer.invoke("enterProduct", editProductId, enterQuantity);
        console.log(`Ingreso registrado: ${enterQuantity}gr de producto`);

        ipcRenderer.send("operationCompleted");
        window.close();
    } catch (error) {
        console.error("Error al realizar la venta:", error.message);
    }
});
