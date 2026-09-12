import bcrypt from 'bcryptjs';

async function main() {
  const hash = '$2a$12$OImd41euJxCa8DEh236Zv.qOwBOxVEJh6Sj7BGIOuzJW9hZT4RP9W';
  const pwd = 'Password@123';
  const match = await bcrypt.compare(pwd, hash);
  console.log('Match?', match);
}

main().catch(console.error);
