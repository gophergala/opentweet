(function() {

    var button = document.getElementById('go');
    button.addEventListener('click', function() {
        var string = document.getElementById('string').value;
        var container = document.getElementById('output');



        tcpClient = new TcpClient('icculus.org', 79);
        tcpClient.connect(function() {
            container.innerHTML = 'Connected to icculus.org:79<br/>';
            tcpClient.addResponseListener(function(data) {
                container.innerHTML = data;
            });
            tcpClient.sendMessage('icculus');
        });


        // chrome.sockets.tcp.onReceive.addListener(function(info) {
        //     console.log('onreceive')
        //     console.log(info.socketId)
        //     arrayBufferToString(info.data, function(str) {
        //         container.innerHTML = str;
        //     });
        // });

        // chrome.sockets.tcp.onReceiveError.addListener(function(info) {
        //     console.log('onreceiveerror')
        //     console.log(info.socketId)
        //     console.log(info.resultCode)
        // });

        // chrome.sockets.tcp.create({}, function(createInfo) {
        //     if (chrome.runtime.lastError) {
        //         console.error('Unable to create socket: ' + chrome.runtime.lastError.message);
        //         return;
        //     }
        //     console.log(createInfo.socketId)
        //     chrome.sockets.tcp.connect(createInfo.socketId, 'icculus.org', 79, function(result) {
        //         if (chrome.runtime.lastError) {
        //             console.error('Unable to connect: ' + chrome.runtime.lastError.message);
        //             return;
        //         }
        //         console.log(result)
        //         if (result < 0) {
        //             console.error('Unable to connect to server');
        //             return;
        //         }
        //         stringToArrayBuffer('icculus\r\n', function(ab) {
        //             chrome.sockets.tcp.send(createInfo.socketId, ab, function(sendInfo) {
        //                 console.log(sendInfo.resultCode)
        //                 console.log(sendInfo.bytesSent)
        //                 if (sendInfo.resultCode < 0) {
        //                     console.error('Unable to send');
        //                     return;
        //                 }
        //             });
        //         });
        //     });
        //     chrome.sockets.tcp.close(createInfo.socketId);
        // });
    });
})();

/**
 * Converts an array buffer to a string
 *
 * @private
 * @param {ArrayBuffer} buf The buffer to convert
 * @param {Function} callback The function to call when conversion is complete
 */
arrayBufferToString = function(buf, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    var blob=new Blob([ buf ], { type: 'application/octet-stream' });
    reader.readAsText(blob);
};

/**
 * Converts a string to an array buffer
 *
 * @private
 * @param {String} str The string to convert
 * @param {Function} callback The function to call when conversion is complete
 */
stringToArrayBuffer = function(str, callback) {
    var bb = new Blob([str]);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsArrayBuffer(bb);
};
