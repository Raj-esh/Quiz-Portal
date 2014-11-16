var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '##########',
	database: 'test'
});

/*
var Available_Quiz = "SELECT U.QUIZ_ID,U.QUIZ_NAME FROM USER_QUIZ_DETAILS U JOIN QUIZ_DETAILS Q" 
											+" ON U.QUIZ_ID=Q.QUIZ_ID WHERE Q.AVAILABLE_FROM_DT <= CURRENT_DATE AND Q.AVAILABLE_TO_DT >= CURRENT_DATE"
											+" AND USER_EMAIL_ID = ? AND STATUS = 'N'";*/

router.get('/Quiz/MyAttempts', function(req, res){
	if(req.session.name=='welcome'){
		db.query("SELECT QUIZ_ID,QUIZ_NAME FROM QUIZ_DETAILS WHERE AVAILABLE_TO_DT < CURRENT_DATE ORDER BY 1 DESC", function(err, quiz){
			var Available_Quiz = "SELECT QUIZ_ID FROM USER_QUIZ_DETAILS " 
													+" WHERE USER_EMAIL_ID = ? AND STATUS = 'T'";
			db.query(Available_Quiz,[req.session.username], function (err, rows){
				res.render('attempts', {quiz : quiz, rows : rows});
				
			});
		});
	}
	else
		res.redirect('/Quiz/SignIn');

});

router.post('/Quiz/MyAttempts', function(req, res){
	var QUIZ_ID = req.body.quizid;
	var key;
	
		var query = "SELECT question_text,option1,option2,option3,option4,answer_key FROM quiz_questions1 where quiz_id=?";
		db.query(query,[QUIZ_ID], function(err, rows, fields) {
			if (err) throw err;
			if (rows.length >=1)
				var count = 1;
			else 
				var count = 0;
			db.query('SELECT ANSWER_KEYS FROM USER_QUIZ_DETAILS WHERE QUIZ_ID=? AND STATUS = ? AND USER_EMAIL_ID = ?', [QUIZ_ID, 'T',req.session.username], function (err, row){
				if (err) throw err;
				if (row.length == 1){
					
					var key = row[0].ANSWER_KEYS.split('');
					res.render('answered', {rows: rows , key : key, count : count});
				}
				else{
					
					res.render('unanswered', {rows: rows, count : count});}
			});
			
		});
});












module.exports = router;