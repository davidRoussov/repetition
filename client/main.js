import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

var Repetition = new Mongo.Collection("topics");

Template.topicsBar.helpers({
	topic: function() {
		if (Repetition.findOne() && Repetition.findOne().topics) {
			let topics = Repetition.findOne().topics;
			console.log(topics);
			Session.set("allTopics", topics);
			return topics;
		}
	}

});

Template.studySection.helpers({
	topic: function() {
		return Session.get("currentTopic");
	}

});

Template.addSection.helpers({
	topic: function() {
		return Session.get("currentTopic");
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
			Meteor.call("addNewTopic", topicName, function() {

			});
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