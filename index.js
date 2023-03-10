/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  const LABEL = "stargazers";
  let issueNumber;

  async function findOrCreateStargazersIssue(context) {
    const OWNER = context.payload.repository.owner.login;
    const REPO = context.payload.repository.name;
    const { data: issues } = await context.octokit.issues.listForRepo({
      repo: REPO,
      owner: OWNER,
      state: "open",
    });

    const stargazersIssue = issues.find((issue) =>
      issue.labels.some((label) => label.name === LABEL)
    );

    if (stargazersIssue) {
      return stargazersIssue.number;
    } else {
      const { data: issue } = await context.octokit.issues.create({
        repo: REPO,
        owner: OWNER,
        body: "This issue tracks the stargazers and the runaway stargazers of this repo",
        labels: [LABEL],
      });
      return issue.number;
    }
  }

  app.on(["star.created", "star.deleted"], async (context) => {
    issueNumber = await findOrCreateStargazersIssue(context);
    const OWNER = context.payload.repository.owner.login;
    const REPO = context.payload.repository.name;
    const USER = context.octokit.users.getByUsername({
      username: context.payload.sender.login,
    });

    const commentBody =
      context.name === "star.created"
        ? `Thank you so much for starring this repo, ${USER} :pray:, this means a lot!`
        : `${USER} just unstarred this repository :cry: :cry:`;

    await context.octokit.issues.createComment(
      context.issue({
        repo: REPO,
        owner: OWNER,
        body: commentBody,
        issue_number: issueNumber,
      })
    );
  });
};
