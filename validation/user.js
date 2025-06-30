const Joi = require('joi');

module.exports.registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(), // or use regex for phone
    password: Joi.string().min(6).required()
});

module.exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});
