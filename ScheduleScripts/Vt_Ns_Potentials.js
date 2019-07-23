function Execute() {
  var records = getRecordsFromVitger();
  $LOG.debug("records", records);
  records.forEach(function(potential) {
    var nsopp = transfromRecord(potential);
    $NS.initialize({
      id: 3
    });
    var res = $NS.upsert(nsopp);
    $LOG.debug("nsresponse", res);
  });
}

/**
 * @description executes the query for the modified record on vtiger using timestamp
 * @returns {Object} List of Records
 * @author sathish
 */
function getRecordsFromVitger() {
  var timestamp = new moment().subtract(30,'m').format("YYYY-MM-DD HH:mm:ss");
  var records_count_traker = 0;
  var lowerBound = 0;
  var upperBound = 99;
  var results = [];
  var query_tpl =
    "SELECT * from Potentials " +
    "WHERE sales_stage IN('S4','S5','S5R','S6','S7','S21','S22','Closed Won','Closed Lost','H5','H6','H7') " +
    "AND modifiedtime >= '{{TS}}'  limit {{LWR}},{{UPL}};";
  do {
    var query = query_tpl
      .replace(/{{TS}}/g, timestamp)
      .replace(/{{LWR}}/g, lowerBound)
      .replace(/{{UPL}}/g, upperBound);
    $VTIGER.initialize(1);
    var api_res = JSON.parse($VTIGER.query(query));
    $LOG.debug("api_res", api_res);
    if (api_res.success) {
      results.concat(api_res.result);
      records_count_traker += 100;
      upperBound += 100;
      lowerBound += 100;
    }
  } while (results.length > 99 && records_count_traker < 1000);

  return results;
}

function transfromRecord(src_rec) {
  var opp = $NS.createRecord("Opportunity");
  opp.title = src_rec.potentialname;
  opp.customFieldList = mapCustomFields(src_rec);
  opp.externalId = src_rec.id;
  opp.projectedTotal = parseFloat(src_rec.cf_2741);
  opp.projectedTotalSpecified = true;
  opp.entity = {
    externalId: getCustomerId(src_rec.related_to)
  };
  opp.subsidiary = {
    internalid: 17
  };

  return opp;
}

/**
 * @param  {Object} srcrec
 * @description maps the custom fields in ns using the source record from vtiger
 */
function mapCustomFields(srcrec) {
  //internal ids of the picklist
  var ACADEMIC_CYCLE_PID = 370;
  var SALES_STAGE_PID = 368;
  var SALES_TYPE_PID = 369;
  var customfieldlist = [];

  if (!isNullorEmpty(srcrec.id)) {
    customfieldlist.push(
      $NS.createCustomField({
        type: "string",
        scriptid: "custbody_crm_id",
        value: srcrec.id
      })
    );
  }
  if (!isNullorEmpty(srcrec.cf_1359)) {
    customfieldlist.push(
      $NS.createCustomField({
        type: "date",
        scriptid: "custbody_xseed_final_qvc_date",
        value: srcrec.cf_1359
      })
    );
  }

  if (!isNullorEmpty(srcrec.cf_1351)) {
    customfieldlist.push(
      $NS.createCustomField({
        type: "date",
        scriptid: "custbody_xseed_material_delivery_date",
        value: srcrec.cf_1351
      })
    );
  }

  if (!isNullorEmpty(srcrec.cf_1349)) {
    customfieldlist.push(
      $NS.createCustomField({
        type: "date",
        scriptid: "custbody_xd_1_day_schl",
        value: srcrec.cf_1349
      })
    );
  }

  if (!isNullorEmpty(srcrec.cf_potentials_earlypercent)) {
    customfieldlist.push(
      $NS.createCustomField({
        type: "double",
        scriptid: "custbodycf_potentials_earlypercent",
        value: srcrec.cf_potentials_earlypercent
      })
    );
  }

  if (!isNullorEmpty(srcrec.cf_2721)) {
    var cf_2721 = $PICKLIST.getValue(ACADEMIC_CYCLE_PID, srcrec.cf_2721);
    if (!isNullorEmpty(cf_2721)) {
      customfieldlist.push(
        $NS.createCustomField({
          type: "select",
          scriptid: "custbody_cseg_academic_cycle",
          value: cf_2721
        })
      );
    }
  }

  if (!isNullorEmpty(srcrec.sales_stage)) {
    var sales_stage = $PICKLIST.getValue(SALES_STAGE_PID, srcrec.sales_stage);
    if (!isNullorEmpty(sales_stage)) {
      customfieldlist.push(
        $NS.createCustomField({
          type: "select",
          scriptid: "custbody_xseed_opp_status",
          value: sales_stage
        })
      );
    }
  }

  if (!isNullorEmpty(srcrec.cf_1347)) {
    var cf_1347 = $PICKLIST.getValue(SALES_TYPE_PID, srcrec.cf_1347);
    if (!isNullorEmpty()) {
      customfieldlist.push(
        $NS.createCustomField({
          type: "select",
          scriptid: "custbody_xd_sale_type",
          value: cf_1347
        })
      );
    }
  }

  return customfieldlist;
}

/**
 * @param  {String} customerid
 * @description gets the externalid of customer in netsuite from vtiger ie acoountno
 */

function getCustomerId(customerid) {
  $VTIGER.initialize(1);
  var res = JSON.parse($VTIGER.getRecord(customerid));
  if (res.success) {
    return res.result.account_no;
  } else {
    return null;
  }
}

function isNullorEmpty(str) {
  if (str == "" || str == undefined || str == null) {
    return true;
  } else {
    return false;
  }
}
