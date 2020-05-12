export const environment = {
  production: false,
  apiBase: 'http://localhost:3000/api',
  wikiBase: 'http://wiki.draas.cdsvdc.lcl/index.php/UI',
  openId: {
    authority: 'https://10.151.20.115/cfs/oauth/draasui/authorize',
    client_id: 'IS12GPO6IWGJ8e7Ocjbo0z',
    redirect_uri: 'http://localhost:4200/callback',
    post_logout_redirect_uri: 'http://localhost:4200/',
    response_type: 'id_token token',
    scope: 'openid profile',
    loadUserInfo: true,
  },
};
