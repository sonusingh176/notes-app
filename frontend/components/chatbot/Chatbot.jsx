"use client";

import { useState } from "react";
import ChatbotButton from "./ChatbotButton";
import ChatbotWindow from "./ChatbotWindow";

/*
 * Main chatbot component.
 *
 * isOpen = false -> show only the floating bot button.
 * isOpen = true  -> show the chat window instead.
 */
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return isOpen ? (
    <ChatbotWindow onClose={() => setIsOpen(false)} />
  ) : (
    <ChatbotButton onClick={() => setIsOpen(true)} />
  );
}
