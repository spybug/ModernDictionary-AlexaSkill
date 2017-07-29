var https = require('https');
var appID = process.env['app_ID'];

console.log(appID);

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
                        buildSpeechletResponse('Modern Dictionary is a skill to learn new funny phrases and words by giving you the definition. Please ask for a random definition now or say stop to exit.', false),
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

                    case 'AMAZON.StopIntent' || 'StopIntent':
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Goodbye", true),
                                {}
                            )
                        );
                        break;

                    case 'AMAZON.HelpIntent' || 'HelpIntent':
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Modern Dictionary gives modern day definitions to words and phrases. To hear one, please ask Modern Dictionary for a random word now.", false),
                                {}
                            )
                        );
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
