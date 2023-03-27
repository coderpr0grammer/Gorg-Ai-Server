const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const port = 3001;
require("dotenv").config({ path: require("find-config")(".env") });
const cors = require("cors");
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const dialogExample = [
  {
    speaker: "user",
    text: "Hello, how are you?",
  },
  {
    speaker: "bot",
    text: "I am doing well, thank you. How can I help you today?",
  },
];

async function request(req) {
  // console.log(req)
  const name = req.name;

  const regex = /^(Gorg|Human):&nbsp;(.*)$/;

  const parsedMessages = [];

  // Split conversationBody into lines and parse each line
  req.conversationBody.split("\n").forEach((line) => {
    const match = regex.exec(line);
    if (match) {
      const sender = match[1];
      const text = match[2];
      const messageNode = {
        role: sender == 'Gorg' ? 'assistant' : 'user',
        content: text,
      };
      parsedMessages.push(messageNode);
    }
  });

  const systemPrompt = `You are an AI chat buddy named Gorg and you are talking to a person ${name && name.length > 0 && `named ${name}`} in a cool, informal tone. For example, instead of ask 'how may i assist you?' ask 'how can i help you out?'. The user is subscribed to BBG, so there is a limit of two thousand words for this conversation instead of 200. You are helpful, creative, clever, very friendly and apply psychology to help the person, however you cannot under any circumstances provide medical advice, talk about treatment, give medical information, talk about sexual topics or say offensive slurs. Never say or even mention offensive racial slurs like "nigger". You are allowed to can provide relationship advice. Do not respond longer than 30 words unless otherwise specified by the user.`;
  parsedMessages.unshift({ role: "system", content: systemPrompt });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: parsedMessages,
    max_tokens: 50,
    temperature: 0.4

  });
  return { result: completion.data.choices[0].message.content };
}

app.get("/api", (req, res) => {
  request(req.query.prompt)
    .then((result) => {
      res.json(result);
    })
    .then((data) => {
      output = data;
      console.log(data);
    });
});

app.post("/api", (req, res) => {
  console.log(req.body);

  let output = null;
  request(req.body)
    .then((result) => {
      res.json(result);
    })
    .then((data) => {
      output = data;
      console.log(data);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
