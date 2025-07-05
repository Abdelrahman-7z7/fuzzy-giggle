import express from "express";
import fileUpload from "express-fileupload";

import * as productController from '../controller/productController'

const router = express.Router()

router.get('/getProducts', productController.getAllProducts)
router.delete('/deleteProduct/:id', productController.deleteProduct)

router.use(fileUpload())
router.post('/createProduct', productController.createProduct)
router.patch('/updateProduct/:id', productController.updateProduct)

export default router;