require("dotenv").config({ path: ".env.local" });
// require("dotenv").config({
//   path: require("path").resolve(__dirname, ".env.local"),
// });
const rateLimit = require("express-rate-limit");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { OpenAI } = require("openai");
const isInputFlagged = require("./checkInputSafety");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: "Too many requests, please try again later.",
});

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// TMDB recommnedation
// const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
// const data = await response.json();
// const recommendations = data.results.slice(0, 5).map(movie => ({
//   title: movie.title,
//   overview: movie.overview,
//   poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`
// }));
// res.json(recommendations);
app.use("/api/recommendations", limiter);
app.get("/api/recommendations", async (req, res) => {
  const title = req.query.title || "";

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Missing or invalid movie title" });
  }

  try {
    const moderationRes = await openai.moderations.create({
      input: title,
    });

    const flagged = moderationRes.results[0].flagged;

    const check = isInputFlagged(moderationRes);

    if (check.flagged || flagged) {
      console.log("Moderation Scores:", check.scores);
      return res
        .status(400)
        .json({ error: `Inappropriate input detected. (${check.reason})` });
    }

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a movie expert. When given a movie title, always recommend exactly 3 similar movies (only titles).`,
        },
        {
          role: "user",
          content: `I liked "${title}". Recommend 3 similar movies.`,
        },
      ],
    });

    const text = aiResponse.choices?.[0]?.message?.content;

    const movieTitles = text
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    const results = [];
    for (const movie of movieTitles) {
      const response = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(
          movie
        )}&apikey=${OMDB_API_KEY}`
      );
      const data = await response.json();
      if (data.Response === "True") {
        results.push({
          title: data.Title,
          plot: data.Plot,
          poster: data.Poster !== "N/A" ? data.Poster : null,
          year: data.Year,
          genre: data?.Genre,
          rating: data?.imdbRating,
        });
      }
    }
    res.json(results);
  } catch (err) {
    console.log(err);
    console.error("Error in /api/recommendations:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.use("/api/chat", limiter);
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const moderationRes = await openai.moderations.create({
    input: message,
  });
  console.log("moderation: ", moderationRes);
  const flagged = moderationRes.results[0].flagged;

  const check = isInputFlagged(moderationRes);

  if (check.flagged || flagged) {
    console.log("Moderation Scores:", check.scores);
    return res
      .status(400)
      .json({ error: `Inappropriate input detected. (${check.reason})` });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a respectful, helpful assistant. If the user inputs something harmful, abusive, or inappropriate, respond with a polite refusal.",
      },
      { role: "user", content: message },
    ],
  });

  console.log("openAI completion: ", completion);

  const reply = completion?.choices?.[0]?.message?.content;
  res.json({ reply });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
