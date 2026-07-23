import mysql from "mysql2/promise";
 
const dbAupair = mysql.createPool({
  host: process.env.DB_AUPAIR_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_AUPAIR_PORT || "3307"),
  user: process.env.DB_AUPAIR_USER || "root",
  password: process.env.DB_AUPAIR_PASSWORD || "",
  database: process.env.DB_AUPAIR_NAME || "destino_aupair",
  waitForConnections: true,
  connectionLimit: 10,
  // La BD guarda los timestamps en UTC. 'Z' hace que mysql2 los interprete
  // como UTC → los Date quedan en el instante correcto y el cliente los
  // muestra en su zona local (Colombia GMT-5). Sin esto, la hora salía +5h.
  timezone: "Z",
});
 
export default dbAupair;