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

// Object.prototype.isEmpty = function () {
//   for (var key in this) {
//     console.log('key')
//     console.log(key)
//     if (this[key] != null){
//       return false;
//     }
//   }
//   return true;
// }

Object.prototype.isEmpty = function () {
  for (var key in this) {
    if (this.hasOwnProperty(key))
      return false;
  }
  return true;
}

// Object.prototype.notNull = function () {
//   for (var key in this) {
//     console.log('key')
//     console.log(key)
//     if (this[key] != null) {
//       console.log(key, this[key]);
//       return this[key];
//     }
//   }
// }

var askQueue = {};
var user = "";
var toppings = [];
var readyToCheckoutString = "Are you ready to checkout?"

app.setHandler({

  LAUNCH() {
    askQueue = {
      'name': 'What\'s your name?',
      'toppings': 'What toppings would you like on your pizza?',
      'crust': 'What type of crust do you want?'
    }
    return this.toIntent('HelloWorldIntent');
  },

  HelloWorldIntent() {
    console.log(askQueue);
    this.$speech = 'Hi! I\'m Pizza Man! I\'ll help you order a pizza! ';
    if (!askQueue.isEmpty()) {
      this.ask(this.$speech + Object.values(askQueue)[0]);
    }
    else {
      this.followUpState('CheckoutState')
        .ask(this.$speech + readyToCheckoutString);
    }
  },

  MyNameIsIntent() {
    delete askQueue.name;
    user = this.$inputs.name.value;
    this.$speech = 'Hey ' + user + ', nice to meet you! ';
    if (!askQueue.isEmpty()) {
      this.ask(this.$speech + Object.values(askQueue)[0]);
    }
    else {
      this.followUpState('CheckoutState')
        .ask(this.$speech + readyToCheckoutString);
    }
  },

  // AskToppingsIntent() {
  //   this.ask('Sure! What toppings would you like on your pizza?');
  // },

  TellToppingsIntent() {
    delete askQueue.toppings;
    toppings = this.$inputs.toppings.value;
    this.$speech = 'Okay, I\'ll add ' + toppings.join(' and ') + ' to your pizza. '
    // TODO Change join to place commas for 3+ items
    if (!askQueue.isEmpty()) {
      this.ask(this.$speech + Object.values(askQueue)[0]);
    } 
    else {
      this.followUpState('CheckoutState')
        .ask(this.$speech + readyToCheckoutString);
    }
  },

  TellCrustIntent() {
    delete askQueue.crust;
    this.$speech.addText('Okay, your pizza will have ' + this.$inputs.crust.value + ' crust. ');
    this.$reprompt.addText('Give yes or no.');
    if (!askQueue.isEmpty()) {
      this.ask(this.$speech + Object.values(askQueue)[0]);
    }
    else {
      this.followUpState('CheckoutState')
        .ask(this.$speech + readyToCheckoutString, this.$reprompt);
    }
  },

  ChangeOrderState: {
    ChangeIntent(){
      this.ask("What would you like to change?");
    },

    ChangeToppingsIntent() {
      this.followUpState()
        .ask("I'll remove your previous topping selections. What new toppings do you want?")
      // return this.toStatelessIntent('TellToppingsIntent')
    },

    ChangeCrustIntent() {
      this.followUpState()
        .ask("I'll remove your previous crust selection. What new type of crust do you want?")
      // return this.toStatelessIntent('TellCrustIntent')
    },
    Unhandled(){
      return this.toStateIntent('CheckoutState', 'askCheckout');
    },
  },

  CancelOrderState: {
    CancelOrderIntent() {
      this.ask('Are you sure you want to cancel your order?');
    },
    
    YesIntent() {
      this.tell("Okay, your order is cancelled. Say Launch PizzaMan next time you want to talk to me!")
    },

    NoIntent() { 
      return this.toStateIntent('CheckoutState', 'NoIntent');
    },

    Unhandled() {
      return this.toStateIntent('CheckoutState', 'NoIntent');
    }
  },

  CheckoutState: {
    AskCheckout() {
      this.ask("Ready to checkout?", "Would you like to checkout?");
    },

    YesIntent(){
      return this.toIntent('AskAddressIntent')
    },

    NoIntent(){
      this.ask('Would you like to change your order or cancel it?');
    },

    ChangeOrderIntent() {
      return this.toStateIntent('ChangeOrderState', 'ChangeIntent');
    },

    CancelOrderIntent() {
      return this.toStateIntent('CancelOrderState', 'CancelOrderIntent');
    },

    Unhandled(){
      this.followUpState('CheckoutState')
        .ask("please say yes or no");
    },

    AskAddressIntent() {
      this.followUpState(this.getState() + '.FindAddressState')
        .ask("What is your address?");
    },

    FindAddressState: {
      TellAddressIntent() {
        this.followUpState(this.getState() + '.AddressState')
          .ask('If I heard correctly, your address is ' + this.$inputs.address.value + '. Is this correct?');
      },
      AddressState: {
        YesIntent() {
          this.followUpState('CheckoutState.ConfirmOrderState')
            .ask('Great! We\'ll deliver it to that address. Would you like to confirm or cancel your order?');
        },
        NoIntent() {
          this.toStateIntent('CheckoutState', 'AskAddressIntent');
        },
        Unhandled() {
          let speech = 'You need to answer with yes to confirm your address, or no, to change your address.';
          let reprompt = 'Please answer with yes or no.';
          this.ask(speech, reprompt);
        }
      }
    },
    ConfirmOrderState: {
      YesIntent() {
        this.tell('Your order is confirmed. Your customized pizza will be delivered soon!');
      },
      NoIntent(){
        this.tell("Your order has been cancelled.");
      },
      CancelIntent() {
        this.tell("Your order has been cancelled.");
      }
    }
  },

  // AskSidesIntent() {
  //   this.ask('What sides would you like with your pizza?');
  //   return this.toIntent('TellSidesIntent');
  // },

  // TellSidesIntent() {
  //   this.tell('Okay, I\'ll add ' + this.$inputs.sides.value.join(' and ') + 'to your order');
  //   return this.toIntent('ConfirmOrderIntent');
  // },

  // CancelOrderIntent() {
  //   this.tell('Your order is cancelled. Let me know if you need me again!');
  // },

  ConfirmOrderIntent() {
    this.tell('Your order is confirmed');
  }
});

module.exports.app = app;
