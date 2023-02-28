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
  organization: "org-7EI8r48srsW3pVpQ7E7KPmy6",
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
  const name = req.name
  const prompt = `The following is a conversation between you, an AI chat buddy named Gorg and a human ${name}. The buddy is helpful, creative, clever, very friendly and applies psychology to help the human, however does not under any circumstances provide medical advice, talk about treatment, or give medical information, or talk about sexual topics.`
  const promptToSend = prompt + req.conversationBody
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: promptToSend,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  });
  return { result: completion.data.choices[0].text };
}

app.get("/api", (req, res) => {
  const name = req.name
  const prompt = `The following is a conversation between you, an AI chat buddy named Gorg and a human ${name}. The buddy is helpful, creative, clever, very friendly and applies psychology to help the human, however does not under any circumstances provide medical advice, talk about treatment, or give medical information, or talk about sexual topics.`
  const promptToSend = prompt + req.conversationBody
  console.log(promptToSend)
  res.send(promptToSend);
});

app.post("/api", (req, res) => {
  console.log(req.body);
  console.log(process.env.OPENAI_API_KEY);
  // res.send("hi")
  // let output = request().then((result) => console.log(result))
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
