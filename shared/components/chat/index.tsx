"use client";

import React from "react";
import axios from "axios";

import { MessageType, Notification } from "@/type";
import Auth from "../auth";
import Message from "../message";

import style from "./Cart.module.css";

const Chat: React.FC = () => {
  const [idInstance, setIdInstance] = React.useState<string>("");
  const [apiTokenInstance, setApiTokenInstance] = React.useState<string>("");
  const [phoneInput, setPhoneInput] = React.useState<string>("");
  const [selectedPhone, setSelectedPhone] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    const savedIdInstance = localStorage.getItem("idInstance");
    const savedApiTokenInstance = localStorage.getItem("apiTokenInstance");

    if (savedIdInstance && savedApiTokenInstance) {
      setIdInstance(savedIdInstance);
      setApiTokenInstance(savedApiTokenInstance);
      setIsAuthenticated(true);
    }
  }, []);

  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 11;
  };

  const createChat = () => {
    const cleanedPhone = phoneInput.replace(/\D/g, "");

    if (!isValidPhone(cleanedPhone)) {
      alert("Введите корректный номер телефона");
      return;
    }

    setSelectedPhone(cleanedPhone);
    setMessages([]);
  };

  const handleLogin = (idInstance: string, apiTokenInstance: string) => {
    localStorage.setItem("idInstance", idInstance);
    localStorage.setItem("apiTokenInstance", apiTokenInstance);

    setIdInstance(idInstance);
    setApiTokenInstance(apiTokenInstance);
    setIsAuthenticated(true);
  };

  const sendMessage = async () => {
    if (!message || !selectedPhone) return;

    const url = `https://api.green-api.com/waInstance${idInstance}/SendMessage/${apiTokenInstance}`;
    const data = {
      chatId: `${selectedPhone}@c.us`,
      message: message,
    };

    try {
      await axios.post(url, data);
      setMessages([...messages, { text: message, isOutgoing: true }]);
      setMessage("");
    } catch (error) {
      alert("Ошибка отправки сообщения, проверьте номер");
    }
  };

  const logout = () => {
    localStorage.removeItem("idInstance");
    localStorage.removeItem("apiTokenInstance");

    setIdInstance("");
    setApiTokenInstance("");
    setIsAuthenticated(false);
    setSelectedPhone("");
    setMessages([]);
  };

  const receiveMessage = async () => {
    const url = `https://api.green-api.com/waInstance${idInstance}/ReceiveNotification/${apiTokenInstance}`;

    try {
      const response = await axios.get<Notification>(url);
      const notification = response.data;

      if (!notification) {
        return;
      }

      if (
        notification.body.typeWebhook === "outgoingMessageReceived" &&
        notification.body.messageData?.typeMessage === "textMessage" &&
        notification.body.messageData.textMessageData
      ) {
        const text = notification.body.messageData.textMessageData.textMessage;

        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (msg) => msg.text === text && !msg.isOutgoing
          );
          if (!isDuplicate) {
            return [...prevMessages, { text, isOutgoing: false }];
          }
          return prevMessages;
        });
      }

      await axios.delete(
        `https://api.green-api.com/waInstance${idInstance}/DeleteNotification/${apiTokenInstance}/${notification.receiptId}`
      );
    } catch (error) {
      if (confirm("Данные входа некорректны, пройдите авторизацию заново.")) {
        logout();
      }
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(receiveMessage, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, messages]);

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={style.chat}>
      <div className={style.chat__header}>
        <h2 className={style.chat__heading}>Чат с {selectedPhone}</h2>
        <button
          className={`${style.chat__btn} ${style.chat__exit}`}
          onClick={() => logout()}
        >
          выход
        </button>
      </div>
      <div className={style.chat__window}>
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} isOutgoing={msg.isOutgoing} />
        ))}
      </div>
      <div className={style.chat__bottom}>
        {!selectedPhone && (
          <div className={style.chat__message_box}>
            <input
              className={style.chat__input}
              type="text"
              placeholder="Введите номер получателя"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
            <button
              className={`${style.chat__btn} ${style.chat__btn_defolt}`}
              onClick={createChat}
            >
              Создать чат
            </button>
          </div>
        )}

        {selectedPhone && (
          <div className={style.chat__message_box}>
            <textarea
              className={`${style.chat__input} ${style.chat__textarea}`}
              placeholder="Введите сообщение"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className={`${style.chat__btn} ${style.chat__send}`}
              onClick={sendMessage}
            >
              <svg
                className={style.chat__icon}
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="send"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
