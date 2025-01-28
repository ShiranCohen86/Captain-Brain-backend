const express = require("express");
const cors = require("cors");
const path = require("path");
const expressSession = require("express-session");
const app = express();
const http = require("http").createServer(app);
const logger = require("./services/logger.service");

require('dotenv').config()

const session = expressSession({
    secret: "coding is amazing",
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "public")));
} else {
    const corsOptions = {
        origin: [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:3030"
        ],
        credentials: true,
    };
    app.use(cors(corsOptions));
}

// Express App Config
app.use(express.json());
app.use(session);

const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware");
app.all("*", setupAsyncLocalStorage);


const openAiRoutes = require("./api/openAi/openAi.routes");
app.use("/api/openAi", openAiRoutes);

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get("/**", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3030;
//const port = 3030;
http.listen(port, () => {
    logger.info("Server is running on port: " + port);
});

console.log("The Server Is Up !!!");
