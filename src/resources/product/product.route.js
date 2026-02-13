import express from "express";
import Product from "./product.controller.js";

const productRouters = express.Router();


productRouters.get("/",Product.getProducts);
productRouters.get("/:id",Product.getProduct);


export default productRouters;