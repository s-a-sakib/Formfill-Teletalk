/**
 * Security & Anti-Jacking Core Module
 * Formfill Teletalk Extension
 * Provides AES-256-GCM authenticated encryption, PBKDF2 key derivation,
 * and Anti-Form-Jacking DOM analysis guards against decoy/harvesting fields.
 */

const root = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : self);

const SECURITY_DEFAULTS = {
  DEFAULT_TRUSTED_DOMAINS: [
    'teletalk.com.bd',
    '*.teletalk.com.bd',
    'alljobs.teletalk.com.bd'
  ],
  DEFAULT_SETTINGS: {
    isVaultConfigured: false,
    trustedDomainsOnly: true,
    trustedDomains: [
      'teletalk.com.bd',
      '*.teletalk.com.bd',
      'alljobs.teletalk.com.bd'
    ],
    autoLockMinutes: 15, // 0 = never, 5, 15, 30, 60
    antiJackingStrict: true
  }
};

const SecurityCrypto = {
  uint8ToBase64(bytes) {
    let binary = '';
    const len = bytes.length;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  },

  base64ToUint8(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  },

  async deriveKey(password, saltUint8, iterations = 100000) {
    const enc = new TextEncoder();
    const pwKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltUint8,
        iterations: iterations,
        hash: 'SHA-256'
      },
      pwKey,
      { name: 'AES-GCM', length: 256 },
      true, // extractable for RAM-only session storage
      ['encrypt', 'decrypt']
    );
  },

  async importRawKey(rawKeyBase64) {
    const rawBytes = this.base64ToUint8(rawKeyBase64);
    return await crypto.subtle.importKey(
      'raw',
      rawBytes,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  },

  async exportRawKey(cryptoKey) {
    const raw = await crypto.subtle.exportKey('raw', cryptoKey);
    return this.uint8ToBase64(new Uint8Array(raw));
  },

  async encryptPayload(dataObject, passwordOrKey) {
    let key;
    let saltBase64 = null;
    const iterations = 100000;

    if (typeof passwordOrKey === 'string') {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      key = await this.deriveKey(passwordOrKey, salt, iterations);
      saltBase64 = this.uint8ToBase64(salt);
    } else {
      key = passwordOrKey;
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(JSON.stringify(dataObject));
    const ciphertextBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const result = {
      version: 1,
      iv: this.uint8ToBase64(iv),
      ciphertext: this.uint8ToBase64(new Uint8Array(ciphertextBuf))
    };

    if (saltBase64) {
      result.salt = saltBase64;
      result.iterations = iterations;
    }

    return { vault: result, key };
  },

  async decryptPayload(vault, passwordOrKey) {
    if (!vault || !vault.ciphertext || !vault.iv) {
      throw new Error('Invalid vault structure');
    }

    let key;
    if (typeof passwordOrKey === 'string') {
      if (!vault.salt) throw new Error('Missing salt in vault');
      const salt = this.base64ToUint8(vault.salt);
      key = await this.deriveKey(passwordOrKey, salt, vault.iterations || 100000);
    } else {
      key = passwordOrKey;
    }

    const iv = this.base64ToUint8(vault.iv);
    const ciphertext = this.base64ToUint8(vault.ciphertext);
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return { data: JSON.parse(dec.decode(decryptedBuf)), key };
  }
};

const SecurityGuards = {
  extractHostname(url) {
    try {
      if (!url || !url.startsWith('http')) return '';
      return new URL(url).hostname.toLowerCase();
    } catch (_) {
      return '';
    }
  },

  isDomainTrusted(hostname, trustedList) {
    if (!hostname) return false;
    const host = hostname.toLowerCase().trim();
    const list = Array.isArray(trustedList) ? trustedList : SECURITY_DEFAULTS.DEFAULT_TRUSTED_DOMAINS;

    for (const pattern of list) {
      const p = String(pattern || '').toLowerCase().trim();
      if (!p) continue;
      if (p.startsWith('*.')) {
        const base = p.slice(2);
        if (host === base || host.endsWith('.' + base)) return true;
      } else {
        if (host === p || host.endsWith('.' + p)) return true;
      }
    }
    return false;
  },

  isElementGenuinelyVisible(el) {
    if (!el || !(el instanceof HTMLElement)) return false;

    // 1. Basic HTML attributes
    if (el.hidden || el.type === 'hidden') return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;

    // 2. Computed styles
    const style = window.getComputedStyle(el);
    if (!style) return false;
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (parseFloat(style.opacity || '1') < 0.05) return false;

    // 3. Dimensions
    const rect = el.getBoundingClientRect();
    if (rect.width < 12 || rect.height < 12) return false;

    // 4. Offscreen decoy trap detection (classic autofill jacking)
    if (rect.right < -50 || rect.bottom < -50) return false;
    const docWidth = window.innerWidth || document.documentElement.clientWidth || 2000;
    const docHeight = window.innerHeight || document.documentElement.clientHeight || 2000;
    if (rect.left > docWidth + 3000) return false;
    if (rect.top > docHeight + 8000) return false;

    // 5. OffsetParent check (null means display:none or not rendered, unless position:fixed)
    if (el.offsetParent === null && style.position !== 'fixed') return false;

    // 6. Parent tree check
    let parent = el.parentElement;
    let depth = 0;
    while (parent && depth < 8) {
      if (parent === document.body || parent === document.documentElement) break;
      const pStyle = window.getComputedStyle(parent);
      if (pStyle.display === 'none' || pStyle.visibility === 'hidden' || parseFloat(pStyle.opacity || '1') < 0.05) {
        return false;
      }
      if (pStyle.overflow === 'hidden') {
        const pRect = parent.getBoundingClientRect();
        if (pRect.width < 10 || pRect.height < 10) return false;
      }
      parent = parent.parentElement;
      depth++;
    }

    return true;
  }
};

root.SECURITY_DEFAULTS = SECURITY_DEFAULTS;
root.SecurityCrypto = SecurityCrypto;
root.SecurityGuards = SecurityGuards;
