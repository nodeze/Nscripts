/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/https'], function(https) {

    
    function afterSubmit(context) {
            var newRecord = context.newRecord;
            var headers = {
                "content-type":"application/json",
                "Authorization":"Basic 013ererwe-485a-46er-8cera-67aec6were881"
            };

            var req = {
                recordId:newRecord.id,
                recordType : newRecord.type
            };

  var res =  https.post({
            url:"https://nodeze.com:3001/api/actionscripts/run?script=31&deploy=39",
            body: JSON.stringify(req),
            headers: headers
        });


        log.debug("res",res.body);
    }

    return {
        afterSubmit: afterSubmit
    };
});
