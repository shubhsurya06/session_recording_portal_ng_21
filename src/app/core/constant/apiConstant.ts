export const API_CONSTANT = {
    CONTROLLER_TYPES: {
        BATCH_DASHBOARD: 'BatchDashboard',
        BATCH_ENROLLMENTS: 'BatchEnrollments',
        BATCHES: 'Batches',
        BATCH_SESSIONS: 'BatchSessions',
        BATCH_USER: 'BatchUser',
        CANDIDATES: 'Candidates'
    },
    BATCH_ENROLLMENTS_API: {
        GET_ENROLLMENTS: '/GetAllEnrollment',
        BY_CANDIDATE_ID: '/by-candidate'
    },
    SESSION_APIS: {
        GET_SESSIONS: '/GetAllSessionsRecordings',
        BY_BATCH_ID: '/by-batch'
    },
    BATCH_USER_APIS: {
        LOGIN: '/login',
    },
}