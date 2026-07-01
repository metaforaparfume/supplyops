import * as bcrypt from 'bcryptjs';
console.log('typeof compare:', typeof bcrypt.compare);
console.log('typeof hash:', typeof bcrypt.hash);
console.log('keys:', Object.keys(bcrypt).slice(0, 10));

const hash = await bcrypt.hash("password123", 10);
console.log('hash:', hash.substring(0, 20) + '...');
const match = await bcrypt.compare("password123", hash);
console.log('match:', match);