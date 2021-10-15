import express from "express";
import pg from "pg";
import cors from "cors";
import { gameSchema } from "./validations/gameValidations.js";
import Joi from "joi";

const port = 4000;
const { Pool } = pg;

const app = express();
app.use(cors());

const pool = new Pool({
    user: "bootcamp_role",
    password: "senha_super_hiper_ultra_secreta_do_role_do_bootcamp",
    host: "localhost",
    port: 5432,
    database: "boardcamp",
});

app.use(express.json());

app.post("/categories", async (req, res) => {
    const category = req.body;
    const name = category.name.toLowerCase();

    try {
        if (!name) {
            throw "empty";
        }

        await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);

        return res.sendStatus(201);
    } catch (error) {
        if (error === "empty") {
            return res.status(400).send("name cannot be empty");
        }

        if (error.code == 23505) {
            return res.sendStatus(409);
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
    try {
        const game = req.body;
        const invalid = gameSchema.validate(game);

        if (invalid.error) {
            throw "invalid";
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
        if (error.code == 23505) {
            return res.sendStatus(409);
        }

        res.sendStatus(500);
    }
});

app.get("/games", async (req, res) => {
    const name = req.query.name ? `%${req.query.name}%` : "%";

    try {
        let result = await pool.query(
            `SELECT * FROM games WHERE name iLIKE ($1)`,
            [name]
        );

        // result.rows.forEach(async (game) => {
        //     const category = await pool.query(
        //         `SELECT name FROM categories WHERE id = ($1)`,
        //         [game.categoryId]
        //     );
        //     game.categoryName = category.rows[0].name;
        // });

        res.send(result.rows);
    } catch (error) {
        console.log(error);

        res.sendStatus(500);
    }
});

app.listen(port);
