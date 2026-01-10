export class EnrollmentClass {
    enrollmentId: number;
    fullName: string;
    mobileNumber: string;
    batchId?: number;
    candidateId?: number;
    batchName: string;
    enrollmentDate: string;
    isActive: boolean;
    isDeleteLoader?: boolean;

    constructor() {
        this.enrollmentId = 0;
        this.fullName = '';
        this.mobileNumber = '';
        this.batchName = '';
        this.enrollmentDate = '';
        this.isActive = true;
    }
}