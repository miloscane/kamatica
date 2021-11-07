//Server
const server				=	require('express')();
const https				 	= require('https');
const http					=	require('http').Server(server);
const net						=	require('net');
const express				=	require('express');
const fs						=	require('fs');
const bodyParser		=	require('body-parser');
const session				=	require('express-session');
const cookieParser	=	require('cookie-parser');
const crypto				=	require('crypto');
const mongo					=	require('mongodb');
const dotenv 				= require('dotenv');
dotenv.config();
const kursUrl 			= "https://api.kursna-lista.info/3318f92773dc6cbae5c13ba537620f5b/kursna_lista/json";

const mongoClient		=	mongo.MongoClient;
const mongoUrl			=	process.env.mongourl;

server.set('view engine','ejs');
server.set('views', [__dirname + '/views']);
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(session({
		secret: process.env.sessionsecret,
    resave: true,
    saveUninitialized: true
}));

function generateId(length) {
	var result           = [];
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
	}
  return result.join('');
}

function hashString(string){
	var hash	=	crypto.createHash('md5').update(string).digest('hex')
	return hash
}

const mainFileVersion	=	1.1;
var pageInfo					=	{};
pageInfo.fileVersion	=	mainFileVersion;

http.listen(process.env.PORT , function(){
  console.log('Server Started');
});

require('events').EventEmitter.prototype._maxListeners = 0;

server.get('/',function(req,res){
	if(req.session.user){
		mongoClient.connect(mongoUrl,{useUnifiedTopology: true},function(err,client){
			if(err){
				console.log(err);
				res.send(err);
			}else{
				var collection	=	client.db('Kamatica').collection('Duznici');
				collection.find({me:req.session.user.username}).toArray(function(err,result){
					if(err){
						console.log(err);
						res.send(err);
					}else{
						res.render('home',{
							pageInfo: pageInfo,
							user: 		req.session.user,
							dugovi: 	result 
						});	
						client.close();
					}
				});
			}
		});
		
	}else{
		res.redirect('/login');
	}
});

server.get('/login',function(req,res){
	if(req.session.user){
		res.redirect('/')
	}else{
		res.render('login',{
			pageInfo: pageInfo
		})
	}
});

server.get('/failed-login',function(req,res){
	if(req.session.user){
		res.redirect('/');
	}else{
		res.render('failed-login',{
			pageInfo: pageInfo
		});
	}
});

server.post('/login',function(req,res){
	var username	=	req.body.username.toLowerCase();
	var pin  			=	req.body.pin.toString();
	mongoClient.connect(mongoUrl,{useUnifiedTopology: true},function(err,client){
		if(err){
			console.log(err);
			res.send(err);
		}else{
			var collection	=	client.db('Kamatica').collection('Korisnici');
			collection.find({username:username}).toArray(function(err,result){
				if(err){
					console.log(err);
					res.send(err);
				}else{
					if(result.length>0){
						if(pin.toString()==result[0].pin.toString()){
							var sessionObject	=	JSON.parse(JSON.stringify(result[0]));
							sessionObject.kursnaLista = "";
							delete sessionObject.pin;						
							https.get(kursUrl,(response) => {
							    let body = "";
							    response.on("data", (chunk) => {
							        body += chunk;
							    });
							    response.on("end", () => {
							        try {
							            let json = JSON.parse(body);
							            sessionObject.kursnaLista = JSON.stringify(json);
							            req.session.user	=	sessionObject;
													client.close();
													res.redirect('/');
							        } catch (error) {
							            console.error(error.message);
							            req.session.user	=	sessionObject;
													client.close();
													res.redirect('/');
							        };
							    });

							}).on("error", (error) => {
							    console.error(error.message);
							    req.session.user	=	sessionObject;
									client.close();
									res.redirect('/');
							});
							
							
						}else{
							res.redirect('/failed-login');
						}
					}else{
						res.redirect('/failed-login');
					}
				}
			});
		}
	});
});

server.post('/novi-dug',function(req,res){
	if(req.session.user){
			var dugJson				=	{};
			dugJson.id 				=	generateId(100);
			dugJson.me 				=	req.session.user.username;
			dugJson.ime 			=	req.body.ime;
			dugJson.telefon		=	req.body.telefon ? req.body.telefon : "";
			dugJson.datum 		=	req.body.datum;
			dugJson.dan 			=	req.body.datum.split("-")[2];
			dugJson.iznos 		=	req.body.eur;
			dugJson.procenat	=	req.body.procenat;
			dugJson.komentar	=	req.body.komentar;
			dugJson.status		=	"Aktivan";
			dugJson.naplate		=	[];
			mongoClient.connect(mongoUrl,{useUnifiedTopology: true},function(err,client){
				if(err){
					console.log(err)
				}else{
					var duznici	=	client.db('Kamatica').collection('Duznici');
					duznici.insertOne(dugJson,function(err,addedResult){
						if(err){
							console.log(err);
							res.send(err);
						}else{
							client.close();
							res.redirect('/');
						}
					});
				}
			});
	}else{
		res.redirect("/login");
	}
});

server.post('/izmena-duga',function(req,res){
	if(req.session.user){
			var dugJson				=	{};
			dugJson.id 				=	req.body.id;
			dugJson.me 				=	req.session.user.username;
			dugJson.ime 			=	req.body.ime;
			dugJson.telefon		=	req.body.telefon ? req.body.telefon : "";
			dugJson.datum 		=	req.body.datum;
			dugJson.dan 			=	req.body.datum.split("-")[2];
			dugJson.iznos 		=	req.body.eur;
			dugJson.procenat	=	req.body.procenat;
			dugJson.komentar	=	req.body.komentar;
			dugJson.status		=	req.body.status;
			dugJson.naplate		=	JSON.parse(req.body.naplate);
			mongoClient.connect(mongoUrl,{useUnifiedTopology: true},function(err,client){
				if(err){
					console.log(err)
				}else{
					var duznici	=	client.db('Kamatica').collection('Duznici');
					duznici.replaceOne({id:req.body.id},dugJson, function(err,result){
						if(err){
							console.log(err)
							res.send(err);
						}else{
							client.close();
							res.redirect('/');
						}
					});
				}
			});
	}else{
		res.redirect("/login");
	}
});

server.post('/naplata',function(req,res){
	if(req.session.user){
		var id	=	req.body.idnaplata;
		mongoClient.connect(mongoUrl,{useUnifiedTopology: true},function(err,client){
			if(err){
				console.log(err);
				res.send(err);
			}else{
				var duznici	=	client.db('Kamatica').collection('Duznici');
				duznici.find({id:id}).toArray(function(err,result){
					if(err){
						console.log(err);
						res.send(err);
					}else{
						var dugJson 		=	JSON.parse(JSON.stringify(result[0]));
						delete dugJson._id
						var naplata			=	{};
						naplata.godina	=	req.body.godina;
						naplata.mesec		=	req.body.mesec;
						dugJson.naplate.push(naplata);
						duznici.replaceOne({id:id},dugJson, function(err,result){
							if(err){
								console.log(err)
								res.send(err);
							}else{
								client.close();
								res.redirect('/');
							}
						});
					}
					
				})
			}
		});
	}else{
		res.redirect('/login');
	}
});
