// Adding Eleven Labs Text-to-Speech functionality to the Chrome extension

document.addEventListener("DOMContentLoaded", () => {
  const settingsButton = document.getElementById("settings");
  const settingsSection = document.getElementById("settingsSection");
  const saveKeyButton = document.getElementById("saveKey");
  const summarizeButton = document.getElementById("summarize");
  const outputTextarea = document.getElementById("output");
  const languageSelect = document.getElementById("language");
  const ttsButton = document.getElementById("readAloud");

  // Load saved API key and language on popup open
  chrome.storage.local.get(["openaiApiKey", "selectedLanguage", "elevenLabsApiKey"], (result) => {
      if (result.openaiApiKey) {
          document.getElementById("apiKey").value = result.openaiApiKey.substring(0, 10) + "...";
      }
      if (result.selectedLanguage) {
          languageSelect.value = result.selectedLanguage;
      }
      if (result.elevenLabsApiKey) {
          ttsButton.style.display = "none"; // Initially hidden
          document.getElementById("elevenLabsApiKey").value = result.elevenLabsApiKey.substring(0, 10) + "...";
      }
  });

  languageSelect.addEventListener("change", () => {
      const selectedLanguage = languageSelect.value;
      chrome.storage.local.set({ selectedLanguage: selectedLanguage }, () => {
          console.log("Selected language saved:", selectedLanguage);
      });
  });

  settingsButton.addEventListener("click", () => {
      settingsSection.style.display = settingsSection.style.display === "none" ? "block" : "none";
  });

  saveKeyButton.addEventListener("click", () => {
      const res = { };
      const apiKey = document.getElementById("apiKey").value;
      if (!apiKey || apiKey.endsWith("...")) {
        // alert("Please enter proper OpenAI API key!");
        // return;
      } else {
        res.openaiApiKey = apiKey;
      }

      const elevenApiKey = document.getElementById("elevenLabsApiKey").value;
      if (!elevenApiKey || elevenApiKey.endsWith("...")) {
        // alert("Please enter Eleven Labs API key!");
        // return;
      } else {
        res.elevenLabsApiKey = elevenApiKey;
      }

      chrome.storage.local.set(res, () => {
          alert("API key saved successfully!");
      });
  });

  summarizeButton.addEventListener("click", async () => {
      summarizeButton.disabled = true;
      outputTextarea.value = "Please wait...";

      chrome.storage.local.get(["openaiApiKey", "elevenLabsApiKey"], async (result) => {
        const apiKey = result.openaiApiKey;
        const elevenApiKey = result.elevenLabsApiKey;

          if (!apiKey) {
              alert("Please enter your API key first!");
              return;
          }

          const selectedLanguage = languageSelect.value;

          try {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  const tabId = tabs[0].id;
                  chrome.scripting.executeScript(
                      {
                          target: { tabId: tabId },
                          func: () => document.body.innerText,
                      },
                      async (results) => {
                          const pageContent = results[0].result;
                          const summary = await summarizeText(pageContent, apiKey, selectedLanguage);

                          outputTextarea.value = summary;
                          ttsButton.disabled = false;
                          ttsButton.style.display = "block";
                          summarizeButton.disabled = false;
                      }
                  );
              });
          } catch (error) {
              outputTextarea.value = `Error: ${error.message}`;
              summarizeButton.disabled = false;
          }
      });
  });

  ttsButton.addEventListener("click", () => {
      ttsButton.disabled = true;
      chrome.storage.local.get("elevenLabsApiKey", (result) => {
          // https://api.elevenlabs.io/v1/voices
          const voiceId = "Xb7hH8MSUJpSbSDYk0k2"; // Alice
          const elevenApiKey = result.elevenLabsApiKey;
          if (!elevenApiKey) {
              alert("Please enter your Eleven Labs API key in the settings!");
              return;
          }

          const textToRead = outputTextarea.value;
          if (!textToRead.trim()) {
              alert("No summary to read aloud!");
              return;
          }

          fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "xi-api-key": elevenApiKey,
              },
              body: JSON.stringify({
                  text: textToRead,
              }),
          })
              .then((response) => response.blob())
              .then((audioBlob) => {
                  const audioUrl = URL.createObjectURL(audioBlob);
                  const audio = new Audio(audioUrl);
                  audio.play();
              })
              .catch((error) => {
                  alert(`Error reading aloud: ${error.message}`);
              });
      });
  });

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
                  messages: [{ role: "user", content: `Summarize this in ${language}: ${text}` }],
              }),
          });

          const data = await response.json();
          return data.choices[0].message.content;
      } catch (error) {
          throw new Error(`Failed to summarize: ${error.message}`);
      }
  }
});
