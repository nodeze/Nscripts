// email send option

function send(){
    var data=$EMAIL.send({
        to: ["example@xyz.com"],
        cc: ["demo@xyz.com"],
        bcc: [],
        subject: "Test Mail",
        body: "ullam et saepe reiciendis voluptatem adipisci sitdoloremque ipsam iure quis sunt voluptatem rerum illo velit"
      });
return data;
}

// Send Email using email template

