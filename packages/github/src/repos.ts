import { getGithubApp } from "./app";

export interface InstallationRepo {
  githubRepoId: number;
  owner: string;
  name: string;
  defaultBranch: string;
  private: boolean;
}

/**
 * Lists every repository the given installation can access. Auth is handled
 * internally by the returned installation-scoped Octokit instance — no token
 * ever passes through caller code.
 */
export async function listInstallationRepositories(
  installationId: number,
): Promise<InstallationRepo[]> {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const repos = await octokit.paginate("GET /installation/repositories");
  return repos.map((repo) => ({
    githubRepoId: repo.id,
    owner: repo.owner.login,
    name: repo.name,
    defaultBranch: repo.default_branch,
    private: repo.private,
  }));
}
