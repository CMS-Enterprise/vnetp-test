import { OidcClientSettings } from 'oidc-client';

// Needs to be updated but necessary for build
// const openId: OidcClientSettings = {
//   authority: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
//   client_id: '6710TqF8fKfbx7R4VXowrl',
//   client_secret: 'AZhsc851y3Nd2hNr6oPk04xMsmnpuDBuMv5IfJJ1eKz0',
//   redirect_uri: 'https://10.151.14.54/callback',
//   response_type: 'token',
//   scope: 'openid profile',
//   loadUserInfo: true,
//   metadata: {
//     issuer: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
//     authorization_endpoint: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui/authorize',
//     token_endpoint: 'https://10.151.14.54/cfs/oauth/draasui/tokenservice',
//     userinfo_endpoint: 'https://10.151.14.54/cfs/oauth/draasui/userinfo',
//   },
// };
const openId: OidcClientSettings = {
  authority: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
  client_id: 'XANzoGUU0r1fzyRI24qdd1',
  client_secret: 'l4r9C895ssY9bAHU1NVj9vdVO0qMJMrhCVnMNi5RhYj0',
  redirect_uri: 'https://dcs-int.draas.cdsvdc.lcl/callback',
  response_type: 'token',
  scope: 'openid profile',
  loadUserInfo: true,
  metadata: {
    issuer: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
    authorization_endpoint: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui/authorize',
    token_endpoint: 'https://dcs-int.draas.cdsvdc.lcl/cfs/oauth/draasui/tokenservice',
    userinfo_endpoint: 'https://dcs-int.draas.cdsvdc.lcl/cfs/oauth/draasui/userinfo',
  },
};

// const openId: OidcClientSettings = {
//   authority: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
//   client_id: 'u9jH9wH5gGNtI44uyl2g2Y',
//   client_secret: 'WoQr5zyY2OcuFfM4EslQF8R1WplrtkvDo1MsS2e9ezX1',
//   redirect_uri: 'https://dcs-dev.draas.cdsvdc.lcl/callback',
//   response_type: 'token',
//   scope: 'openid profile',
//   loadUserInfo: true,
//   metadata: {
//     issuer: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
//     authorization_endpoint: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui/authorize',
//     token_endpoint: 'https://dcs-dev.draas.cdsvdc.lcl/cfs/oauth/draasui/tokenservice',
//     userinfo_endpoint: 'https://dcs-dev.draas.cdsvdc.lcl/cfs/oauth/draasui/userinfo',
//   },
// };

export const environment = {
  production: true,
  userClaims: false,
  apiBase: '/api',
  wikiBase: 'http://wiki.draas.cdsvdc.lcl/index.php/UI',
  openId,
};
