document.addEventListener("DOMContentLoaded", () => {
  const settingsButton = document.getElementById("settings");
  const settingsSection = document.getElementById("settingsSection");
  const saveKeyButton = document.getElementById("saveKey");
  const summarizeButton = document.getElementById("summarize");

  // Toggle settings visibility
  settingsButton.addEventListener("click", () => {
    if (settingsSection.style.display === "none") {
      settingsSection.style.display = "block";
    } else {
      settingsSection.style.display = "none";
    }
  });

  // Save API Key
  saveKeyButton.addEventListener("click", () => {
    const apiKey = document.getElementById("apiKey").value;
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      alert("API key saved successfully!");
    });
  });

  // Summarize Page
  summarizeButton.addEventListener("click", () => {
    chrome.storage.local.get("openaiApiKey", (result) => {
      const apiKey = result.openaiApiKey;
      if (!apiKey) {
        alert("Please enter your API key first!");
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            func: () => document.body.innerText, // Extract webpage content
          },
          async (results) => {
            const pageContent = results[0].result;
            const summary = await summarizeText(pageContent, apiKey);
            document.getElementById("output").value = summary;
          }
        );
      });
    });
  });

  // Function to summarize text
  async function summarizeText(text, apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: `Summarize this: ${text}` }],
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});
