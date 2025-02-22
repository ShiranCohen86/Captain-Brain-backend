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
    //proxy: true,|| process.env.NODE_ENV === "production"
    cookie: {
        secure:  process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "public")));
} else {
    const corsOptions = {
        origin: [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:3030",
        ],
        credentials: true,
    };
    app.use(cors(corsOptions));
}

// Express App Config
app.use(express.json());
app.use(session);

const authRoutes = require('./api/auth/auth.routes')
const openAiRoutes = require("./api/openAi/openAi.routes");
const userRoutes = require('./api/user/user.routes')

const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware");
app.all("*", setupAsyncLocalStorage);

app.get('/api/setup-session', (req, res) =>{
    req.session.connectedAt = Date.now()
    console.log('setup-session:', req.sessionID);
    res.end()
})

app.use('/api/auth', authRoutes)
app.use("/api/openAi", openAiRoutes);
app.use('/api/user', userRoutes)

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
