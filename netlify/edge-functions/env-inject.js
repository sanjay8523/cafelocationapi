export default async (request, context) => {
  const response = await context.next();
  const text = await response.text();

  // Replace the placeholder
  const modifiedText = text.replace("$VITE_API_KEY", context.env.VITE_API_KEY);

  return new Response(modifiedText, {
    status: response.status,
    headers: {
      "content-type": "application/javascript", // Force correct type
    },
  });
};
