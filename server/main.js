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
					_id: Random.id(),
					question: question,
					answer: answer,
					rank: getHighestRank(topicID) + 1
				})

				Repetition.update(Repetition.findOne(), repetition);
			}
		});
	},

	goodAnswer: function(currentTopic, currentQuestion) {
		let repetition = Repetition.findOne();

		repetition.topics.forEach((topic, i) => {
			if (topic._id == currentTopic._id) {
				let questions = topic["content"];
				questions.forEach((question, j) => {
					if (question._id == currentQuestion._id) {

						repetition.topics[i]["content"][j].rank = getHighestRank(currentTopic._id) + 1;

						Repetition.update(Repetition.findOne(), repetition);
					}
				});
			}
		})

	},

	badAnswer: function(currentTopic, currentQuestion) {
		let repetition = Repetition.findOne();

		repetition.topics.forEach((topic, i) => {
			if (topic._id == currentTopic._id) {
				let questions = topic["content"];
				questions.forEach((question, j) => {
					if (question._id == currentQuestion._id) {

						repetition.topics.forEach(topic => {
							if (topic._id == currentTopic._id) {
								let questions = topic["content"];

								let sorted = questions.sort(compare);

								let index = Math.floor(sorted.length / 4);


								repetition.topics[i]["content"][j].rank = sorted[index].rank;

								Repetition.update(Repetition.findOne(), repetition);
							}
						});


					}
				});
			}
		})
	},

	passAnswer: function(currentTopic, currentQuestion) {
		let repetition = Repetition.findOne();

		repetition.topics.forEach((topic, i) => {
			if (topic._id == currentTopic._id) {
				let questions = topic["content"];
				questions.forEach((question, j) => {
					if (question._id == currentQuestion._id) {

						repetition.topics[i]["content"][j].rank = passAnswerRank(currentTopic._id);

						Repetition.update(Repetition.findOne(), repetition);
					}
				});
			}
		})
	},

	badAnswerRank: function(topicID) {

		let repetition = Repetition.findOne();

		repetition.topics.forEach(topic => {
			if (topic._id == topicID) {
				let questions = topic["content"];

				let sorted = questions.sort(compare);

				let index = Math.floor(sorted.length / 4);


				return sorted[index].rank;
			}
		});

	}


});



function passAnswerRank(topicID) {


}

function compare(a, b) {
	if (a.rank < b.rank) {
		return -1;
	} else if (a.rank > b.rank) {
		return 1;
	} else {
		return 0;
	}
}

function getHighestRank(topicID) {
	let topics = Repetition.findOne().topics;
	let highestRank = -Infinity;
	topics.forEach(topic => {
		if (topic._id == topicID) {
			let questions = topic["content"];
			questions.forEach(question => {
				if (question.rank > highestRank) {
					highestRank = question.rank;
				}
			})
		}
	});

	if (highestRank == -Infinity) {
		return 0;
	}
	else {
		return highestRank;
	}


}