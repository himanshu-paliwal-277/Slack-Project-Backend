import { EMAIL_USER } from '../../config/serverConfig.js';

export const workspaceJoinMail = function (workspace) {
  return {
    from: EMAIL_USER,
    subject: 'You have been added to a workspace',
    text: `Congratulations! You have been added to the workspace ${workspace.name}`
  };
};
