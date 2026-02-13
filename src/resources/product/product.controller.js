import { config } from "../../config/config.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import client from "../../redis/redis.js";
import mongoose from "mongoose";
import ProductModel from "./product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = config.NODE_ENV === "production" ? true : false;

class Product {
  static getProducts = async (req, res, next) => {
    try {
      const key = req.path.replace(/^\/+|\/+$/g, "").replace(/\//g, ":");
      console.log("key", key);

      const cachedProducts = await client.get("products");

      if (cachedProducts) {
        const parse = JSON.parse(cachedProducts);
        const productsUrl = parse.categories?.flatMap((category) =>
          category.content.map((item) => {
            return {
              image_url: item.image_url,
              id: item.content_id,
            };
          }),
        );

        console.log(productsUrl);
        return res.status(200).json({
          success: true,
          message: "cached data!!!",
          data: {
            productsUrl: JSON.parse(cachedProducts),
          },
        });
      }
      console.log("no cached!!!");
      const products = await fs.readFile(
        path.resolve(
          __dirname,
          "../../../public/resources/provider/netflix.json",
        ),
      );

      const productsParse = JSON.parse(products);
      const productsUrl = productsParse.categories?.flatMap((category) =>
        category.content.map((item) => {
          return {
            image_url: item.image_url,
            id: item.content_id,
          };
        }),
      );

      console.log(productsParse);

      if (productsParse) {
        await client.set("products", JSON.stringify(productsParse), {
          EX: 120,
        });
      }

      return res.status(200).json({
        success: true,
        message: "unchached data!!!",
        data: {
          productsUrl,
        },
      });
    } catch (err) {
      const error = {
        message: isProduction ? "Failed to get products!!!" : err.message,
        statusCode: err.statusCode || 500,
        stack: isProduction ? undefined : err.stack,
      };

      next(error);
    }
  };

  static getProduct = async (req, res, next) => {
    try {
      const productId = req.params.id;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Product id is required!!!" });
      }

      const product = await ProductModel.findById(productId).lean();
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "NOT FOUND!!!" });
      }
      const cachedProducts = await client.get("products");
      let result = null;
      console.log("cachedProducts",cachedProducts)
      if (cachedProducts) {
        const parse = JSON.parse(cachedProducts);
        console.log(parse)
        for (const category of parse.categories) {
          result = category.content.find(
            (item) => item.content_id === product._id.toString(),
          );
          if (result) break;
        }
      }

      console.log(result)

      const productInfo = {
        ...product,
        ...result,
      };

      console.log("productInfo", productInfo);

      return res.status(200).json({
        success: true,
        message: "Product Found!",
        data: {
          product: productInfo,
        },
      });
    } catch (err) {
      const error = {
        message: isProduction ? "Failed to get product!!!" : err.message,
        statusCode: err.statusCode || 500,
        stack: isProduction ? undefined : err.stack,
      };

      next(error);
    }
  };
}

export default Product;
