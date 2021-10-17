import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import { validateGame } from "./validations/gameValidations.js";
import { validateCategory } from "./validations/categoryValidations.js";
import { validateCustomer } from "./validations/customerValidation.js";
import { validateRental } from "./validations/rentalValidation.js";
import { getGamePrice } from "./db/rentals.js";
import dayjs from "dayjs";

const PORT = 4000;
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

app.post("/customers", async (req, res) => {
    const customer = req.body;
    const validation = await validateCustomer(customer);

    try {
        if (validation.isInvalid) {
            throw validation.errorCode;
        }

        const { name, phone, cpf, birthday } = customer;

        pool.query(
            "INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)",
            [name, phone, cpf, birthday]
        );

        res.sendStatus(201);
    } catch (error) {
        if (validation.isInvalid) {
            return res.status(error).send(validation.errorMessage);
        }
        res.sendStatus(500);
    }
});

app.get("/customers", async (req, res) => {
    const cpf = req.query.cpf ? req.query.cpf + "%" : "%";

    try {
        const result = await pool.query(
            "SELECT * FROM customers WHERE cpf LIKE ($1);",
            [cpf]
        );

        res.send(result.rows);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get("/customers/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const customerFound = await pool.query(
            "SELECT * FROM customers WHERE id = $1",
            [id]
        );

        res.send(customerFound.rows);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.put("/customers/:id", async (req, res) => {
    const customer = req.body;
    const id = req.params.id;
    const validation = await validateCustomer(customer, true, id);

    try {
        if (validation.isInvalid) {
            throw validation.errorCode;
        }

        const { name, phone, cpf, birthday } = customer;
        await pool.query(
            "UPDATE customers SET name=$2, phone=$3, cpf=$4, birthday=$5 WHERE id = $1;",
            [id, name, phone, cpf, birthday]
        );

        res.status(200).send("Updated.");
    } catch (error) {
        if (validation.isInvalid) {
            return res.status(error).send(validation.errorMessage);
        }
        res.sendStatus(500);
    }
});

app.post("/rentals", async (req, res) => {
    const rental = req.body;
    const validation = await validateRental(rental);

    try {
        if (validation.isInvalid) {
            throw validation.errorCode;
        }

        const { customerId, gameId, daysRented } = rental;
        const gamePrice = (await getGamePrice(gameId)) * daysRented;
        const rentDate = dayjs().format("YYYY-MM-DD");
        await pool.query(
            `INSERT INTO rentals ("customerId", "gameId", "daysRented", "originalPrice", "returnDate", "delayFee", "rentDate" ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [customerId, gameId, daysRented, gamePrice, null, null, rentDate]
        );

        res.sendStatus(201);
    } catch (error) {
        if (validation.isInvalid) {
            return res.status(error).send(validation.errorMessage);
        }
        res.sendStatus(500);
    }
});

app.get("/rentals", async (req, res) => {
    try {
        const results = await pool.query("SELECT * FROM rentals;");

        res.send(results.rows);
    } catch (error) {
        console.log(error);

        res.sendStatus(500);
    }
});

app.listen(PORT);
