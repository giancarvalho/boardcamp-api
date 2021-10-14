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

app.post("/categories", (req, res) => {
    const category = req.body;
    const name = category.name.toLowerCase();

    connection
        .query("INSERT INTO categories (name) VALUES ($1)", [name])
        .then(() => {
            res.sendStatus(201);
        })
        .catch(() => {
            res.sendStatus(409);
        });
});

app.get("/categories", (req, res) => {
    connection.query("SELECT * FROM categories").then((response) => {
        res.send(response.rows);
    });
});

app.listen(port);
