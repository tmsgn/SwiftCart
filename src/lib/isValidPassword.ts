export async function isValidPassword(
  password: string,
  hashedPassword: string
) {
    console.log(await hashPassword(password));
  return (await hashPassword(password)) === hashedPassword;
}

async function hashPassword(password: string) {
  const arrayBUffer = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(password)
  );

  return Buffer.from(arrayBUffer).toString("base64");
}
