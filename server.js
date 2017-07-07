var path = require('path');
var express = require('express');
var app = express();  
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var url= 'mongodb://itme:passwordA@ds049935.mlab.com:49935/polls';

app.route('/getall')
    .get(function(req, res) {
        MongoClient.connect(url,function(err,db){
            if(err)
            { 
              console.log(err);
              res.send("Error connecting to server.");
            }
            var characters = db.collection('polls');
		    var findOne = (db,err) =>
		    {
		      characters.find({},{})
		      .toArray((err,data) => {
		          if(err)
		            console.log(err);
		          else
		           res.send(data);
		      });
		    }
		    findOne(db,()=>{db.close();});
        });
});

app.route('/getmine/:username')
    .get(function(req, res) {
        MongoClient.connect(url,function(err,db){
            if(err)
            { 
              console.log(err);
              res.send("Error connecting to server.");
            }
            //console.log(req.params.username);
            var characters = db.collection('polls');
		    var findOne = (db,err) =>
		    {
		      characters.find({userid: req.params.username},{})
		      .toArray((err,data) => {
		          if(err)
		            console.log(err);
		          else
		           res.send(data);
		      });
		    }
		    findOne(db,()=>{db.close();});
        });
});

app.route('/getone/:title/:userid')
    .get(function(req, res) {
        MongoClient.connect(url,function(err,db){
            if(err)
            { 
              console.log(err);
              res.send("Error connecting to server.");
            }
            //console.log(req.params.username);
            var characters = db.collection('polls');
		    var findOne = (db,err) =>
		    {
		      var eh = parseInt(req.params.title);
		      console.log(parseInt(req.params.title));
		      characters.find({id: eh},{})
		      .toArray((err,data) => {
		          if(err)
		            console.log(err);
		          if(data.length<1)
		           res.send([{name: "Sorry, looks like theres no poll here", author: "404", options:[]}]);
		          else
		           res.send(data);
		      });
		        
		    }
		    findOne(db,()=>{db.close();});
        });
});

app.route('/permalink/:title/:userid')
   .get((req,res)=>{
    res.sendFile(__dirname + '/index.html');        
});
    


app.route('/vote/:name/:userid/:option/:voter')
   .get((req,res)=>{
      MongoClient.connect(url,function(err,db){
       if(err)
       { 
         res.send("Error connecting to server.");
         console.log("error, error");
         console.log(err);
       }
      //console.log("asdfdsfa");
      var polls=db.collection('polls');
       var findOne = (db,err) =>
       {
             console.log("attempting to vote " + req.params.name);
             polls.update({name: req.params.name, userid: req.params.userid, "options.name": req.params.option},
              {
                $push:{"who-voted": req.params.voter},
                $inc:{"options.$.votes": 1}
              });
             res.send("ding"); 
	   }
	   findOne(db,()=>{
	       db.close();
	   });
	  });
      console.log("post complete");
   });

app.route('/newopt/:name/:author/:newoption/')
   .get((req,res)=>{
       MongoClient.connect(url,function(err,db){
       if(err)
       { 
         res.send("Error connecting to server.");
         console.log("error, error");
         console.log(err);
       }
      //console.log("asdfdsfa");
       var polls=db.collection('polls');
       var findOne = (db,err) =>
       {
           console.log("attempting to add " + req.params.newoption);
           polls.update({name: req.params.name, userid: req.params.author},
           {
              $push:{"options": {"name": req.params.newoption, "votes": 0}}
           });
           res.send("ding"); 
	   }
	   findOne(db,()=>{
	       db.close();
	   });
      
      });
   });

app.route('/add/:name/:author/:options/:userid')
   .post((req,res)=>{
    console.log(req.params);
    var ops=req.params.options.split(',');
    var opsObj = [];
    for(var i=0;i<ops.length;i++)
    {
       opsObj.push({name: ops[i], votes: 0});
    }
    var toon = {
        name: req.params.name,
        options: opsObj,
        author: req.params.author,
        userid: req.params.userid,
        "who-voted": [],
        id: new Date().getTime()
    };
    console.log(toon);
   
    MongoClient.connect(url,function(err,db){
       if(err)
       { 
         res.send("Error connecting to server.");
         console.log(err);
       }
       var characters = db.collection('polls');
       var findOne = (db,err) =>
       {
           characters.insert(toon);
	   }
	   findOne(db,()=>{db.close();});
       
    });
    console.log("it is completed.");
});

app.route('/delete/:name/:userid')
   .get((req,res)=>{
       
       
     MongoClient.connect(url,function(err,db){
       if(err)
       { 
         res.send("Error connecting to server.");
         console.log(err);
       }
       var characters = db.collection('polls');
       var findOne = (db,err) =>
       {
         characters.remove({
             name: req.params.name, userid: req.params.userid},
             {justOne: true});
	   }
	   res.send("ding");
	   findOne(db,()=>{db.close();});
       
    });
    console.log("it is completed.");
       
   });

app.route('/userip')
   .get((req,res)=>{
       console.log(req.headers['x-forwarded-for']);
       res.send({ip: req.headers['x-forwarded-for']});
   });

app.use(express.static(__dirname));

app.listen(process.env.PORT, function() {
    console.log('Server listening');
});