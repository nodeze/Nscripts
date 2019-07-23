// Create the Http Get Request 

function get(){
    var options = {url:"https://jsonplaceholder.typicode.com/todos/1"};
     var response = $HTTP.get(options);
   //returns the reponse data as string
   var body_str = response.body;
   var body = JSON.parse(response.body);
   return body;
    }

//Test for the Http POST request 


function post(){

    var request_body = {
        userId: 1,
        id: 1,
        title: "delectus aut autem",
        completed: false
      };

      //request options for the post request
      var options = {
        url: "https://jsonplaceholder.typicode.com/todos/1",
        headers: {
          "content-type": "application/json",
          authorization: "aeraewrawadiwoieriununjlamifmai"
        },
        body: JSON.stringify(request_body)
      };

      var response = $HTTP.post(options);
      //returns the reponse data as string
      var body_str = response.body;
      var body = JSON.parse(response.body);
      return body;
}



// Create HTTP request such as get post put delete 


function request(){

    var options = {
        url: "https://jsonplaceholder.typicode.com/todos/1",
        headers: {
          "content-type": "application/json",
          authorization: "aeraewrawadiwoieriununjlamifmai"
        },
        body: "",

        //Change the Method Like POST,PUT 
        method:"GET"
      };
      var response = $HTTP.request(options);
      //returns the reponse data as string
      var body_str = response.body;
      var body = JSON.parse(response.body);
      return body;

}