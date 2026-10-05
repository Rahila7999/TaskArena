import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

// Safe environment variable access - these are required for GitHub auth
// They should be set in .env.local; TypeScript will narrow them after the check
const githubId = process.env.GITHUB_ID
const githubSecret = process.env.GITHUB_SECRET

if (!githubId || !githubSecret) {
  throw new Error(
    'Please add GITHUB_ID and GITHUB_SECRET to .env.local',
  )
}

export default NextAuth({
  providers: [
    GithubProvider({
      // Type-safe: we've verified they exist above
      clientId: githubId as string,
      clientSecret: githubSecret as string,
    }),
  ],
})