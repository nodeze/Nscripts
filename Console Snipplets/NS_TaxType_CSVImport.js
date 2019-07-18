(function () {
    //group by helper method
    var groupBy = function (xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    //read the file from the filestore
    var csv_file = $FILE.readLines("/FileCabinet/TaxData.csv");

    //convert the csv to json object
    var data = [];

    csv_file.forEach(function (c, i, a) {
        if (i > 0) {
            temp = c.split(",");
            var out = {};
            for (var i = 0; i < temp.length; i++) {
                out["col_" + i.toString()] = temp[i];
            }
            data.push(out);
        }
    });

    //group the results by the first column by default
    var grouped_result = groupBy(data, "col_0");

    //output processed container
    var ns_processed_rec = [];

    //transform the result to  netsuite object
    for (var key in grouped_result) {
        //process the body fields here
        var tax_type = $NS.createRecord("TaxType");

        tax_type.name = grouped_result[key][0].col_1;

        tax_type.description = grouped_result[key][0].col_2;

        tax_type.country = "_india";

        tax_type.countrySpecified = true;

        var nex_lines = [];
        var group_rec = grouped_result[key];
        //process the lines here
        group_rec.forEach(function (row) {
            //create the line level nex object
            var nex_line = $NS.createRecord("TaxTypeNexusAccounts");

            nex_line.nexus = {
                internalId: getNexusId(row.col_3)
            };
            nex_line.payablesAccount = {
                internalId: getAccountId(row.col_4)
            };
            nex_line.receivablesAccount = {
                internalId: getAccountId(row.col_5)
            };
            nex_line.description = row.col_6;
            nex_lines.push(nex_line);
        });

        tax_type.nexusAccountsList = {
            replaceAll: true,
            taxTypeNexusAccounts: nex_lines
        };
        //push the data into output for processing
        ns_processed_rec.push(tax_type);
    }

    //initialize the NetSuite Node
    $NS.initialize({
        id: 9
    });

    var response = [];
    //create the record in netsuite
    ns_processed_rec.forEach(function (res) {
        response.push($NS.add(res));
    });

    return {
        success: true,
        result: response
    };

    /**
     * @param  {String} name
     * @description Gets the internalid of the account using its name
     */

    function getAccountId(name) {
        //var accname = name.replace(/\d/g, "");
        var accname = name;
        $NS.initialize({
            id: 9
        });
        var res = JSON.parse($NS.search({
            filters: [
                ["name", "is", [accname]]
            ],
            columns: ["internalid"],
            type: "account"
        }));
        var output = "";
        if (res.success == true && res.result.length > 0) {
            //taken the first result
            output = res.result[0]["internalid"];
        }
        return output;
    }

    /**
     * @param  {String} name
     * @description Gets the internalid of the nexus account description from netsuite
     */

    function getNexusId(name) {
        //var nexusname = name.replace(/\d/g, "");
        var nexusname = name;
        $NS.initialize({
            id: 9
        });
        var res = JSON.parse($NS.search({
            filters: [
                ["description", "is", [nexusname]]
            ],
            columns: ["internalid", "description"],
            type: "nexus"
        }));
        var output = "";
        if (res.success == true && res.result.length > 0) {
            //taken the first result
            output = res.result[0]["internalid"];
        }
        return output;
    }
})();