var https = require('https');
var appID = "APP_ID_HERE";

exports.handler = (event, context) => {

    try {
        if (event.session.new) {
            console.log('NEW SESSION');
        }
        if (event.session.application.applicationId != appID) {
            throw "Not a valid App ID";
        }

        switch (event.request.type) {
            case 'LaunchRequest':
                console.log('LAUNCH REQUEST');
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse('This skill will give you the defintions to words from Urban Dictionary. Please ask for the definition to a word.', false),
                        {}
                    )
                );
                break;

            case 'IntentRequest':
                console.log('INTENT REQUEST');
                var endpoint = '';
                var body = '';
                switch(event.request.intent.name) {
                    case 'GetRandomDefinition':
                        endpoint = 'https://api.urbandictionary.com/v0/random';
                        https.get(endpoint, (response) => {
                            response.on('data', (chunk) => { body += chunk; });
                            response.on('end', () => {
                                var data = JSON.parse(body);
                                var definition = data.list[0].definition;
                                var word = data.list[0].word;
                                var result = 'The random word is ' + word + '. The definition is ' + definition + '.';
                                console.log('word: ' + word);
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(result, true),
                                        {}
                                    )
                                );
                            });
                        });
                        break;

                    case 'GetDefinition':
                        var term = event.request.intent.slots.word.value;
                        endpoint = 'https://api.urbandictionary.com/v0/define?term=' + term;
                        https.get(endpoint, (response) => {
                            response.on('data', (chunk) => { body += chunk; });
                            response.on('end', () => {
                                var data = JSON.parse(body);
                                var result = '';
                                if (data.result_type != 'no_results') {
                                    var definition = data.list[0].definition;
                                    result = 'The defintion of ' + term + ' is: ' + definition + '.';
                                }
                                else {
                                    result = 'Sorry, I could not find the definition to ' + term + '. Please try a different word.';
                                }
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(result, true),
                                        {}
                                    )
                                );
                            });
                        });
                        break;
                }
                break;

            case 'SessionEndedRequest':
                console.log('Session Ended Request');
                break;

            default:
                context.fail('INVALID REQUEST TYPE: $(event.request.type)');
        }
    }
    catch(error) { context.fail('Exception: $(error)'); }

};

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: 'PlainText',
      text: outputText
    },
    shouldEndSession: shouldEndSession
  };

};

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: '1.0',
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };

};
