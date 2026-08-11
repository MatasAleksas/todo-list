const http = require('http');
const { URL } = require('url');

let todos = [
    {id: 1, task: 'task 1', completed: false},
    {id: 2, task: 'task 2', completed: true},
];

const server = http.createServer((req, res) => {
    const { method, url } = req;
    const parsedUrl = new URL(url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // handle pre-flight requests 
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // route: GET /todos
    if (method === 'GET' && pathname === '/todos') {
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(todos));
    }
    // route: POST /todos
    else if (method === 'POST' && pathname === '/todos') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const newTodo = JSON.parse(body);
                
                newTodo.id = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
                todos.push(newTodo);

                res.writeHead(201, { 'Content-Type': 'application/json'});
                res.end(JSON.stringify(newTodo));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json'});
                res.end(JSON.stringify({ error: 'Invalid JSON'}));
            }
        });
    }
    // route: PUT /todos/:id
    else if (method === "PUT" && pathname.startsWith('/todos/')) {
        const id = parseInt(pathname.split('/')[2]);
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const updatedTodo = JSON.parse(body);
                const index = todos.findIndex(t => t.id === id);

                if (index === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Todo not found'}));
                } else {
                    todos[index] = { ...todos[index], ...updatedTodo };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(todos[index]));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    // route: DELETE /todos/:id
    else if (method === "DELETE" && pathname.startsWith('/todos/')) {
        const id = parseInt(pathname.split('/')[2]);
        const index = todos.findIndex(t => t.id === id);
        
        if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Todo not found'}));
        } else {
            todos = todos.filter(t => t.id !== id);
            res.writeHead(204);
            res.end();
        }
    }
    // 404 not found
    else {
        res.writeHead(404, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Not Found'}));
    }
});

const PORT = 3000;

server.listen(PORT, 'localhost', () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
})