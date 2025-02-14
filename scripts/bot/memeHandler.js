const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.TELEGRAM_BOT_AWS_ACCESS_KEY,
  secretAccessKey: process.env.TELEGRAM_BOT_AWS_SECRET_KEY,
});

async function handleMemeCommand(ctx) {
  // Extract prompt and Safe address from the user's message
  const inputText = ctx.message.text.split(" ").slice(1).join(" ");

  // Split the input text by the pipe character (|)
  const [prompt, safeAddress] = inputText.split("|").map((s) => s.trim());

  // console.log("messageText", messageText);
  // const [safeAddress, ...promptParts] = messageText
  //   .split("|")
  //   .map((s) => s.trim());
  // const prompt = promptParts.join(" ");

  console.log("safeAddress", safeAddress, prompt);

  // Validate inputs
  if (!safeAddress || !prompt) {
    return ctx.reply(
      "Please provide both a Safe address and a prompt. Example: `/meme 0x1234... | Funny dog in a spaceship`"
    );
  }

  // Call the Lambda function
  const lambda = new AWS.Lambda({ region: "us-east-1" });
  const params = {
    FunctionName: "memeGenerator",
    Payload: JSON.stringify({ prompt, safeAddress }), // Pass both prompt and Safe address
  };

  lambda.invoke(params, async function (err, data) {
    if (err) {
      console.error(err, err.stack);
      return ctx.reply(
        "An error occurred while generating the meme. Please try again."
      );
    }

    try {
      const payload = JSON.parse(data.Payload);
      if (payload.statusCode !== 200) {
        throw new Error(payload.body.error || "Failed to generate meme");
      }

      const responseBody = JSON.parse(payload.body);
      const memeLink = `${process.env.TELEGRAM_BOT_PINATA_URL}/${responseBody.ipfsHash}`;
      const transactionHash = responseBody.transactionHash;

      // Reply to the user with the meme link and transaction hash
      ctx.reply(
        `Meme generated!\n` +
          `Meme Link: ${memeLink}\n` +
          `Transaction Hash: ${transactionHash}\n` +
          `Safe Address: ${safeAddress}`
      );
    } catch (error) {
      console.error("Error parsing Lambda response:", error);
      ctx.reply(
        "An error occurred while processing the meme. Please try again."
      );
    }
  });
}

module.exports = { handleMemeCommand };
