const { BrowserWindow, ipcMain, Notification } = require("electron")
const { getConnection } = require("./database")
const path = require("path")

async function createNewProduct(product) {
    try {
        const pool = await getConnection()
        const request = pool.request()

        product.quantity = parseFloat(product.quantity)

        const sql = "INSERT INTO product (name, quantity, gender) OUTPUT INSERTED.* VALUES (@name, @quantity, @gender)"
        request.input("name", product.name)
        request.input("quantity", product.quantity)
        request.input("gender", product.gender)

        const result = await request.query(sql)
        const instertedProduct = result.recordset[0]

        new Notification({
            title: "Electro SQL",
            body: `Nuevo producto ${product.name}`
        }).show()

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
        console.error("Error al eliminar el producto:", error.message);
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

function createWindow() {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "icons", "icono.ico"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    window.loadFile("src/ui/index.html")
}

ipcMain.handle("callCreateNewProduct", async (event, newProduct) => {
    try {
        const insertedProduct = await createNewProduct(newProduct);
        // Enviamos el producto insertado como respuesta al proceso de renderizado
        return insertedProduct;
    } catch (error) {
        // Enviamos un mensaje de error como respuesta al proceso de renderizado
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

ipcMain.handle("updateProductById", async (event, newProduct, id) => {
    try {
        const result = await updateProductById(newProduct, id);
        return result;
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
        throw error;
    }
});

ipcMain.handle('perform-search', (event, searchTerm) => {
    // Aquí colocas tu lógica de búsqueda...
    // Supongamos que los resultados de búsqueda están en un arreglo llamado "searchResults"
    const searchResults = [];

    return searchResults;
});

module.exports = {
    createWindow
}