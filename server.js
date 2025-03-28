import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv/config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configura CORS per accettare richieste solo dal dominio www.dontbej.com
app.use(cors({
  origin: 'https://www.dontbej.com', // Permetti solo richieste dal dominio www.dontbej.com
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Abilita le richieste preflight per CORS
app.options("https://www.dontbej.com", cors());

// Middleware per limitare l'accesso solo da www.dontbej.com
app.use((req, res, next) => {
  const origin = req.get('Origin');
  
  // Se la richiesta non proviene dal dominio www.dontbej.com, rispondi con un errore
  if (origin !== 'https://www.dontbej.com') {
    return res.status(403).send('Accesso non autorizzato. Solo richieste da www.dontbej.com sono permesse.');
  }
  
  next();
});

// Connessione a MongoDB con gestione degli errori
mongoose.connect(process.env.VITE_DB_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connesso con successo");
}).catch(err => {
  console.error("Errore nella connessione a MongoDB:", err);
});

// Modello Mongoose per i prodotti
const Product = mongoose.model("Product", {
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true }
});

// Rotte API
app.get('/', (req, res) => res.send('API CORRECTLY WORKING'));

app.post("/add-product", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    console.log("Prodotto salvato:", product);
    res.json({ success: true, name: product.name });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find({});
    console.log("Tutti i prodotti recuperati");
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
    console.error("Errore nell'invio dell'email:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

// Avvio del server
app.listen(port, () => console.log(`Server in esecuzione sulla porta ${port}`));
