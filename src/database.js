const sql = require("mssql");

const config = ({
    user: "usuario",
    password: "password",
    server: "localhost",
    database: "electronCRUD",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
})

async function getConnection() {
    try {
        const pool = await sql.connect(config)
        console.log("Conexion realizada con exito a la base de datos", "👾👾")
        return pool;
    } catch (err) {
        console.error("Error al conectar a la base de datos")
        throw err
    }
}

module.exports = { getConnection }