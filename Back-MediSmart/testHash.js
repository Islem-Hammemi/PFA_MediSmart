// testHash.js
const bcrypt = require('bcryptjs');

const hash = '$2b$10$bbedxkA7Ekmmr3iD/p55hefyBPUCbPWA3BxI4iVqOqW1XTDua2F1G';
const password = '1234';

async function test() {
  const result = await bcrypt.compare(password, hash);
  console.log('bcrypt.compare résultat :', result);
  
  // Générer un nouveau hash propre
  const newHash = await bcrypt.hash('1234', 10);
  console.log('Nouveau hash généré :', newHash);
  
  const result2 = await bcrypt.compare('1234', newHash);
  console.log('Vérification nouveau hash :', result2);
}
test();