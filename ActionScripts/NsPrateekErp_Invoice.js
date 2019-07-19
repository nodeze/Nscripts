
        
        
        
function post(ctx)
{
    var request = JSON.parse(ctx.request.body);
    $LOG.debug("NS_RES" , request );
    var recordId = request.recordId.toString();
    var recordType = request.recordType;
    //Initialize Ns
    $NS.initialize({
        id:8
    });

    var response = $NS.getRecord({
        id:recordId,
        type:recordType
    });
    
    
var record = response.record;
 
 $LOG.debug("record",record);

$PTS.initialize({
    url:"http://prateekerp.com:9080/erpservice/erp/E01/0001?tranid=DNSINA"
});

var pts_res = $PTS.send({
    payload: JSON.stringify(record),
    xtrancode: "NS_"+recordType,
    keyid : "TSTDRV2111191_" + record.internalId
});

pts_res = JSON.parse(pts_res);

$LOG.debug("PTS_RES" , pts_res );

return {
    success:true,
    result:"action completed successfully"
};

}
    
    
    
    
    
    
    
    