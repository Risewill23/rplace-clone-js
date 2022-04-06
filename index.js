const express = require('express')
const app = express()
const port = 8080
const config = require("./config.json")
const Webs = require("ws")
const fs = require("fs")
const Board = require("./Board")
app.use(express.static('client'))
var bodyParser = require('body-parser')

const apiFiles = fs.readdirSync('./api').filter(file => file.endsWith('.js'));
const board = new Board()
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

class UpdateVars {
    constructor() {
        this.update_image_needed = false
    }
}

const globalvars = new UpdateVars()

if(!fs.existsSync("./data")){
    fs.mkdirSync("./data")
}

for (const file of apiFiles) {
    const apievent = require(`./api/${file}`);
    if (apievent.ws) {

    }
    else if (apievent.post) {
        app.post("/api/" + apievent.path, urlencodedParser, (req, res) => { apievent.execute(req, res, board) })
    } else {
        app.get("/api/" + apievent.path, jsonParser, (req, res) => { apievent.execute(req, res, board) })
    }
}

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

var server = require("http").createServer(app)
const wss = new Webs.Server({ server: server, path: "/api/ws" });
var wslist = {}
var wsidcount = 0;
wss.on('connection', function (ws, request) {
    wsidcount++;
    const wsid = wsidcount
    wslist[`${wsid}`] = ws
    ws.on('message', function (message) {
        //
        // Here we can now use session parameters.
        //
        console.log(`Received message ${message} from ` + wsid);
        console.log(Object.keys(wslist))
    });

    ws.on('close', function () {
        delete wslist[`${wsid}`]
    });
});




//app.listen(port, () => {
//    console.log(`Running on http://localhost:${port}`)
//})
server.listen(port, () => {
    console.log(`Running on http://localhost:${port}`)
})

