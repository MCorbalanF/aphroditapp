// storage.service.js

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * StorageService
 * Abstracción unificada de almacenamiento seguro / persistente.
 * 
 * - iOS / Android → SecureStore (almacenamiento cifrado)
 * - Web → AsyncStorage (localStorage wrapper)
 * 
 * API pensada para escalar (TTL, namespacing, etc.)
 */

class StorageService {
  constructor() {
    this.isWeb = Platform.OS === "web";
  }

  /**
   * Guarda un string bajo una clave.
   * @param {string} key
   * @param {string} value
   */
  async set(key, value) {
    this._validateKey(key);
    this._validateString(value);
    try {
      if (this.isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible:
            SecureStore.AFTER_FIRST_UNLOCK,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Recupera un string por clave.
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  async get(key) {
    this._validateKey(key);
    try {
      if (this.isWeb) {
        
        const value = await AsyncStorage.getItem(key);
        return value;
        
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una clave
   * @param {string} key
   */
  async remove(key) {
    this._validateKey(key);

    try {
      if (this.isWeb) {
      await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Guarda un objeto automáticamente serializado
   * Escalable para futuro
   */
  async setJSON(key, value) {
    
    const serialized = JSON.stringify(value);
    return this.set(key, serialized);
  }

  /**
   * Recupera objeto automáticamente parseado
   */
  async getJSON(key) {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Validaciones privadas
   */
  _validateKey(key) {
    if (!key || typeof key !== "string") {
      throw new Error("Storage key must be a non-empty string.");
    }
  }

  _validateString(value) {
    console.log('Validating storage value:', value);
    if (typeof value !== "string") {
      throw new Error("Storage value must be a string.");
    }
  }
}

const storageService = new StorageService();

export default storageService;
