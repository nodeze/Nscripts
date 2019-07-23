//read  MSSQL Read method first 1000 record 

function read() {

    $MYSQL.initialize({
        server: "192.500.163.810",
        user: "testuser_dev",
        password: "Njt5x252$",
        database: "TEST_DB"
    });
    //some sample data to be queried from the database
    var res_str = $MYSQL.read(
                "SELECT TOP 1000 [ID]" +
                ",[Account]" +
                ",[Module]" +
                ",[Details]" +
                ",[LoggedOn]" +
                ",[Result]" +
                ",[Raw_Data]" +
                ",[processName]" +
                "FROM [DB Name ].[dbo].[Table Name]"
    );
    var res = JSON.parse(res_str);

    return res;
}


//Insert the new value using execute method 

function execute() {
    //do your stuff here
    $MSSQL.initialize({
        server: "35.452.780.569",
        user: "User Name",
        password: "Pass@312312",
        database: "sample_db_name "
    });

    var res = $MSSQL.execute("INSERT INTO [dbo].[Table name] ([Account Name]" +
                        ",[Module] ,[Details]  ,[LoggedOn] ,[Result] ,[Raw_Data] ,[processName]) " +
                        "VALUES ( 'Log' , 'Test_Query'  , 'SELECT * from Potentials WHERE sales_stage' ," +
                        "'7/05/2019'   ,1,  'Create the model function' ,'Update the Query')");

    return res;
};


