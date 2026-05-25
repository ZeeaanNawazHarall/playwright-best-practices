import fs from "fs";
import path from "path";

const SESSION_EXPIRATION_MINUTES = 10;

export function getSessionFile(browserName: string) {
  return path.resolve(__dirname, `../storageState.${browserName}.json`);
}

export function isSessionExpired(sessionFile: string): boolean {
  if (!fs.existsSync(sessionFile)) return true;
  const stats = fs.statSync(sessionFile);
  const ageMins = (Date.now() - stats.mtime.getTime()) / 60000;
  return ageMins > SESSION_EXPIRATION_MINUTES;
}
