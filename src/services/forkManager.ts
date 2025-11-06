import { githubApi, type ForkResult, type Fork } from './githubApi';

export class ForkManager {
  async forkRepository(owner: string, repo: string): Promise<ForkResult> {
    return await githubApi.forkRepository(owner, repo);
  }

  async getForkStatus(forkId: string): Promise<Fork | null> {
    return await githubApi.getForkStatus(forkId);
  }

  getUserForks(): Fork[] {
    return githubApi.getUserForks();
  }

  async deleteFork(forkId: string): Promise<void> {
    return await githubApi.deleteFork(forkId);
  }

  isForkExists(originalRepo: string): boolean {
    const forks = this.getUserForks();
    return forks.some(fork => fork.originalRepo === originalRepo);
  }

  getForkByOriginalRepo(originalRepo: string): Fork | null {
    const forks = this.getUserForks();
    return forks.find(fork => fork.originalRepo === originalRepo) || null;
  }
}

export const forkManager = new ForkManager();