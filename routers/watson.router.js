const express = require('express');
const multer = require('multer');
const controller = require('../controllers/watson.controller');

const router = express.Router();
const storage = multer.memoryStorage()

const upload = multer({
    storage: storage
}).single('img');

router.route('/watson')
    .get(controller.getWatson)
    .post(upload, controller.postWatson)

module.exports = router;