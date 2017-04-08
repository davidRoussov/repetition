import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';	

var Repetition = new Mongo.Collection("topics");

Meteor.methods({

	initializeDatabase: function(topicName) {
		let schema = {
			topics: [
				{
					_id: Random.id(),
					topicName: topicName,
					content: []
				}
			]
		}

		Repetition.insert(schema);
	},

	addNewTopic: function(topicName) {

		let newTopicObject = {
			_id: Random.id(),
			topicName: topicName,
			content: []
		}

		let repetition = Repetition.findOne();
		if (!repetition) {
			Meteor.call("initializeDatabase", topicName);
		} else {
			repetition.topics.push(newTopicObject);

			Repetition.update(Repetition.findOne(), repetition);
		}


	},

	addQuestion: function(topicID, question, answer) {
		let repetition = Repetition.findOne();

		repetition.topics.forEach((topic, i) => {
			if (topic._id == topicID) {
				repetition.topics[i].content.push({
					question: question,
					answer: answer
				})

				Repetition.update(Repetition.findOne(), repetition);
			}
		});
	}


});