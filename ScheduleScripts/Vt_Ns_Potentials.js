function Execute()
{
    var records = getRecordsFromVitger();

    records.forEach(function(potential){
            var nsopp = transfromRecord(potential);
            $NS.initialize({
                id:8
            });
            var res = $NS.upsert(nsopp);
            $LOG.debug("res",res);
    })


}



/**
 * @description executes the query for the modified record on vtiger using timestamp
 * @returns {Object} List of Records
 * @author sathish
 */
function getRecordsFromVitger()
{
    var timestamp =  $UTIL.date.format( new Date(),"yyyy-MM-dd HH:mm:ss");
    var records_count_traker = 0;
    var lowerBound = 0;
    var upperBound = 99;
    var results = [];
    var query_tpl = "SELECT * from Potentials" 
                +"WHERE sales_stage IN ('S4','S5','S5R','S6','S7','S21','S22','Closed Won','Closed Lost','H5','H6','H7')" 
                +"AND modifiedtime >= '{{TS}}' AND modifiedby != '19x817' limit {{LWR}},{{UPL}}";
    do
    {
         var query = query_tpl.replace(/{{TS}}/g,timestamp)
        .replace(/{{LWR}}/g,lowerBound)
        .replace(/{{UPL}}/g,upperBound);
        $VTIGER.initialize(2);        
        var api_res = JSON.parse($VTIGER.query(query));
        if(api_res.success)
        {
            results.concat(api_res.result);
            records_count_traker +=100;
            upperBound +=100;
            lowerBound +=100;
        }

    }while(results.length>99&& records_count_traker < 1000);

    return results;
}



function transfromRecord(src_rec)
{
        var opp = $NS.createRecord("Opportunity");
        opp.title = src_rec.potentialname;
        opp.customFieldList = mapCustomFields(src_rec);
        opp.externalId = src_rec.id;
        opp.projectedTotal = parseFloat(src_rec.cf_2741);
        opp.projectedTotalSpecified = true;
        opp.entity = {
            externalId:getCustomerId(src_rec.related_to)
        };
        opp.subsidiary = {
            internalid:17
        };

        return opp;

}

/**
 * @param  {Object} srcrec
 * @description maps the custom fields in ns using the source record from vtiger
 */
function mapCustomFields(srcrec)
{
    //internal ids of the picklist
    var ACADEMIC_CYCLE_PID = 0;
    var SALES_STAGE_PID = 0;
    var SALES_TYPE_PID = 0;


var customfieldlist = [

    //string fields
    $NS.createCustomField({
        type:"string",
        scriptid:"custbody_crm_id",
        value:srcrec.id
    }),

    $NS.createCustomField({
        type:"date",
        scriptid:"custbody_xseed_final_qvc_date",
        value:srcrec.cf_1359
    }),

    //date fields
    $NS.createCustomField({
        type:"date",
        scriptid:"custbody_xseed_material_delivery_date",
        value: srcrec.cf_1351
    }),

    $NS.createCustomField({
        type:"date",
        scriptid:"custbody_xd_1_day_schl",
        value: srcrec.cf_1349
    }),

    $NS.createCustomField({
        type:"double",
        scriptid:"custbodycf_potentials_earlypercent",
        value: srcrec.cf_potentials_earlypercent
    }),

    //select fields
    $NS.createCustomField({
        type:"select",
        scriptid:"custbody_cseg_academic_cycle",
        value: $PICKLIST.getValue(ACADEMIC_CYCLE_PID,srcrec.cf_2721)
    }),
    $NS.createCustomField({
        type:"select",
        scriptid:"custbody_xseed_opp_status",
        value:  $PICKLIST.getValue(SALES_STAGE_PID,srcrec.sales_stage)
    }),
    $NS.createCustomField({
        type:"select",
        scriptid:"custbody_xd_sale_type",
        value:  $PICKLIST.getValue(SALES_TYPE_PID,srcrec.cf_1347)
    })
];

return customfieldlist;

}

/**
 * @param  {String} customerid
 * @description gets the externalid of customer in netsuite from vtiger ie acoountno
 */

function getCustomerId(customerid)
{
    $VTIGER.initialize(1);
    var res = JSON.parse($VTIGER.getRecord(customerid));
    if(res.success)
    {
        return res.result.account_no;
    }else {
        return null;
    }
}