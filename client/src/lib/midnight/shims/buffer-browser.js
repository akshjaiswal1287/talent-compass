const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

function normalizeHex(value) {
  const hex = value.startsWith('0x') ? value.slice(2) : value;
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string length.');
  }
  return hex;
}

function fromHex(value) {
  const hex = normalizeHex(value);
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

function toHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function fromValue(value, encoding) {
  if (value instanceof BrowserBuffer) return new BrowserBuffer(value);
  if (value instanceof Uint8Array) return new BrowserBuffer(value);
  if (ArrayBuffer.isView(value)) {
    return new BrowserBuffer(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  }
  if (value instanceof ArrayBuffer) return new BrowserBuffer(value);
  if (Array.isArray(value)) return new BrowserBuffer(Uint8Array.from(value));
  if (typeof value === 'number') return new BrowserBuffer(value);
  if (typeof value === 'string') {
    const mode = encoding ?? 'utf8';
    if (mode === 'hex') return new BrowserBuffer(fromHex(value));
    if (mode === 'base64') return new BrowserBuffer(fromBase64(value));
    if (mode === 'latin1' || mode === 'binary' || mode === 'ascii') {
      return new BrowserBuffer(Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff));
    }
    return new BrowserBuffer(textEncoder.encode(value));
  }
  throw new TypeError('Unsupported Buffer.from input.');
}

class BrowserBuffer extends Uint8Array {
  static from(value, encoding) {
    return fromValue(value, encoding);
  }

  static alloc(size, fill = 0) {
    const bytes = new BrowserBuffer(size);
    bytes.fill(fill);
    return bytes;
  }

  static allocUnsafe(size) {
    return new BrowserBuffer(size);
  }

  static isBuffer(value) {
    return value instanceof BrowserBuffer;
  }

  static byteLength(value, encoding) {
    if (typeof value !== 'string') {
      return value?.byteLength ?? value?.length ?? 0;
    }
    return BrowserBuffer.from(value, encoding).byteLength;
  }

  toString(encoding = 'utf8') {
    if (encoding === 'hex') return toHex(this);
    if (encoding === 'base64') return toBase64(this);
    if (encoding === 'latin1' || encoding === 'binary' || encoding === 'ascii') {
      return Array.from(this, (byte) => String.fromCharCode(byte)).join('');
    }
    return textDecoder.decode(this);
  }
}

export const Buffer = BrowserBuffer;
export default { Buffer };
