/**
 * @description Sends the Email by using Email module and Db module
 * @author sathish.a@prateektechnosoft.com
 */
function sendAutoMailer() {
    //initialize the database
    $MYSQL.initialize({
        server: "112.20.137.82",
        user: "demo_dev",
        password: "Nj34x22$",
        port: "3306",
        database: "TEST_DB"
    });

    //some sample data to be queried from the database
    var res_str = $MYSQL.read("SELECT itemid,description,rate,qty FROM items;");
    var res = JSON.parse(res_str);

    $LOG.debug("result", res);

    var table_template = $FILE.read("/EmailTemplates/items_layout.html");
    table_template = table_template.replace("{{table}}", renderArrayTable(res));

    //send email method
    $EMAIL.send({
        to: ["sathish.a@example.com"],
        cc: [],
        bcc: [],
        subject: "Store - Items on Hand",
        body: table_template
    });
}

//helper function for generating html table for template
function renderArrayTable(arr, css) {
    var firstrow = arr[0];
    var keys = Object.keys(firstrow);
    var thead = get_thead(keys);
    var trow = "";
    arr.forEach(function (row, index, arrdata) {
        trow += get_row(row);
    });
    var tbody = get_tbody(trow);
    return getTable(thead, tbody, css);
}

function get_thead(headers) {
    var temp = "";
    headers.forEach(function (c, i, a) {
        temp += "<th>" + c + "</th>";
    });
    return "<tr>" + temp + "</tr>";
}

function get_tbody(rows) {
    return "" + rows + "";
}

function get_row(row) {
    var temp = "";
    for (var key in row) {
        temp += "<td>" + row[key] + "</td>";
    }
    return "<tr>" + temp + "</tr>";
}

function getTable(thead, tbody, csspath) {
    var temp = "";
    return temp + "<table class='dtable'>" + thead + tbody + "</table>";
}