//importation du package express
const express = require("express");

//importation du package mangoose
const mongoose = require("mongoose");

//importation de path (natif de node) qui donne accès aux chemins du système de fichier
const path = require("path");

//Importation du package helmet pour sécuriser les en-têtes de requêtes HTTP
const helmet = require("helmet");

//Importation du package nocache pour désactiver la mise en cache npm
const nocache = require("nocache");

//Importation du package cookie-session pour sécuriser les cookies
const cookieSession = require("cookie-session");

//Importation du package express-rate-limit pour limiter le nombre de requêtes par IP utilisateur
const rateLimit = require("express-rate-limit");

//Importation du package express-mongo-sanitize pour empêcher l'injection d'opérateur MongoDB
const mongoSanitize = require("express-mongo-sanitize");

//importation du routeur des sauces
const saucesRoutes = require("./routes/sauce");
//importation du routeur d'authentification utilisateur
const userRoutes = require("./routes/user");

//on crée notre aplication express
const app = express();

//middleware global capable d'extraire l'objet JSON des requêtes POST provenants de l'application front-end
//va transformer le corps de la requête en objet JS utilisable
app.use(express.json());

//Importation package dotenv pour accéder aux variables d'environnement
require("dotenv").config();
//Connection de l'api au cluster MongoDB
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//Gestion des erreurs de CORS, pour permettre au serveurs front et back de communiquer
//Ajout d'un middleware qui permet d'ajouter des headers aux réponses de requêtes
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
      maxAge: 60 * 60 * 1000, // 1 heure en ms
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

// expres-mongo-sanitize pour empêcher l'injection d'opérateur MongoDB
app.use(mongoSanitize());

//On indique à Express qu'il faut gérer la ressource images de manière statique
app.use("/images", express.static(path.join(__dirname, "images")));

//on enregistre le routeur des sauces
app.use("/api/sauces", saucesRoutes);
//on enregistre le routeur d'authentification utilisateur
app.use("/api/auth", userRoutes);

//on exporte notre application pour pouvoir s'en servir dans les autres fichiers
//notamment notre server node
module.exports = app;
