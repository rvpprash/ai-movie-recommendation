import { useEffect, useState } from "react";

export default function Recommendations() {
  const [title, setTitle] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const res = await fetch(
      `http://localhost:5000/api/recommendations?title=${encodeURIComponent(
        title
      )}`
    );
    const data = await res.json();
    setMovies(data);
    setLoading(false);
  };

  return (
    <section className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto mt-8 p-4 space-y-4">
      <h2>Enter a movie name to get recommendation...</h2>
      <input
        type="text"
        placeholder="Enter a movie you liked..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button
        onClick={fetchRecommendations}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 hover:scale-[1.03] text-white font-semibold px-5 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
      >
        {loading ? "Recommending..." : "Get Recommendations"}
      </button>

      <div className="movie-list">
        {movies.map((movie, idx) => (
          <div
            key={idx}
            className="movie-card flex gap-4 p-4 border rounded mb-4 bg-gray-900"
          >
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-32 h-auto rounded"
              />
            )}
            <h3 className="text-xl font-semibold mb-1 text-white">
              {movie.title}
            </h3>
            <p className="text-gray-300 text-md">{movie.plot}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
