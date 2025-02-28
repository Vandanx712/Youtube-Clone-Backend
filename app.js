import express from 'express'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userrouter from "./Routes/user.routes.js";
import videorouter from './Routes/video.routes.js'
import commentrouter from './Routes/comment.routes.js';
import subscriptionrouter from './Routes/subscription.routes.js'
import likerouter from './Routes/like.routes.js'
import playlistrouter from "./Routes/playlist.routes.js";

const app = express(); 

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(express.json({limit:'16kb'}));  
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use('/api/v1/users', userrouter);
app.use('/api/v1/videos',videorouter)
app.use('/api/v1/comments',commentrouter)
app.use('/api/v1/subscriptions' , subscriptionrouter)
app.use('/api/v1/likes',likerouter)
app.use('/api/v1/playlists', playlistrouter)

export { app };
