export function getCurrency(){return (process.env.FLAME_DEFAULT_CURRENCY||'EUR').toUpperCase();}
export function formatPrice(value:number,locale:string){return new Intl.NumberFormat(locale,{style:'currency',currency:getCurrency()}).format(value);}
export function formatPriceUsd(value:number){return new Intl.NumberFormat('en-US',{style:'currency',currency:getCurrency()}).format(value);}
