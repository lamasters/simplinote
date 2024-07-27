import Aes from "react-native-aes-crypto";
import { RSA } from "react-native-rsa-native";

export const createDeviceKeys = async () => {
  return await RSA.generateKeys(2048);
};

export const createAccountKey = async () => {
  return await Aes.randomKey(32);
};

export const hash = async (key: string) => {
  return await Aes.sha256(key);
};

export const encryptKey = async (deviceKey: string, accountKey: string) => {
  return await RSA.encrypt(accountKey, deviceKey);
};

export const decryptKey = async (deviceKey: string, accountKey: string) => {
  return await RSA.decrypt(accountKey, deviceKey);
};

export const encryptString = async (plainText: string, key: string) => {
  return Aes.encrypt(plainText, key, null, "aes-256-ctr");
};

export const decryptString = async (cipherText: string, key: string) => {
  return Aes.decrypt(cipherText, key, null, "aes-256-ctr");
};
