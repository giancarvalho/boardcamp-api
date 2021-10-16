import { pool } from "../db/pool.js";
import Joi from "joi";

const customerSchema = Joi.object({
    cpf: Joi.string()
        .pattern(/^[0-9]+$/)
        .length(11)
        .required(),
    phone: Joi.string()
        .length(11)
        .pattern(/^[0-9]+$/)
        .required(),
    name: Joi.string().min(2).required(),
    birthday: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
        .required(),
});

async function validateCustomer(customer) {
    const validation = { isInvalid: false, errorCode: null, errorMessage: "" };
    const validData = customerSchema.validate(customer);

    console.log(validData);
}

export { validateCustomer };
