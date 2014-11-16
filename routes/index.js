var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '##########',
	database: 'test'
});


router.post('/Quiz/Welcome', function(req, res) {
	if(req.session.name=='login' || req.session.name=='relogin'){
		var username= req.body.username;
		
		if(req.session.username)
			username=req.session.username;
		/*else{
			var user = username.split('@');
			username = user[0];
			req.session.username = username;
		}*/
			
		username= username.toLowerCase();
		//var query = "SELECT * FROM USER WHERE ACCESS_DISABLE_DT >= CURRENT_DATE and ACCESS_ENABLE_DT <= CURRENT_DATE AND USER_EMAIL_ID=?";
		var query = "SELECT * FROM USER WHERE USER_EMAIL_ID=?";
		
		db.query(query,[username],function(err, rows ) {
			//if (err) throw err;
			if(rows.length==1){
				req.session.name='welcome';
				req.session.username=username;
				var roleid = rows[0].role_id;
				var access_disable_date=new Date(rows[0].ACCESS_DISABLE_DT);
				var currentDate =  new Date();

				if(!req.session.loginId){
					var LOGIN_TIMESTAMP = currentDate.getFullYear() + "-"
									+ (currentDate.getMonth()+1)  + "-" 
									+ currentDate.getDate() + " "  
									+ currentDate.getHours() + ":"  
									+ currentDate.getMinutes() + ":" 
									+ currentDate.getSeconds();
									
					/*var LOGOUT_TIMESTAMP = currentDate.getFullYear() + "-"
									+ (currentDate.getMonth()+1)  + "-" 
									+ currentDate.getDate() + " "  
									+ currentDate.getHours() + ":"  
									+ currentDate.getMinutes()+":" 
									+ currentDate.getSeconds();
					*/
					db.query("INSERT INTO LOGIN_INFO (USER_EMAIL_ID,LOGIN_TIMESTAMP,LOGOUT_TIMESTAMP) VALUES (?,?,current_timestamp)", [req.session.username,LOGIN_TIMESTAMP], function(err, result){
						if(err) throw err;
						req.session.loginId = result.insertId;
					});
				}
					var Available_Quiz = "SELECT U.QUIZ_ID,U.QUIZ_NAME FROM USER_QUIZ_DETAILS U JOIN QUIZ_DETAILS Q" 
											+" ON U.QUIZ_ID=Q.QUIZ_ID WHERE Q.AVAILABLE_FROM_DT <= CURRENT_DATE AND Q.AVAILABLE_TO_DT >= CURRENT_DATE"
											+" AND USER_EMAIL_ID = ? AND STATUS = 'N'";
					db.query(Available_Quiz,[req.session.username], function (err, rows){
						var Quiz_Count = rows.length;
						//if (err) throw err;
						username = username.split("_");
						username = username[0];
						username=username[0].substr(0,1).toUpperCase()+username.substring(1);
						req.session.firstname=username;
											
						//var QUIZ_TAKEN_QUERY= "SELECT UQD.QUIZ_NAME,UQD.QUIZ_SCORE,H.USER_EMAIL_ID FROM USER_QUIZ_DETAILS UQD INNER JOIN (SELECT A.QUIZ_ID,A.USER_EMAIL_ID,MIN(A.QUIZ_TAKEN_TIME) FROM (SELECT U.USER_EMAIL_ID,U.QUIZ_ID,U.QUIZ_TAKEN_TIME FROM USER_QUIZ_DETAILS U INNER JOIN (SELECT QUIZ_ID,MAX(QUIZ_SCORE) AS MAXSCORE FROM USER_QUIZ_DETAILS GROUP BY QUIZ_ID) GROUPED ON U.QUIZ_ID = GROUPED.QUIZ_ID	AND U.QUIZ_SCORE = GROUPED.MAXSCORE ) A GROUP BY A.QUIZ_ID) H ON UQD.QUIZ_ID = H.QUIZ_ID AND UQD.USER_EMAIL_ID = ? and status = 'T'";

						//db.query(QUIZ_TAKEN_QUERY,[req.session.username], function(err, score){
							//if (err) throw err;
							req.session.roleid=roleid;
							res.render('index',{username: username, Quiz_Count: Quiz_Count, rows: rows, roleid : roleid});
						//});
					});
				}
				
				else{
					req.session.destroy(function(err) {
						res.redirect('/Quiz/AccessExpired');
					})
				}
		});
	}
	else
		res.redirect('/Quiz/SignIn');
	
});

router.post('/Quiz/testsihadattempted', function(req, res){
	var QUIZID = req.body.quizid;
	var QUIZ_TAKEN_QUERY = "SELECT UQD.QUIZ_NAME,UQD.QUIZ_SCORE,H.USER_EMAIL_ID,H.QUIZ_SCORE AS MAXSCORE FROM USER_QUIZ_DETAILS UQD INNER JOIN (SELECT UQ.USER_EMAIL_ID,UQ.QUIZ_SCORE,UQ.QUIZ_ID FROM USER_QUIZ_DETAILS UQ INNER JOIN (SELECT A.QUIZ_ID,A.USER_EMAIL_ID,MIN(A.QUIZ_TAKEN_TIME) AS MINTIME,A.QUIZ_SCORE	FROM (SELECT U.USER_EMAIL_ID,U.QUIZ_ID,U.QUIZ_TAKEN_TIME,U.QUIZ_SCORE FROM USER_QUIZ_DETAILS U 	INNER JOIN (SELECT QUIZ_ID,MAX(QUIZ_SCORE) AS MAXSCORE FROM USER_QUIZ_DETAILS GROUP BY QUIZ_ID) GROUPED ON U.QUIZ_ID = GROUPED.QUIZ_ID	AND U.QUIZ_SCORE = GROUPED.MAXSCORE) A GROUP BY A.QUIZ_ID) FINAL ON FINAL.QUIZ_ID = UQ.QUIZ_ID AND FINAL.MINTIME = UQ.QUIZ_TAKEN_TIME AND FINAL.QUIZ_SCORE = UQ.QUIZ_SCORE) H  ON UQD.QUIZ_ID = H.QUIZ_ID AND UQD.USER_EMAIL_ID = ? and status = 'T'";
	//var QUIZ_TAKEN_QUERY= "SELECT UQD.QUIZ_NAME,UQD.QUIZ_SCORE,H.USER_EMAIL_ID,H.QUIZ_SCORE AS MAXSCORE FROM USER_QUIZ_DETAILS UQD INNER JOIN (SELECT A.QUIZ_ID,A.USER_EMAIL_ID,MIN(A.QUIZ_TAKEN_TIME),A.QUIZ_SCORE FROM (SELECT U.USER_EMAIL_ID,U.QUIZ_ID,U.QUIZ_TAKEN_TIME,U.QUIZ_SCORE FROM USER_QUIZ_DETAILS U INNER JOIN (SELECT QUIZ_ID,MAX(QUIZ_SCORE) AS MAXSCORE FROM USER_QUIZ_DETAILS GROUP BY QUIZ_ID) GROUPED ON U.QUIZ_ID = GROUPED.QUIZ_ID	AND U.QUIZ_SCORE = GROUPED.MAXSCORE ) A GROUP BY A.QUIZ_ID) H ON UQD.QUIZ_ID = H.QUIZ_ID AND UQD.USER_EMAIL_ID = ? and status = 'T'";
		db.query(QUIZ_TAKEN_QUERY,[req.session.username], function(err, score){
		if (err) throw err;
		res.render('testsihadattempted', {score : score });
	});
});

router.post('/Quiz/Ajax', function(req, res){
	var QUIZID = req.body.id;
	/*req.secret=QUIZID;
	console.log(req.secret);
	console.log(req.session);*/
	db.query('SELECT DURATION,TOTAL_QUESTIONS from QUIZ_DETAILS WHERE QUIZ_ID=?', [QUIZID], function (err, row){
		if (err) throw err;
		var DURATION  = row[0].DURATION;
		var TOTAL_QUESTIONS = row[0].TOTAL_QUESTIONS;
		res.render('Ajax', {DURATION: DURATION, TOTAL_QUESTIONS: TOTAL_QUESTIONS, quiz_id : QUIZID });
	});
});


router.post('/Quiz/QuizName', function(req, res){
	var QUIZID = req.body.id;
	/*req.secret=QUIZID;
	console.log(req.secret);
	console.log(req.session);*/
	db.query('SELECT QUIZ_NAME from QUIZ_DETAILS WHERE QUIZ_ID=?', [QUIZID], function (err, row){
		if (err) throw err;
		var QUIZ_NAME  = row[0].QUIZ_NAME;
		
		res.render('QuizName', {QUIZ_NAME: QUIZ_NAME});
	});
});



router.get('/Quiz/Quiz', function(req, res){
	if(req.session.name=='welcome'){
		req.session.name='quiz';
		
		var QUIZ_ID = req.query.quiz_id;
		req.session.quiz_id = QUIZ_ID;
		var query = "SELECT question_text,option1,option2,option3,option4 FROM quiz_questions1 where quiz_id=?";
		db.query(query,[QUIZ_ID], function(err, rows, fields) {
			db.query('SELECT QUIZ_NAME,DURATION from QUIZ_DETAILS WHERE QUIZ_ID=?', [QUIZ_ID], function (err, row){
				if (err) throw err;
				var time  = row[0].DURATION;
				var name = row[0].QUIZ_NAME;				
				db.query('UPDATE USER_QUIZ_DETAILS SET STATUS = ? WHERE QUIZ_ID = ? AND USER_EMAIL_ID = ?', ['S',QUIZ_ID, req.session.username], function (err, result) {
					if (err) throw err;
					res.render('Quiz', {rows: rows , time : time , name : name});
				});
			});
			
		});
	}
	else
		res.redirect('SignIn');
	
});


router.post('/Quiz/finalScore',function(req, res){
console.log(req.body);
	if(req.session.name=='quiz'){
		req.session.name ='relogin';
		var score = 0, count=0;
		var QUIZ_ID = req.session.quiz_id;
		var ans_string='';
		var query = "SELECT answer_key FROM quiz_questions1 where quiz_id=?";
		
		db.query(query, [QUIZ_ID], function(err, rows) {
			count=rows.length;
			for(var i=0; i< rows.length; i++){
				var radio = 'radio' + i;
				if(req.body[radio]==rows[i].answer_key)
					score++;
				if(!req.body[radio]){
					ans_string= ans_string + '0';
					continue;
				}
				ans_string = ans_string + req.body[radio];
			}
			
			var query1 = "UPDATE USER_QUIZ_DETAILS SET ANSWER_KEYS = ?, STATUS = ?, QUIZ_SCORE = ?, QUIZ_TAKEN_TIME = CURRENT_TIMESTAMP WHERE USER_EMAIL_ID = ? AND QUIZ_ID = ? ";
			db.query(query1, [ans_string,'T',score, req.session.username, req.session.quiz_id], function(err, result){
				if(err) throw err;		
				res.render('finalScore',{score:score, count:count, username: req.session.firstname});
			});
		});
	}
	else
		res.redirect('SignIn');
});



router.get('/Quiz/Logout', function(req, res){
	// cannot access session here
	var currentDate =  new Date();

	var LOGOUT_TIMESTAMP = currentDate.getFullYear() + "-"
							+ (currentDate.getMonth()+1)  + "-" 
							+ currentDate.getDate() + " "  
							+ currentDate.getHours() + ":"  
							+ currentDate.getMinutes() + ":" 
							+ currentDate.getSeconds();

		db.query("UPDATE LOGIN_INFO SET LOGOUT_TIMESTAMP=? WHERE ID = ?", [LOGOUT_TIMESTAMP,req.session.loginId], function(err, result){
		});
	req.session.destroy(function(err) {
		res.render('Logout');
	})
});
module.exports = router;