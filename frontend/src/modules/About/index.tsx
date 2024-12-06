// Libraries
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Components
import { Features, Footer, Hero } from './components';

interface AboutProps {}

export const About: React.FC<AboutProps> = props => {
  // State to store messages from the server
  const [response, setResponse] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  // Create a socket connection and handle events
  useEffect(() => {
    //console.log('message: ', message);
    const socket = io('http://localhost:4000');
    // Listen for incoming messages from the server
    // socket.on('message', (msg: string) => {
    //   setMessages(prevMessages => [...prevMessages, msg]);
    //   console.log('msg: ', msg);
    // });

    socket.on('message', (data: string) => {
      setResponse(prev => [...prev, data]);
    });

    // Handle cleanup when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  // Emit a message to the server
  const sendMessage = () => {
    const socket: Socket = io('http://localhost:4000');
    socket.emit('message', message);
    setMessage('');
  };

  return (
    <div className="h-screen flex flex-col justify-between">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};
