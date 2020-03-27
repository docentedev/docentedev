/*
# MOCK SERVER

## fetures
- no tiene dependencias
- CORS configurado para aceptar todos los origenes
- auto scaneo de servicios creados
- responde archivos estaticos
- pensado para simular servicios JSON
- super ligero
- todo el codigo en un solo archivo
- configurable

crear directorios de la siguiente forma
## configuración

```
mock-server
    -> mock-server.js
    -> services (carpeta donde van los servicios)
        jwt.js
        user.js
        products.js
    -> static
        config.json // url: localhost:4000/static.config.json
```

## Servicios
```js
module.exports = () => ({
    path: '/url/jwt',
    method: 'GET',
    response: (req, res, querystring, jsonData) => ({
        data: {
            jwt: 'token.1234.1234',
        },
        status: 200,
    }),
    delay: 2000,
});
```
### opciones de un servicio
- path: sera la URL con la que haga match
- method: metodo con el que se hara match
- response: funcion que retorna la respuesta sus parametros son:
    - req: request de http de nodejs
    - res: response de http de nodejs
    - querystring: objeto JSON de los parametros pasados en la URI
    - jsonData: sera el body que se envia como JSON
- response: lo que retorna la funcion sera:
    data: es lo que retornara el body como JSON
    status: es esta code HTTP que retornara el servicio
- delay: parametro opcional para hacer que un servicio especifico retorna con retraso la respuesta
*/

const http = require('http');
const url = require('url');
const fs = require("fs");
const path = require("path");

// DEFINE PORT TO MOCK SERVER
const PORT = 4000;
const DELAY_RESPONSE = 200;

const normalizedPath = path.join(__dirname, "services");

const mimeDict = {
    json: 'application/javascript',
};

const serviceDiscovery = (req, res, query) => {
    const services = [];
    fs.readdirSync(normalizedPath).forEach(function(file) {
        services.push(require("./services/" + file)(req, res, query));
    });
    return services;
};

const findService = (serviceList, req, path, querystring, jsonData) => {
    const activeService = serviceList.find(s => s.path === path && s.method === req.method);
    if (activeService) return activeService;
    return ({ response: () => ({ message: 'mock' }), status: 200 });
};

http.createServer(function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // OPTIONS return OK
    if (req.method === 'OPTIONS') {
        res.end();
        return;
    }

    // favicon return OK
    if (req.url === '/favicon.ico') {
        res.end();
        return;
    }

    const urlParse = url.parse(req.url, true);

    if (`${urlParse.pathname}`.startsWith('/static')) {
        const staticUrl = urlParse.pathname;
        const ext = staticUrl.split('.').reverse()[0];
        const mime = mimeDict[ext] || 'text/plain';

        const dir = path.join(__dirname, 'static', staticUrl.replace('/static', ''));
        fs.readFile(dir, 'utf8', function(err, contents) {
            if (err) {
                res.statusCode = 404;
                res.end('Not File');
            } else {
                console.log(contents)
                res.statusCode = 200;
                res.setHeader('Content-Type', mime);
                res.end(contents);
            }
        });
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
        let jsonData = {};
        try {
            jsonData = JSON.parse(body);
        } catch (error) {}
        const querystring = urlParse.query;
        const route = findService(serviceDiscovery(), req, urlParse.pathname, querystring, jsonData);
        res.setHeader('Content-Type', 'application/json');

        const routeResponse = route.response(req, res, querystring, jsonData);
        const response = JSON.stringify(routeResponse.data);
        res.statusCode = routeResponse.status;

        if (!res.statusCode) { res.statusCode = 500; }
        const delayResponse = route.delay || DELAY_RESPONSE;
        setTimeout(() => {
            console.log('- SERVICE --------------------\n', {
                method: req.method,
                status: res.statusCode,
                path: urlParse.pathname,
                querystring,
                responseBody: routeResponse.data,
                requestBody: jsonData,
                delay: delayResponse
            }, '\n');
            res.end(response);
        }, delayResponse);

    });
}).listen(PORT, () => {
    console.log(`Mock server is running in port: ${PORT}`);
});