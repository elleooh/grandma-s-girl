import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
    Box,
    Container,
    Image,
    Center,
} from '@chakra-ui/react';

function App() {
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        console.log('Connecting to socket...');
        const socket = io('http://localhost:3001', {
            transports: ['websocket'],
            cors: {
                origin: "http://localhost:3000"
            }
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('image', (data) => {
            console.log('Received image:', data);
            if (data.image_url) {
                setCurrentImage(data.image_url);
            }
        });

        socket.on('connect_error', (error) => {
            console.log('Connection error:', error);
        });

        return () => socket.disconnect();
    }, []);

    return (
        <Container maxW="container.xl" py={5}>
            <Center h="100vh">
                {currentImage ? (
                    <Box width="800px" height="800px">
                        <Image
                            src={currentImage}
                            alt="Generated image"
                            objectFit="contain"
                            w="100%"
                            h="100%"
                        />
                    </Box>
                ) : (
                    <Box>Waiting for images...</Box>
                )}
            </Center>
        </Container>
    );
}

export default App;
