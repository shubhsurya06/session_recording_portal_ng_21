import { setAlertData, toggleAlert } from '../../shared/utils/alert-utils';
import { setDeleteLoader } from '../../shared/utils/loader-utils';
import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CandidateService } from '../../core/services/candidate/candidate-service';
import { C_Candidate } from '../../core/model/classes/candidate.class';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ICommonApiResponse } from '../../core/model/interfaces/common/common.model';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { AlertBox } from '../../shared/reusable-component/alert-box/alert-box';
import { NgClass } from '@angular/common';
import { GetLoader } from '../../shared/reusable-component/get-loader/get-loader';

const MESSAGE_TITLE = APP_CONSTANT.MESSAGE_TITLE;

@Component({
  selector: 'app-candidates',
  imports: [ReactiveFormsModule, AlertBox, NgClass, GetLoader],
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

  // add / candidate loader
  isAddEditCandidateLoader = signal<boolean>(false);

  // user roles allowed
  userRoles = APP_CONSTANT.USER_ROLES;

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
    this.candidateForm.patchValue({
      role: ''
    });
  }

  // Helper for Date Formatting in UI
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  /**
   * Perform below operations when candidate Add/EDIT success
   * @param candidate 
   */
  onAddEditSuccess(res: ICommonApiResponse) {
    let candidate = res.data;
    this.isAddEditCandidateLoader.set(false);

    if (this.candidateForm.value.candidateId) {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.EDIT);
      this.candidateList.update(values => values.map(user => user.candidateId === candidate.candidateId ? candidate : user));
    } else {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.ADD);
      this.candidateList.update(values => [candidate, ...values]);
    }

    this.createAlertData(res);

    this.closeModal();
  }

  /**
   * Handle error after Add/Edit api got failed
   * @param error 
   */
  onAddEditError(error: ICommonApiResponse) {
    if (this.candidateForm.value.candidateId) {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.EDIT);
    } else {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.ADD);
    }
    this.createAlertData(error);

    this.isAddEditCandidateLoader.set(false);
  }

  /**
   * Call update API and handle its success/error
   * @param newBatch 
   */
  editcandidateIdApi(candidate: C_Candidate) {
    let editApiSubscriber = this.candidateService.updateCandidate(candidate).subscribe({
      next: (updatedBatch: ICommonApiResponse) => {
        this.onAddEditSuccess(updatedBatch);
      },
      error: (error: any) => {
        this.onAddEditError(error.error);
      }
    });
    // this.subscriptionList.push(editApiSubscriber);
  }

  /**
   * call save candidate API and handle its success/error
   * @param candidate 
   */
  createNewCandidateApi(candidate: C_Candidate) {
    let addApiSubscriber = this.candidateService.addCandidate(candidate).subscribe({
      next: (res: ICommonApiResponse) => {
        this.onAddEditSuccess(res);
      },
      error: (error: any) => {

        this.onAddEditError(error.error);
      }
    });
  }
  
  /**
   * Save candidate (Add/Edit)
   */
  saveCandidate() {
    console.log('this is form details:', this.candidateForm.value);
    if (this.candidateForm.valid) {
      const candidate: C_Candidate = {
        ...this.candidateForm.value
      };
      if (!candidate.candidateId) {
        candidate.candidateId = 0;
        candidate.createdAt = new Date().toISOString().substring(0, 10);
        candidate.updatedAt = new Date().toISOString().substring(0, 10);
      }

      this.isAddEditCandidateLoader.set(true);

      // Update existing candidate
      if (candidate.candidateId && candidate.candidateId > 0) {
        this.editcandidateIdApi(candidate);
        return;
      }

      // add new candidate from below method
      this.createNewCandidateApi(candidate);
    } else {
      this.candidateForm.markAllAsTouched();
    }
  }

  /**
   * Edit candidate by populating form values
   * @param candidate 
   */
  editCandidate(candidate: C_Candidate) {
    // Implement edit logic here
    this.candidateForm.setValue({
      candidateId: candidate.candidateId,
      fullName: candidate.fullName,
      email: candidate.email,
      mobileNumber: candidate.mobileNumber,
      password: candidate.password,
      role: candidate.role,
      isActive: candidate.isActive,
      createdAt: new Date(candidate.createdAt).toISOString().substring(0, 10),
      updatedAt: new Date(candidate.updatedAt).toISOString().substring(0, 10),
    });
    this.openModal();
  }

  // delete candidate using id
  deleteCandidate(candidate: C_Candidate) {
    let candidateId = candidate.candidateId;
    setDeleteLoader(candidate, true);

    let deleteApiSubscriber = this.candidateService.deleteCandidate(candidateId).subscribe({
      next: (res: ICommonApiResponse) => {
        setDeleteLoader(candidate, false);
        this.errorTitle.set(MESSAGE_TITLE.CANDIDATE.DELETE);
        this.createAlertData(res);

        this.candidateList.update(values => values.filter(candidate => candidate.candidateId !== candidateId));
      },
      error: (error: any) => {
        setDeleteLoader(candidate, false);
        this.errorTitle.set(MESSAGE_TITLE.CANDIDATE.DELETE);
        this.createAlertData(error.error);
      }
    });

    // this.subscriptionList.push(deleteApiSubscriber);
  }

  // Show success/error alert message using utility
  createAlertData(data: ICommonApiResponse) {
    setAlertData(this.errorMessage, this.isError, this.isShowAlert, data);
  }

  // Hide and Show SUCCESS/ERROR alert message using utility
  showAlertError(flag: any) {
    toggleAlert(this.isShowAlert, flag);
  }

}
