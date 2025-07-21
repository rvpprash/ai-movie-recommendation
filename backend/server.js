require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { OpenAI } = require("openai");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

app.get("/api/recommendations", async (req, res) => {
  const title = req.query.title || "";
  console.log("title: ", title);
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Missing or invalid movie title" });
  }

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a movie expert. When given a movie title, recommend 3 similar movies (just titles).`,
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

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });
  console.log("openAI completion: ", completion);
  const reply = completion?.choices?.[0]?.message?.content;
  res.json({ reply });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
