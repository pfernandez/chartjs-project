



function reqListener () {
    //console.log(this.responseText);

    var data = jQuery.toArrays(this.responseText);
    console.log(data);
}


window.onload = function() {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "data.csv");
    oReq.send();
};
