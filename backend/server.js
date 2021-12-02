//importation du package HTTP natif de Node
const http = require("http");

//importation de l'application express
const app = require("./app");

//la fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
//on dit à notre application sur quel port elle doit s'exécuter
//soit la variable d'environnement du port grâce à process.env.PORT : si la plateforme de déploiement
//propose un port par défaut, soit le port 3000
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

//la fonction errorHandler  recherche les différentes erreurs et les gère de manière appropriée
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

//on utilise le package HTTP pour créer un serveur, en passant en fonction notre application express
const server = http.createServer(app);

//la fonction errorHandler est enregistrée dans le server
server.on("error", errorHandler);

//un écouteur d'évènements est également enregistré, consignant le port ou le canal nommé
//sur lequel le serveur s'exécute dans la console.
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

//on configure le serveur pour qu'il écoute avec la constante port déclarée précédemment
server.listen(port);
