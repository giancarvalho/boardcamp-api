import dayjs from "dayjs";
import { pool } from "../db/pool.js";

async function validateRental(rental) {
    const validation = { isInvalid: false, errorCode: null, errorMessage: "" };

    try {
        if (rental.daysRented < 1) {
            validation.isInvalid = true;
            validation.errorCode = 400;
            validation.errorMessage =
                "The number of days for rent has to be greater than 0.";

            return validation;
        }

        const isGame = await pool.query("SELECT * FROM games WHERE id = $1", [
            rental.gameId,
        ]);

        if (isGame.rows.length === 0) {
            validation.isInvalid = true;
            validation.errorCode = 400;
            validation.errorMessage += " Game does not exist.";

            return validation;
        }

        const totalRents = await pool.query(
            `SELECT * FROM rentals WHERE "gameId" = $1`,
            [rental.gameId]
        );

        if (totalRents.rows.length >= isGame.rows[0].stockTotal) {
            validation.isInvalid = true;
            validation.errorCode = 400;
            validation.errorMessage +=
                " This game is out of stock at the moment.";

            return validation;
        }

        const isCustomer = await pool.query(
            "SELECT * FROM customers WHERE id = $1",
            [rental.customerId]
        );

        if (isCustomer.rows.length === 0) {
            validation.isInvalid = true;
            validation.errorCode = 400;
            validation.errorMessage = "Customer does not exist.";

            return validation;
        }

        return validation;
    } catch (error) {
        validation.isInvalid = true;
        validation.errorCode = 500;
        validation.errorMessage += "Unknown error";

        return validation;
    }
}

async function validateReturn(id) {
    const validation = { isInvalid: false, errorCode: null, errorMessage: "" };

    try {
        let isRental = await pool.query("SELECT * FROM rentals WHERE id = $1", [
            id,
        ]);
        isRental = isRental.rows[0];

        if (!isRental) {
            validation.isInvalid = true;
            validation.errorCode = 400;
            validation.errorMessage = "Rental does not exist.";

            return validation;
        }

        if (isRental.returnDate) {
            validation.isInvalid = true;
            validation.errorCode = 400;
            validation.errorMessage = `This rental was finished on ${dayjs(
                isRental.returnDate
            ).format("DD-MM-YYYY")}`;

            return validation;
        }

        return validation;
    } catch (error) {
        console.log(error);
        validation.isInvalid = true;
        validation.errorCode = 500;
        validation.errorMessage = "Unknown error";

        return validation;
    }
}

export { validateRental, validateReturn };
