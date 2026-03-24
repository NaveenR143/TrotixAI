// frontend/src/crypto/decryptLayer.js
import forge from "node-forge";
import { publicKeyPem } from "./publicKey";

function fixBase64Padding(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    return base64String + padding;
}

/**
 * Decrypts server encrypted (base64) RSA response.
 */
export function decryptResponse(encryptedBase64) {
    try {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

        // Ensure proper base64 padding
        const fixedEncryptedBase64 = fixBase64Padding(encryptedBase64);
        const decoded = forge.util.decode64(fixedEncryptedBase64);

        // Split: EncryptedKey (256 bytes) + EncryptedData
        const encryptedKey = decoded.slice(0, 256);
        const encryptedData = decoded.slice(256);

        // Decrypt AES key, IV, Tag using RSA Public Key (Raw RSA)
        const BigInteger = publicKey.n.constructor;
        const c = new BigInteger(forge.util.createBuffer(encryptedKey).toHex(), 16);
        const m = c.modPow(publicKey.e, publicKey.n);

        let keyPayloadHex = m.toString(16);
        if (keyPayloadHex.length % 2 !== 0) keyPayloadHex = '0' + keyPayloadHex;

        let keyPayload = forge.util.hexToBytes(keyPayloadHex);

        // Remove sentinel (\x01)
        if (keyPayload.charCodeAt(0) === 1) {
            keyPayload = keyPayload.slice(1);
        } else {
            console.warn("No sentinel byte found, proceeding with fallback...");
        }

        const key = keyPayload.slice(0, 32);
        const iv = keyPayload.slice(32, 44);
        const tag = keyPayload.slice(44, 60);

        // Decrypt data with AES-GCM
        const decipher = forge.cipher.createDecipher('AES-GCM', key);
        decipher.start({
            iv: iv,
            tag: forge.util.createBuffer(tag)
        });
        decipher.update(forge.util.createBuffer(encryptedData));
        const pass = decipher.finish();

        if (!pass) {
            throw new Error("Decryption failed: Invalid tag or corrupted data");
        }

        return JSON.parse(decipher.output.toString());
    } catch (error) {
        console.error("Error in decryptResponse:", error);
        return null;
    }
}
