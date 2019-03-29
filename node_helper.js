/* -----------------------------------------------------------
 * Module:       MMM-Tabulator
 * FileName:     node_helper.js
 * Author:       E:V:A
 * License:      MIT
 * Date:         2018-03-05
 * Version:      1.0.2
 * Description:  A MagicMirror Demo module for using Tabulator
 * Format:       4-space TAB's (no TAB chars), mixed quotes
 *
 * URL1:         https://github.com/E3V3A/MMM-Tabulator
 * URL2:         https://github.com/olifolkerd/tabulator
 * -----------------------------------------------------------
 * Tabulator Requires:
 *      "node_modules/jquery/dist/jquery.min.js",
 *      "node_modules/jquery-ui-dist/jquery-ui.min.js",
 *      "node_modules/jquery-ui-dist/jquery-ui.css",
 *      "node_modules/jquery.tabulator/dist/js/tabulator.js",
 *      "node_modules/jquery.tabulator/dist/css/tabulator.css",
 * -----------------------------------------------------------
 * See:
 *   https://stackoverflow.com/questions/32621988/electron-jquery-is-not-defined?rq=1
 *   https://electronjs.org/docs/faq
*/

'use strict';

const fs = require('fs');
const XMLHttpRequest = require('xhr2');

module.exports = NodeHelper.create({

    start: function() {
        this.config = null;
    },

    readData: function() {
        const myfile = 'modules/MMM-Tabulator/medilounge.json';
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://192.168.0.8:8081/waitingroom/assignment", true);
        xhr.onreadystatechange = onResponse;
        xhr.send(null);

        function onResponse() {
            if (xhr.readyState != 4)  { return; }
                var serverResponse = xhr.responseText;
                console.log(serverResponse);
                const fs = require('fs');
                fs.writeFile(myfile, serverResponse, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("JSON saved as file medidemo.json");
                }); 
            }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "REQUEST_DATA") {
            this.config = payload;
            this.readData();
            setInterval(() => {
                this.readData();
            }, this.config.updateInterval * 1000);
        }
    }

});

// To check if something is JSON
function isJSON(str) {
    try { return (JSON.parse(str) && !!str); }
    catch (e) { return false; }
}

// To check if something is an Array or Object (parsed JSON)
function isAO(val) {
    return val instanceof Array || val instanceof Object ? true : false;
}

// --------------------------------------------------------------------------
// What:  A dirt simple JSON cleanup function that also compactifies the data
// NOTE:  - Only use on flat and trustworthy ASCII JSON data!
//        - Cannot handle any characters outside [A-Za-z0-9_\-]. (e.g. UTF-8)
//        - Using remote data without further sanitation is a security risk!
// --------------------------------------------------------------------------
const re1 = /([A-Za-z0-9_\-]+):/gm;  // use const to make sure it is compiled
function jZen(data) {
    //let re1 = /([A-Za-z0-9_\-]+):/gm; // Find all ASCII words $1 before an ":"
    let str = "";
    str = data.replace(/\s/gm, '');     // Remove all white-space
    str = str.replace(/\'/gm, '\"');    // Replace all ' with "
    str = str.replace(re1, '\"$1\":');  // Replace $1: with "$1":
    //console.log("Dirty JSON is:\n" + data.toString() );
    //console.log("Clean JSON is:\n" + str);
    return str;
}
