function Execute(jsonStr_customer) {
    var VT_CUS = JSON.parse(jsonStr_customer);

    var CUS_OBJ = create_customerObj(VT_CUS);

    $NS.initialize();
    $NS.upsert(CUS_OBJ);
    var contacts = $VTIGER.getRelated(VT_CUS.id, "contacts")
    var transform_contacts = sync_Contacts(contacts);
    $NS.initialize({
        id: 4
    });
    $NS.upsertList(transform_contacts);

}




function create_customerObj(VT_VENDORS) {
    // picklist initiate
    var GLOBAL_DICT_PID = 0;
    var BOARD_DICT_PID = 0;
    var GST_STATE_DICT_PID = 0;


    cus_obj = $NS.createRecord("Customer");
    cus_obj.internalId = VT_VENDORS.account_no;

    if (!isNullOrEmpty(VT_VENDORS.siccode)) {
        cus_obj.entityId = VT_VENDORS.siccode;
    } else {
        cus_obj.entityId = VT_VENDORS.account_no;
    }
    cus_obj.entityStatus = {
        internalId: $PICKLIST.getValue(GLOBAL_DICT_PID, "entityStatus")
    }
    cus_obj.customFieldList = create_customField(VT_VENDORS);


    if (VT_VENDORS.accountname.Length > 82) {
        cus_obj.companyName = VT_VENDORS.accountname.Substring(0, 80);
    } else {
        cus_obj.companyName = VT_VENDORS.accountname;
    }
    if (validateEmail(VT_VENDORS.email1)) {
        cus_obj.email = VT_VENDORS.email1;
    }

    if (validatePhNumber(VT_VENDORS.phone) && VT_VENDORS.phone.Length < 21) {
        cus_obj.phone = VT_VENDORS.phone;
    }

    cus_obj.subsidiary = {

        internalId: $PICKLIST.getValue(GLOBAL_DICT_PID, "subsidiary")

    };


    if (!isNullorEmpty(VT_VENDORS.cf_1070)) {
        var cf_1070 = $PICKLIST.getValue(BOARD_DICT_PID, VT_VENDORS.cf_1070)
        if (!isNullorEmpty(cf_1070)) {
            cus_obj.category = {
                internalId: cf_1070,
            }

        }
    }

    if (!isNullorEmpty(VT_VENDORS.assigned_user_id)) {
        cus_obj.salesRep = {
            externalId: VT_VENDORS.assigned_user_id
        }
    } else {
        cus_obj.salesRep = {
            externalId: "100740"
        }

    }

    //Create billing address record
    var billing_address = $NS.createRecord("Address")
    billing_address.addr1 = VT_VENDORS.bill_street.replace(/[^\w\d]/g, "");
    billing_address.city = VT_VENDORS.bill_city.replace(/[^\w\d]/g, " ");
    billing_address.zip = VT_VENDORS.bill_code.replace(/[^\w\d]/g, " ");
    billing_address.country = VT_VENDORS.country;

    billing_address.customFieldList = [];


    if (!isNullorEmpty(VT_VENDORS.bill_state)) {
        var bill_state = $PICKLIST.getValue(GST_STATE_DICT_PID, VT_VENDORS.bill_state)
        if (!isNullorEmpty(bill_state)) {
            billing_address.customFieldList.push(
                $NS.createCustomField({
                    type: "select",
                    scriptid: "custrecord1419",
                    value: bill_state
                })
            )
        }
    }


    // Create shipping Address Record 

    var shipping_address = $NS.createRecord("Address");
    shipping_address.add1 = VT_VENDORS.ship_street.replace(/[^\w\d]/g, "");
    shipping_address.city = VT_VENDORS.ship_city.replace(/[^\w\d]/g, "");
    shipping_address.zip = VT_VENDORS.ship_code.replace(/[^\w\d]/g, "");

    shipping_address.country = VT_VENDORS.country;

    shipping_address.customFieldList = [];

    if (!isNullorEmpty(VT_VENDORS.ship_state)) {
        var ship_state = $PICKLIST.getValue(GST_STATE_DICT_PID, VT_VENDORS.ship_state)
        if (!isNullorEmpty(ship_state)) {
            shipping_address.customFieldList.push(
                $NS.createCustomField({
                    type: "select",
                    scriptid: "custrecord1419",
                    value: ship_state
                })
            )
        }
    }

    cus_obj.addressbookList = {

        addressbook = [
            addressbookAddress = {
                billing_address,
                shipping_address
            }
        ]
    }


return cus_obj;
}


function create_customField(srcrec) {

    // pickList 
    var MOI_DICT_PID = 0;
    var MARKET_PID = 0;
    var OHTER_MARKET_DICT_PID = 0;
    var CURRENT_PUBLISHER_DICT_PID = 0;
    var FAVOURABLITY_DICT_PID = 0;
    var SIGN_UP_CYCLE_DICT_PID = 0;

    customfieldlist = [];


    if (!isNullorEmpty(srcrec.cf_1066)) {
        var cf_1066 = $PICKLIST.getValue(MOI_DICT_PID, srcrec.cf_1066)
        if (!isNullorEmpty(cf_1066)) {
            customfieldlist.push(
                $NS.createCustomField({
                    type: "select",
                    scriptid: "custentity_xseed_moi",
                    value: cf_1066
                })
            )
        }
    }



    if (!isNullorEmpty(srcrec.acc_market)) {
        var acc_market = $PICKLIST.getValue(MARKET_PID, srcrec.acc_market)
        var cf_accounts_ceregion = $PICKLIST.getValue(OHTER_MARKET_DICT_PID, srcrec.cf_accounts_ceregion)
        if (!isNullorEmpty(acc_market) || !isNullorEmpty(cf_accounts_ceregion)) {

            if (srcrec.acc_market != "Others") {
                customfieldlist.push(
                    $NS.createCustomField({
                        type: "select",
                        scriptid: "custentity_cseg_markets",
                        value: acc_market
                    })
                )
            } else {

                customfieldlist.push(
                    $NS.createCustomField({
                        type: "select",
                        scriptid: "custentity_cseg_markets",
                        value: cf_accounts_ceregion
                    })
                )
            }



        }
    }

    if (!isNullorEmpty(srcrec.cf_1068)) {
        var cf_1068 = $PICKLIST.getValue(CURRENT_PUBLISHER_DICT_PID, srcrec.cf_1068)
        if (!isNullorEmpty(cf_1068)) {
            customfieldlist.push(
                $NS.createCustomField({
                    type: "select",
                    scriptid: "custentity_xseed_current_publi",
                    value: cf_1068
                })
            )
        }
    }



    if (!isNullorEmpty(srcrec.cf_3421)) {
        var cf_3421 = $PICKLIST.getValue(FAVOURABLITY_DICT_PID, srcrec.cf_3421)
        if (!isNullorEmpty(cf_3421)) {
            customfieldlist.push(
                $NS.createCustomField({
                    type: "select",
                    scriptid: "custentityfavorability_id",
                    value: cf_3421
                })
            )
        }
    }


    if (!isNullorEmpty(srcrec.cf_2174)) {
        var cf_2174 = $PICKLIST.getValue(SIGN_UP_CYCLE_DICT_PID, srcrec.cf_2174)
        if (!isNullorEmpty(cf_2174)) {
            customfieldlist.push(
                $NS.createCustomField({
                    type: "select",
                    scriptid: "custentity_xseed_sign_up_cycle",
                    value: cf_2174
                })
            )
        }
    }



    if (!isNullorEmpty(srcrec.cf_2686)) {
        customfieldlist.push(
            $NS.createCustomField({
                type: "string",
                scriptid: "custentity_xseed_affiliation_id",
                value: srcrec.cf_2686
            })
        );

    }



    if (!isNullorEmpty(srcrec.id)) {
        customfieldlist.push(
            $NS.createCustomField({
                type: "string",
                scriptid: "custentity_xs_vtiger_ref",
                value: srcrec.id
            })
        );

    }



    if (!isNullorEmpty(srcrec.employees)) {
        customfieldlist.push(
            $NS.createCustomField({
                type: "string",
                scriptid: "custentity_xseed_ks_nu_g8",
                value: srcrec.employees
            })
        );

    }

    if (!isNullorEmpty(srcrec.cf_1600)) {
        customfieldlist.push(
            $NS.createCustomField({
                type: "date",
                scriptid: "custentity_xseed_bi",
                value: srcrec.cf_1600
            })

        )
    };


    if (!isNullorEmpty(srcrec.cf_2668)) {
        customfieldlist.push(
            $NS.createCustomField({
                type: "date",
                scriptid: "custentity_xseed_year_founded",
                value: srcrec.cf_2668
            })

        )
    };



    if (!isNullorEmpty(srcrec.cf_1108)) {

        customfieldlist.push(
            $NS.createCustomField({
                type: "double",
                scriptid: "custentity_xseed_af_lkg",
                value: srcrec.cf_1108
            })
        )
    };


    if (!isNullorEmpty(srcrec.cf_1110)) {

        customfieldlist.push(
            $NS.createCustomField({
                type: "double",
                scriptid: "custentity_xseed_af_g5",
                value: srcrec.cf_1110
            })
        )
    };

    return customfieldlist;
}


// contacts Sync function 


function sync_Contacts(VT_CONTACTS) {


    var GLOBAL_DICT_PID = 0;
    var CONTACT_TYPE_PID = 0;


    ns_contactsList = [];

    VT_CONTACTS.forEach(function (vt_contact) {

        var ns_contact = $NS.createRecord("Contact")

        if (validateEmail(vt_contact.email)) {
            ns_contact.email = vt_contact.email;
        }


        if (vt_contact.firstname.Length > 30) {
            ns_contact.firstname = vt_contact.firstname.substring(0, 29);
        } else {
            ns_contact.firstname = vt_contact.firstname;
        }

        if (vt_contact.lastname.Length > 30) {
            ns_contact.lastname = vt_contact.lastname.substring(0, 29);
        } else {
            ns_contact.lastname = vt_contact.lastname;
        }

        if (validatePhNumber(vt_contact.mobile) && vt_contact.mobile < 21) {
            ns_contact.phone = vt_contact.mobile.replace(/[^\w\d]/g, "");
        }
        var subsidiary = $PICKLIST.getValue(GLOBAL_DICT_PID, "subsidiary")
        if (subsidiary != null) {
            ns_contact.subsidiary = {
                internalId: subsidiary
            }

        }

        ns_contact.salutation = vt_contact.salutationtype;
        ns_contact.entityId = vt_contact.contact_no;
        ns_contact.title = vt_contact.contacttype;


        if (validatePhNumber(vt_contact.phone) && vt_contact.phone.Length < 21) {
            ns_contact.mobilePhone = vt_contact.phone;
        }

        ns_contact.comments = "INTEGRATION";
        ns_contact.externalId = vt_contact.id


        if (!isNullorEmpty(vt_contact.contacttype)) {
            var contacttype = $PICKLIST.getValue(CONTACT_TYPE_PID, vt_contact.contacttype)
            if (!isNullorEmpty(contacttype)) {
                ns_contact.customFieldList[
                    $NS.createCustomField({
                        type: "select",
                        scriptid: "custentity_xseed_cjt",
                        value: contacttype
                    })
                ]

            }
        }
        ns_contactsList.push(ns_contact);
    })

    return ns_contactsList;
}







function isNullOrEmpty(str) {
    if (str == "" || str == undefined || str == null) {
        return true;
    } else {
        return false;
    }
}




function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function validatePhNumber(phNumber) {
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (phNumber.match(phoneno)) {
        return true;
    } else {
        return false;
    }
}