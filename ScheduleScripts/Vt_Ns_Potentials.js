function Execute()
{

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
        }

    }while(results.length>99&& records_count_traker < 1000);
}