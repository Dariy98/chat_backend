const Joi = require("joi");

//проверить на isAdmin?
//доделать
const schema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),

  nickname: Joi.string()
    .alphanum()
    .min(3)
    .max(15)
    .required()
    .pattern(new RegExp("^[^%/&?,';:!-+!@#$^*)(]$")),

  isAdmin: Joi.boolean(),

  access_token: [Joi.string(), Joi.number()],
})
  .with("nickname", "birth_year")
  .xor("password", "access_token")
  .with("password", "repeat_password");
