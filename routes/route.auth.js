/**
 * Slantapp code and properties {www.slantapp.io}
 */
// const {bodyParser} = require('../middleware/middleware.protects');

const express = require('express');
const router = express.Router();
const CoreError = require('./../core/core.error');
const { index } = require('../controller/controller.auth');


/**
 * auth routes
 */
router.get('/in', index);
// router.post('/register', bodyParser, authRegister);
// router.post('/login', bodyParser, authLogin);
// router.post('/biometric', bodyParser, authBiometrics);


/**
 * Export lastly
 */
router.all('/*', (req, res) => {
    throw new CoreError(`route not found ${req.originalUrl} using ${req.method} method`, 404);
})

module.exports = router;