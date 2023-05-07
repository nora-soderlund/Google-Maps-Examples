export const onRequest: PagesFunction<Env> = async (context) => {
    return Response.redirect(`${context.request.url}/?key=${context.env.GOOGLE_MAPS_PUBLIC_API}`);
};
