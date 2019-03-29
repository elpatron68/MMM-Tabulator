/* -----------------------------------------------------------
 * Module:       MMM-Tabulator
 * FileName:     MMM-Tabulator.js
 * Author:       E:V:A
 * License:      MIT
 * Date:         2018-03-05
 * Version:      1.0.2
 * Description:  A MagicMirror Demo module for using Tabulator
 * Format:       4-space TAB's (no TAB chars), mixed quotes
 *
 * URL1:         https://github.com/E3V3A/MMM-Tabulator
 * URL2:         http://tabulator.info/
 * URL3:         https://github.com/olifolkerd/tabulator
 * -----------------------------------------------------------
 * About Tabulator CSS & Themes:
 *   http://tabulator.info/docs/3.4?#css
 *   http://tabulator.info/examples/3.4?#theming
 * -----------------------------------------------------------
 */

//-----------------------------------------------------
// Tabulator Requires:
// "node_modules/jquery/dist/jquery.min.js",
// "node_modules/jquery-ui-dist/jquery-ui.min.js",
// "node_modules/jquery-ui-dist/jquery-ui.css",
// "node_modules/jquery.tabulator/dist/js/tabulator.js",
// "node_modules/jquery.tabulator/dist/css/tabulator.css",
//-----------------------------------------------------

'use strict';

Module.register('MMM-Tabulator',{

    defaults: {
        header: "Patientenaufrufe", // The module header text, if any
        maxItems: 10,           // MAX number of planes (table rows) to show
        updateInterval: 180     // [sec] Read the file every 3 min
        //fileUrl: "file:///home/pi/MagicMirror/modules/MMM-backlog/demo.json"
    },

    requiresVersion: "2.1.0",

    start: function() {
        this.loaded = false;
        this.sendSocketNotification("REQUEST_DATA", this.config);
    },

    getDom: function() {
        let w = document.createElement("div");  // Let w be the "wrapper"
        w.id = "patlist";                   // The id used by Tabulator

        if (!this.loaded) {
            w.innerHTML = "Loading...";
            w.className = "dimmed light small";
            return w;
        }
        if (!this.data) {
            w.innerHTML = "No data!";
            w.className = "dimmed light small";
            return w;
        }
        w.innerHTML = "Waiting for Tabulator...";
        return w;
    },

    getScripts: function() {
        return [
            this.file('node_modules/jquery/dist/jquery.min.js'),
            this.file('node_modules/jquery-ui-dist/jquery-ui.min.js'),
            this.file('node_modules/jquery.tabulator/dist/js/tabulator.js')
        ]
    },

    getStyles: function() {
        return [
            this.file('node_modules/jquery-ui-dist/jquery-ui.css'),
            //this.file('node_modules/jquery.tabulator/dist/css/tabulator.css'),                // Standard Theme
            this.file('node_modules/jquery.tabulator/dist/css/tabulator_midnight.min.css'),     // Midnight Theme
            //this.file('node_modules/jquery.tabulator/tabulator_simple.min.css'),              // Simple Theme
            //this.file('node_modules/jquery.tabulator/bootstrap/tabulator_bootstrap.min.css'), // Bootstrap Theme
            "MMM-Tabulator.css"
        ];
    },

    getTranslations: function() { return false; }, // Nothing to translate

    // This come from the MM CORE or from other modules
    notificationReceived: function (notification, payload, sender) {
        if (notification === "DOM_OBJECTS_CREATED") {
            // The div with id "flighttable" now exists, so we can load Tabulate.
            this.loadTabulate();
        }
    },

    // This comes from YOUR module, usually "node_helper.js"
    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case "NEW_DATA":
                //console.log("MMM-Tabulator: NEW_DATA received!");
                this.loaded = true;
                this.setTableData(payload);
                break;
        }
    },

    //===================================================================================
    //  From here:  Tabulator specific code
    //===================================================================================
    loadTabulate: function() {

        // see: http://tabulator.info/docs/3.3#mutators
        /*Tabulator.extendExtension("mutator", "mutators", {
            ft2met:function(value, data, type, mutatorParams){
                return (value * 0.3048).toFixed(0);
            },
        });*/

        let self = this;

        Tabulator.extendExtension("format", "formatters", {
            ft2mt:function(cell, formatterParams){              // Feet to Meters
                return  (0.3048*cell.getValue()).toFixed(0);
            },
            kn2km:function(cell, formatterParams){              // Knots to Kilometers
                return  (1.852*cell.getValue()).toFixed(0);
            },
            ep2time:function(cell, formatterParams){            // POSIX epoch to hh:mm:ss
                let date = new Date(cell.getValue());
                // We use "en-GB" only to get the correct formatting for a 24 hr clock, not your TZ.
                return date.toLocaleString('en-GB', { hour:'numeric', minute:'numeric', second:'numeric', hour12:false } );
            },
            // placeholder: deg2dir
        });

        let patlist = $("#patlist");
        var patlistHeight = ( this.config.maxItems * 33 + 33 );   // @12px font-size we have [~33 px/row]

        flightTable.tabulator({
            height:patlistHeight,           // [px] Set MAX height of table, this enables the Virtual DOM and improves render speed
            height:205,                         // Set height of table, this enables the Virtual DOM and improves render speed
            layout:"fitColumns",                // Fit columns to width of table (optional)
            //headerSort:false,                   // Disable header sorter
            resizableColumns:false,             // Disable column resize
            responsiveLayout:true,              // Enable responsive layouts
            placeholder:"Warte auf Daten...",   // Display message to user on empty table
            initialSort:[                       // Define the sort order:
                {column:"patName",     dir:"asc"},     // 1'st
                //{column:"flight",     dir:"desc"},    // 2'nd
                //{column:"bearing",    dir:"asc"},     // 3'rd
            ],
            columns:[
                {title:"Patient*in",    field:"patName",         headerSort:false, sortable:false, visible:true, align:"left"}, // , width:250},
                {title:"Behandler*in",  field:"docName",         headerSort:false, sortable:false, visible:true, align:"left"},
                {title:"Raum",          field:"roomName",        headerSort:false, sortable:false, visible:true, align:"left"},
                {title:"Neu",           field:"new",             headerSort:false, sortable:false, visible:true, align:"left"}
            ],
        });

        $(window).resize(function () {
            patlist.tabulator("redraw");
        });
    },

    setTableData: function(data) {
        $("#patlist").tabulator("setData", data);
    }
    //===================================================================================

});
