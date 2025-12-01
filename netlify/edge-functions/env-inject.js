export default async (request, context) => {
  // 1. Get the original file content
  const response = await context.next();
  const text = await response.text();

  // 2. secure way to get the variable
  // context.env DOES NOT EXIST, we must use Netlify.env.get()
  const apiKey = Netlify.env.get("VITE_API_KEY") || "KEY_NOT_FOUND";

  // 3. Replace the placeholder
  const modifiedText = text.replace("$VITE_API_KEY", apiKey);

  // 4. Return new response
  // We manually set the content-type to avoid "Content-Encoding" bugs
  return new Response(modifiedText, {
    status: response.status,
    headers: {
      "content-type": "application/javascript",
    },
  });
};
