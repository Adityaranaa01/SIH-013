import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:5000";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to backend");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from backend");
      setIsConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected };
};
