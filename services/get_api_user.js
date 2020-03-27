module.exports = () => ({
    path: '/api/user',
    method: 'GET',
    delay: 100,
    response: (req, res, querystring, jsonData) => ({
        data: [{
            name: 'Claudio',
            age: 24,
        }, {
            name: 'Esteban',
            age: 32,
        }],
        status: 200,
    }),
});