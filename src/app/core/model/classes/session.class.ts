export class Session {
    sessionId: number;
    batchId: number;
    batchName?: string;
    topicName: string;
    topicDescription: string;
    youtubeVideoId: string;
    durationInMinutes: number;
    sessionDate: string;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    isDeleteLoader?: boolean;

    constructor() {
        this.sessionId = 0;
        this.batchId = 0;
        this.topicName = '';
        this.topicDescription = '';
        this.youtubeVideoId = '';
        this.durationInMinutes = 0;
        this.sessionDate = new Date().toISOString().substring(0, 10);
        this.displayOrder = 0;
        this.createdAt = new Date().toISOString().substring(0, 10);
        this.updatedAt = new Date().toISOString().substring(0, 10);
        this.batchName = '';
        this.isDeleteLoader = false;
    }
}
