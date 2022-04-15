import polyfill from "polyfill-library";

function featuresfromQueryParameter(featuresParameter, flagsParameter) {
  const features = featuresParameter.split(",").filter((f) => f.length);
  const globalFlags = flagsParameter ? flagsParameter.split(",") : [];
  const featuresWithFlags = {};

  for (const feature of features.sort()) {
    const safeFeature = feature.replace(/[*/]/g, "");
    const [name, ...featureSpecificFlags] = safeFeature.split("|");
    featuresWithFlags[name] = {
      flags: new Set(featureSpecificFlags.concat(globalFlags)),
    };
  }

  return featuresWithFlags;
}

export default async (request, response) => {
  const {
    excludes = "",
    features = "default",
    unknown = "polyfill",
    ua = "",
    flags = "",
    min = false,
  } = request.query;

  const bundle = await polyfill.getPolyfillString({
    excludes: excludes ? excludes.split(",") : [],
    features: featuresfromQueryParameter(features, flags),
    minify: min === "true",
    unknown: unknown === "ignore" ? "ignore" : "polyfill",
    uaString: ua,
  });

  response
    .status(200)
    .setHeader("content-type", "text/javascript; charset=utf-8")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS")
    .setHeader("Cache-Control", "public, s-maxage=31536000, max-age=604800")
    .send(bundle);
};
