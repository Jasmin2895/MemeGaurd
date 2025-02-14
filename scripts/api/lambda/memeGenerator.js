const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const FormData = require("form-data");
const { PassThrough } = require("stream");

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

async function generateMeme(event) {
  const requestPayload = {
    text_prompts: [{ text: event }],
    cfg_scale: 8,
    seed: 42,
    steps: 50,
    width: 1024,
    height: 1024,
  };

  try {
    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: "stability.stable-diffusion-xl-v1",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestPayload),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const buffer = Buffer.from(responseBody.artifacts[0].base64, "base64");

    return buffer;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

module.exports = { generateMeme };
