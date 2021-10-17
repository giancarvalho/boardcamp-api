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

getGamePrice(8);

export { getGamePrice };
