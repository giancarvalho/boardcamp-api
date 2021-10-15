import joi from "joi";

const gameSchema = joi.object({
    name: joi.string().min(2).required(),
    stockTotal: joi.number().integer().min(1).required(),
    pricePerDay: joi.number().integer().min(1).required(),
    image: joi.string().uri().required(),
    categoryId: joi.number().min(1).required(),
});

export { gameSchema };
