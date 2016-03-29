/*jslint node: true*/
'use strict';

var Emitter = require('events');
var NODE = require('./Node');
var map = require('./util/map');

function Graph(graph) {
	var soul, self = this;
	if (graph && typeof graph === 'object') {
		this.put(graph);
	}
}

Graph.prototype = Emitter.prototype;
var API = Graph.prototype;

API.constructor = Graph;

API.get = function (query, cb, opt) {
	var self, matching, soul = query['#'];
	matching = this[soul];
	self = this;
	if (matching) {
		cb(null, matching);
		return this;
	}
	this.emit('get', query, function (err, node) {
		if (!node) {
			return;
		}
		if (!(node instanceof NODE)) {
			node = NODE(node);
		}
		var graph = {};
		graph[node.getSoul()] = node;
		self.update(graph);
		cb(err, node);
	}, opt || {});
	return this;
};

API.add = function (node, soul) {
	if (!(node instanceof NODE)) {
		node = NODE(node, soul);
	}
	if (this[soul]) {
		return this[soul].merge(node);
	}
	this[soul] = node;
	this.emit('add', node, soul, this);
	return this;
};

API.put = function (graph) {
	var soul;
	for (soul in graph) {
		if (graph.hasOwnProperty(soul) && soul !== '_events') {
			this.add(graph[soul], soul);
		}
	}
	return this;
};

API.every = function (cb) {
	var key;
	for (key in this) {
		if (this.hasOwnProperty(key) && key !== '_events') {
			cb(this[key], key, this);
		}
	}
	this.on('add', cb);
	return this;
};



module.exports = Graph;
