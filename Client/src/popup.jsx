import { useEffect, useState } from "react";
import "./popup.css";

function Popup() {
  const [tabs, setTabs] = useState([]);

  const [selectedTabs, setSelectedTabs] =
    useState([]);

  const [summary, setSummary] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    chrome.tabs.query({}, (allTabs) => {
      const validTabs = allTabs.filter(
        (tab) =>
          tab.url &&
          tab.url.startsWith("http")
      );

      setTabs(validTabs);
    });
  }, []);

  const toggleTab = (tabId) => {
    setSelectedTabs((prev) =>
      prev.includes(tabId)
        ? prev.filter((id) => id !== tabId)
        : [...prev, tabId]
    );
  };

  const extractTabContent = async (
    tabId
  ) => {
    const results =
      await chrome.scripting.executeScript({
        target: { tabId },

        func: () => {
          const documentClone =
            document.cloneNode(true);

            return new Readability(
                documentClone
            ).parse()?.textContent;
        },
      });

    return results[0].result;
  };

  const handleSummarize = async () => {
    setLoading(true);

    try {
      const tabData = [];

      for (const tabId of selectedTabs) {
        const tab = tabs.find(
          (t) => t.id === tabId
        );

        const content =
          await extractTabContent(tabId);

        tabData.push({
          title: tab.title,
          url: tab.url,
          content: content.slice(0, 1000),
        });
      }

      const response = await fetch(
        "http://localhost:5001/summarize",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            tabs: tabData,
          }),
        }
      );

      const data = await response.json();

      const cleanSummary =
        data.summary
          .replace(/\*\*/g, "")
          .trim();

      setSummary(cleanSummary);
    } catch (error) {
      console.error(error);

      setSummary(
        "Failed to generate summary."
      );
    }

    setLoading(false);
  };

  return (
    <div className="popup-container">
      <h1>webGather</h1>

      <div className="tabs-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="tab-item"
          >
            <input
              type="checkbox"
              checked={selectedTabs.includes(
                tab.id
              )}
              onChange={() =>
                toggleTab(tab.id)
              }
            />

            <span>{tab.title}</span>
          </div>
        ))}
      </div>

      <button onClick={handleSummarize}>
        {loading
          ? "Summarizing..."
          : "Summarize Research"}
      </button>

      <div className="summary-box">
        {summary ||
          "Research summary appears here"}
      </div>
    </div>
  );
}

export default Popup;