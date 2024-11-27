export default async function generate_password() {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&';
  let password = '';
  for (let i = 0; i < 10; ++i) {
    const randomIndex = Math.floor(Math.random() * charset.length);

    password += charset.charAt(randomIndex);
  }
  return password;
}
