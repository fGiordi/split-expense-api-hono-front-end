export const encryptData = async (data, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Random initialization vector
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(data)
  );
  return {
    iv: Array.from(iv), // Store IV for decryption
    encrypted: Array.from(new Uint8Array(encrypted)),
  };
};
