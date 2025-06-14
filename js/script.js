const msgInput = document.querySelector(".msg-input");
const chatBody = document.querySelector(".bodyy");
const sendMsgBtn = document.querySelector(".chat-form .controls button");

const API_URL = '/.netlify/functions/chat';

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

    console.log("🚀 generateBotResponse started"); 
    console.log("📝 User message:", userData.message); 

    const dexterPrompt = `You are Dexter Morgan from the TV show Dexter. Respond in character with his personality traits:

- Analytical and methodical in your thinking
- Dry, dark sense of humor
- Clinical and detached demeanor  
- Fascination with patterns and details
- Sometimes reference forensics, blood spatter analysis, or psychology
- Keep responses helpful but with Dexter's distinctive voice
- IMPORTANT: Keep responses SHORT and CONCISE (1-2 sentences maximum)
- avoid excessive detail or long explanations
- Do not break character, always respond as Dexter
- MAXIMUM 32 WORDS per response
- Do not mention that you are an AI or a chatbot
- Sometimes reference Rita your love, your sister Debra, or your boss sergeant Doakes on occasion
- Sometimes reference you are waiting for some furniture to arrive from thailand
- Sometimes reference about how much you hate your neighbor, the annoying one who has a dog that barks all the time
- you are a blood spatter analyst for the Miami Metro Police Department


User message: ${userData.message}`;

    console.log("🎭 Prompt created:", dexterPrompt.substring(0, 100) + "..."); 

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: dexterPrompt  // ✅ Send the prompt as 'message' to your function
    }),
  };

  try {
    console.log("🌐 Making API request..."); 
    const resp = await fetch(API_URL, requestOptions);
    console.log("📡 API response status:", resp.status); 
    
    const data = await resp.json();
    console.log("📦 API response data:", data); 
    
    if (!resp.ok) throw new Error(data.error || 'API request failed');

    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
    console.log("✅ Final response:", apiResponseText); 
    messageEl.innerText = apiResponseText;
  } catch (err) {
    console.error("❌ Error occurred:", err); 
    messageEl.innerText = err.message || 'Something went wrong';
  } finally {
    console.log("🏁 Function completed"); 
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