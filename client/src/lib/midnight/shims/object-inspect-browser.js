function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function inspect(value) {
  if (typeof value === 'string') return JSON.stringify(value);
  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'undefined'
  ) {
    return String(value);
  }

  return safeStringify(value);
}
