const Joi = require("joi");

exports.questionSchema = Joi.object({
  question: Joi.string().required(),
  options: Joi.array().items(Joi.string()).required(),
  correct_answer: Joi.string().required()
});