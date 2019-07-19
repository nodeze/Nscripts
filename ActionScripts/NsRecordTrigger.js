/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/https'], function(https) {

    
    function afterSubmit(context) {
            var newRecord = context.newRecord;
            var headers = {
                "contentType":"application/json",
                "Authorization":"Basic 0135666d-485a-4692-8c0a-67aec649a881"
            };

            var req = {
                recordId:newRecord.id,
                recordtype : newRecord.type
            };

        var res = https.post({
            "url":"https://sandbox.nodeze.com/api/actionscripts/run?script=30&deploy=38",
            "body":JSON.stringify(req),
            "headers":headers
        });
        
        log.debug("res",res.body);
    }

    return {
        afterSubmit: afterSubmit
    };
});
