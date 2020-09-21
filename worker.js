const AWS = require('aws-sdk')


AWS.config.update({
  accessKeyId: 'ASIAWI3G2UXHOSQCNTFN',
  secretAccessKey: 'hccKSHkWJVGKMN2rSxG791rZiXxgpK4Bvw2XD6Xe',
  sessionToken: "FwoGZXIvYXdzEHQaDJXqudaEmX/9/tWrEiLDAazNebyzVxT6g9DHasj7SSv5EXHdPYVvaAzSoQz0CAY7q+X8OEJAT8yZ0QPkMhMsvGXfP90rbr6PtX3O/dKjHn9G4N0zUPrxNkxhqzF8y0+k1CrcpjpAixV73aYam7x+lUNnCbDnfDMC+/4QWvXKSUGlbnANK28PX+HQgssT9U5VijSjLW9ssDJhY6iHj1SWi5y1GEOEKaKWJQGUE5BRohJOokAi4G9D6l5mknHcCWhtBjXWMTFQWnBQM5leyZst0D6b2Cj+16P7BTIteOtpzV2s1KfTCJXH04a3M0O1KzxXy3tVvuA+bTyziuou2kadJV7rO9f0R4Tv"
})
AWS.config.update({ region: 'us-east-1' })

const myBucket = 'testowybucket'
const myKey = 'test.jpg'
const signedUrlExpireSeconds = 60 * 4
var s3 = new AWS.S3({
  signatureVersion: 'v4'
});


var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var queueURL = "https://sqs.us-east-1.amazonaws.com/431322998222/test.fifo";

var params = {
  AttributeNames: [
    "SentTimestamp"
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
    "All"
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 1,
  WaitTimeSeconds: 20
};


var receiveMessage = function() {
  sqs.receiveMessage(params, function(err, data) {
      if(err){
          console.log(err);
          }
      if (data.Messages) {
          for (var i = 0; i < data.Messages.length; i++) {
              var message = data.Messages[i];
              var name = data.Messages[0].Body
              // var body = JSON.parse(message.Body);
              var getParams = {
                Bucket: 'testowybucket', // your bucket name,
                Key: name // path to the object you're looking for
              }
        
              s3.getObject(getParams, function (err, data) {
                // Handle any error and exit
                if (err)
                  return err;
        
                console.log(name)
                new_name = "changed_"+ name
        
                var uploadOptions = {
                  Bucket: "testowybucket",
                  Key: new_name,
                  ContentType: 'image/jpeg',
                  Body: data.Body
                };

                s3.putObject(uploadOptions, function (err, data) {
                  if (err) console.log(err)
                  console.log("success")
                });
                let objectData = data.Body.toString('utf-8'); // Use the encoding necessary
              });
              removeFromQueue(message);
          }
          receiveMessage();
      } else {
          setTimeout(function() {
              receiveMessage()
          }, 60 * 1000);

      }
  });
};

var removeFromQueue = function(message) {
  sqs.deleteMessage({
      QueueUrl : queueURL,
      ReceiptHandle : message.ReceiptHandle
  }, function(err, data) {
      err && console.log(err);
  });
};


receiveMessage();



// while (true) {
//   // your code
  
//   async function foo() {

//     const promise = await new Promise((resolve, reject) => {
//       setTimeout(() => resolve("finishedWorker"), 5000);
//     })
//     console.log("start") 

//   sqs.receiveMessage(params, function (err, data) {
//     if (err) {
//       console.log("Receive Error", err);
//     } else if (data.Messages) {
//       // getimage(data.Messages[0].Body);
//       console.log()

//       var getParams = {
//         Bucket: 'testowybucket', // your bucket name,
//         Key: data.Messages[0].Body // path to the object you're looking for
//       }

//       s3.getObject(getParams, function (err, data) {
//         // Handle any error and exit
//         if (err)
//           return err;

//         console.log(data.Body)
//         new_name = "changed"+data.Body  

//         var uploadOptions = {
//           Bucket: "testowybucket",
//           Key: new_name,
//           ContentType: 'image/jpeg',
//           Body: data.Body
//         };
//         s3.putObject(uploadOptions, function (err, data) {
//           if (err) console.log(err)
//           console.log("success")
//         });


//         // Convert Body from a Buffer to a String

//         let objectData = data.Body.toString('utf-8'); // Use the encoding necessary
//       });

//       // const obj = JSON.parse(data.Messages[0]);
//       console.log(data.Messages[0].Body)
//       var deleteParams = {
//         QueueUrl: queueURL,
//         ReceiptHandle: data.Messages[0].ReceiptHandle
//       };
//       sqs.deleteMessage(deleteParams, function (err, data) {
//         if (err) {
//           console.log("Delete Error", err);
//         } else {
//           console.log("Message Deleted", data);
//         }
//       });
//     }
//   });
// }
// foo();
// }

