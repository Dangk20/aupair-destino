const bcrypt = require('bcrypt');

async function run() {
  const password = "Admin123456";
  const hash = await bcrypt.hash(password, 12);
  console.log("Nuevo hash:");
  console.log(hash);
}

run();