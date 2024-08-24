
import express from "express";
import Nylas from "nylas";

const config = {
  clientId: process.env.NYLAS_CLIENT_ID,
  callbackUri: process.env.CALLBACK_URI,
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
};

const nylas = new Nylas({
  apiKey: config.apiKey,
  apiUri: config.apiUri,
});

const app = express();
const port = 10000;

app.use(express.static('dist'));
app.use(express.json());

app.get("/nylas/auth", (req, res) => {
  const authUrl = nylas.auth.urlForOAuth2({
    clientId: config.clientId,
    redirectUri: config.callbackUri,
  });

  res.redirect(authUrl);
});

app.get("/oauth/exchange", async (req, res) => {
  console.log("Received callback from Nylas");
  const code = req.query.code;

  if (!code) {
    res.status(400).send("No authorization code returned from Nylas");
    return;
  }

  const codeExchangePayload = {
    clientSecret: config.apiKey,
    clientId: config.clientId,
    redirectUri: config.callbackUri,
    code,
  };

  try {
    const response = await nylas.auth.exchangeCodeForToken(codeExchangePayload);
    const { grantId } = response;

    // NB: This stores in RAM
    // In a real app you would store this in a database, associated with a user
    process.env.USER_GRANT_ID = grantId;

    console.log({ message: "OAuth2 flow completed successfully for grant ID: " + grantId });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to exchange authorization code for token");
  }
});

async function fetchFolders() {
  try {
      const folders = await nylas.folders.list({
        identifier: process.env.USER_GRANT_ID,
      });
      return folders;
  } catch (error) {
    console.error('Error fetching folders:', error)
  }
}

async function createFolder(name) {
  try {
    const folder = await nylas.folders.create({
      identifier: process.env.USER_GRANT_ID,
      requestBody: { name }
    })

    return folder;
  } catch (error) {
    console.error('Error creating folder:', error)
  }
}

async function getFolder(name) {
  try {
    const folders = await fetchFolders();
    let folder = folders.data?.find(f => f.name === name);
    if (!folder) {
      folder = (await createFolder(name)).data;
    }
    return folder;
  } catch (error) {
    console.error('Error get folder:', error)
  }
}

app.post("/nylas/send-email", async (req, res) => {
  try {
    const { email, subject, body } = req.body;
    const sentMessage = await nylas.messages.send({
      identifier: process.env.USER_GRANT_ID,
      requestBody: {
        to: [{ email }],
        subject,
        body
      },
    });

    // move to "reminders-box" folder
    const folder = await getFolder('reminders-box');
    const updatedMessage = await nylas.messages.update({
      identifier: process.env.USER_GRANT_ID,
      messageId: sentMessage.data.id,
      requestBody: {
        folders: [folder.id]
      }
    })

    res.json({sentMessage, updatedMessage});
  } catch (error) {
    console.error("Error sending email:", error);
  }
});   

app.get("/nylas/app-emails", async (req, res) => {
  try {
    const folder = await getFolder('reminders-box');
    const identifier = process.env.USER_GRANT_ID;
    const messages = await nylas.messages.list({
      identifier,
      queryParams: {
        in: [folder.id]
      },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
});   

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
