(function() {

    var eventCodes = {
        "0": "kPlayerState_None",
        "1": "kPlayerState_Stop",
        "2": "kPlayerState_Pause",
        "3": "kPlayerState_Play",
        "4": "kPlayerState_ScanForward",
        "5": "kPlayerState_ScanReverse",
        "6": "kPlayerState_Buffering",
        "7": "kPlayerState_ConnectionWait",
        "8": "kPlayerState_End",
        "9": "kPlayerState_Prepare",
        "10": "kPlayerState_Ready",
        "11": "kPlayerState_Reconnect",
        "20": "kPlayerState_Seek_Forward",
        "21": "kPlayerState_Seek_Reverse",
        "99": "kPlayerState_Exit"
    };

    // Convert event_data array into a hashmap with human-readable keywords.
    function remapEventCodes(entity, codes) {
        return entity.reduce(function(acc, cur, i) {
            var eventStr = codes[cur];  // event code string
            if (i % 2 && "kPlayerState_Exit" != eventStr) {
                acc.push([
                    eventStr,
                    parseInt(entity[i+1]),  // event start time
                    parseInt(entity[i+3])   // event end time
                ]);
            }
            return acc;
        }, []);
    }

    // Transform the data into a form suitable for visualization.
    function transformData(data, codes) {
        return data.map(function(entity) {
            var evtArray = entity["event_data"].split(":");
            entity["event_data"] = remapEventCodes(evtArray, codes);
            return entity;
        });
    };

    // Draw the chart for a single video stream.
    function visualizeStream(stream, container) {
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn({ type: 'string', id: 'Event' });
        dataTable.addColumn({ type: 'number', id: 'Start' });
        dataTable.addColumn({ type: 'number', id: 'End' });
        dataTable.addRows(stream.event_data);
        chart.draw(dataTable, {
            hAxis: {format: "mm:ss:ms"},
            height: 175
        });
    }

    // Draw the chart for all video stream.
    function visualizeAllStreams(streams, container) {
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        // Collect rows, adding the id as a label.
        var rows = [];
        for(var s in streams) {
            var stream = streams[s];
            stream.event_data.forEach(function (evt) {
                evt.unshift(stream.id.toString());
                rows.push(evt);
            });
        }

        dataTable.addColumn({ type: 'string', id: 'Id' });
        dataTable.addColumn({ type: 'string', id: 'Event' });
        dataTable.addColumn({ type: 'number', id: 'Start' });
        dataTable.addColumn({ type: 'number', id: 'End' });
        dataTable.addRows(rows);
        chart.draw(dataTable, {
            avoidOverlappingGridLines: false,
            hAxis: {format: "mm:ss:ms"},
            height: 260,
            width: 29500
        });
    }

    // Once all depencdencies are loaded, read the data and act on it.
    google.charts.load('current', {'packages':['timeline']});
    google.charts.setOnLoadCallback(function () {

        // Read in the CSV data.
        Papa.parse("data.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: function(results) {
                if (results.errors[0]) {
                    console.warn("Error:\n", results.errors[0]);
                }

                // Transform data and display results.
                var elem1 = document.getElementById("initial-json"),
                    elem2 = document.getElementById("event-codes"),
                    elem3 = document.getElementById("model"),
							  		elem4 = document.getElementById('stream-timeline'),
								  	elem5 = document.getElementById('all-streams-timeline');
							
                elem1.innerHTML = JSON.stringify(results.data[0], null, 2);
                var model = transformData(results.data, eventCodes);
                elem2.innerHTML = JSON.stringify(eventCodes, null, 2);
                elem3.innerHTML = JSON.stringify(model[0], null, 2);
                console.log("Dataset:\n", model);
                visualizeStream(model[0], elem4);
                visualizeAllStreams(model, elem5);
            }
        });
    });
})();
