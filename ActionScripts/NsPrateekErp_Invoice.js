function post(ctx)
{
    var request = JSON.parse(ctx.request.body);

    $LOG.debug("NS_RES" , request );
    var recordId = request.recordId;
    var recordType = request.recordType;

    //Initialize Ns
    $NS.initialize({
        id:8
    });

    var record = $NS.getRecord({
        id:recordId,
        type:recordType
    });
    
    return record;

$PTS.initalize({
    url:"http://prateekerp.com:9080/erpservice/erp/E01/0001?tranid=DNSINA"
});

var pts_res = $PTS.send({
    payload:record,
    xtrancode: "NS_"+record.type,
    keyid : "TSTDRV2111191_" + record.id
});

pts_res = JSON.parse(pts_res);

$LOG.debug("PTS_RES" , pts_res );

return {
    success:true,
    result:"action completed successfully"
};

}