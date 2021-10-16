import joi from "joi";
import { pool } from "../db/pool.js";

const gameSchema = joi.object({
    name: joi.string().min(2).required(),
    stockTotal: joi.number().integer().min(1).required(),
    pricePerDay: joi.number().integer().min(1).required(),
    image: joi.string().uri().required(),
    categoryId: joi.number().min(1).required(),
});

async function validateGame(game) {
    const validation = { isInvalid: false, errorMessage: "", errorCode: null };
    const invalid = gameSchema.validate(game);

    try {
        if (invalid.error) {
            validation.isInvalid = true;
            validation.errorMessage += invalid.error.details[0].message + ";";
            validation.errorCode = 400;
        }

        const isValidCategory = await pool.query(
            "SELECT * FROM categories WHERE id = ($1)",
            [game.categoryId]
        );

        if (isValidCategory.rows.length === 0) {
            validation.isInvalid = true;
            validation.errorMessage +=
                " Category doesn't exist. Please, select an existing category;";
            validation.errorCode = 400;
        }

        const isValidGame = await pool.query(
            "SELECT * FROM games WHERE name = ($1)",
            [game.name]
        );

        if (isValidGame.rows.length > 0) {
            validation.isInvalid = true;
            validation.errorMessage += " This game is already registered.";
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

export { gameSchema, validateGame };
