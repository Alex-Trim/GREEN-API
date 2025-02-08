"use client";
import { MessageType } from "@/type";
import React from "react";
import style from "./Message.module.css";
const Message: React.FC<MessageType> = ({ text, isOutgoing }) => {
  return (
    <div
      className={`${style.message} ${
        isOutgoing ? style.outgoing : style.incoming
      }`}
    >
      {text}
    </div>
  );
};

export default Message;
