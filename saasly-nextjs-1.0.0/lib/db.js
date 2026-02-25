import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "127.0.0.1",
  port: 3307, 
  user: "root",
  password: "",
  database: "project_center",
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;