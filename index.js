/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log("Yay! The app was loaded!");

  async function findOrCreateStargazersIssue(context) {
    const OWNER = context.payload.repository.owner.login;
    const REPO = context.payload.repository.name;
    const LABEL = "stargazers";

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
        title: "Issue to track stargazers",
      });
      return issue.number;
    }
  }

  app.on(["star.created", "star.deleted"], async (context) => {
    const issueNumber = await findOrCreateStargazersIssue(context);

    const OWNER = context.payload.repository.owner.login;
    const REPO = context.payload.repository.name;
    const STARGAZERS = context.payload.repository.stargazers_count;
    const {
      data: { login: USER },
    } = await context.octokit.users.getByUsername({
      username: context.payload.sender.login,
    });

    const commentBody =
      context.name === "star" && context.payload.action === "created"
        ? `Thank you so much for starring this repo, @${USER} :pray:, this means a lot! \n\n ${REPO} has ${
            STARGAZERS > 1 ? `${STARGAZERS}s` : STARGAZERS
          } now`
        : `@${USER} just unstarred this repository :sob: :sob: \n\n ${REPO} has ${
            STARGAZERS > 1 ? `${STARGAZERS}s` : STARGAZERS
          } now`;

    return context.octokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      body: commentBody,
    });
  });
};
