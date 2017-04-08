import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

var Repetition = new Mongo.Collection("topics");

Session.set("currentTopic", undefined);


Template.topicsBar.helpers({
	topic: function() {
		if (Repetition.findOne() && Repetition.findOne().topics) {
			let topics = Repetition.findOne().topics;
			Session.set("allTopics", topics);
			return topics;
		}
	}

});

Template.studySection.helpers({
	content: function() {
		let currentTopic = Session.get("currentTopic");
		if (currentTopic) {
			let allContent = currentTopic["content"];
			let sorted = allContent.sort(function(a,b) {
				if (a.rank < b.rank) {
					return -1;
				} else if (a.rank > b.rank) {
					return 1;
				}
				else {
					return 0;
				}
			});
			Session.set("currentQuestion", sorted[0]);
			return Session.get("currentQuestion");
		}
	}

});

Template.addSection.helpers({
	topic: function() {
		if (Session.get("currentTopic")) {
			return Session.get("currentTopic");	
		}
		
	}

});

Template.topicsBar.events({
	"click .js-topic-menu-button": function(event) {

		$(".topic-menu-button").removeClass("button-when-selected").addClass("button-when-unselected");

		let button = $(event.target);
		let topicID = button.attr("id");

		Session.get("allTopics").forEach(topic => {
			if (topic._id == topicID) {
				Session.set("currentTopic", topic);
				button.addClass("button-when-selected");
			}
		});
	},

	"keyup .js-addNewTopicInput": function(event) {
		let key = event.which;
		let topicName = $(event.target).val();

		if (key === 13) {
			Meteor.call("addNewTopic", topicName);
		}
	}
})

Template.studySection.events({
	"click .js-hide-show-button": function(event) {

		let textarea = $("#studyTextarea");
		let button = $(event.target);

		if (textarea.hasClass("obscured-textarea")) {
			textarea.removeClass("obscured-textarea");
			textarea.prop("disabled", false);
			button.html("Hide");
			$("#evaluationButtons").removeClass("hide");

		} else {
			textarea.addClass("obscured-textarea");
			textarea.prop("disabled", true);
			button.html("Reveal");
			$("#evaluationButtons").addClass("hide");
		}
	},
	"click .js-study-good": function(event) {
		Meteor.call("goodAnswer", Session.get("currentTopic"), Session.get("currentQuestion"), function() {
			refreshStudy();
		});
	},
	"click .js-study-bad": function(event) {
		Meteor.call("badAnswer", Session.get("currentTopic"), Session.get("currentQuestion"), function() {
			refreshStudy();
		});
	},
	"click .js-study-pass": function(event) {
		Meteor.call("passAnswer", Session.get("currentTopic"), Session.get("currentQuestion"), function() {
			refreshStudy();
		});
	}


});

Template.addSection.events({
	"click .js-submit-problem-button": function(event) {
		let answer = $(".js-submit-problem-answer").val();
		let question = $(".js-submit-problem-question").val();
		let topicID = Session.get("currentTopic")._id;

		Meteor.call("addQuestion", topicID, question, answer);
	}
});

function refreshStudy() {
	if (Repetition.findOne() && Repetition.findOne().topics) {
		let topics = Repetition.findOne().topics;
		Session.set("allTopics", topics);

		topics.forEach(topic => {
			if (topic._id == Session.get("currentTopic")._id) {
				Session.set("currentTopic", topic);
			}
		})


		$("#studyTextarea").addClass("obscured-textarea");
		$("#hide-show-button").html("Reveal");
		$("#evaluationButtons").addClass("hide");
	}

	
}