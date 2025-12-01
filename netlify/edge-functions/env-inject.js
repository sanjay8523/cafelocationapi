export default async (request, context) => {
  const response = await context.next();

  return new Response(
    await response.text().replace("$VITE_API_KEY", context.env.VITE_API_KEY),
    response
  );
};
