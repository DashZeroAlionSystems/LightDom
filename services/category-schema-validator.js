import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  $data: true,
  allowUnionTypes: true,
});

const compiledCache = new Map();

function getSchemaKey(categoryId, schema) {
  return `${categoryId || 'global'}:${JSON.stringify(schema)}`;
}

function ensureCompiled(categoryId, schema) {
  const targetSchema = schema?.schema && typeof schema.schema === 'object' ? schema.schema : schema;
  if (!targetSchema || typeof targetSchema !== 'object') {
    throw new Error('Schema definition must be an object');
  }

  const cacheKey = getSchemaKey(categoryId, targetSchema);
  if (!compiledCache.has(cacheKey)) {
    const validator = ajv.compile(targetSchema);
    compiledCache.set(cacheKey, validator);
  }

  return compiledCache.get(cacheKey);
}

export function validateSchemaDefinition(schemaDefinition, { categoryId } = {}) {
  if (!schemaDefinition || (Array.isArray(schemaDefinition) && !schemaDefinition.length)) {
    return { valid: true };
  }

  const definitions = Array.isArray(schemaDefinition) ? schemaDefinition : [schemaDefinition];
  try {
    for (const schema of definitions) {
      ensureCompiled(categoryId, schema);
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      details: error.errors || [],
    };
  }
}

export function validatePayload(schemaDefinition, payload, { categoryId } = {}) {
  if (!schemaDefinition) {
    return { valid: true };
  }

  const definitions = Array.isArray(schemaDefinition) ? schemaDefinition : [schemaDefinition];
  const schema = definitions[0];

  try {
    const validator = ensureCompiled(categoryId, schema);
    const isValid = validator(payload);
    return {
      valid: isValid,
      error: isValid ? null : 'Payload does not satisfy configured schema.',
      details: validator.errors || [],
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      details: error.errors || [],
    };
  }
}

export default {
  validateSchemaDefinition,
  validatePayload,
};
