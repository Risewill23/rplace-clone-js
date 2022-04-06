const express = require('express')
const Board = require("../Board")
const fs = require("fs")

module.exports = {
	path: 'get_wait_time',
	post: false,
    /** 
     * @param {express.Request} req
     * @param {express.Response} res
	 * @param {Board} board
     */
	async execute(req, res, board) {
        var ratelimittime = await board.GetUserWaitTime(req.socket.remoteAddress)
		res.send({
            time: ratelimittime,
            timeLeft: ratelimittime - new Date().getTime()
        })
	},
};