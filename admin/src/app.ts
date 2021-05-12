import express from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import "reflect-metadata";
import { Product } from "./entity/product";

createConnection().then((db) => {
  const productRepo = db.getRepository(Product);
  const app = express();

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:4200",
      ],
    })
  );

  app.use(express.json());

  app.get("/api/products", async (_, res) => {
    const products = await productRepo.find();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = await productRepo.create(req.body);
    const result = await productRepo.save(product);
    return res.send(result);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await productRepo.findOne(req.params.id);
    res.send(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    const product = await productRepo.findOne(req.params.id);
    if (!product) return res.send({ error: "not found" });
    productRepo.merge(product, req.body);
    const result = await productRepo.save(product);
    return res.send(result);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const result = await productRepo.delete(req.params.id);
    return res.send(result);
  });

  app.post("/api/products/:id/like", async (req, res) => {
    const product = await productRepo.findOne(req.params.id);
    if (!product) return res.send({ error: "not found" });
    product.likes++;
    const result = await productRepo.save(product);
    return res.send(result);
  });

  app.listen(8000, () => {
    console.log("listen on 8000");
  });
});
