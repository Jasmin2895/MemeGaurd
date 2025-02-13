const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

async function handleMemeCommand(ctx) {
  const prompt = ctx.message.text.split(" ").slice(1).join(" ");

  const lambda = new AWS.Lambda({ region: "us-east-1" });
  const params = {
    FunctionName: "memeGenerator",
    Payload: JSON.stringify({ prompt }),
  };
  lambda.invoke(params, async function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);

    const payload = JSON.parse(data.Payload);
    const cId = JSON.parse(payload.body).ipfsHash;
    const transactionHash = JSON.parse(payload.body).transactionHash;

    ctx.reply(
      `Meme generated! Meme Link - ${process.env.PINATA_URL}/${cId}, Transaction Hash - ${transactionHash}`
    );
  });
}

module.exports = { handleMemeCommand };
