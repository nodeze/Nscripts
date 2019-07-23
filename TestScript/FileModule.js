// Read the file  method 
function read() {
    var contents = $FILE.read("/FolderName/filename.txt");
    return contents;
}


// Read the file  method 
function read() {
    var contents = $FILE.readLines("/FolderName/filename.txt");
    return contents;
}


//Create file example 
function createFile() {
    var example_content = "est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro";
    var options = {
        folder: "/File Path/",
        name: "test.txt",
        content: example_content
    };
    var data = $FILE.create(options);
    return data;
}


// File append method

function appendFile() {
    var example_content = "est rerum tempore vitae  blanditiis voluptate porro";
    var options = {
        folder: "/file Path/",
        name: "test.txt",
        content: example_content
    };
    var data = $FILE.append(options);
    return data;
}