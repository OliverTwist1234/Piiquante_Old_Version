const Sauce = require("../models/Sauce"); // import du modèle Sauce
const fs = require("fs"); // file system, package qui permet de modifier et/ou supprimer des fichiers

exports.getAllSauces = (req, res, next) => {
  // on récupère toutes les sauces
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
