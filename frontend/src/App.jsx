import Chatbot from "./components/Chatbot";
import Recommendations from "./components/Recommendations";

export default function App() {
  return (
    <div className="min-h-screen bg-movie bg-cover bg-center bg-no-repeat">
      <header className="relative bg-header bg-cover bg-center bg-no-repeat  h-[300px]  flex items-center justify-center">
        <h1
          className="relative z-10 text-3xl sm:text-4xl font-bold text-center px-4 py-3 animate-fade-in rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            textShadow: "1px 1px 4px #000",
          }}
        >
          🎥 Smart Movie Recommender
        </h1>
      </header>
      <main className="px-4 sm:px-6 lg:px-8  mx-auto py-8 text-white">
        <Recommendations />
        <Chatbot />
      </main>
    </div>
  );
}
