const express = require('express')
const apiRoutes = require('./routes/index.js');
const { ServerConfig, Logger, Queue } = require('./config/index.js');
const { GlobalMiddlware } = require('./middlewares/index.js');
const CRON = require('./utils/comman/cron-jobs.js');


const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(GlobalMiddlware.reqUserMiddleware)
app.use("/api", apiRoutes)

app.listen(ServerConfig.PORT, async () => {
    console.log(`Server is running on PORT : ${ServerConfig.PORT}`)
    Logger.info("Succesfully started the server")
    await Queue.connectQueue();
    console.log("queue connected");
    CRON();
})

