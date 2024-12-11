const Joi = require('joi')
// register validation
const registerValidation = (data)=>{
    const schemaValidation = Joi.object({
        username: Joi.string().min(3).max(256).required(),
        email: Joi.string().min(6).max(256).required().email(),
        password: Joi.string().min(6).max(1024).required()
    })
    return schemaValidation.validate(data)
}

// login validation
const loginValidation = (data)=>{
    const schemaValidation = Joi.object({
        email: Joi.string().min(6).max(256).required().email(),
        password: Joi.string().min(6).max(1024).required()
    })
    return schemaValidation.validate(data)
}



// Post creation validation
const postValidation = (data) => {
    const schemaValidation = Joi.object({
        title: Joi.string().min(3).max(256).required(),
        topics: Joi.array().items(Joi.string().length(24)).min(1).required(), // Ensure at least one valid topic ID
        message: Joi.string().min(3).required()
    });
    return schemaValidation.validate(data);
};

// Comment creation validation
const commentValidation = (data) => {
    const schemaValidation = Joi.object({
        message: Joi.string().min(1).required()
    });
    return schemaValidation.validate(data);
};

module.exports.postValidation = postValidation;
module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.commentValidation = commentValidation;