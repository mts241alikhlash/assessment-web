import type { SchoolIdentity } from './profile-display'

/**
 * How an app supplies the half of a profile this service does not own.
 *
 * identity-service holds the person; employment is hr-service's, teaching is
 * academic-service's, enrolment is student-service's. identity-service must
 * not call any of them: every service already depends on it for auth, so a
 * call back down would make signing in depend on hr being up.
 *
 * The app composes instead: it already holds the caller's token and knows
 * which services it routes to. An app that routes to none simply supplies no
 * provider, and the section does not render.
 */
export type SchoolIdentityProvider = (context: {
  userId: string
  isOwnProfile: boolean
  roles: string[]
}) => Promise<SchoolIdentity | null>
