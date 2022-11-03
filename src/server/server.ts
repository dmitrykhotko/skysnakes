import { v4 } from 'node-uuid';
import express from 'express';
import path from 'path';
import WebSocket from 'ws';

declare module 'ws' {
	interface WebSocket {
		id: string;
		isAlive: boolean;
	}
}

const app = express();
const port = process.env.PORT || 3000;

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
