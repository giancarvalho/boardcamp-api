import express from "express";
import cors from "cors";
import { validateGame } from "./validations/gameValidations.js";
import { pool } from "./db/pool.js";
import { validateCategory } from "./validations/categoryValidations.js";

const port = 4000;

const app = express();
app.use(cors());

app.use(express.json());

app.post("/categories", async (req, res) => {
    const category = req.body;
    const name = category.name.toLowerCase();
    const validation = await validateCategory(name);

    try {
        if (validation.isInvalid) {
            throw validation.errorCode;
        }

        await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);

        return res.sendStatus(201);
    } catch (error) {
        if (validation.isInvalid) {
            return res.status(error).send(validation.errorMessage);
        }

        res.sendStatus(500);
    }
});

app.get("/categories", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories");

        res.send(result.rows);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/games", async (req, res) => {
    const game = req.body;
    const validation = await validateGame(game);

    try {
        if (validation.isInvalid) {
            throw validation.errorCode;
        }

        const { name, image, stockTotal, categoryId, pricePerDay } = game;

        await pool.query(
            `INSERT INTO games (name,
            image,
            "stockTotal",
            "categoryId",
            "pricePerDay") VALUES ($1, $2, $3, $4, $5)`,
            [name, image, stockTotal, categoryId, pricePerDay]
        );

        res.sendStatus(201);
    } catch (error) {
        if (validation.isInvalid) {
            return res.status(error).send(validation.errorMessage);
        }

        res.sendStatus(500);
    }
});

app.get("/games", async (req, res) => {
    const name = req.query.name ? `%${req.query.name}%` : "%";

    try {
        const result = await pool.query(
            `SELECT games.*, categories.name AS "categoryName" 
            FROM games 
            JOIN categories 
            ON games."categoryId"=categories.id
            WHERE games.name iLIKE ($1);`,
            [name]
        );

        res.send(result.rows);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.listen(port);
