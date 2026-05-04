import mysql from "mysql2/promise";
 
const dbAupair = mysql.createPool({
  host: process.env.DB_AUPAIR_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_AUPAIR_PORT || "3307"),
  user: process.env.DB_AUPAIR_USER || "root",
  password: process.env.DB_AUPAIR_PASSWORD || "",
  database: process.env.DB_AUPAIR_NAME || "destino_aupair",
  waitForConnections: true,
  connectionLimit: 10,
});
 
export default dbAupair;