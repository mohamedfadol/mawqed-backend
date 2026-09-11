function toBigInt(id) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

function isDecimalLike(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.toString === 'function' &&
    Array.isArray(value.d) &&
    value.s !== undefined &&
    value.e !== undefined
  );
}

function serializeBigInt(value) {
  if (typeof value === 'bigint') return value.toString();

  if (isDecimalLike(value)) return value.toString();

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.map(serializeBigInt);
  }

  if (value && typeof value === 'object') {
    const data = {};

    for (const key of Object.keys(value)) {
      data[key] = serializeBigInt(value[key]);
    }

    return data;
  }

  return value;
}

module.exports = {
  toBigInt,
  serializeBigInt,
};