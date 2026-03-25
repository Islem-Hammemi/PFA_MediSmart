// hashPasswords.js
const bcrypt = require('bcrypt');

async function main() {
  const hash = await bcrypt.hash('1234', 10);
  console.log(hash);
}
main();