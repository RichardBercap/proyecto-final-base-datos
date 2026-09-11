const express = require('express');
const peliculasController = require('../controllers/peliculas.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(peliculasController.listPeliculas));
router.get('/buscar', asyncHandler(peliculasController.searchPeliculas));
router.get('/:id', asyncHandler(peliculasController.getPelicula));
router.post('/', asyncHandler(peliculasController.createPelicula));
router.put('/:id', asyncHandler(peliculasController.updatePelicula));

module.exports = router;
