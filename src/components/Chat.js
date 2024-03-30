import React, { useEffect, useState } from "react";
import "../App.css"; // Import custom CSS styles

// Sample JSON data
const initialMessages = [
  {
    sender: "Alice",
    message: "Hello!",
    status: "seen",
  },
  {
    sender: "Bob",
    message: "Hi Alice!",
    status: "unseen",
  },
  {
    sender: "Alice",
    message: "How are you?",
    status: "seen",
  },
  {
    sender: "Bob",
    message: "I'm good, thank you!",
    status: "seen",
  },
];

// Component for the side box containing sender names
const SideBox = ({ senders, setSelectedSender }) => {
  return (
    <div className="side-box">
      <ul style={{ listStyle: "none" }}>
        {senders.map((sender, index) => (
          <li key={index} onClick={() => setSelectedSender(sender)}>
            {sender}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedSender, setSelectedSender] = useState(
    initialMessages[0].sender
  );
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);

  const filteredMessages = messages.filter(
    (message) => message.sender === selectedSender
  );

  useEffect(() => {
    const ws = new WebSocket(
      "wss://ba92-103-81-215-141.ngrok-free.app/ws/user/"
    ); // Replace with your WebSocket server URL
    setSocket(ws);

    // Handle WebSocket events
    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      const newMessage = {
        sender: "You",
        message: inputValue.trim(),
        status: "sent",
      };
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(newMessage));
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputValue("");
      } else {
        console.error("WebSocket is not open yet.");
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <SideBox
        senders={Array.from(new Set(messages.map((message) => message.sender)))}
        setSelectedSender={setSelectedSender}
      />
      <div className="messages">
        {filteredMessages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === "You" ? "sender" : "receiver"
            }`}
          >
            <span className="message-content">{message.message}</span>
            <span className={`message-status ${message.status}`}></span>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          className="input"
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress} // Handle sending message when Enter key is pressed
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
