const express = require("express");

const mongoose = require("mongoose");

const path = require("path");

const helmet = require("helmet");

const nocache = require("nocache");

const cookieSession = require("cookie-session");

const rateLimit = require("express-rate-limit");

const mongoSanitize = require("express-mongo-sanitize");

const saucesRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

const app = express();

app.use(express.json());

//Importation package dotenv
require("dotenv").config();
//Connection de l'api au cluster MongoDB
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// securisation des headers de requêtes, 11 middlewares
app.use(helmet());

// désactivation de la mise en cache npm
app.use(nocache());

// sécurisation des cookies
app.use(
  cookieSession({
    keys: [process.env.COOKIE_KEY1, process.env.COOKIE_KEY2],
    cookie: {
      secure: true,
      httpOnly: true,
      domain: "http://localhost:3000",
      maxAge: 60 * 60 * 1000, // 1 hour in ms
    },
  })
);

//Limitation du nombre de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limite chaque IP à 50 requêtes par windowMs
  message: "Trop de requêtes effectuées, Réessayez dans 15 minutes",
});
// limitation des requêtes sur toutes les routes
app.use(limiter);

// expres-mongo-sanitize pour pour empêcher l'injection d'opérateur MongoDB.
app.use(mongoSanitize());

app.use("/images", express.static(path.join(__dirname, "images"))); 

app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
