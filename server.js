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

//LISTA MED RANDOM SVAR
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

//FRÅGOR & SVAR SCHEMA
const questionResponseSchema = new mongoose.Schema({
  question: String,
  response: String,
  date: { type: Date, default: Date.now },
});

const Question = mongoose.model(
  "Question",
  questionResponseSchema,
  "magic-8-ball.questions"
);

// 🚀 POST: Skicka en fråga (och fetcha ett svar)
app.post("/questions", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(404).json({ error: "You need to write a question" });
    }

    // Hämta ett svar från responses
    const response = await fetch(
      "https://magic-8-ball-api-zlrr.onrender.com/responses"
    );
    const responses = await response.json();

    if (!responses || responses.length === 0) {
      return res.status(404).json({
        error: "No responses available at the moment. Try seeking within.",
      });
    }

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)].response;

    const newQuestion = new Question({
      question,
      response: randomResponse,
    });

    await newQuestion.save();

    res.status(201).json({ message: "Your answer has been received!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server is failing you :(" });
  }
});

// 🚀 GET: Hämta alla frågor och svar
app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Serverfel" });
  }
});

// 🚀 PATCH: Uppdatera specifik fråga/svar
app.patch("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question field is required" });
    }

    // Hämta ett nytt svar från responses
    const response = await fetch(
      "https://magic-8-ball-api-zlrr.onrender.com/responses"
    );
    const responses = await response.json();

    if (!responses || responses.length === 0) {
      return res.status(404).json({
        error: "No responses available at the moment. Try seeking within.",
      });
    }

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)].response;

    // Uppdatera frågan och svaret
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { question, response: randomResponse, date: new Date() },
      { new: true } // Ensures that the updated document is returned
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Return the updated question with the new response
    res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server failed you..." });
  }
});

// 🚀 DELETE: Radera specifik fråga/svar
app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Could not find question." });
    }

    res.status(202).json({ message: "Question has been deleted" });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: "Server failed you..." });
  }
});

// Starta servern
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server kör på port ${port}`));
