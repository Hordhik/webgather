import { useState } from "react";
import "./App.css";

function App() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return document.body.innerText;
        },
      });

      const pageContent = results[0].result.slice(0, 1500);

      const response = await fetch(
        "http://localhost:5001/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: pageContent,
          }),
        }
      );

      const data = await response.json();
      const cleanSummary = data.summary
        .replace(/\*\*/g, "")
        .trim();

      setSummary(cleanSummary);
    } catch (error) {
      console.error(error);
      setSummary("Failed to generate summary.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>webGather</h1>

      <button onClick={handleSummarize}>
        {loading ? "Summarizing..." : "Generate Summary"}
      </button>

      <div className="summary-box">
        {summary || "Summary will appear here"}
      </div>
    </div>
  );
}

export default App;