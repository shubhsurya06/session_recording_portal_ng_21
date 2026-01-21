import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { SessionService } from '../../core/services/sessions/session-service';
import { ICommonApiResponse } from '../../core/model/interfaces/common/common.model';
import { Session } from '../../core/model/classes/session.class';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertBox } from '../../shared/reusable-component/alert-box/alert-box';
import { IBatch } from '../../core/model/interfaces/batch/batch-model';
import { BatchService } from '../../core/services/batch/batch-service';
import { GetLoader } from '../../shared/reusable-component/get-loader/get-loader';

const MESSAGE_TITLE = APP_CONSTANT.MESSAGE_TITLE;

@Component({
  selector: 'app-sessions',
  imports: [ReactiveFormsModule, NgClass, DatePipe, AlertBox, NgIf, GetLoader],
  templateUrl: './sessions.html',
  styleUrl: './sessions.css',
})
export class Sessions implements OnInit {

  sessionService = inject(SessionService);

  // Form Group
  sessionForm!: FormGroup;

  // signal to hold batchList
  batchList = signal<IBatch[]>([]);
  batchService = inject(BatchService);

  // View Modes (table or card)
  tableViewMode = APP_CONSTANT.VIEW_MODE.TABLE_VIEW;
  cardViewMode = APP_CONSTANT.VIEW_MODE.CARD_VIEW;

  // signal to hold sessions list
  sessions = signal<Session[]>([]);

  // current selected VIEW MODE (Table/Card)
  viewMode = signal<string>(this.tableViewMode); // Default to Table

  // whether Add/Edit modal is open or not
  isModalOpen = signal<boolean>(false);

  // Show alert when error comes
  isShowAlert = signal<boolean>(false);

  // loaders
  isSessionLoading = signal<boolean>(false);
  isAddEditSessionLoader = signal<boolean>(false);

  // --- Computed Pagination Logic ---
  itemsPerPage = signal<number>(APP_CONSTANT.PAGE_SIZE);
  // current page no
  currentPage = signal<number>(1);
  // pagination logic
  paginatedSessions = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.sessions().slice(0, start + this.itemsPerPage());
  });
  // total Pages based on total data received
  totalPages = computed(() => Math.ceil(this.sessions().length / this.itemsPerPage()));
  // NEW: Generate array of page numbers for the template loop
  pagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // Subscription array data
  subscriptionList: Subscription[] = [];

  // use child component to show alert error
  errorTitle = signal<string>('');
  errorMessage = signal<string>('');
  isError = signal<boolean>(false);

  constructor() {
    // Initialize the session form
    this.sessionForm = new FormBuilder().group({
      sessionId: [0],
      batchId: ['', [Validators.required]],
      topicName: ['', [Validators.required, Validators.maxLength(100)]],
      topicDescription: ['', [Validators.maxLength(500)]],
      youtubeVideoId: ['', [Validators.required, Validators.maxLength(50)]],
      durationInMinutes: ['', [Validators.required, Validators.min(1)]],
      sessionDate: ['', [Validators.required]],
      displayOrder: ['', [Validators.required, Validators.min(1)]],
    });
  }

  get f() {
    return this.sessionForm.controls;
  }


  ngOnInit(): void {
    this.getBatchList();
    this.getAllSessions();
  }

  ngOnDestroy(): void {
    this.subscriptionList.forEach(sub => {
      sub.unsubscribe();
    });
    this.subscriptionList = [];
  }

  /**
   * Close alert box on document click
   * @param event 
   */
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.isShowAlert()) {
      this.showAlertError(false);
    }
  }

  // call batch list api
  getBatchList() {
    let batchListSubscriber = this.batchService.getBatches().subscribe((batches: ICommonApiResponse) => {
      this.batchList.set(batches.data);
    });
    this.subscriptionList.push(batchListSubscriber);
  }

  getAllSessions(): void {
    this.isSessionLoading.set(true);
    let sessionsSubscriber = this.sessionService.getAllSessions().subscribe({
      next: (response) => {
        this.isSessionLoading.set(false);
        this.sessions.set(response.data);
      },
      error: (error) => {
        console.error('Error fetching sessions:', error);
      }
    });
    this.subscriptionList.push(sessionsSubscriber);
  }

  // --- Actions ---
  toggleView(mode: string) {
    this.viewMode.set(mode);
    this.currentPage.set(1); // Reset to page 1 on view switch
  }

  /**
   * Change to next page/any selected page
   * @param page 
   */
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.sessionForm.reset({ isActive: true }); // Reset form
  }

  // Handle success after Add/Edit api got success
  onAddEditSuccess(res: ICommonApiResponse) {
    this.isAddEditSessionLoader.set(false);

    if (this.sessionForm.value.sessionId && this.sessionForm.value.sessionId > 0) {
      this.errorTitle.set(MESSAGE_TITLE.SESSION.EDIT);
    } else {
      this.errorTitle.set(MESSAGE_TITLE.SESSION.ADD);
    }
    this.createAlertData(res);
    this.closeModal();
    this.getAllSessions();
  }

  // Handle error after Add/Edit api got failed
  onAddEditError(error: ICommonApiResponse) {
    if (this.sessionForm.value.sessionId && this.sessionForm.value.sessionId > 0) {
      this.errorTitle.set(MESSAGE_TITLE.SESSION.EDIT);
    } else {
      this.errorTitle.set(MESSAGE_TITLE.SESSION.ADD);
    }
    this.createAlertData(error);
    this.isAddEditSessionLoader.set(false);
  }

  // call edit session api
  callEditApi(sessionData: Session) {
    let editSessionSubscriber = this.sessionService.updateSession(sessionData.sessionId, sessionData).subscribe({
      next: (res: ICommonApiResponse) => {
        this.onAddEditSuccess(res);
      },
      error: (error: ICommonApiResponse) => {
        this.onAddEditError(error);
      }
    });
    this.subscriptionList.push(editSessionSubscriber);
  }

  // call add session api
  callAddApi(sessionData: Session) {
     let addSessionSubscriber = this.sessionService.createSession(sessionData).subscribe({
      next: (res: ICommonApiResponse) => {
        this.onAddEditSuccess(res);
      },
      error: (error: ICommonApiResponse) => {
        this.onAddEditError(error);
      }
    });
    this.subscriptionList.push(addSessionSubscriber);
  }

  // call method when click on Save/Edit button while adding/editing session
  onSubmit() {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }
    this.isAddEditSessionLoader.set(true);
    const sessionData: Session = this.sessionForm.value;

    if (!sessionData.sessionId) {
      sessionData.sessionId = 0;
    }
    sessionData.batchId = Number(sessionData.batchId);
    sessionData.sessionDate = new Date(sessionData.sessionDate).toISOString().substring(0, 10);
    sessionData.createdAt = new Date().toISOString().substring(0, 10);
    sessionData.updatedAt = new Date().toISOString().substring(0, 10);

    if (sessionData.sessionId && sessionData.sessionId > 0) {
      // Edit session
      console.log('Edit session:', sessionData);
      this.callEditApi(sessionData);
    } else {
      // Create new session
      console.log('Create session:', sessionData);
      this.callAddApi(sessionData);
    }
  }

  // edit session and populate form
  editSession(session: Session) {
    // Populate form with session data
    let batchId = this.batchList().find(b => b.batchName === session.batchName)?.batchId || null;

    this.sessionForm.patchValue({
      sessionId: session.sessionId,
      batchId: batchId,
      topicName: session.topicName,
      topicDescription: session.topicDescription,
      youtubeVideoId: session.youtubeVideoId,
      durationInMinutes: session.durationInMinutes,
      sessionDate: new Date(session.sessionDate).toISOString().substring(0, 10),
      displayOrder: session.displayOrder
    });
    this.openModal();
  }

  // delete session using id and show alert
  deleteSession(session: Session) {
    // Implement delete logic here
    console.log('Delete session:', session);
    let sessionId = session.sessionId;

    // Set loader
    session.isDeleteLoader = true;
    let deleteSessionSubscriber = this.sessionService.deleteSession(sessionId).subscribe({
      next: (res: ICommonApiResponse) => {
        session.isDeleteLoader = false;
        this.errorTitle.set(MESSAGE_TITLE.SESSION.DELETE);
        this.createAlertData(res);
        this.sessions.update(values => values.filter(s => s.sessionId !== sessionId));
      },
      error: (error: ICommonApiResponse) => {
        session.isDeleteLoader = false;
        this.errorTitle.set(MESSAGE_TITLE.SESSION.DELETE);
        this.createAlertData(error);
      }
    });
    this.subscriptionList.push(deleteSessionSubscriber);
  }

  /**
   * Show success/error alert message using re-usable component
   * @param data 
   */
  createAlertData(data: ICommonApiResponse) {
    this.errorMessage.set(data.message);
    this.isError.set(data.result);
    this.isShowAlert.set(true);
  }

  /**
   * Hide and Show SUCCESS/ERROR alert message
   * @param flag 
   */
  showAlertError(flag: any) {
    this.isShowAlert.set(flag);
  }

}