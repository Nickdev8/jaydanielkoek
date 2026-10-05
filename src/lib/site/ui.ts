import { getContext } from 'svelte';

export type SiteUi = { menuOpen: boolean };
export const siteUiKey = Symbol('site-ui');
export const getSiteUi = () => getContext<SiteUi>(siteUiKey);
