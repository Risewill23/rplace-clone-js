const express = require('express')
const Board = require("../Board")

module.exports = {
	path: 'get_colors',
	post: false,
    /** 
     * @param {express.Request} req
     * @param {express.Response} res
	 * @param {Board} board
     */
	execute(req, res, board) {
		res.send(require("../colors.json"))
	},
};