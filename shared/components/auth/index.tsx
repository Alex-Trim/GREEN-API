"use client";

import React, { useState } from "react";

import style from "./Auth.module.css";

interface AuthProps {
  onLogin: (idInstance: string, apiTokenInstance: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [idInstance, setIdInstance] = useState<string>("");
  const [apiTokenInstance, setApiTokenInstance] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(idInstance, apiTokenInstance);
  };

  return (
    <div className={style.auth}>
      <h2 className={style.auth__heading}>Вход</h2>
      <p className={style.auth__description}>
        Введите свои учетные данные из системы GREEN-API
      </p>
      <form className={style.auth__form} onSubmit={handleSubmit}>
        <input
          className={style.auth__input}
          type="text"
          placeholder="ID Instance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          required
        />
        <input
          className={`${style.auth__input} ${style.auth__secret}`}
          type="text"
          placeholder="API Token Instance"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          required
        />
        <button className={style.auth__btn} type="submit">
          Войти
        </button>
      </form>
    </div>
  );
};

export default Auth;
