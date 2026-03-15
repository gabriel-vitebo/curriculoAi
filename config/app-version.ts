import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import packageJson from '../package.json'

type PackageJsonWithOptionalVersion = typeof packageJson & {
  version?: string
}

function getGitValue(command: string) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  }
  catch {
    return ''
  }
}

function getLatestReleaseVersion() {
  const releaseCommit = getGitValue("git log --grep='^chore(release):' --format='%s' -n 1")
  const releaseMatch = releaseCommit.match(/chore\(release\):\s*([0-9]+\.[0-9]+\.[0-9]+)/)

  if (releaseMatch) {
    return `v${releaseMatch[1]}`
  }

  try {
    const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
    const changelogMatch = changelog.match(/^## \[?([0-9]+\.[0-9]+\.[0-9]+)\]?/m)

    if (changelogMatch) {
      return `v${changelogMatch[1]}`
    }
  }
  catch {
    return ''
  }

  return ''
}

const latestTag = getGitValue('git describe --tags --abbrev=0')
const latestReleaseVersion = getLatestReleaseVersion()
const shortCommit = getGitValue('git rev-parse --short HEAD')
const packageVersion = (packageJson as PackageJsonWithOptionalVersion).version

export const appVersion = process.env.APP_VERSION
  || packageVersion
  || latestTag
  || latestReleaseVersion
  || (shortCommit ? `dev-${shortCommit}` : 'dev')
