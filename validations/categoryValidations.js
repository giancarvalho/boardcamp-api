import { pool } from "../db/pool.js";

async function validateCategory(category) {
    const validation = { isInvalid: false, errorMessage: "", errorCode: null };

    if (!category) {
        validation.isInvalid = true;
        validation.errorMessage = "Category name cannot be empty";
        validation.errorCode = 400;
        return validation;
    }

    const isValidcategory = await pool.query(
        `SELECT * FROM categories WHERE name = $1`,
        [category]
    );

    if (isValidcategory.rows.length > 0) {
        validation.isInvalid = true;
        validation.errorMessage = "Category is already registered.";
        validation.errorCode = 409;
    }

    return validation;
}

export { validateCategory };
