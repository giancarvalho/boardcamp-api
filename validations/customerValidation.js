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

async function validateCustomer(customer, isUpdate, id) {
    const validation = { isInvalid: false, errorCode: null, errorMessage: "" };
    const data = customerSchema.validate(customer);
    const search = isUpdate ? `id` : `cpf`;
    const customerVariable = isUpdate ? id : customer.cpf;

    try {
        if (data.error) {
            validation.isInvalid = true;
            validation.errorMessage = data.error.details[0].message;
            validation.errorCode = 400;

            return validation;
        }

        const searchCustomer = await pool.query(
            `SELECT * FROM customers WHERE ${search} = $1`,
            [customerVariable]
        );

        if (searchCustomer.rows.length === 0 && isUpdate) {
            validation.isInvalid = true;
            validation.errorMessage +=
                " You can't update a customer that is not registered.";
            validation.errorCode = 400;
            return validation;
        }

        if (searchCustomer.rows.length > 0 && !isUpdate) {
            validation.isInvalid = true;
            validation.errorMessage += " This customer is already registered.";
            validation.errorCode = 409;
            return validation;
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
