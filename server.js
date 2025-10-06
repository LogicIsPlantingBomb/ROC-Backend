const http = require('http');
const app = require('./app');
const { Server } = require("socket.io");
const RideRequest = require('./models/rideRequest.model');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://roc-frontend.vercel.app",
        methods: ["GET", "POST"]
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('cancelRideRequest', async ({ rideRequestId }) => {
        try {
            const rideRequest = await RideRequest.findById(rideRequestId);
            if (!rideRequest) {
                return socket.emit('rideCancellationFailed', { message: 'Ride request not found.' });
            }
            rideRequest.status = 'cancelled';
            await rideRequest.save();
            
            socket.emit('rideRequestCancelled', rideRequest);

            if (rideRequest.captain) {
                io.to(rideRequest.captain.toString()).emit('rideCancelledByCustomer', rideRequest);
            }
        } catch (error) {
            console.error('Error cancelling ride request:', error);
            socket.emit('rideCancellationFailed', { message: 'An error occurred while cancelling the ride request.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});