import express from "express";
import pg from "pg";
import cors from "cors";

const port = 4000;
const { Pool } = pg;

const app = express();
app.use(cors());

const connection = new Pool({
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

        await connection.query("INSERT INTO categories (name) VALUES ($1)", [
            name,
        ]);

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
        const result = await connection.query("SELECT * FROM categories");

        res.send(result.rows);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.listen(port);
