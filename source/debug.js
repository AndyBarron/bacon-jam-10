// TODO disable when debug mode is off
export let print = console.log.bind(console, '[Debug]');
export function error(msg, e) {
  alert(msg);
  console.log('[Error]', msg);
  if (e) {
    console.log('[Exception]', e);
  }
};