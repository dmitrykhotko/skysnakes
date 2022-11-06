import express from 'express';
import path from 'path';

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
