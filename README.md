
## Reminders Box
<p  align="center">This is a submission for the Nylas Challenge: AI Expedition</p>

## Demo
![](https://github.com/Thiago-Cardoso/reminders-box/blob/master/demo/0123.PNG)

## Link
![](https://streamable.com/ld5irh)

<a href="https://streamable.com/ld5irh" target="_blank">Link Demo</a>

## Stack the Project
- **Frontend: Vite and Vue.js**
- **Interface Nylas API**
- **Nylas SDK**
- **Cloudflare Workers AI**
- **Backend: NodeJs - Express.js**

## Link Sdks
https://developer.nylas.com/docs/v3/sdks/node  
https://developer.nylas.com/docs/v3/email

## About
I developed a reminder box application powered by an interactive AI agent for managing emails that must be written and sent. Its key features include:
Create Reminders: Set reminders for emails that need to be sent in the future.
Natural Language Interaction: Use conversational commands to manage reminders with the AI agent, supporting CRUD (Create, Read, Update, Delete) operations.
Automated Drafts: The AI agent generates useful and relevant email drafts based on your reminders.
Seamless Integration: Send emails using the Nylas API and save them in a dedicated app folder for easy access and organization.

## Getting Started

First, it is necessary to deploy a public host and configure an environment according to Nylas sandbox :  
https://developer.nylas.com/docs/v3/getting-started/set-up/  

```bash
process.env.NYLAS_CLIENT_ID,
process.env.CALLBACK_URI,
process.env.NYLAS_API_KEY,
process.env.NYLAS_API_URI,

```

## Code
Code
The AI agent was created and deployed on Cloudflare Workers AI. The primary model used is @hf/nousresearch/hermes-2-pro-mistral-7b, which supports function calling capabilities. Function calling allows users to utilize Large Language Models (LLMs) to perform specific actions or interact with external APIs based on the model's responses. Developers typically define a collection of functions and the necessary input parameters for each, referred to as tools. The LLM then determines when to invoke these tools and provides a JSON output that needs to be passed to another function or API. In summary, function calling enables you to leverage LLMs for executing code or making additional API requests, extending their functionality beyond mere text generation.

The data is stored in a key-value database (Workers KV) in an entirely unstructured format. Nevertheless the agent has the ability to capture db data and use it in the correct way.

The Agent code is located in file functions/_worker.js

## Author
Project created by developer

<!-- ALL-CONTRIBUTOR-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->

[<img src="https://avatars1.githubusercontent.com/u/1753070?s=460&v=4" width="100px;"/><br /><sub><b>Thiago Cardoso</b></sub>](https://github.com/Thiago-Cardoso)<br />



