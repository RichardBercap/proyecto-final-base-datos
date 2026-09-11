const express = require('express');
const prestamosController = require('../controllers/prestamos.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(prestamosController.listPrestamos));
router.get('/:id', asyncHandler(prestamosController.getPrestamo));
router.post('/', asyncHandler(prestamosController.createPrestamo));
router.patch('/:id/devolver', asyncHandler(prestamosController.devolverPrestamo));

module.exports = router;
