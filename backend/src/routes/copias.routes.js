const express = require('express');
const copiasController = require('../controllers/copias.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(copiasController.listCopias));
router.get('/disponibles', asyncHandler(copiasController.listCopiasDisponibles));
router.post('/', asyncHandler(copiasController.createCopia));
router.patch('/:id/baja', asyncHandler(copiasController.darBajaCopia));

module.exports = router;
