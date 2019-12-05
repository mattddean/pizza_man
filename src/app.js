'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  LAUNCH() {
    return this.toIntent('HelloWorldIntent');
  },

  HelloWorldIntent() {
    this.ask('Hello World! What\'s your name?', 'Please tell me your name.');
  },

  MyNameIsIntent() {
    this.tell('Hey ' + this.$inputs.name.value + ', nice to meet you!');
  },

  AskToppingsIntent() {
    this.ask('What toppings would you like on your pizza?');
    return this.toIntent('TellToppingsIntent');
  },

  TellToppingsIntent() {
    this.tell('Okay, I\'ll add ' + this.$inputs.toppings.value.join(' and ') + ' to your pizza');
    return this.toIntent('AskCrustIntent');
  },

  AskCrustIntent() {
    this.ask('What type of crust do you want?');
    return this.toIntent('TellCrustIntent');
  }

  TellCrustIntent() {
    this.tell('Okay, your pizza will have ' + this.$inputs.crust.value + 'crust');
    return this.toIntent('AskSidesIntent');
  },

  AskSidesIntent() {
    this.ask('What sides would you like with your pizza?');
    return this.toIntent('TellSidesIntent');
  },

  TellSidesIntent() {
    this.tell('Okay, I\'ll add ' + this.$inputs.sides.value.join(' and ') + 'to your order');
    return this.toIntent('ConfirmOrderIntent');
  },

  CancelOrderIntent() {
    this.tell('Your order is cancelled. Let me know if you need me again!');
  },

  ConfirmOrderIntent() {
    this.tell('Your order is confirmed');
  }
});

module.exports.app = app;
