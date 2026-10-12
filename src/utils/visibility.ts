// One rule for "does this post exist on the site yet".
//
// A drafted post is invisible everywhere the built site lists or renders posts,
// which is what makes a staged release possible: a whole track can sit in the
// repository, finished and cross-linked, without a reader finding it.
//
// `astro dev` is the exception. Drafts render locally so a track can be read
// and reviewed in the browser before its release date. `astro build` never
// sets DEV, so nothing drafted reaches the deployed site or its feeds.
export const isVisible = ({ data }: { data: { draft?: boolean } }) =>
  !data.draft || import.meta.env.DEV;
