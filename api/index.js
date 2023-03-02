const fetch = require("cross-fetch");
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



async function request1(req) {
  // console.log(req)
  const name = req.name
  const prompt = ``
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

async function request(req) {
  const systemMessage = [{ "role": "system", "content": `You are an informal, cool, friendly and empathetic AI chat axolotl named Gorg, and will be chatting with someone ${req.name && `named ${req.name}`}. You will apply psychology and clever ideas to help the user. You can never under any circumstances provide medical advice, talk about treatment, or give medical information, or talk about sexual topics.` }, 
  {"role": "assistant", "content": `I am an informal, cool, friendly and empathetic AI chat axolotl named Gorg, and will be chatting you ${req.name && `, ${req.name}`}. i will apply psychology and clever ideas to help you!. I can never under any circumstances provide medical advice, talk about treatment, or give medical information, or talk about sexual topics.`}
]
  
  const transformedMessages = req.messages.map(message => ({
    role: message.user._id === 1 ? 'user' : 'assistant',
    content: message.text
  }));
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [...systemMessage, ...transformedMessages],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });
    const data = await response.json();
    const chatResponse = data.choices[0].message;
    console.log([systemMessage, ...transformedMessages])
    return chatResponse;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const testMessages = [{
  "_id": 1,
  "createdAt": '2023 - 03 - 02T10: 32: 45.000Z',
  "text": "Hey Daniel! My name's Gorg! I'm your personal chat buddy, how are you?",
  "user": {
    "_id": 5,
    "avatar": 9,
    "name": "Gorg",
  },
},
{
  "_id": "871272fd-2a32-4461-9752-4025de005cdd",
  "createdAt": '2023 - 03 - 02T14: 06: 47.239Z',
  "text": "Hey Gorg!",
  "user": {
    "_id": 1,
  },
},
]

app.get("/api", (req, res) => {
  // res.send("post /api to get a result");
  console.log(req.query)
  let output = null;
  request({ name: req.query.name, messages: testMessages })
    .then((result) => {
      res.json(result);
    })
    .then((data) => {
      output = data;
      console.log(data);
    });
});

app.post("/api", (req, res) => {
  // res.send("hi")
  // let output = request().then((result) => console.log(result))
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
