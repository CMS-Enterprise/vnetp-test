import { OidcClientSettings } from 'oidc-client';

// Needs to be updated but necessary for build
const openId: OidcClientSettings = {
  authority: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
  client_id: 'lS12GPO6lWGJ8e7Ocjbo0z',
  client_secret: 'r0Tjc0OZ6Oem4Biw9ZGulD0mY3xzzBD9Q6wuJ4jIgMft',
  redirect_uri: 'http://localhost:4200/callback',
  response_type: 'code',
  scope: 'openid profile',
  loadUserInfo: true,
  metadata: {
    issuer: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui',
    authorization_endpoint: 'https://cfs01-dc01.draas.cdsvdc.lcl/cfs/oauth/draasui/authorize',
    token_endpoint: 'http://localhost:3000/cfs/oauth/draasui/tokenservice',
    userinfo_endpoint: 'http://localhost:3000/cfs/oauth/draasui/userinfo',
  },
};

export const environment = {
  production: true,
  apiBase: 'http://localhost:3000',
  wikiBase: 'http://wiki.draas.cdsvdc.lcl/index.php/UI',
  openId,
};
