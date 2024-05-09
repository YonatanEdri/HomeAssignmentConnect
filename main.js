const cfg = require("./config").get();
const express = require("express");
const bodyParser = require('body-parser');
const webserver_port = cfg["webserver"]["port"];
const itemHandler = require("./itemHandler");
const categoryHandler = require("./categoryHandler");
const rateLimit = require('express-rate-limit');
const app = express();

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 100, // Max requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// the API is getting only json body req
app.use(bodyParser.json());

// create/update an item
app.post("/items", async (req,res)=> {
    await itemHandler.createOrUpdateItem(app,req,res);
});

// get category details and all the items related to it
app.get("/category/:id", async (req,res)=> {
    await categoryHandler.getCategoryById(app,req,res);
});

// get all items list
app.get("/items", async (req,res)=> {
    await itemHandler.getItems(app,req,res);
});

// search item or category by input string. or get item details by id
app.get("/item/:query", async (req,res)=> {
    await itemHandler.queryItems(app,req,res);
});

// add new category
app.post("/category", async (req,res)=> {
    await categoryHandler.createCategory(app,req,res);
});


app.listen(webserver_port, () =>
{
    console.log(`Yonatan's REST API is listening on port ${webserver_port}!`);
});


