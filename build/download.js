"use strict";
var http = require("http"); // or 'https' for https:// URLs
var fs = require("fs");
var download = function (url, dest, onComplete, onProgress) {
    var outStream = fs.createWriteStream(dest);
    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;
    var request = http.get(url, function (response) {
        var body = "";
        total_bytes = parseInt(response.headers["content-length"]);
        response
            .on("data", function (chunk) {
            body += chunk;
            received_bytes += chunk.length;
            onProgress(received_bytes / total_bytes);
        })
            .on("end", function () {
            onComplete(body);
        })
            .on("error", function (e) {
            console.log("Error: " + e.message);
        })
            .pipe(outStream);
    });
};
module.exports = { download: download };
