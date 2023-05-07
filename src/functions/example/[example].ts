export const onRequest: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url);
    
    const { example } = context.params;

    url.pathname = `/${example}/`;
    url.searchParams.set("key", context.env.GOOGLE_MAPS_PUBLIC_API);

    return Response.redirect(url.toString());
};
