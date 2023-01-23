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
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt:
      "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: I'm great, how are you?\n\nAI:I'm doing well, thanks for asking. How can I help you today?\nHuman: Im great, how are you?\nAI: I'm doing well, thanks for asking. How can I help you today?\nHuman: im a little sad\n\nAI:I'm sorry to hear that. Is there anything I can do to help brighten your day?\nHuman: so much work\n\nAI:I understand that it can be overwhelming to have a lot of work to do. What can I do to help make it easier for you?\nHuman: \n",
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
  res.send("hi");
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
