import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CandidateService } from '../../core/services/candidate/candidate-service';
import { C_Candidate } from '../../core/model/classes/candidate.class';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ICommonApiResponse } from '../../core/model/interfaces/common/common.model';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { AlertBox } from '../../shared/reusable-component/alert-box/alert-box';

const MESSAGE_TITLE = APP_CONSTANT.MESSAGE_TITLE;

@Component({
  selector: 'app-candidates',
  imports: [ReactiveFormsModule, AlertBox],
  templateUrl: './candidates.html',
  styleUrl: './candidates.css',
})
export class Candidates {

  // imported Candidate Service and created instance
  candidateService = inject(CandidateService);

  // Store Candidate data in signal
  candidateList = signal<C_Candidate[]>([]);

  // get candidate loader
  isCandidateLoading = signal<boolean>(false);

  // View Modes (table or card)
  tableViewMode = APP_CONSTANT.VIEW_MODE.TABLE_VIEW;
  cardViewMode = APP_CONSTANT.VIEW_MODE.CARD_VIEW;

  // current selected VIEW MODE (Table/Card)
  viewMode = signal<string>(this.tableViewMode); // Default to Table

  candidateForm!: FormGroup;

  // whether Add/Edit modal is open or not
  isModalOpen = signal<boolean>(false);

  // --- Computed Pagination Logic ---
  itemsPerPage = signal<number>(APP_CONSTANT.PAGE_SIZE);
  // current page no
  currentPage = signal<number>(1);
  // pagination logic
  paginatedCandidates = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.candidateList().slice(0, start + this.itemsPerPage());
  });
  // total Pages based on total data received
  totalPages = computed(() => Math.ceil(this.candidateList().length / this.itemsPerPage()));
  // NEW: Generate array of page numbers for the template loop
  pagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // use child component to show alert error
  errorTitle = signal<string>('');
  errorMessage = signal<string>('');
  isError = signal<boolean>(false);

  // Show alert when error comes
  isShowAlert = signal<boolean>(false);

  constructor() {
    this.initializeForm()
  }

  initializeForm() {
    this.candidateForm = new FormGroup({
      candidateId: new FormControl(0),
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      mobileNumber: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('', [Validators.required]),
      isActive: new FormControl(false),
      createdAt: new FormControl(''),
      updatedAt: new FormControl('')
    })
  }

  ngOnInit() {
    this.getAllCandidates();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.isShowAlert()) {
      this.showAlertError(false);
    }
  }

  getAllCandidates() {
    this.isCandidateLoading.set(true);
    this.candidateService.getAllCandidates().subscribe({
      next: (res: ICommonApiResponse) => {
        this.isCandidateLoading.set(false);
        this.candidateList.set(res.data);
      },
      error: (error: ICommonApiResponse) => {
        alert(error.message);
      }
    })
  }

  // --- Actions ---
  toggleView(mode: string) {
    this.viewMode.set(mode);
    // this.currentPage.set(1); // Reset to page 1 on view switch
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
    this.candidateForm.reset({ isActive: true }); // Reset form
  }

  // Helper for Date Formatting in UI
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  editCandidate(candidate: C_Candidate) {

  }

  // delete batch using id
  deleteCandidate(candidate: C_Candidate) {
    let candidateId = candidate.candidateId;
    candidate.isDeleteLoader = true;

    let deleteApiSubscriber = this.candidateService.deleteCandidate(candidateId).subscribe({
      next: (res: ICommonApiResponse) => {
        candidate.isDeleteLoader = false;
        this.errorTitle.set(MESSAGE_TITLE.CANDIDATE.DELETE);
        this.createAlertData(res);

        this.candidateList.update(values => values.filter(candidate => candidate.candidateId !== candidateId));
      },
      error: (error: any) => {
        candidate.isDeleteLoader = false;
        this.errorTitle.set(MESSAGE_TITLE.CANDIDATE.DELETE);
        this.createAlertData(error.error);
      }
    })

    // this.subscriptionList.push(deleteApiSubscriber);
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
