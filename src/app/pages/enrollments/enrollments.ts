import { Component, inject, signal, OnInit, computed, OnDestroy, ViewChild, ElementRef, HostListener, Host } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { ICommonApiResponse } from '../../core/model/interfaces/common/common.model';
import { Subscription } from 'rxjs';
import { AlertBox } from '../../shared/reusable-component/alert-box/alert-box';
import { EnrollmentClass } from '../../core/model/classes/enrollments.class';
import { EnrollmentsService } from '../../core/services/enrollments/enrollments-service';
import { IBatch } from '../../core/model/interfaces/batch/batch-model';
import { C_Candidate } from '../../core/model/classes/candidate.class';
import { BatchService } from '../../core/services/batch/batch-service';
import { CandidateService } from '../../core/services/candidate/candidate-service';
import { GetLoader } from '../../shared/reusable-component/get-loader/get-loader';

const MESSAGE_TITLE = APP_CONSTANT.MESSAGE_TITLE;

@Component({
  selector: 'app-enrollments',
  imports: [ReactiveFormsModule, NgClass, AlertBox, NgIf, NgFor, DatePipe, GetLoader],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.css',
})
export class Enrollments implements OnInit, OnDestroy {
  // Form Group
  enrollmentForm!: FormGroup;

  today = new Date().toISOString().substring(0, 10);

  // inject BatchService
  enrollmentService = inject(EnrollmentsService);

  // View Modes (table or card)
  tableViewMode = APP_CONSTANT.VIEW_MODE.TABLE_VIEW;
  cardViewMode = APP_CONSTANT.VIEW_MODE.CARD_VIEW;

  // signal to hold enrollmentList list
  enrollmentList = signal<EnrollmentClass[]>([]);

  // signal to hold batchList
  batchList = signal<IBatch[]>([]);
  batchService = inject(BatchService);

  // signal to hold candidateList
  candidateList = signal<C_Candidate[]>([]);
  candidateService = inject(CandidateService);

  // current selected VIEW MODE (Table/Card)
  viewMode = signal<string>(this.tableViewMode); // Default to Table

  // whether Add/Edit modal is open or not
  isModalOpen = signal<boolean>(false);

  // Show alert when error comes
  isShowAlert = signal<boolean>(false);

  // loaders
  getEnrollmentLoader = signal<boolean>(false);
  isAddEditEnrollLoader = signal<boolean>(false);

  // --- Computed Pagination Logic ---
  itemsPerPage = signal<number>(APP_CONSTANT.PAGE_SIZE);
  // current page no
  currentPage = signal<number>(1);
  // pagination logic
  paginatedEnrollments = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.enrollmentList().slice(0, start + this.itemsPerPage());
  });
  // total Pages based on total data received
  totalPages = computed(() => Math.ceil(this.enrollmentList().length / this.itemsPerPage()));
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
    // Initialize enrollment form
    this.enrollmentForm = new FormBuilder().group({
      enrollmentId: [0],
      batchId: ["", Validators.required],
      candidateId: ["", Validators.required],
      enrollmentDate: ['', Validators.required],
      isActive: [false],
    });
  }

  ngOnInit(): void {
    // Load initial data if needed
    this.getAllEnrollments();
    this.getBatchList();
    this.getCandidateList();
  }

  ngOnDestroy(): void {
    this.subscriptionList.forEach(sub => {
      sub.unsubscribe();
    })
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) { 
    if (this.isShowAlert()) {
      this.isShowAlert.set(false);
    } 
  }

  // call batch list api
  getBatchList() {
    let getApiSubscriber = this.batchService.getBatches().subscribe((batches: ICommonApiResponse) => {
      this.batchList.set(batches.data);
    });
    this.subscriptionList.push(getApiSubscriber);
  }

  // call candidate list api
  getCandidateList() {
    let getApiSubscriber = this.candidateService.getAllCandidates().subscribe((candidates: ICommonApiResponse) => {
      this.candidateList.set(candidates.data);
    });
    this.subscriptionList.push(getApiSubscriber);
  }

  // call enrollment list api
  getAllEnrollments() {
    this.getEnrollmentLoader.set(true);
    let getApiSubscriber = this.enrollmentService.getAllEnrollment().subscribe((enrollments: ICommonApiResponse) => {
      this.getEnrollmentLoader.set(false);
      this.enrollmentList.set(enrollments.data);
    });
    this.subscriptionList.push(getApiSubscriber);
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

  //  Open/Close Modal
  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.enrollmentForm.reset(); // Reset form
    this.enrollmentForm.patchValue({
      batchId: '',
      candidateId: ''
    });
  }

  // Helper for Date Formatting in UI
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  /**
   * Perform below operations when batch Add/EDIT success
   * @param batch 
   */
  onAddEditSuccess(res: ICommonApiResponse) {
    let resEnroll = res.data;
    this.isAddEditEnrollLoader.set(false);

    if (this.enrollmentForm.value.enrollmentId) {
      this.errorTitle.set(MESSAGE_TITLE.ENROLLMENT.EDIT);
      // this.enrollmentList.update(values => values.map(batch => batch.enrollmentId === resEnroll.enrollmentId ? resEnroll : batch));
    } else {
      this.errorTitle.set(MESSAGE_TITLE.ENROLLMENT.ADD);
      // this.enrollmentList.update(values => [resEnroll, ...values]);
    }
    this.getAllEnrollments();

    this.createAlertData(res);

    this.closeModal();
  }

  /**
   * Handle error after Add/Edit api got failed
   * @param error 
   */
  onAddEditError(error: ICommonApiResponse) {
    if (this.enrollmentForm.value.enrollmentId) {
      this.errorTitle.set(MESSAGE_TITLE.ENROLLMENT.EDIT);
    } else {
      this.errorTitle.set(MESSAGE_TITLE.ENROLLMENT.ADD);
    }
    this.createAlertData(error);

    this.isAddEditEnrollLoader.set(false);
  }

  // call edit enrollment api and handle its success/error
  editEnrollmentApi(newEnrollment: EnrollmentClass) {
    let editApiSubscriber = this.enrollmentService.updateEnrollment(newEnrollment).subscribe({
      next: (updatedEnrollment: ICommonApiResponse) => {
        this.onAddEditSuccess(updatedEnrollment);
      },
      error: (error: any) => {
        this.onAddEditError(error.error);
      }
    });
    this.subscriptionList.push(editApiSubscriber);
  }

  // call add enrollment api and handle its success/error
  createNewEnrollment(newEnrollment: EnrollmentClass) {
    let addApiSubscriber = this.enrollmentService.addEnrollment(newEnrollment).subscribe({
      next: (createdEnrollment: ICommonApiResponse) => {
        this.onAddEditSuccess(createdEnrollment);
      },
      error: (error: any) => {
        this.onAddEditError(error.error);
      }
    });
    this.subscriptionList.push(addApiSubscriber);
  }

  // Save enrollment (Add/Edit) when click on Save/Edit button
  saveEnrollment() {
    if (this.enrollmentForm.valid) {
      const newEnrollment: EnrollmentClass = {
        ...this.enrollmentForm.value
      };
      if (!newEnrollment.enrollmentId) {
        newEnrollment.enrollmentId = 0;
      }
      newEnrollment.batchId = Number(newEnrollment.batchId);
      newEnrollment.candidateId = Number(newEnrollment.candidateId);

      this.isAddEditEnrollLoader.set(true);
      // For now, just log the enrollment data
      console.log('Saving Enrollment:', newEnrollment);
      // Update existing enrollment
      if (newEnrollment.enrollmentId && newEnrollment.enrollmentId > 0) {
        this.editEnrollmentApi(newEnrollment);
        return;
      }

      // add new enrollment from below method
      this.createNewEnrollment(newEnrollment);
    } else {
      this.enrollmentForm.markAllAsTouched();
    }
  }

  // Edit enrollment - populate form and open modal
  editEnrollment(enrollment: EnrollmentClass) {
    let batchId = this.batchList().find(b => b.batchName === enrollment.batchName)?.batchId || null;
    let candidateId = this.candidateList().find(c => c.fullName === enrollment.fullName)?.candidateId || null;

    this.enrollmentForm.patchValue({
      enrollmentId: enrollment.enrollmentId,
      batchId: batchId,
      candidateId: candidateId,
      enrollmentDate: new Date(enrollment.enrollmentDate).toISOString().substring(0, 10),
      isActive: enrollment.isActive
    });
    this.openModal();
  }

  // Delete enrollment
  deleteEnrollment(enrollment: EnrollmentClass) {
    enrollment.isDeleteLoader = true;
    let deleteApiSubscriber = this.enrollmentService.deleteEnrollment(enrollment.enrollmentId).subscribe({
      next: (deletedEnrollment: ICommonApiResponse) => {
        enrollment.isDeleteLoader = false;
        this.enrollmentList.update(values => values.filter(e => e.enrollmentId !== enrollment.enrollmentId));
        this.errorTitle.set(MESSAGE_TITLE.ENROLLMENT.DELETE);
        this.createAlertData(deletedEnrollment);
      },
      error: (error: any) => {
        enrollment.isDeleteLoader = false;
        this.errorTitle.set(MESSAGE_TITLE.ENROLLMENT.DELETE);
        this.createAlertData(error.error);
      }
    });
    this.subscriptionList.push(deleteApiSubscriber);
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
