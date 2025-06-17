const express = require('express')
const app = express();
const path = require('path')
const cors = require('cors')
const routes = require('./config/allRoutes')
const userClient = require('./models/users')


app.use(express.json());
app.use(express.static(path.join(__dirname, 'assets')))
app.use(express.urlencoded({ extended : true }))
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow required methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow required headers
}));

app.get("/all", async (req, res) => {
    const user = await userClient.find()
    res.status(200).json(user)
})

app.use(routes)


const port = process.env.PORT || 8080
app.listen(port, ()=>{
    console.log(`Server is running on : ${port}`)
})