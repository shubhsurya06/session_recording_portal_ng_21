export interface IBatch {
    batchId: number;
    batchName: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    isDeleteLoader?: boolean;
}