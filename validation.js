const Joi = require("joi");

const schema = Joi.object({
  nickname: Joi.string()
    .alphanum()
    .min(3)
    .max(15)
    .pattern(new RegExp("^[^%/&?,';:!-+!@#$^*)(]{3,15}$")),

  password: Joi.string().alphanum().min(6).max(16),

  isAdmin: Joi.boolean(),

  isBane: Joi.boolean(),

  isMute: Joi.boolean(),

  color: Joi.string(),

  access_token: [Joi.string(), Joi.number()],
});

module.exports = schema;
