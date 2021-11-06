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
		res.render('home',{
			pageInfo: pageInfo,
			user: 		req.session.user 
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
			console.log(err)
		}else{
			var collection	=	client.db('Kamatica').collection('Korisnici');
			collection.find({username:username}).toArray(function(err,result){
				if(err){
					console.log(err)
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
													res.redirect('/');
							        } catch (error) {
							            console.error(error.message);
							            req.session.user	=	sessionObject;
													res.redirect('/');
							        };
							    });

							}).on("error", (error) => {
							    console.error(error.message);
							    req.session.user	=	sessionObject;
									res.redirect('/');
							});
							
							
						}else{
							res.redirect('/failed-login');
						}
					}else{
						res.redirect('/failed-login');
					}
					client.close();
				}
			});
		}
	});
});