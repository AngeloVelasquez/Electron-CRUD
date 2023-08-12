const { BrowserWindow, ipcMain, Notification, app, dialog } = require("electron")
const fs = require("fs")
const os = require("os")
const { getConnection } = require("./database")
const path = require("path")

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
const day = currentDate.getDate().toString().padStart(2, "0");

// Construir el nombre del archivo de registro
const logFileName = `log_${year}-${month}-${day}.txt`;

// Ruta completa del archivo de registro en la carpeta "registro inventario" en Documentos
const logFilePath = path.join(app.getPath("documents"), "registro inventario", logFileName);

// Función para agregar una entrada al archivo de registro
function addToLog(entry) {
    const currentTime = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
    const logEntry = `[${currentTime}] ${entry}\n`;

    // Agregar la entrada al archivo de registro
    fs.appendFileSync(logFilePath, logEntry);
}


async function createNewProduct(product) {
    try {
        const pool = await getConnection()
        const request = pool.request()

        product.quantity = parseFloat(product.quantity) || 0

        const sql = "INSERT INTO product (name, quantity, gender) OUTPUT INSERTED.* VALUES (@name, @quantity, @gender)"
        request.input("name", product.name)
        request.input("quantity", product.quantity)
        request.input("gender", product.gender)

        const result = await request.query(sql)
        const instertedProduct = result.recordset[0]

        new Notification({
            title: "Touch Inventario",
            body: `Nuevo producto ${product.name}`
        }).show()

        addToLog(`Nuevo producto añadido: ${product.name}`)

        return instertedProduct

    } catch (error) {
        console.error(error)
    }
}

async function getAllProducts() {
    const conn = await getConnection()
    const results = await conn.query("SELECT * FROM product ORDER BY id DESC")
    return results.recordset
}

async function getAllProductsOrderH() {
    const conn = await getConnection()
    const results = await conn.query("SELECT * FROM product WHERE gender = 'Hombre' ORDER BY name ASC")
    return results.recordset
}

async function getAllProductsOrderM() {
    const conn = await getConnection()
    const results = await conn.query("SELECT * FROM product WHERE gender = 'Mujer' ORDER BY name ASC")
    return results.recordset
}

async function deleteProduct(id) {
    try {
        const pool = await getConnection();
        const request = pool.request();

        const sql = "DELETE FROM product WHERE id = @id";
        request.input("id", id);

        const result = await request.query(sql);
        return result;
    } catch (error) {
        console.error("Error al eliminar el producto:", error.message);
        throw error;
    }
}

async function editProduct(id) {
    try {
        const pool = await getConnection();
        const request = pool.request();

        const sql = "SELECT * FROM product WHERE id = @id";
        request.input("id", id);

        const result = await request.query(sql);
        console.log(result)
        return result.recordset[0];
    } catch (error) {
        console.error("Error al obtener el producto:", error.message);
        throw error;
    }
}

async function sellProduct(id, soldQuantity) {
    try {
        const pool = await getConnection();
        const request = pool.request();

        const getProductQuery = "SELECT * FROM product WHERE id = @id";
        request.input("id", id);

        const productResult = await request.query(getProductQuery);
        const product = productResult.recordset[0];

        if (product.quantity >= soldQuantity) {
            // Restar la cantidad vendida
            const updatedQuantity = product.quantity - soldQuantity;
            const updateQuery = "UPDATE product SET quantity = @updatedQuantity WHERE id = @id";
            request.input("updatedQuantity", updatedQuantity);

            await request.query(updateQuery);

            // Obtener el producto actualizado
            const updatedProductResult = await request.query(getProductQuery);

            console.log("Producto vendido y actualizado:", updatedProductResult.recordset[0]);

            addToLog(`Venta: Producto ${product.name} - Cantidad vendida: ${soldQuantity}gr`)

            return updatedProductResult.recordset[0];
        } else {
            console.error("No hay suficiente cantidad para realizar la venta.");
            return null;
        }
    } catch (error) {
        console.error("Error al vender el producto:", error.message);
        throw error;
    }
}

async function enterProduct(id, enterQuantity) {
    try {
        const pool = await getConnection();
        const request = pool.request();

        const getProductQuery = "SELECT * FROM product WHERE id = @id";
        request.input("id", id);

        const productResult = await request.query(getProductQuery);
        const product = productResult.recordset[0];

        // Actualizar la cantidad sumando la cantidad ingresada
        const updatedQuantity = product.quantity + enterQuantity;
        const updateQuery = "UPDATE product SET quantity = @updatedQuantity WHERE id = @id";
        request.input("updatedQuantity", updatedQuantity);

        await request.query(updateQuery);

        // Obtener el producto actualizado
        const updatedProductResult = await request.query(getProductQuery);

        console.log("Producto actualizado por entrada:", updatedProductResult.recordset[0]);

        addToLog(`Entrada: Producto ${product.name} - Cantidad ingresada: ${enterQuantity}gr`);

        return updatedProductResult.recordset[0];
    } catch (error) {
        console.error("Error al realizar la entrada del producto:", error.message);
        throw error;
    }
}

async function updateProductById(newProduct, id) {
    try {
        const pool = await getConnection();
        const request = pool.request();

        const sql = "UPDATE product SET name = @name, gender = @gender, quantity = @quantity WHERE id = @id";
        request.input("id", id); // Utilizamos el ID recibido como parámetro, no newProduct.id
        request.input("name", newProduct.name);
        request.input("gender", newProduct.gender);
        request.input("quantity", newProduct.quantity);

        // Ejecutamos la actualización
        await request.query(sql);

        // Ahora, obtendremos el producto actualizado con una consulta SELECT
        const updatedProductQuery = await editProduct(id); // Usamos el ID recibido como parámetro
        return updatedProductQuery;
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
        throw error;
    }
}

let window
let modifyProduct

function createWindow() {
    window = new BrowserWindow({
        width: 1100,
        height: 700,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    window.loadFile("src/ui/index.html")
    window.on("closed", () => {
        app.quit()
    })
    ipcMain.on("operationCompleted", () => {
        window.webContents.send("refreshMainWindow");
    });
}

function sellProductWindow(product) {
    modifyProduct = new BrowserWindow({
        width: 600,
        height: 340,
        autoHideMenuBar: true,
        title: "Cantidad a retirar",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    modifyProduct.loadFile("src/ui/controllers/sell_product.html")
    modifyProduct.on("closed", () => {
        modifyProduct = null;
    });
    modifyProduct.webContents.on("did-finish-load", () => {
        modifyProduct.webContents.send("productData", product)
    })
}

function enterProductWindow(product) {
    modifyProduct = new BrowserWindow({
        width: 600,
        height: 340,
        autoHideMenuBar: true,
        title: "Cantidad a ingresar",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    modifyProduct.loadFile("src/ui/controllers/enter_product.html")
    modifyProduct.on("closed", () => {
        modifyProduct = null;
    });
    modifyProduct.webContents.on("did-finish-load", () => {
        modifyProduct.webContents.send("productData2", product)
    })
}

ipcMain.handle("callCreateNewProduct", async (event, newProduct) => {
    try {
        const insertedProduct = await createNewProduct(newProduct);
        return insertedProduct;
    } catch (error) {
        throw new Error("Error al crear el producto: " + error.message);
    }
});

ipcMain.handle("getAllProducts", async (event) => {
    return await getAllProducts();
});

ipcMain.handle("deleteProduct", async (e, id) => {
    const result = await deleteProduct(id)
    return result
})

ipcMain.handle("editProduct", async (e, id) => {
    const result = await editProduct(id)
    return result
})

ipcMain.handle("sellProduct", async (e, id, soldQuantity) => {
    const result = await sellProduct(id, soldQuantity)
    return result
})

ipcMain.handle("enterProduct", async (e, id, enterQuantity) => {
    const result = await enterProduct(id, enterQuantity)
    return result
})

ipcMain.handle("updateProductById", async (event, newProduct, id) => {
    try {
        const result = await updateProductById(newProduct, id);
        return result;
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
        throw error;
    }
});

ipcMain.handle("getAllProductsOrderH", async (e) => {
    return await getAllProductsOrderH();
});

ipcMain.handle("getAllProductsOrderM", async (e) => {
    return await getAllProductsOrderM();
})

ipcMain.handle("sellProductWindow", async (e, product) => {
    return await sellProductWindow(product)
})

ipcMain.handle("enterProductWindow", async (e, product) => {
    return await enterProductWindow(product)
})

ipcMain.handle('perform-search', (event, searchTerm) => {
    // Aquí colocas tu lógica de búsqueda...
    // Supongamos que los resultados de búsqueda están en un arreglo llamado "searchResults"
    const searchResults = [];

    return searchResults;
});

module.exports = {
    createWindow,
    sellProductWindow,
    enterProductWindow
}