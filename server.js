import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';


const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["https://www.dontbej.com", "https://dev.dontbej.com"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.get('/', (req, res) => res.send('API COORECTLY WORKING'));

mongoose.connect(process.env.VITE_DB_LINK)

//API


const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    }
})

app.post("/add-product", async (req, res) => {
    try {
        const product = new Product({
            id: req.body.id,
            name: req.body.name,
            image: req.body.image,
            price: req.body.price
        });
        console.log(product);
        await product.save();
        console.log("Saved to DB");
        res.json({
            success: true,
            name: req.body.name,
        })
    } catch (error) {
        res.json({success: false, message: error.message})
    }
    
    
})

app.get("/all-products", async (req, res) => {
    let products = await Product.find({});
    console.log("All products fetched")
    
    res.json(products);
})

app.post("/send-email", async (req, res) => {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.VITE_RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "dontbeJ <dontreply@dontbej.com>",
          to: req.body.email,
          subject: "Hello World",
          html: "<strong>It works!</strong>",
        }),
      });
  
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

app.listen(port, () => console.log(`Server running on port ${port}`));





