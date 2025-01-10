document.addEventListener("DOMContentLoaded", () => {
  const settingsButton = document.getElementById("settings");
  const settingsSection = document.getElementById("settingsSection");
  const saveKeyButton = document.getElementById("saveKey");
  const summarizeButton = document.getElementById("summarize");
  const outputTextarea = document.getElementById("output");
  const languageSelect = document.getElementById("language");

  // Load saved API key and language on popup open
  chrome.storage.local.get(["openaiApiKey", "selectedLanguage"], (result) => {
    if (result.openaiApiKey) {
      document.getElementById("apiKey").value = result.openaiApiKey.substring(0, 10) + "...";
    }
    if (result.selectedLanguage) {
      languageSelect.value = result.selectedLanguage;
    }
  });

  languageSelect.addEventListener("change", () => {
    const selectedLanguage = languageSelect.value;
    chrome.storage.local.set({ selectedLanguage: selectedLanguage }, () => {
      // Optionally, you can show a confirmation message
      console.log("Selected language saved:", selectedLanguage);
    });
  });

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
    if (!apiKey || apiKey.endsWith("...")) {
      alert("Please enter proper OpenAI API key!");
      return;
    }
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      alert("API key saved successfully!");
    });
  });

  // Summarize Page with feedback
  summarizeButton.addEventListener("click", async () => {
    chrome.storage.local.get("openaiApiKey", async (result) => {
      const apiKey = result.openaiApiKey;

      if (!apiKey) {
        alert("Please enter your API key first!");
        return;
      }

      // Get the selected language
      const selectedLanguage = languageSelect.value;

      // Disable button and show loading text
      summarizeButton.disabled = true;
      summarizeButton.textContent = "Summarizing...";
      outputTextarea.value = "Loading... Please wait.";

      try {
        // Extract webpage content
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0].id;
          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              func: () => document.body.innerText, // Extract webpage content
            },
            async (results) => {
              const pageContent = results[0].result;
              const summary = await summarizeText(pageContent, apiKey, selectedLanguage);

              // Display the summary
              outputTextarea.value = summary;
              autoResizeTextarea(outputTextarea);

              // Reset button state
              summarizeButton.disabled = false;
              summarizeButton.textContent = "Summarize Page";
            }
          );
        });
      } catch (error) {
        outputTextarea.value = `Error: ${error.message}`;
        summarizeButton.disabled = false;
        summarizeButton.textContent = "Summarize Page";
      }
    });
  });

  // Function to summarize text
  async function summarizeText(text, apiKey, language) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: `Summarize this in ${language} with bullet points: ${text}` }],
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Failed to summarize: ${error.message}`);
    }
  }

  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto'; // Reset height to auto to calculate new height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight
  }
});