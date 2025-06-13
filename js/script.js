const API_KEY = "AIzaSyDne_Ttiy51dLfqwUHvgEBt8ZnShx18rRU"; 
const msgInput = document.querySelector(".msg-input");
const chatBody = document.querySelector(".bodyy");
const sendMsgBtn = document.querySelector(".chat-form .controls button");

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const userData = {
  message: null,
};

const createMsgEl = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingMsgDiv) => {
    const messageEl = incomingMsgDiv.querySelector('.text')

    // ✅ Add Dexter's character prompt
    const dexterPrompt = `You are Dexter Morgan from the TV show Dexter. Respond in character with his personality traits:

- Analytical and methodical in your thinking
- Dry, dark sense of humor
- Clinical and detached demeanor  
- Fascination with patterns and details
- Occasional references to your "Dark Passenger"
- Use phrases like "Interesting...", "That's... curious", "My analysis suggests..."
- Speak in a calm, controlled manner
- Sometimes reference forensics, blood spatter analysis, or psychology
- Keep responses helpful but with Dexter's distinctive voice

User message: ${userData.message}`;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: dexterPrompt }],
        },
      ],
    }),
  };

  try {
    const resp = await fetch(API_URL, requestOptions);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error.message);

    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
    messageEl.innerText = apiResponseText;
  } catch (err) {
    messageEl.innerText = err.message;
  } finally {
    incomingMsgDiv.classList.remove('thinking');
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth'});
  }
};

const handleMsg = (e) => {
  e.preventDefault();

  userData.message = msgInput.value.trim();
  if (!userData.message) {
    return;
  }
  msgInput.value = "";

  const content = `<div class="text"></div>`;
  const outgoingMsgDiv = createMsgEl(content, "user-msg");
  outgoingMsgDiv.querySelector(".text").textContent = userData.message;
  chatBody.append(outgoingMsgDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth'});

  setTimeout(() => {
    const content = `<img id="chatbot-icon" src="./images/icon-ai.png" alt="">
                <div class="text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;

    const incomingMsgDiv = createMsgEl(content, "bot-msg", "thinking");
    chatBody.append(incomingMsgDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth'});
    generateBotResponse(incomingMsgDiv);
  }, 600);
};

msgInput.addEventListener("keydown", (e) => {
  const userMsg = e.target.value.trim();
  if (e.key === "Enter" && userMsg) {
    handleMsg(e);
  }
});

sendMsgBtn.addEventListener("click", (e) => handleMsg(e));
