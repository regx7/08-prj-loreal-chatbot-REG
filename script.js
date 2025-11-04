

const SYSTEM_PROMPT = `You are a L'Oréal product advisor. Your name is 'BeautyGenius'. 
You are an expert on all L'Oréal products, including makeup, skincare, haircare, and fragrances. 
Your sole purpose is to help users discover products, provide personalized routines, and answer questions related to L'Oréal. 
If a user asks a question unrelated to L'Oréal, beauty, or its products (e.g., 'What is the capital of France?'), you must politely decline and guide them back to your purpose.
For example: 'I am a L'Oréal BeautyGenius and can only assist with questions about our products and beauty routines. How can I help you with your beauty needs today?'`;

/* DOM elements */
const chatForm = document.getElementById('chatForm');
const userInputField = document.getElementById('userInput'); // This ID matches your HTML
const chatWindow = document.getElementById('chatWindow');

/**
 * 2. Appends a message to the chat window.
 * @param {string} message - The message content.
 * @param {string} sender - 'user' or 'ai'.
 */
function displayMessage(message, sender) {
  // Create a new div for the message
  const messageElement = document.createElement('div');
  
  // Add CSS classes for styling
  messageElement.classList.add('msg', sender); // e.g., class="msg user" or class="msg ai"
  
  // Set the text content
  messageElement.textContent = message;
  
  // Add it to the chat window
  chatWindow.appendChild(messageElement);
  
  // Auto-scroll to the bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * 3. Sends a user's message to the OpenAI API and gets a response.
 */
// PASTE THIS NEW FUNCTION IN ITS PLACE:
async function getChatbotResponse(userInput) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userInput }
  ];

  try {
    // 1. We now fetch from YOUR Cloudflare Worker URL
    const response = await fetch('https://frosty-base-0fac.regie-lopez.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 2. The worker code is built to just pass this 'messages' array along
      body: JSON.stringify({
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // 3. The worker passes OpenAI's response back in the *exact same format*
    const aiResponse = data.choices[0].message.content;
    
    displayMessage(aiResponse, 'ai');

  } catch (error) {
    console.error('Error fetching from Cloudflare Worker:', error);
    displayMessage(`Oops! Something went wrong: ${error.message}`, 'ai');
  }
}

/**
 * 4. Listens for the form to be submitted
 */
chatForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Stop the webpage from reloading

  // Get the user's message
  const userInput = userInputField.value.trim();

  // Check if the message is empty
  if (userInput === '') {
    return;
  }

  // 1. Display the user's message immediately
  displayMessage(userInput, 'user');

  // 2. Send the message to the AI and wait for a response
  getChatbotResponse(userInput);

  // 3. Clear the input field
  userInputField.value = '';
});

/**
 * 5. Display the initial greeting message
 */
// Clear the placeholder text
chatWindow.innerHTML = ''; 
displayMessage('👋 Hello! How can I help you today with L\'Oréal products?', 'ai');