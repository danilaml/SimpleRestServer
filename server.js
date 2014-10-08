var http = require('http');
var url = require('url');

var server = new http.Server();

var portn = 4242;
var vtablename = 'table';
var valtable = {};
var usrtable = {'test' : '123', 'usr1' : "qqq"};
var authorized = {};

server.listen(portn);
console.log('Server running at http://127.0.0.1:' + portn);

// first log in using PUT/POST /login/%username% and sending {"password" : "qwerty"} (test,123 or usr1,qqq in this case)
// DELETE /login/%username% to log out
// GET /%vtablename% - contents of %tablename%
// GET /%vtablename%/%key% - search for value with the key == %key%
// PUT/POST /%vtablename% with {"key" : %key%, "value" : %value} - put %value% in the table with the key == %key%
// PUT/POST /%vtablename%/%key% with {"value" : %value} - put %value% in the table with the key == %key%
// DELETE /%vtablename%/%key% - delete value with the key == %key% from the table

server.on('request', function (request, response) {
    var cookie = request.headers.cookie;
    var params = url.parse(request.url).pathname.split('/');
    var bodyStr = '';

    request.on('data', function (chunk) {
        bodyStr += chunk.toString();
    });

    request.on('end', function () {
        var res;
        if (params[1] === 'login') {
            res = login(request.method, params[2], cookie, bodyStr);
        } else if (cookie && authorized[cookie]) {
            res = process(request.method, params[1], params[2], bodyStr);
        } else {
            res = {
                statusCode : 403,
                header : {"Content-Type": "text/plain"},
                message : 'Error: you are not authorized'
            }
        }
        response.writeHead(res.statusCode, res.header);
        response.end(res.message);
    })
})

function login(method, user, cookie, bodyStr) {
    var result = {
        success: true,
        statusCode: 200,
        header : {"Content-Type": "text/plain"}
    }
    var data;
    if (!user || !usrtable[user]) {
        result.statusCode = 404;
        result.success = false;
        result.message = 'Error: no such user';
    } else if (method === 'POST' || method === 'PUT') {
        data = JSON.parse(bodyStr);
    }
    if (!result.success) {
        return result;
    }
    switch (method) {
        case 'POST':
        case 'PUT':
            if (!data.password) {
                result.statusCode = 400;
                result.success = false;
                result.message = 'Error: password is not specified';
            } else if (usrtable[user] !== data.password) {
                result.statusCode = 403;
                result.success = false;
                result.message = 'Error: wrong password';
            } else {
                var id = 'mySimpleID=' + Math.random();
                authorized[id] = true;
                result.header = {"Set-Cookie": id + ";path=/"};
                result.message = 'Logged in';
            }
            break;
        case 'DELETE':
            if (cookie) {
                var id = cookie.split('=')[1];
                authorized[id] = false;
                result.header = {"Set-Cookie": "mySimpleID=-1;path=/"};
                result.message = 'Logged out';
            } else {
                result.statusCode = 403;
                result.success = false;
                result.message = 'Error: you are not authorized';
            }
            break;
        default:
            result.statusCode = 400;
            result.success = false;
            result.message = "Error: unsupported method";
            break;
    }
    return result;
}

function process(method, tablename, key, bodyStr) {
    var result = {
        success: true,
        statusCode: 200,
        header : {"Content-Type": "text/plain"}
    }
    var data;
    if (!tablename || tablename !== vtablename) {
        result.statusCode = 404;
        result.success = false;
        result.message = 'Error: no such table';
    } else if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        data = JSON.parse(bodyStr);
    }
    if (!result.success) {
        return result;
    }
    switch (method) {
        case 'GET':
            if (!key) {
                result.message = JSON.stringify(valtable);
                result.header = {"Content-Type": "application/json"};
            } else if (valtable[key]) {
                result.message = JSON.stringify(valtable[key]);
                result.header = {"Content-Type": "application/json"};
            } else {
                result.statusCode = 404;
                result.success = false;
                result.message = 'Error: no item with such key';
            }
            break;
        case 'POST':
        case 'PUT':
            if (!key) {
                if (data.key) {
                    valtable[data.key] = data.value;
                } else {
                    result.statusCode = 400;
                    result.success = false;
                    result.message = 'Error: item key is not specified';
                }
            } else {
                valtable[key] = data.value;
            }
            break;
        case 'DELETE':
            if (!key) {
                delete valtable[data.key];
            } else {
                delete valtable[key];
            }
            break;
        default:
            result.statusCode = 400;
            result.success = false;
            result.message = 'Error: unsupported method';
            break;
    }
    return result;
}