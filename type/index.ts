// Типы для сообщений
export interface MessageType {
  text: string;
  isOutgoing: boolean;
}

// Тип для уведомления от GREEN-API
export interface Notification {
  receiptId: number;
  body: {
    typeWebhook: string;
    messageData?: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
    };
  };
}
