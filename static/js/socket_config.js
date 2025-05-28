function initializeSocketIO() {
    if (typeof io === 'undefined') {
        console.error('Socket.IO client is not loaded! Make sure socket.io.min.js is included in your HTML.');
        return null;
    }

    // Create socket connection with robust error handling
    const socket = io({
        transports: ['polling', 'websocket'],  // Start with polling which is more reliable, then upgrade
        reconnection: true,                    // Enable reconnection
        reconnectionAttempts: 5,               // Number of reconnection attempts
        reconnectionDelay: 1000,               // Initial delay between reconnections (1 second)
        reconnectionDelayMax: 5000,            // Maximum delay between reconnections (5 seconds)
        timeout: 20000,                        // Connection timeout
        autoConnect: true                      // Auto connect on initialization
    });

    // Connection event handlers
    socket.on('connect', () => {
        console.log('Socket.IO connected successfully');
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.log('Socket.IO connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_failed', () => {
        console.log('Socket.IO failed to reconnect after maximum attempts');
    });

    return socket;
}

// Export socket instance for use in other files
window.socketIO = initializeSocketIO();