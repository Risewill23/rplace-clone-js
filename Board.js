const { createCanvas, loadImage } = require('canvas')
const fs = require("fs")
const colors = require("./colors.json")
const config = require("./config.json")

//Utils
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

class Board {
    constructor(options = {}) {
        this.size_x = options.size_x || 50;
        this.size_y = options.size_y || 50
        this.canvas = createCanvas(this.size_x, this.size_y)

        this.ctx = this.canvas.getContext('2d')

        this.ClearBoard()

        setInterval(() => {
            const image = this.canvas.toBuffer()
            fs.writeFileSync("./data/image.png", image)
        }, 
        (
        //I hope no one even wants to try setting it below 1
        Number((config["image_save_speed"] ? config["image_save_speed"] >= 1 : 5))
        || 5) * 1000)
        this.UpdateImageFromSave()
    }

    async UpdateImageFromSave() {
        if (fs.existsSync("./data/image.png")) {
            const imageoldfile = await fs.readFileSync("./data/image.png")
            const imageold = await loadImage(imageoldfile)
            if (this.canvas.height >= imageold.height && this.canvas.width >= imageold.width) {
                this.ctx.drawImage(imageold, 0, 0)
            }
            else {
                if (!fs.existsSync("./data/old")) {
                    await fs.mkdirSync("./data/old")
                }
                fs.writeFileSync(`./data/old/image-${new Date().getTime()}.png`, imageoldfile)
            }
        }
    }
    GetImage() {
        return this.canvas.toBuffer()
    }

    CheckColorValid(hex) {
        if(Object.keys(colors).some((v) => {return v == String(hex)})){
            return true
        } else {
            return false
        }
    }

    async SetUserWaitTime(user, time){
        var usersjson = {}
        var fileexists = await fs.existsSync("./users.json")
        if(fileexists)
            usersjson = JSON.parse(await fs.readFileSync("./users.json"))
        usersjson[String(user)] = ((time || (Number(config["rate_limit_time"]) || 5 * 1000)) + new Date().getTime())
        fs.writeFileSync("./users.json", JSON.stringify(usersjson))
    }

    async GetUserWaitTime(user) {
        if(await !fs.existsSync("./users.json"))
            return -1
        else {
            var usersjson = JSON.parse(await fs.readFileSync("./users.json"))
            var time = (Number(usersjson[String(user)]) - new Date().getTime() ) > 1 ? Number(usersjson[String(user)]) : -1
            return time
        }
    }

    HexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    ClearBoard() {
        this.ctx.fillStyle = "rgba(255,255,255,1)"
        this.ctx.lineWidth = 1
        this.ctx.fillRect(0, 0, this.size_x, this.size_y)
    }

    SetPixel(x, y, r = 255, g = 255, b = 255, a = 1) {
        this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`
        this.ctx.lineWidth = 1
        this.ctx.fillRect(x - 1, y - 1, 1, 1)
    }
}

module.exports = Board