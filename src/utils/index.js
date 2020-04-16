export function httpRequest(request) {
    return new Promise(function (resolve, reject) {
        if (!request.mode) {
            request.mode = 'GET'
        }
        var xmlHttp = new XMLHttpRequest();
        if (request.xhr) {
            request.xhr(xmlHttp)
        }
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status < 400) {
                    resolve(JSON.parse(xmlHttp.responseText));
                } else {
                    reject(xmlHttp.responseText);
                }
            }
        };
        xmlHttp.open(request.mode, request.url, true);
        if (request.headers) {
            for (var name in request.headers) {
                xmlHttp.setRequestHeader(name, request.headers[name]);
            }
        }
        if (request.params) {
            xmlHttp.send(request.params);
        } else if (request.body) {
            xmlHttp.send(JSON.stringify(request.body));
        } else if (request.formData) {
            xmlHttp.send(request.formData);
        } else {
            xmlHttp.send(null);
        }

    });
}