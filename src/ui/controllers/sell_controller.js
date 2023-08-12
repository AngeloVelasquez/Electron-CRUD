const { ipcRenderer } = require("electron");

// Obtener elementos del formulario de la ventana "Modificar Producto"
const productName = document.getElementById("name");
const productQuantity = document.getElementById("quantity");
const productGender = document.getElementById("gender")

let editProductId = ""

// Escucha el evento "productData" y utiliza los datos para llenar el formulario
ipcRenderer.on("productData", (event, product) => {

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
document.getElementById("updateForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const soldQuantity = parseFloat(document.getElementById("soldQuantity").value);

    if (!isNaN(soldQuantity) && soldQuantity > 0) {
        try {
            const productToUpdate = await ipcRenderer.invoke("sellProduct", editProductId, soldQuantity);
            console.log(`Venta registrada: ${soldQuantity}gr de producto`);

            // Cerrar la ventana de modificación
            ipcRenderer.send("operationCompleted");
            window.close();
        } catch (error) {
            console.error("Error al realizar la venta:", error.message);
        }
    } else {
        console.error("Cantidad inválida para la venta.");
    }
});
