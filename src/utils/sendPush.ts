import { messaging } from "firebase-admin";

interface ISendPushPaylod {
  token: string;
  title?: string;
  body?: string;
  message?: string;
  silent?: boolean;
}

export const sendPush = async ({
  token,
  title,
  body,
  message,
  silent,
}: ISendPushPaylod) => {
  await messaging().send({
    token,
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        channelId: "cherry",
        vibrateTimingsMillis: [0, 500, 500, 500],
        priority: "high",
        defaultVibrateTimings: false,
      },
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          category: "general",
          contentAvailable: true,
        },
      },
    },
  });
};
