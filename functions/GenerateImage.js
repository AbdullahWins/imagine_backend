const request = require("request");
const Replicate = require("replicate");

const GenerateImageUsingSDAPI = async (prompt) => {
  const key = process.env.STABLE_DIFFUSION_API_KEY;
  const options = {
    method: "POST",
    url: "https://stablediffusionapi.com/api/v3/text2img",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: "",
      prompt: prompt,
      negative_prompt: null,
      width: "512",
      height: "512",
      samples: "1",
      num_inference_steps: "20",
      seed: null,
      guidance_scale: 7.5,
      safety_checker: "yes",
      multi_lingual: "no",
      panorama: "no",
      self_attention: "no",
      upscale: "no",
      embeddings_model: "embeddings_model_id",
      webhook: null,
      track_id: null,
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    const data = JSON.parse(response.body);
    const fileUrl = data.output[0];
    return fileUrl;
  });
};

const GenerateImageUsingReplicate = async (prompt) => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const model =
    "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
  const input = { prompt: prompt };
  const output = await replicate.run(model, { input });
  return output;
};

module.exports = { GenerateImageUsingSDAPI, GenerateImageUsingReplicate };
