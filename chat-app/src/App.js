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
    Spinner,
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
        <Container maxW="100vw" h="100vh" display="flex" alignItems="center" p={0}>
            <HStack spacing={8} align="stretch" w="100%" h="100vh" p={4}>
                {/* Featured Image */}
                <Box flex="1" display="flex" justifyContent="center" alignItems="center">
                    {currentImage ? (
                        <VStack spacing={0}>
                            <Box width="1200px" height="1200px" position="relative">
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
                                        height="80px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Text
                                            fontSize="3xl"
                                            color="white"
                                            textAlign="center"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: '1',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                            w="90%"
                                        >
                                            {lastPrompt}
                                        </Text>
                                    </Box>
                                )}
                            </Box>
                        </VStack>
                    ) : (
                        <Box p={4} textAlign="center">
                            <VStack spacing={12}>
                                <Spinner
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='blue.500'
                                    size='xl'
                                />
                                <VStack spacing={6}>
                                    <Text fontSize="4xl" fontWeight="bold" color="gray.700">
                                        Start a conversation! 🎨
                                    </Text>
                                    <VStack spacing={4}>
                                        <Text fontSize="2xl" color="gray.600" maxW="800px" lineHeight="1.8">
                                            I will turn your story into pixels ✨
                                        </Text>
                                        <Text fontSize="2xl" color="gray.600" maxW="800px" lineHeight="1.8">
                                            All your visual memories will be saved right here 🖼️
                                        </Text>
                                        <Text fontSize="2xl" color="gray.600" maxW="800px" lineHeight="1.8">
                                            Wondering what sparked an image? 🤔
                                        </Text>
                                        <Text fontSize="2xl" color="gray.600" maxW="800px" lineHeight="1.8">
                                            Each caption shows the moment that inspired it 🔮
                                        </Text>
                                    </VStack>
                                </VStack>
                            </VStack>
                        </Box>
                    )}
                </Box>

                {/* Vertical Scrollable Gallery */}
                {imageHistory.length > 0 && (
                    <Box
                        w="350px"
                        h="100%"
                        overflowY="auto"
                        css={{
                            '&::-webkit-scrollbar': {
                                width: '12px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#888',
                                borderRadius: '6px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#555',
                            },
                        }}
                    >
                        <VStack spacing={6} p={3}>
                            {imageHistory.map((image, index) => (
                                <Box
                                    key={image.timestamp}
                                    cursor="pointer"
                                    onClick={() => handleHistoryImageClick(image)}
                                    position="relative"
                                    w="100%"
                                >
                                    <Image
                                        src={image.url}
                                        alt={`Historical image ${index}`}
                                        objectFit="cover"
                                        w="100%"
                                        h="350px"
                                    />
                                    <Box
                                        position="absolute"
                                        bottom="0"
                                        left="0"
                                        right="0"
                                        bg="rgba(0, 0, 0, 0.6)"
                                        height="40px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Text
                                            fontSize="md"
                                            color="white"
                                            textAlign="center"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: '1',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                            w="90%"
                                        >
                                            {image.prompt}
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                        </VStack>
                    </Box>
                )}
            </HStack>
        </Container>
    );
}

export default App;
