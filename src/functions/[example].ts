export const onRequest: PagesFunction<Env> = async (context) => {
    const { example } = context.params;

    return Response.redirect(`/${example}/?key=${context.env.GOOGLE_MAPS_PUBLIC_API}`);
};
