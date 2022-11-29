import * as dotenv from 'dotenv';
import express from 'express';
// import rateLimit from 'express-rate-limit';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
// const limiter = rateLimit({
// 	windowMs: 5 * 60 * 1000, // 5 minutes
// 	max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
// 	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
// 	legacyHeaders: false // Disable the `X-RateLimit-*` headers
// });

// app.use(limiter);
app.use(express.static('dist'));
app.use(express.static('dist/client'));

// sendFile will go here
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/error', function (req, res) {
	res.sendFile(path.join(__dirname, '../client/error.html'));
});

app.listen(port);
console.log(`Express server started at http://localhost:${port}`);
