export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function envNum(name: string): number {
  const value = parseInt(env(name), 10);
  if (isNaN(value)) throw new Error(`Environment variable ${name} must be a number`);
  return value;
}
