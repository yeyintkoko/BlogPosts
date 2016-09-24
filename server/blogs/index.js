var express = require('express');
var { getAllArticles, createArticle, updateArticle, deleteArticle } = require('./blogs');

var blogs = express.Router();


/** Get Article List Template */
blogs.get('/', function (req, res, next) {
	res.sendFile(req.app.get('root_dir') + '/client/blogs/articles.html')
});

/** Get Article List */
blogs.get('/apis/getarticles', function (req, res, next) {

	res.status(200).send(JSON.stringify(getAllArticles()));

});

/** Create Article */
blogs.post('/apis/createarticle', function (req, res, next) {

	if(!req.body.header || !req.body.body) res.status(406).end('Unaccpetable request')
	else {
		createArticle(req.body);
		res.status(201).end();
	}

});

/** Delete Article */
blogs.delete('/apis/deletearticle/:id', function (req, res, next) {

	if(!req.params.id) res.status(406).end('Unaccpetable request')
	else {
		deleteArticle(req.params.id);
		res.status(200).end();
	}

});

/** Update Article */
blogs.put('/apis/updatearticle', function (req, res, next) {

	if(!req.body) res.status(400).end('Invalid request')
	else {
		updateArticle(req.body);
		res.status(200).end()
	}

});





module.exports = blogs;
