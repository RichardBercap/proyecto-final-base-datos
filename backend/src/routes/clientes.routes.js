const express = require('express');
const clientesController = require('../controllers/clientes.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(clientesController.listClientes));
router.get('/:id', asyncHandler(clientesController.getCliente));
router.post('/', asyncHandler(clientesController.createCliente));
router.put('/:id', asyncHandler(clientesController.updateCliente));
router.patch('/:id/bloquear', asyncHandler(clientesController.bloquearCliente));
router.patch('/:id/desbloquear', asyncHandler(clientesController.desbloquearCliente));

module.exports = router;
