import cors from "cors";
import express from "express";
import amqp from "amqplib/callback_api";
import { createConnection } from "typeorm";
import { Product } from "./entity/product";
import axios from "axios";

createConnection().then((db) => {
  const productRepo = db.getMongoRepository(Product);

  amqp.connect("amqp://localhost", (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      channel.assertQueue("hello", { durable: false });
      channel.assertQueue("product_created", { durable: false });
      channel.assertQueue("product_updated", { durable: false });
      channel.assertQueue("product_deleted", { durable: false });

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

      // channel.consume("hello", (msg) => {
      //   console.log(msg?.content.toString());
      // });

      channel.consume(
        "product_created",
        async (msg) => {
          if (!msg) {
            console.log("product_created no msg");
          } else {
            const eventProduct: Product = JSON.parse(msg.content.toString());
            const product = new Product();
            product.admin_id = parseInt(eventProduct.id);
            product.title = eventProduct.title;
            product.image = eventProduct.image;
            product.likes = eventProduct.likes;
            await productRepo.save(product);
            console.log("product created");
          }
        },
        { noAck: true }
      );

      channel.consume(
        "product_updated",
        async (msg) => {
          if (!msg) {
            console.log("product_created no msg");
            return;
          }
          const eventProduct: Product = JSON.parse(msg.content.toString());
          const product = await productRepo.findOne({
            admin_id: parseInt(eventProduct.id),
          });

          if (product) {
            productRepo.merge(product, {
              title: eventProduct.title,
              image: eventProduct.image,
              likes: eventProduct.likes,
            });
            await productRepo.save(product);
            console.log("product updated");
          }
        },
        { noAck: true }
      );

      channel.consume("product_deleted", async (msg) => {
        if (!msg) {
          return console.log("not found");
        }
        const admin_id = parseInt(msg.content.toString());
        await productRepo.deleteOne({ admin_id: admin_id });
        console.log("product deleted");
      });

      app.get("/api/products", async (_, res) => {
        const products = await productRepo.find();
        return res.send(products);
      });

      app.post("/api/products/:id/like", async (req, res) => {
        const p = await productRepo.findOne(req.params.id);
        if (!p) {
          return console.log("not Found");
        }

        await axios.post(
          `http://localhost:8000/api/products/${p.admin_id}/like`,
          {}
        );

        p.likes++;
        await productRepo.save(p);
        return res.send(p);
      });

      app.listen(8001, () => {
        console.log("listen on 8001");
        process.on("beforeExit", () => {
          console.log("closing");
          connection.close();
        });
      });
    });
  });
});
