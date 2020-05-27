export const environment = {
  production: false,
  apiBase: 'http://localhost:3000/api',
  wikiBase: 'http://wiki.draas.cdsvdc.lcl/index.php/UI',
  openId: {
    authority: 'https://10.151.20.115/cfs/oauth/draasui',
    client_id: 'lS12GPO6lWGJ8e7Ocjbo0z',
    client_secret: 'r0Tjc0OZ6Oem4Biw9ZGulD0mY3xzzBD9Q6wuJ4jIgMft',
    redirect_uri: 'http://localhost:4200/callback',
    response_type: 'code',
    scope: 'openid profile',
    filterProtocolClaims: false,
    loadUserInfo: true,
    metadata: {
      issuer: 'https://10.151.20.115/cfs/oauth/draasui',
      authorization_endpoint: 'https://10.151.20.115/cfs/oauth/draasui/authorize',
      token_endpoint: 'https://10.151.20.115/cfs/oauth/draasui/tokenservice',
      userinfo_endpoint: 'http://localhost:3000/api/v1/auth/user-info',
    },
  },
};
