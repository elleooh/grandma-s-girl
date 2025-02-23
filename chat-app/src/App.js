import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
    Box,
    Container,
    Image,
    Center,
    Text,
    VStack,
    Grid,
    GridItem,
    HStack,
} from '@chakra-ui/react';

function App() {
    const [currentImage, setCurrentImage] = useState(null);
    const [imageHistory, setImageHistory] = useState([]);
    const [lastPrompt, setLastPrompt] = useState('');

    // Function to handle clicking on a history image
    const handleHistoryImageClick = (image) => {
        setCurrentImage(image);
        setLastPrompt(image.prompt);
    };

    // Use useCallback to memoize the image update handler
    const handleImageUpdate = useCallback((data) => {
        console.log('[Socket] Received image event:', data);
        if (data.image_url) {
            console.log('[Image] Setting new image URL:', data.image_url);
            const timestamp = new Date().getTime();
            const imageUrl = `${data.image_url}${data.image_url.includes('?') ? '&' : '?'}t=${timestamp}`;

            // Create new image object
            const newImage = {
                url: imageUrl,
                prompt: data.text || '',
                timestamp: timestamp
            };

            // Update current image
            setCurrentImage(newImage);

            // Add to history (at the beginning)
            setImageHistory(prev => [newImage, ...prev]);
            setLastPrompt(data.text || '');
        } else {
            console.warn('[Image] Received image event without URL');
        }
    }, []);

    useEffect(() => {
        console.log('Connecting to socket...');
        const socket = io('http://localhost:3001', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
        });

        socket.onAny((eventName, ...args) => {
            console.log(`[Socket Event] ${eventName}:`, args);
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected to server');
        });

        socket.on('image', handleImageUpdate);

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected from server');
        });

        return () => {
            console.log('[Socket] Cleaning up connection');
            socket.disconnect();
        };
    }, [handleImageUpdate]);

    return (
        <Container maxW="container.xl" h="100vh" display="flex" alignItems="center">
            <VStack spacing={8} align="stretch" w="100%">
                {/* Featured Image */}
                {currentImage ? (
                    <VStack spacing={0}>
                        <Box width="800px" height="800px" mx="auto" position="relative">
                            <Image
                                src={currentImage.url}
                                alt="Generated image"
                                objectFit="contain"
                                w="100%"
                                h="100%"
                                key={currentImage.url}
                            />
                            {lastPrompt && (
                                <Box
                                    position="absolute"
                                    bottom="0"
                                    left="0"
                                    right="0"
                                    bg="rgba(0, 0, 0, 0.6)"
                                    p={4}
                                    minH="fit-content"
                                >
                                    <Text
                                        fontSize="xl"
                                        color="white"
                                        textAlign="center"
                                    >
                                        {lastPrompt}
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </VStack>
                ) : (
                    <Box p={4} textAlign="center">
                        Waiting for images...
                    </Box>
                )}

                {/* Horizontal Scrollable Gallery */}
                {imageHistory.length > 0 && (
                    <Box
                        overflowX="auto"
                        css={{
                            '&::-webkit-scrollbar': {
                                height: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#888',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#555',
                            },
                        }}
                    >
                        <HStack spacing={4} p={2} minW="min-content">
                            {imageHistory.map((image, index) => (
                                <Box
                                    key={image.timestamp}
                                    cursor="pointer"
                                    onClick={() => handleHistoryImageClick(image)}
                                    position="relative"
                                    flexShrink={0}
                                    w="200px"
                                >
                                    <Image
                                        src={image.url}
                                        alt={`Historical image ${index}`}
                                        objectFit="cover"
                                        w="100%"
                                        h="200px"
                                    />
                                    <Box
                                        position="absolute"
                                        bottom="0"
                                        left="0"
                                        right="0"
                                        bg="rgba(0, 0, 0, 0.6)"
                                        p={2}
                                        minH="fit-content"
                                    >
                                        <Text
                                            fontSize="sm"
                                            color="white"
                                            noOfLines={2}
                                            textAlign="center"
                                        >
                                            {image.prompt}
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                        </HStack>
                    </Box>
                )}
            </VStack>
        </Container>
    );
}

export default App;
