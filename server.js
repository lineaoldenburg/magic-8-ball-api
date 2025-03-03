const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

// Anslut till MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Ansluten"))
  .catch((err) => console.log("❌ DB Fel:", err));

// Skapa Schema & Modell
const responseSchema = new mongoose.Schema({ response: String });
const Response = mongoose.model(
  "Response",
  responseSchema,
  "magig-8-ball.responses"
);

// 🚀 GET: Hämta alla svar
app.get("/responses", async (req, res) => {
  try {
    const responses = await Response.find();
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: "Serverfel" });
  }
});

// Starta servern
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`✅ Server kör på port ${port}`));
