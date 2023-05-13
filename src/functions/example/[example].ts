export const onRequest: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url);
    
    const { example } = context.params;

    url.pathname = `/${example}/`;
    url.searchParams.set("key", context.env.GOOGLE_MAPS_PUBLIC_API);
    url.searchParams.set("mapId", context.env.GOOGLE_MAPS_MAP_ID);

    return Response.redirect(url.toString());
};
