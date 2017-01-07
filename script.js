

var data;

window.onload = function() {
    Papa.parse("data.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.errors[0]) {
                console.warn("Error:", results.errors[0]);
            }
            data = results;
        }
    });
};
