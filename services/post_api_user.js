module.exports = () => ({
    path: '/api/user',
    method: 'POST',
    delay: 1000,
    response: (req, res, querystring, jsonData) => ({
        data: {
            message: 'CREATED',
        },
        status: 201,
    }),
});