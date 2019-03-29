var XMLHttpRequest = require('xhr2');
var xhr = new XMLHttpRequest();
xhr.open("GET", "http://192.168.0.8:8081/waitingroom/assignment", true);
xhr.onreadystatechange = onResponse;
xhr.send(null);

function onResponse() {
    if (xhr.readyState != 4)  { return; }
        var serverResponse = xhr.responseText;
        console.log(serverResponse);
        const fs = require('fs');
        fs.writeFile("medidemo.json", serverResponse, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("JSON saved as file medidemo.json");
        }); 
    }