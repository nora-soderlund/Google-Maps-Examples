export const onRequest: PagesFunction<Env> = async (context) => {
    const { example } = context.params;

    return context.env.ASSETS.fetch(`/${example}/index.html?key=${context.env.GOOGLE_MAPS_PUBLIC_API}`);
};
