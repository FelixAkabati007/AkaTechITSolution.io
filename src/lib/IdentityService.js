
import { openDB } from "idb";

const DB_NAME = "AkaTechIdentityDB";
const STORE_NAME = "identity_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    },
  });
};

export const identityService = {
  // 1. Cache Handling
  async setCache(key, data) {
    const db = await initDB();
    await db.put(STORE_NAME, {
      key,
      data,
      timestamp: Date.now(),
    });
  },

  async getCache(key) {
    const db = await initDB();
    const cached = await db.get(STORE_NAME, key);
    
    if (!cached) return null;
    
    // Check expiration
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      await db.delete(STORE_NAME, key);
      return null;
    }
    
    return cached.data;
  },

  // 2. Data Retrieval (Simulated OAuth/Profile Fetch)
  async fetchIdentityData(userToken = null) {
    // Try cache first
    const cachedData = await this.getCache("user_identity");
    if (cachedData) {
      console.log("Returning cached identity data");
      return cachedData;
    }

    // Mock API call / OAuth flow
    // In a real app, this would use the userToken to call a userinfo endpoint
    console.log("Fetching fresh identity data...");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulated data from OAuth provider
    const freshData = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+233201234567",
      picture: "https://lh3.googleusercontent.com/a/default-user",
      source: "oauth_provider",
    };

    // Cache the result
    await this.setCache("user_identity", freshData);
    
    return freshData;
  },

  // 3. Validation
  validateEmail(email) {
    // RFC 5322 Standard Regex (Simplified for JS)
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
  },

  normalizePhone(phone) {
    // Basic E.164 normalization (assuming GH context or generic)
    // Remove spaces, dashes, parens
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");
    
    // Add + if missing
    if (!cleaned.startsWith("+")) {
      // Assume local GH number for this context if starts with 0
      if (cleaned.startsWith("0")) {
        cleaned = "+233" + cleaned.substring(1);
      } else {
        cleaned = "+" + cleaned;
      }
    }
    return cleaned;
  },
};
