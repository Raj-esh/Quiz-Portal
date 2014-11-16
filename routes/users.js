var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '#######',
	database: 'test'
});

router.get('/Quiz/setquiz', function(req, res){
	if(req.session.name=='Manage'){
		req.session.name='setquiz';
		var FROM = req.query.from;
		var TO = req.query.to;
		var QUIZ_NAME = req.query.Quiz_name;
		var COUNT = req.query.Question_count;
		var TIME = req.query.Time;
		var emails = req.query.emails;
		console.log(emails);
		
		if( emails !='' && QUIZ_NAME != '' && FROM != '' && TO != '' && TIME != '' && COUNT != '' ){
			query2="INSERT INTO QUIZ_DETAILS (SET_BY_USER_EMAIL_ID,QUIZ_NAME,AVAILABLE_FROM_DT,AVAILABLE_TO_DT,CURRENT_STATUS,DURATION,"
					+"TOTAL_QUESTIONS) values (?,?,?,?,?,?,?)";
					db.query(query2, [req.session.username,QUIZ_NAME,FROM,TO,"A",TIME,COUNT], function(err, result) {
					var QUIZ_ID=result.insertId;
					req.session.quiz_id = QUIZ_ID;
					USER_EMAIL_ID = emails.split(";");
					
					query3="INSERT INTO USER_QUIZ_DETAILS (USER_EMAIL_ID,QUIZ_ID,QUIZ_NAME,STATUS) VALUES (?,?,?,?)";
					for (var i=0; i < USER_EMAIL_ID.length ; i ++){
						if(USER_EMAIL_ID[i] != ''){
							var USER_EMAIL = USER_EMAIL_ID[i];
							var email1=USER_EMAIL.split("<");
				
							if(email1.length == 1){
								var email2=email1[0].split("@");
								USER_EMAIL= email2[0];
							}
							else{
								var email2=email1[1].split("@");
								USER_EMAIL= email2[0];
							}
							
							USER_EMAIL = USER_EMAIL.toLowerCase();
							db.query("INSERT INTO USER VALUES (?,?,?,?)", [USER_EMAIL,0,'2014-07-27','2015-06-25'], function(err, data){});
							db.query(query3, [USER_EMAIL,QUIZ_ID,QUIZ_NAME,"N"], function(err, result1){
								/*console.log("query "+i+" "+USER_EMAIL_ID.length);
								if (err) {res.render('Success',{msg:"Some of the users you added might not have Access to the Portal...Please Check With the Portal Admin...!!"});
								console.log("error "+i+" "+USER_EMAIL_ID.length);}
								else if(i == USER_EMAIL_ID.length-1)
									res.render('setquiz',{count:COUNT, quiz_id : QUIZ_ID}); */
							});
						}
					}
					res.render('setquiz',{count:COUNT, quiz_id : QUIZ_ID});
					//console.log('insertid'+result.insertId);
			});
		}
		else
			res.render('Success',{msg:"All the fields are Mandatory"});
	}
	else
		res.redirect('/Quiz/SignIn');
});


router.post('/Quiz/Admin', function(req, res){
	var toopen = req.body.toopen;
	//if(req.session.name=='welcome' || req.session.name=='relogin'||req.session.name=='setquiz'){
	//	req.session.name='relogin';
		db.query("SELECT QUIZ_ID,QUIZ_NAME FROM QUIZ_DETAILS WHERE SET_BY_USER_EMAIL_ID=?",[req.session.username], function(err, quiz){
			if (err) throw err;
			db.query("SELECT QUIZ_ID,QUIZ_NAME FROM QUIZ_DETAILS WHERE SET_BY_USER_EMAIL_ID=? and AVAILABLE_TO_DT >= CURRENT_DATE",[req.session.username], function(err, addusertoquiz){
				var open_quiz_count = addusertoquiz.length;
				
				var QUIZ_TAKEN_QUERY = "SELECT UQD.QUIZ_NAME,UQD.QUIZ_SCORE,H.USER_EMAIL_ID,H.QUIZ_SCORE AS MAXSCORE FROM USER_QUIZ_DETAILS UQD INNER JOIN (SELECT UQ.USER_EMAIL_ID,UQ.QUIZ_SCORE,UQ.QUIZ_ID FROM USER_QUIZ_DETAILS UQ INNER JOIN (SELECT A.QUIZ_ID,A.USER_EMAIL_ID,MIN(A.QUIZ_TAKEN_TIME) AS MINTIME,A.QUIZ_SCORE	FROM (SELECT U.USER_EMAIL_ID,U.QUIZ_ID,U.QUIZ_TAKEN_TIME,U.QUIZ_SCORE FROM USER_QUIZ_DETAILS U 	INNER JOIN (SELECT QUIZ_ID,MAX(QUIZ_SCORE) AS MAXSCORE FROM USER_QUIZ_DETAILS GROUP BY QUIZ_ID) GROUPED ON U.QUIZ_ID = GROUPED.QUIZ_ID	AND U.QUIZ_SCORE = GROUPED.MAXSCORE) A GROUP BY A.QUIZ_ID) FINAL ON FINAL.QUIZ_ID = UQ.QUIZ_ID AND FINAL.MINTIME = UQ.QUIZ_TAKEN_TIME AND FINAL.QUIZ_SCORE = UQ.QUIZ_SCORE) H  ON UQD.QUIZ_ID = H.QUIZ_ID AND UQD.USER_EMAIL_ID = ? and status = 'T'";
				//var QUIZ_TAKEN_QUERY= "SELECT UQD.QUIZ_NAME,UQD.QUIZ_SCORE,H.USER_EMAIL_ID,H.QUIZ_SCORE AS MAXSCORE FROM USER_QUIZ_DETAILS UQD INNER JOIN (SELECT A.QUIZ_ID,A.USER_EMAIL_ID,MIN(A.QUIZ_TAKEN_TIME),A.QUIZ_SCORE FROM (SELECT U.USER_EMAIL_ID,U.QUIZ_ID,U.QUIZ_TAKEN_TIME,U.QUIZ_SCORE FROM USER_QUIZ_DETAILS U INNER JOIN (SELECT QUIZ_ID,MAX(QUIZ_SCORE) AS MAXSCORE FROM USER_QUIZ_DETAILS GROUP BY QUIZ_ID) GROUPED ON U.QUIZ_ID = GROUPED.QUIZ_ID	AND U.QUIZ_SCORE = GROUPED.MAXSCORE ) A GROUP BY A.QUIZ_ID) H ON UQD.QUIZ_ID = H.QUIZ_ID AND UQD.USER_EMAIL_ID = ? and status = 'T'";

				db.query(QUIZ_TAKEN_QUERY,[req.session.username], function(err, score){
					if (err) throw err;
						res.render('Admin',{quiz : quiz, addusertoquiz : addusertoquiz, open_quiz_count : open_quiz_count, score:score , toopen : toopen});
				});
			});
		});
	//}
	//else
	//	res.redirect('/Quiz/SignIn');

});



router.post('/Quiz/getdetails', function(req, res){
	var QUIZID = req.body.quizid;
	/*req.secret=QUIZID;
	console.log(req.secret);
	console.log(req.session);*/
	db.query('SELECT USER_EMAIL_ID,QUIZ_SCORE FROM USER_QUIZ_DETAILS WHERE QUIZ_ID=? AND STATUS = ?' , [QUIZID,'T'], function (err, details){
		if (err) throw err;
		res.render('getdetails', {details : details });
	});
});


router.post('/Quiz/ManageUser', function(req, res){
	var emails = req.body.emails;
	var roleid = req.body.roleid;
	var USER_EMAIL = emails;
	
	var email1=USER_EMAIL.split("<");
	if(email1.length == 1){
		var email2=email1[0].split("@");
		USER_EMAIL= email2[0];
	}
	else{
		var email2=email1[1].split("@");
		USER_EMAIL= email2[0];
	}
							
	USER_EMAIL = USER_EMAIL.toLowerCase();
		db.query("INSERT INTO USER VALUES (?,?,?,?)", [USER_EMAIL,0,'2014-07-27','2015-06-25'], function(err, data){});
		db.query("UPDATE USER SET ROLE_ID = ? WHERE USER_EMAIL_ID = ?", [roleid,USER_EMAIL], function(err, result){
			if (err) res.render('Success',{msg:"Role Update Failed...!!"});
			else 
				res.render('Success',{msg:"User Role has been Updated Successfully and will be active from next Login...!!!"});
		});

});


router.post('/Quiz/addusertoquiz', function(req, res){
console.log(req.body);
	var emails = req.body.emails;
	var Quiz_Id = req.body.Quiz_Id;
	var USER_EMAIL = emails;
	
	var email1=USER_EMAIL.split("<");
	if(email1.length == 1){
		var email2=email1[0].split("@");
		USER_EMAIL= email2[0];
	}
	else{
		var email2=email1[1].split("@");
		USER_EMAIL= email2[0];
	}
							
	USER_EMAIL = USER_EMAIL.toLowerCase();
	db.query("INSERT INTO USER VALUES (?,?,?,?)", [USER_EMAIL,0,'2014-07-27','2015-06-25'], function(err, data){});
	db.query("SELECT QUIZ_NAME FROM QUIZ_DETAILS WHERE QUIZ_ID = ?", [Quiz_Id], function(err, row){

	var Quiz_Name = row[0].QUIZ_NAME;
	
		db.query("INSERT INTO USER_QUIZ_DETAILS (USER_EMAIL_ID,QUIZ_ID,QUIZ_NAME,STATUS) VALUES (?,?,?,?)", [USER_EMAIL,Quiz_Id,Quiz_Name,"N"], function(err, result){
			if (err) res.render('Success',{msg:" The User was already added to this Quiz...!!"});
			else 
				res.render('Success',{msg:"The User has been added to the Quiz Successfully...!!!"});
		});
	});

});


router.post('/Quiz/setquiz',function(req, res){

	var key, count = 0;
	for(key in req.body)
		 count++;
	//console.log(req.body);
	var options = new Array(4);
	
	for (var i = 1; i<= count/6; i++){
		var question= 'question'+i;
		var radio = 'radio'+i;
		
		for(key in req.body){

			if(key==question){
				var question_data=req.body[key];
				continue;
			}

			if(key==radio){
				var radio_data=req.body[key];
				continue;
			}
			
			for(var j=1; j<=4; j++){
				var option= 'option' + i + j;
				if(key==option){
					options[j] = req.body[key];
					break;
				}
			}
			
		}	
			var opt1=options[1];
			var opt2=options[2];
			var opt3=options[3];
			var opt4=options[4];
			var QUIZ_ID = req.body.quiz_id;
			
			var query1 = "INSERT INTO quiz_questions1 (QUIZ_ID,QUESTION_TEXT,OPTION1,OPTION2,OPTION3,OPTION4,ANSWER_KEY)values (?,?,?,?,?,?,?)";
			//console.log("Are You there");
				db.query(query1, [QUIZ_ID,question_data,opt1,opt2,opt3,opt4,radio_data], function(err, result) {
				
					if (err) throw err;
					//console.log('insertid'+result.insertId);
				});

		for (var k=1;k <=4; k++){
			//console.log('Option'+k+':'+options[k]);
		}
		//console.log('question:'+i+'is'+question_data);
		//console.log('radio_data:'+radio_data);
	}
	
	//console.log(count);
	//console.log('Value of R is:'+r);
	//db.end();
	res.render('Success',{msg:"Quiz Scheduled Successfully...!!!"});
});

module.exports = router;
