// Mock feed thumbnail for the character test (not the real L2 thumbnail).
function scene(key){
  // rush-hour concourse: blurred commuter silhouettes, warm light from the right, you in focus, the readout
  let crowd="";
  const cols=["#3b4560","#46516e","#525d7a","#384058"];
  for(let i=0;i<26;i++){
    const x=(i*53)%340-10, s=0.55+((i*37)%10)/22, y=118+((i*29)%30);
    if(x>130&&x<200) continue;
    crowd+=`<g transform="translate(${x},${y}) scale(${s})" opacity=".85"><circle cx="0" cy="-58" r="16" fill="${cols[i%4]}"/><rect x="-15" y="-42" width="30" height="58" rx="10" fill="${cols[(i+1)%4]}"/></g>`;
  }
  return `<svg viewBox="0 0 320 180" width="320" height="180" overflow="hidden" style="overflow:hidden" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="bg${key}" x1="0" x2="1"><stop offset="0" stop-color="#1b2135"/><stop offset="1" stop-color="#5a4a63"/></linearGradient>
  <radialGradient id="lamp${key}" cx=".85" cy=".1" r=".7"><stop offset="0" stop-color="rgba(255,196,120,.55)"/><stop offset="1" stop-color="rgba(255,196,120,0)"/></radialGradient>
  <filter id="blur${key}"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="glow${key}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="320" height="180" fill="url(#bg${key})"/><rect width="320" height="180" fill="url(#lamp${key})"/>
  <rect y="150" width="320" height="30" fill="#2a2633"/>
  <g filter="url(#blur${key})">${crowd}</g>
  <g transform="translate(150,26) scale(.95)">${character(key,"worried",{noShadow:true})}</g>
  <g filter="url(#glow${key})"><rect x="218" y="10" width="64" height="22" rx="11" fill="rgba(20,30,40,.75)" stroke="#7df9c6" stroke-width="1.5"/>
  <text x="250" y="26" text-anchor="middle" font-family="Rubik" font-weight="800" font-size="15" fill="#7df9c6">99/100</text></g>
  <text x="14" y="40" font-family="Rubik" font-weight="800" font-size="30" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke">ONLY</text>
  <text x="14" y="72" font-family="Rubik" font-weight="800" font-size="30" fill="#7df9c6" stroke="#000" stroke-width="5" paint-order="stroke">100.</text>
  </svg>`;
}
