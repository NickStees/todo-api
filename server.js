var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res) {
	res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	//use underscore.js to find match
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(matchedTodo){
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}

});


//POST /todos/
app.post('/todos', function (req, res) {
	//filter to just fields we want to keep whitelist
	var body = _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.id = todoNextId++;
	body.description = body.description.trim(); //trim spaces
	todos.push(body);

	res.json(body);
});

//DELETE /todos/:id
app.delete('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);
	//use underscore to remove todo item
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(matchedTodo){
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}else{
		res.status(404).json({"error": "no todo found to delete with that ID"});
	}

});

//PUT /todos/:id
app.put('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo){
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).json({"error": "not valid"});
	} else {
		//never provided attribute
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description.trim();
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).json({"error": "not valid"});
	} else {
		//never provided attribute
	}

	//update todo with valid attributes
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);

});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});