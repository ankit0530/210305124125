// routes/productRoutes.js

const express = require('express');
const { getProducts, getProductById } = require('../controllers/productController');

const router = express.Router();

router.get('/categories/:category/products', getProducts);
router.get('/categories/:category/products/:productId', getProductById);

module.exports = router;
