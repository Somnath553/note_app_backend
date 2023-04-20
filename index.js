const connectToMongoose =require('./db');
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require("dotenv")
dotenv.config()
app.use(cors())
const port = process.env.PORT||8000;
connectToMongoose();
app.use(express.json());
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));
app.listen(port, () => {
  console.log(`Example app listening on port ${port} and http://localhost:${port}`)
})

