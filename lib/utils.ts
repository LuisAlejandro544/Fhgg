import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from "crypto-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SECRET_KEY = 'ai_hub_local_secret_key_2026'; // Obfuscation key for local storage

export function encryptData(data: string): string {
  if (!data) return data;
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (e) {
    return data;
  }
}

export function decryptData(ciphertext: string): string {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption yields empty string but ciphertext wasn't empty, it might not be encrypted
    return decrypted || ciphertext; 
  } catch (e) {
    return ciphertext; // Fallback to original if it wasn't encrypted
  }
}
