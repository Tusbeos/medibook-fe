const express = require('express');
const path = require('path');

const app = express();

const buildDir = path.join(__dirname, '../build');
console.log('Using files in ' + buildDir);

const subDir = '/';
const logRequests = false;

if (subDir === '/') {
    console.log('The server config assuming it is serving at the server root. You can control this with the `subDir` variable in index.js.');
} else {
    console.log('The server config assuming it is serving at \'' + subDir + '\'.');
}

if (logRequests) {
    console.log('The server will log all incoming request. It\'s not recommended for production use.');
}


app.use(subDir, express.static(buildDir));
app.get('*', (req, res) => {
    if (logRequests) {
        console.log(req.method + ' ' + req.url);
    }
    res.sendFile(path.join(buildDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port);

console.log("MediBook is running on the port " + port);