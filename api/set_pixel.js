const express = require('express')
const Board = require("../Board")
const colors = require("../colors.json")
module.exports = {
	path: 'set_pixel',
	post:true,
    /** 
     * @param {express.Request} req
     * @param {express.Response} res
	 * @param {Board} board
     */
	async execute(req, res, board) {
		if(req.body != null)
			if(req.body.x != null, req.body.y != null, req.body.color != null)
				if(Number(req.body.x) <= board.size_x, Number(req.body.y) <= board.size_y)
					if(Object.keys(colors).some((v) => {return v == req.body.color})){
						if(await board.GetUserWaitTime(req.socket.remoteAddress) < 1){
							var rgb = board.HexToRgb(req.body.color)
							res.send("OK")
							board.SetPixel(Number(req.body.x), Number(req.body.y), rgb.r, rgb.g, rgb.b, 1)
							board.SetUserWaitTime(req.socket.remoteAddress, 0 * 60 * 1000)
						} else{
							res.status(429).send("Rate limited")
						}
					}
					else 
						console.log(4)
				else 
					console.log(3)
			else 
				console.log(2)
		else 
			console.log(1)

		
	},
};