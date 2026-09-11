const express = require('express');
const configuracionesController = require('../controllers/configuraciones.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/activa', asyncHandler(configuracionesController.getConfiguracionActiva));
router.post('/', asyncHandler(configuracionesController.createConfiguracion));

module.exports = router;
