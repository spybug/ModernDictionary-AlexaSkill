var https = require('https');
var swearjar = require('swearjar');
var appID = process.env['app_ID'];

exports.handler = (event, context) => {
    try {
        if (event.session.application.applicationId != appID) {
            throw "Not a valid App ID";
        }

        switch (event.request.type) {
            case 'LaunchRequest':
                launchText = 'Modern Dictionary is a skill to learn new funny phrases and words by giving you the definition. Please ask for a random definition now or say stop to exit.';
                returnResponse(launchText, false);
                break;

            case 'IntentRequest':
                switch(event.request.intent.name) {
                    case 'GetRandomDefinition':
                        getRandomDefinition();
                        break;

                    case 'AMAZON.CancelIntent':
                    case 'AMAZON.StopIntent':
                        returnResponse("Goodbye", true);
                        break;

                    case 'AMAZON.HelpIntent':
                        helpText = "Modern Dictionary gives modern day definitions to words and phrases. To hear one, please ask Modern Dictionary for a random word now.";
                        returnResponse(helpText, false);
                        break;
                }
                break;

            case 'SessionEndedRequest':
                break;

            default:
                context.fail('INVALID REQUEST TYPE: $(event.request.type)');
        }
    }
    catch(error) { context.fail('Exception: $(error)'); }

    function getRandomDefinition() {
        var endpoint = 'https://api.urbandictionary.com/v0/random';
        var body = '';
        https.get(endpoint, (response) => {
            response.on('data', (chunk) => { body += chunk; });
            response.on('end', () => {
                var data = JSON.parse(body);
                var foundCleanWord = false
                for (var i = 0; i < data.list.length; i++) {
                    var word = data.list[i].word;
                    // Check to see if the word contains profanities
                    if (!swearjar.profane(word)) {
                        var definition = data.list[i].definition;
                        // Censor the definition of profanities
                        cleanDefinition = swearjar.censor(definition);

                        var result = 'The random word is ' + word + '. The definition is ' + cleanDefinition;
                        foundCleanWord = true;
                        returnResponse(result, true);
                    }
                    else {
                        // Useful for debugging retries
                        console.log('Profane word was ' + word + ", retrying...");
                        continue;
                    }
                }
                if (!foundCleanWord) {
                    returnResponse("Sorry I was not able to find a clean defintion, please try again later", true);
                }
            });
        });
    }

    function returnResponse(text, shouldEndSession) {
        context.succeed(
            generateResponse(
                buildSpeechletResponse(text, shouldEndSession),
                {}
            )
        );
    }
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
