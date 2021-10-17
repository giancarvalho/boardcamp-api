import dayjs from "dayjs";
import { pool } from "./pool.js";

async function getGamePrice(id) {
    try {
        const gamePrice = await pool.query(
            `SELECT "pricePerDay" FROM games WHERE id = $1`,
            [id]
        );

        return gamePrice.rows[0].pricePerDay;
    } catch (error) {
        const gamePrice = null;
        return gamePrice;
    }
}

async function getRentalData(id) {
    try {
        const rentalData = await pool.query(
            `SELECT rentals."rentDate", games."pricePerDay" FROM rentals JOIN games ON rentals."gameId"=games.id WHERE rentals.id = $1;
`,
            [id]
        );
        return rentalData.rows[0];
    } catch (error) {
        return null;
    }
}

export { getGamePrice, getRentalData };

getRentalData(3);
