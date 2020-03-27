# MOCK SERVER

Start
`node index.js`

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

## Ejemplo actual

Al iniciar este proyecto estara disponible:

- STATIC http://localhost:4000/static/config.json
- GET http://localhost:4000/api/user
- POST http://localhost:4000/api/user