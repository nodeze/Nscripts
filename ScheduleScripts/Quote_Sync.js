     
     function Execute() {
            var records = getQuotesFromVitger();
            records.forEach(function (record,index,arr) {

                var ns_Esti = transformRecord(record);
                $NS.initialize({
                    id: 3
                });
                var res = $NS.upsert(ns_Esti);
                $LOG.debug("Netsuite Response", res);
            });
        }
        
        //  transform record from vtiger to ns Record
        
        function transformRecord(quote) {
            var ns_esti = $NS.createRecord("Estimate");
            ns_esti.title = quote.subject;
            ns_esti.externalId = quote.id;
            ns_esti.entity = {
                externalId: getCustomerId(quote.related_to)
            };
            ns_esti.itemList = map_lineItem_VT_NS(quote.LineItems);
          
            ns_esti.customFieldList = MAP_CUSTOMFIELDLIST(quote);
            return ns_esti;
        }
        
        function getQuotesFromVitger() {
           var timeStamp =  new moment().subtract(30,'m').format("YYYY-MM-DD HH:mm:ss");
           $LOG.debug("timeStamp", timeStamp);
            var lowerBound = 0;
            var upperBound = 99;
            var results = [];
            records_count_traker = 0;
            //Query initialize
             var query_Tl =
                "SELECT * from Quotes WHERE quotestage IN" +
                "('Accepted','Cancelled','Review Pending','Review Rejected')" +
                "AND modifiedtime > '{{Ts}}' limit {{LWB}},{{UPB}};";
            do {
                var query = query_Tl
                    .replace(/{{Ts}}/g, timeStamp)
                    .replace(/{{LWB}}/g, lowerBound)
                    .replace(/{{UPB}}/g, upperBound);
                    //$LOG.debug("query",query);
                $VTIGER.initialize(1);
                var api_res = JSON.parse($VTIGER.query(query));
                //$LOG.debug("api_res",api_res);
                if (api_res.success) {
                  
                   results = results.concat(api_res.result);
                    records_count_traker += 100;
                    upperBound += 100;
                    lowerBound += 100;
                }
            } while (results.length > 99 && records_count_traker < 200);
              //$LOG.debug("results",results);
        
            var output = results.map(function (q) {
                var res = JSON.parse($VTIGER.getRecord(q.id));
                if (res.success) {
                    return res.result;
                } else {
                    return null;
                }
            });
        
            var quotes = output.filter(function (res) {
                if (res != null) {
                    return res;
                }
            });
            
            return quotes;
        }
        
        function getCustomerId(customerid) {
            $VTIGER.initialize(1);
            
            var res = JSON.parse($VTIGER.getRecord(customerid));
           
            if (res.success) {
                return res.result.account_no;
            } else {
                return null;
            }
        }
        
        function map_lineItem_VT_NS(lineItems) {
            var itemlist = [];
            var ITEM_PICKLIST = 364;
            lineItems.forEach(function (item) {

                var EstimateItem = {};
                var rate_cf_2506 = parseFloat(item.cf_2506) || 0;
                var custcol_selling_price = parseFloat(item.listprice) || 0;
                var custcol_disc_per_id = parseFloat(item.discount_percent) || 0;
                var quantity = parseFloat(item.quantity) || 0;
                var amount = parseFloat(item.netprice) || 0;
                var custcol_disc_amount_id = amount - quantity * custcol_selling_price;
                var rate = parseFloat(item.listprice);
                rate = rate - (custcol_disc_per_id / 100) * rate;
              
                EstimateItem.item = {
                    internalId: $PICKLIST.getValue(ITEM_PICKLIST, item.productid).toString()
                };
               
                EstimateItem.rate = rate;
                EstimateItem.quantity = quantity;
                EstimateItem.customFieldList = [
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custcol_selling_price",
                        value: item.listprice
                    }),
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custcol_disc_per_id",
                        value: custcol_disc_per_id
                    }),
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custcol_disc_amount_id",
                        value: custcol_disc_amount_id
                    })
                ];
        
                itemlist.push(EstimateItem);
            });
            //$LOG.debug("itemlist", itemlist);
            return {
                replaceAll: true,
                item: itemlist
            };
        }
        
        function MAP_CUSTOMFIELDLIST(srcrec) {
            var ORDER_TYPE_PID = 365;
            var BFSC_DICT_PID = 366;
            var BFST_DICT_PID = 366;
            var cf_2047 = parseFloat(srcrec.cf_2047);
            var QUOTESTAGE_DIC_PID = 367;
            var customfieldlist = [];
        
            if (!isNullorEmpty(srcrec.id)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "string",
                        scriptid: "custbody_xseed_external_id",
                        value: srcrec.id
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.quote_no)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "string",
                        scriptid: "custbody_crm_id",
                        value: srcrec.quote_no
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2065)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "string",
                        scriptid: "custbody_xd_1_bfst_chq_no",
                        value: srcrec.cf_2065
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2031)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "string",
                        scriptid: "custbody_xd_2_chq_no",
                        value: srcrec.cf_2031
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2049)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "string",
                        scriptid: "custbody_xd_2_bfst_chq_no",
                        value: srcrec.cf_2049
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2041)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "string",
                        scriptid: "custbody_xd_3_chq_no",
                        value: srcrec.cf_2041
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.description)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "string",
                        scriptid: "custbody_xd_add_info",
                        value: srcrec.description
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2021)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custbody_xd_1_bfsc_amt",
                        value: srcrec.cf_2021
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2047)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custbody_xd_1_bfst_amt",
                        value: srcrec.cf_2047
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2029)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custbody_xd_2_bfsc_amt",
                        value: srcrec.cf_2029
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2055)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custbody_xd_2_bfst_amt",
                        value: srcrec.cf_2055
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2039)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custbody_xd_3_bfsc_amt",
                        value: srcrec.cf_2039
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2061)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "double",
                        scriptid: "custbody_xd_3_bfst_amt",
                        value: srcrec.cf_2061
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2025)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "date",
                        scriptid: "custbody_xd_1_bfsc_date",
                        value: srcrec.cf_2025
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2051)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "date",
                        scriptid: "custbody_xd_1_bfst_date",
                        value: srcrec.cf_2051
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2033)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "date",
                        scriptid: "custbody_xd_2_bfsc_date",
                        value: srcrec.cf_2033
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2057)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "date",
                        scriptid: "custbody_xd_2_bfst_date",
                        value: srcrec.cf_2057
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2043)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "date",
                        scriptid: "custbody_xd_3_bfsc_date",
                        value: srcrec.cf_2043
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2063)) {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "date",
                        scriptid: "custbody_xd_3_bfst_date",
                        value: srcrec.cf_2063
                    })
                );
            }
        
            if (!isNullorEmpty(srcrec.cf_2254)) {
                var cf_2254 = $PICKLIST.getValue(ORDER_TYPE_PID, srcrec.cf_2254);
                if(!isNullorEmpty(cf_2254))
                {
                     customfieldlist.push(
                    $NS.createCustomField({
                        type: "select",
                        scriptid: "custbody_order_type",
                        value: cf_2254
                    })
                );

                }
               
            }
        
            if (!isNullorEmpty(srcrec.cf_2069)) {
                var cf_2069 =$PICKLIST.getValue(BFSC_DICT_PID, srcrec.cf_2069);
                if(!isNullorEmpty(cf_2069))
                {
                    customfieldlist.push(
                        $NS.createCustomField({
                            type: "select",
                            scriptid: "custbody_xd_2_bfsc_mde",
                            value: cf_2069
                        })
                    );
                }
            }
        
            if (!isNullorEmpty(srcrec.cf_2075)) {
                var cf_2075= $PICKLIST.getValue(BFSC_DICT_PID, srcrec.cf_2075);
                if(!isNullorEmpty(cf_2075))
                {
                    customfieldlist.push(
                        $NS.createCustomField({
                            type: "select",
                            scriptid: "custbody_xd_2_bfst_mde",
                            value: cf_2075
                        })
                    );
                }
            }
        
            if (!isNullorEmpty(srcrec.cf_2071)) {
                var cf_2071 = $PICKLIST.getValue(BFST_DICT_PID, srcrec.cf_2071);
                if(!isNullorEmpty(cf_2071))
                {   customfieldlist.push(
                    $NS.createCustomField({
                        type: "select",
                        scriptid: "custbody_xd_3_bfsc_mde",
                        value: cf_2071
                    })
                );
               }
            }
        
            if (!isNullorEmpty(srcrec.cf_2077)) {
                var cf_2077 = $PICKLIST.getValue(BFSC_DICT_PID, srcrec.cf_2077);
                if(!isNullorEmpty(cf_2077))
                {
                    customfieldlist.push(
                        $NS.createCustomField({
                            type: "select",
                            scriptid: "custbody_xd_3_bfst_mde",
                            value: cf_2077
                        })
                    );
                }
                
            }
        
            if (!isNullorEmpty(srcrec.cf_2067)) {
                var cf_2067=$PICKLIST.getValue(BFSC_DICT_PID, srcrec.cf_2067);
                if(!isNullorEmpty(cf_2067))
                {
                    customfieldlist.push(
                        $NS.createCustomField({
                            type: "select",
                            scriptid: "custbody_xd_1_bfsc_mde",
                            value: cf_2067
                        })
                    );
                }
               
            }
        
            if (!isNullorEmpty(srcrec.cf_2073)) {
                var cf_2073=$PICKLIST.getValue(BFSC_DICT_PID, srcrec.cf_2073);
                if(!isNullorEmpty(cf_2073))
                {
                    customfieldlist.push(
                        $NS.createCustomField({
                            type: "select",
                            scriptid: "custbody_xd_1_bfst_mde",
                            value: cf_2073
                        })
                    );
                }
                
            }
        
            if (!isNullorEmpty(srcrec.quotestage)) {
                var quotestage =  $PICKLIST.getValue(QUOTESTAGE_DIC_PID, srcrec.quotestage);
                if(!isNullorEmpty(quotestage))
                {
                    customfieldlist.push(
                        $NS.createCustomField({
                            type: "select",
                            scriptid: "custbody_xseed_quote_status",
                            value: quotestage
                        })
                    );
                }
            }
            //$LOG.debug("customfieldlist",customfieldlist);
            return customfieldlist;
        }
        
        function isNullorEmpty(str) {
            if (str == "" || str == undefined || str == null) {
                return true;
            } else {
                return false;
            }
        }
            
            
            
        
       var toDate = function(date)
        {
              return new Date( date.getTime() + Math.abs(date.getTimezoneOffset()*60000));
        }


      
            
            
            
            
            
            
            
            
            
            
            
            
    
    
    
    
    