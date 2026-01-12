export class Session {
    sessionId: number;
    batchId: number;
    batchName?: string;
    topicName: string;
    topicDescription: string;
    youtubeVideoId: string;
    durationInMinutes: number;
    sessionDate: Date;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    isDeleteLoader?: boolean;

    constructor() {
        this.sessionId = 0;
        this.batchId = 0;
        this.topicName = '';
        this.topicDescription = '';
        this.youtubeVideoId = '';
        this.durationInMinutes = 0;
        this.sessionDate = new Date();
        this.displayOrder = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.batchName = '';
        this.isDeleteLoader = false;
    }
}
