import { useEffect, useState } from "react";

export default function Recommendations() {
  const [title, setTitle] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    const baseUrl = import.meta.env.VITE_API_URL;

    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch(
      `${baseUrl}/api/recommendations?title=${encodeURIComponent(title)}`
    );

    if (res.status === 429) {
      setError("Too many requests—try again soon.");
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || "Something went wrong.");
      setLoading(false);
      return;
    }

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
            className="movie-card flex gap-4 p-4 border rounded mb-4 bg-gray-900 text-white"
          >
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-32 h-auto rounded"
              />
            )}
            <div className="flex flex-col justify-between">
              <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
              <p className="text-gray-300 text-sm mb-2">{movie.plot}</p>

              <div className="flex gap-2 flex-wrap">
                {movie.genre && (
                  <span className="bg-blue-200 text-blue-900 text-xs font-medium px-2 py-1 rounded-full">
                    {movie.genre}
                  </span>
                )}
                {movie.rating && (
                  <span className="bg-green-200 text-green-900 text-xs font-medium px-2 py-1 rounded-full">
                    IMDb {movie.rating}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
