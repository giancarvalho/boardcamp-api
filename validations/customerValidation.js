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
    const data = customerSchema.validate(customer);

    try {
        if (data.error) {
            validation.isInvalid = true;
            validation.errorMessage = data.error.details[0].message;
            validation.errorCode = 400;

            return validation;
        }

        const isExistentCpf = await pool.query(
            "SELECT * FROM customers WHERE cpf = ($1)",
            [customer.cpf]
        );

        if (isExistentCpf.rows.length > 0) {
            validation.isInvalid = true;
            validation.errorMessage += " This customer is already registered.";
            validation.errorCode = 409;
        }

        return validation;
    } catch (error) {
        validation.isInvalid = true;
        validation.errorMessage = "unknown error";
        validation.errorCode = 500;
        return validation;
    }
}

export { validateCustomer };
