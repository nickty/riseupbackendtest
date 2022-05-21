const { default: Ajv } = require('ajv');

/**
 * @template T
 * @typedef {import('json-schema-to-ts').FromSchema<T>} FromSchema
 */

/**
 * @template {import('ajv').Schema} S
 * @template [P=import('express-serve-static-core').ParamsDictionary]
 * @template [ResBody=any]
 * @template [ReqQuery=any]
 * @param {S} jsonSchema
 * @param {(...args: Parameters<import('express').RequestHandler<P, ResBody, FromSchema<S>, ReqQuery>>)  => void | Promise<void>} handler
 * @returns {import('express').RequestHandler<P, ResBody, FromSchema<S>, ReqQuery>}
 */
function validateBody(jsonSchema, handler) {
  const ajv = new Ajv();
  /**
   * @type {import('ajv').ValidateFunction<{ body: FromSchema<S> }>}
   */
  const validate = ajv.compile({
    type: 'object',
    properties: {
      body: jsonSchema,
    },
  });
  return (req, res, next) => {
    if (validate(req)) {
      Promise.resolve(handler(req, res, next)).catch(next);
    } else {
      const message =
        validate.errors && validate.errors[0]
          ? validate.errors[0].message
          : 'validation failed';
      const error = new Error(message);
      throw error;
    }
  };
}

module.exports = validateBody;
