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

    const totalStars = `${REPO} has ${
      STARGAZERS > 1 ? `${STARGAZERS} stars` : `${STARGAZERS} star`
    } now`;

    let responsesForWhenAStarIsAdded = [
      `Thank you so much for starring this repo, @${USER} :pray:, this means a lot! \n\n ${totalStars}`,
      `Wow! Thanks for the star, @${USER}! :star2: ${totalStars}`,
      `Thank you for showing your support by starring this repository, @${USER}! :raised_hands: ${totalStars}`,
      `We appreciate your interest in this repository, @${USER}! Thank you for the star! :star: ${totalStars}`,
      `Thanks for the star, @${USER}! It means a lot to us! :pray: ${totalStars}`,
      `You just made our day, @${USER}! Thanks for the star! :heart_eyes: ${totalStars}`,
    ];

    let responsesForWhenAStarIsRemoved = [
      `We're sad to see you go, @${USER}. Thanks for your support while you were here! :cry: \n\n ${totalStars}`,
      `Thanks for your interest in this repository, @${USER}. We hope you'll come back soon! :wave: \n\n ${totalStars}`,
      `Sorry to see you unstar the repository, @${USER}. We appreciate your support! :pray: \n\n ${totalStars}`,
      `Thanks for the time you spent with us, @${USER}. We hope to see you again soon! :smile: \n\n ${totalStars}`,
      `We'll miss you, @${USER}! Thanks for your support while you were here! :sob: \n\n ${totalStars}`,
      `@${USER} just unstarred this repository :sob: :sob: \n\n ${totalStars};`,
    ];

    const randomIsStarred = Math.floor(
      Math.random() * responsesForWhenAStarIsAdded.length
    );
    const randomIsStarRemoved = Math.floor(
      Math.random() * responsesForWhenAStarIsRemoved.length
    );

    const commentBody =
      context.name === "star" && context.payload.action === "created"
        ? randomIsStarred
        : randomIsStarRemoved;

    return context.octokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      body: commentBody,
    });
  });
};
