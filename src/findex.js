const express = require("express");
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");
const { signup, login } = require('../services/userController'); // Import userController

const app = express();
const templatePath = path.join(__dirname, '../templates');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", templatePath);

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", signup); // Use the signup function from userController
app.post("/login", login); // Use the login function from userController

app.get("/home", (req, res) => {
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;

    res.render("home", { firstName, lastName });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
