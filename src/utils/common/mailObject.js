import { APP_LINK, EMAIL_USER } from '../../config/serverConfig.js';

export const workspaceJoinMail = function (workspace) {
  return {
    from: EMAIL_USER,
    subject: 'You have been added to a workspace',
    text: `Congratulations! You have been added to the workspace ${workspace.name}`
  };
};

export const verifyEmailMail = function (verificationToken) {
  return {
    from: EMAIL_USER,
    subject: 'Welcome to the app. Please verify your email',
    text: `
      Welcome to the app. Please verify your email by clicking on the link below:
     ${APP_LINK}/verify/${verificationToken}
    `
  };
};
