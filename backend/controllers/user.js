/*************************Controllers d'authentification utilisateur********************/

//Importation du package de cryptage des mots de passe bcrypt
const bcrypt = require("bcrypt");

//Importation du package jsonwebtoken pour créer et vérifier les tokens d'authentification
const jwt = require("jsonwebtoken");

//Importation du modèle utilisateur
const User = require("../models/User");

//Middleware qui va contrôler l'inscription utilisateur et l'enregistrer dans la base de données
exports.signup = (req, res, next) => {
  //hachage du mot de passe utilisateur avec la fonction asynchrone hash() de bcrypt
  //On lui passe en argument le mot de passe du corps de la requête
  //et le salt : on execute 10 fois l'algorithme de hachage pour avoir un mot de passe sécurisé
  bcrypt
    .hash(req.body.password, 10)
    //si la requête de signup aboutie, on récupère le hash du mot de passe et on crée l'utilisateur
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      //on enregistre l'utisateur crée dans la base de données
      user
        .save()
        // si cela a abouti on retourne dans la réponse un code 201 et un message
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        // si cela n'a pas abouti on retourne un code 400 et l'erreur.
        .catch((error) => res.status(400).json({ error }));
    })
    //si la requête du signup n'aboutie pas, on retourne un code 500(erreur server) et l'erreur
    .catch((error) => res.status(500).json({ error }));
};

//Middleware qui va contrôler le login de l'utilisateur
exports.login = (req, res, next) => {
  //On utilise notre modèle Mongoose User avec la méthode findone (fonction asynchrone)
  //pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données
  User.findOne({ email: req.body.email })
    .then((user) => {
      //Si ce n'est pas le cas, on renvoie une erreur 401 Unauthorized et un message d'erreur
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      //Si c'est le cas, nous utilisons la fonction (asynchrone) compare de bcrypt
      //pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          //s'ils ne correspondent pas, si ce n'est pas valid
          //on renvoie une erreur 401 Unauthorized et un message « Mot de passe incorrect ! »
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          //s'ils correspondent, les informations d'identification de notre utilisateur sont valid
          //on renvoie une réponse 200 contenant l'ID utilisateur et un token
          res.status(200).json({
            userId: user._id,
            //on utilise la fonction sign de jsonwebtoken pour encoder un nouveau token
            token: jwt.sign(
              //ce token contient l'ID de l'utilisateur en tant que payload (données encodées dans le token)
              { userId: user._id },
              //on utilise une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour encoder notre token
              "RANDOM_TOKEN_SECRET",
              //on défini la durée de validité du token à 24 heures. L'utilisateur devra se reconnecter au bout de 24 heures
              { expiresIn: "24h" }
            ),
          });
        })
        //Si problème de connection à la base de données
        .catch((error) => res.status(500).json({ error }));
    })
    //si problème de connection
    .catch((error) => res.status(500).json({ error }));
};