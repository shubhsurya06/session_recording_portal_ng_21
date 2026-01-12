import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { SessionService } from '../../core/services/sessions/session-service';
import { ICommonApiResponse } from '../../core/model/interfaces/common/common.model';
import { Session } from '../../core/model/classes/session.class';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertBox } from '../../shared/reusable-component/alert-box/alert-box';

@Component({
  selector: 'app-sessions',
  imports: [ReactiveFormsModule, NgClass, DatePipe, AlertBox],
  templateUrl: './sessions.html',
  styleUrl: './sessions.css',
})
export class Sessions implements OnInit {

  sessionService = inject(SessionService);

  // Form Group
  sessionForm!: FormGroup;

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

  constructor() { }

  ngOnInit(): void {
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

  getAllSessions(): void {
    this.sessionService.getAllSessions().subscribe({
      next: (response) => {
        console.log(response);
        this.sessions.set(response.data);
      },
      error: (error) => {
        console.error('Error fetching sessions:', error);
      }
    });
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

  editSession(session: Session) {
    // Populate form with session data
    this.sessionForm.patchValue({
      sessionId: session.sessionId,
      batchId: session.batchId,
      topicName: session.topicName,
      topicDescription: session.topicDescription,
      youtubeVideoId: session.youtubeVideoId,
      durationInMinutes: session.durationInMinutes,
      sessionDate: session.sessionDate,
      displayOrder: session.displayOrder
    });
    this.openModal();
  }

  deleteSession(session: Session) {
    // Implement delete logic here
    console.log('Delete session:', session);
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