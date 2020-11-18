import { OidcClientSettings } from 'oidc-client';

const openId: OidcClientSettings = {
  authority: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
  client_id: 'u9jH9wH5gGNtI44uyl2g2Y',
  client_secret: 'WoQr5zyY2OcuFfM4EslQF8R1WplrtkvDo1MsS2e9ezX1',
  redirect_uri: 'https://dcs-dev.draas.cdsvdc.lcl/callback',
  response_type: 'token',
  scope: 'openid profile',
  loadUserInfo: true,
  metadata: {
    issuer: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
    authorization_endpoint: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui/authorize',
    token_endpoint: 'https://dcs-dev.draas.cdsvdc.lcl/cfs/oauth/draasui/tokenservice',
    userinfo_endpoint: 'https://dcs-dev.draas.cdsvdc.lcl/cfs/oauth/draasui/userinfo',
  },
};

export const environment = {
  production: true,
  userClaims: true,
  apiBase: '/api',
  wikiBase: 'http://wiki.draas.cdsvdc.lcl/index.php/UI',
  openId,
};
