
/**
 * @param  {Object} req
 * @description Post handler for creation of journal entries inside Netsuite
 * @example var request = require("request");

var options = { method: 'POST',
  url: 'https://sandbox.nodeze.com/api/actionscripts/run',
  qs: { script: '16', deploy: '27' },
  headers: 
   { 
     authorization: 'Basic c2dfF0aGadlzaC5hobm9zdfdfb2Z0LmNdfvbdfTpOZXRzdf0ZUAxMjdfM=',
     'content-type': 'application/json' },
  body: 
   { memo: 'testentry',
     date: '2008-09-22T14:01:54.9571247Z',
     line: 
      [ { debit: 60000, empid: 'MET_IND022', account: 113 },
        { empid: 'MET_IND022', credit: 2000, account: 328 },
        { empid: 'MET_IND022', credit: 60000, account: 348 },
        { debit: 52000, empid: 'MET_IND030', account: 113 },
        { empid: 'MET_IND030', credit: 0, account: 328 },
        { empid: 'MET_IND030', credit: 52000, account: 348 }}] },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});

 */

function post(req) {
    var request = JSON.parse(req.request.body);
    $LOG.debug("request", request);
    var JE = $NS.createRecord("JournalEntry");
    JE.memo = request.memo;
    JE.externalId = request.externalid.toString();
    JE.subsidiary = {
        internalId: "3"
    };
    JE.trandate = request.date;
    JE.trandateSpecified = true;
    JE.lineList = process_lines(request.line);
    //initialize the Netsuite Account
    $NS.initialize({
        id: 6
    });
    // return JE;
    $LOG.debug("finalreq", JE);
    var res = $NS.upsert(JE);
    $LOG.debug("response", res);
    return res;
}

//process the line items from the request
function process_lines(data) {
    if (Array.isArray(data)) {
        var lines = data.map(function (c, i, a) {
            if (c.hasOwnProperty("credit")) {
                return process_credit(c);
            } else {
                return process_debit(c);
            }
        });
        return {
            line: lines,
            replaceAll: true
        };
    }
}

//process the credit line
function process_credit(data) {
    var jv_credit = {};
    jv_credit.account = {
        internalId: data.account.toString()
    };
    jv_credit.credit = data.credit;
    jv_credit.entity = {
        internalId: data.empid.toString(),
        type: "employee"
    };
    return jv_credit;
}

//process the debit line
function process_debit(data) {
    var jv_debit = {};
    jv_debit.account = {
        internalId: data.account.toString()
    };
    jv_debit.debit = data.debit;
    jv_debit.entity = {
        internalId: data.empid.toString(),
        type: "employee"
    };
    return jv_debit;
}