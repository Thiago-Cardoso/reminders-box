// CORS config
class CustomResponse extends Response {
  constructor(body) {
    super(body, {headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }});
    return this;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    if (!q) {
      return new CustomResponse();
    }

    const tools = [
      {
        name: "dblist",
        description: "Provides the capability of list data from database.",
        parameters: {
          type: "object",
          properties: {
            none: {
              type: "string",
              description: "None",
            },
          },
        },
      },
      {
        name: "dbsave",
        description: "Provides the capability of save data to database.",
        parameters: {
          type: "object",
          properties: {
            data: {
              type: "string",
              description: "The data to save.",
            },
          },
          required: ["data"],
        },
      },
      {
        name: "dbget",
        description: "Provides the capability of get data by key.",
        parameters: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description: "The key param.",
            },
            username: {
              type: "string",
              description: "The username param.",
            },
          },
          required: ["key", "username"],
        },
      },
      {
        name: "dbdelete",
        description: "Provides the capability of delete data by key.",
        parameters: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description: "The key param.",
            },
          },
          required: ["key"],
        },
      }
    ];

    const response = await env.AI.run(
      "@hf/nousresearch/hermes-2-pro-mistral-7b",
      {
        messages: [
          // example requests
          // { role: "user", content: `please save this data to database: 'Person Name: Mary. Relationship Bond: Sister. Email Reason: Birthday message. Date: 2024-08-26T20:10.'` }
          // { role: "user", content: "I want to get data to write a draft message with this key '{key-here}'" }
          // { role: "user", content: "I want to delete e-mail remind with this key '{key-here}'" }
          // { role: "user", content: "list all email reminders from db" }
          { role: "user", content: q },
        ],
        tools: tools,
      }
    );

    const ttool = response.tool_calls[0];
    if (ttool.name == "dblist") {
      const list = await this.listEmailsToSend(env);
      const regs = [];
      for (let item of list) {
        regs.push({
          key: item.name,
          data: await this.getEmailToSend(env, item.name),
        });
      }
      return new CustomResponse(JSON.stringify(regs));
    } else if (ttool.name == "dbsave") {
      const data = ttool.arguments.data;
      await this.saveEmailToSend(env, data);
    } else if (ttool.name == "dbget") {
      const { key, username } = ttool.arguments;
      const data = await this.getEmailToSend(env, key);
      console.log(data);
      const response = await this.writeEmailDraft(env, tools, ttool, data, username);
      return new CustomResponse(
        JSON.stringify({ response, data: { key, value: data } })
      );
    } else if (ttool.name == "dbdelete") {
      const key = ttool.arguments.key;
      return new CustomResponse(
        JSON.stringify(await this.deleteByKey(env, key))
      );
    }

    return new CustomResponse();
  },

  async writeEmailDraft(env, tools, ttool, data, username) {
    const { response } = await env.AI.run(
      "@hf/nousresearch/hermes-2-pro-mistral-7b",
      {
        messages: [
          {
            role: 'system',
            content: `
              You are a skilled writer, adept at crafting clear, concise, and effective email responses.
              Your strength lies in your ability to communicate effectively, ensuring that each response
              is tailored to address the specific needs and context of the email.`
          },
          {
            role: "user",
            content: `
              Write an e-mail draft, as if you were me.
              My name is ${username}.
              You can insert emojis.
              Please, fill the fields with the tool retrieved data`,
          },
          {
            role: "assistant",
            content: "",
            tool_call: ttool.name,
          },
          {
            role: "tool",
            name: ttool.name,
            content: data,
          },
        ],
        tools: tools,
      }
    );
    return response;
  },

  async listEmailsToSend(env) {
    const value = await env.MAILS_TO_SEND.list();
    return value.keys;
  },

  async getEmailToSend(env, key) {
    try {
      const value = await env.MAILS_TO_SEND.get(key);
      return value;
    } catch (e) {
      return null;
    }
  },

  async deleteByKey(env, key) {
    return await env.MAILS_TO_SEND.delete(key);
  },

  async saveEmailToSend(env, value) {
    try {
      const date = new Date(value.match(/Date: (.*)./)[1]);
      value = value.replace(/Date:.*/, "");
      await env.MAILS_TO_SEND.put(
        `${date.toISOString()}:${performance.now()}`,
        value
      );
    } catch (e) {
      return null;
    }
  },
};
