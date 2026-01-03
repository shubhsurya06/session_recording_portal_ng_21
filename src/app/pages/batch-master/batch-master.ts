import { Component, inject, signal, OnInit, computed, OnDestroy, ViewChild, ElementRef, HostListener, Host } from '@angular/core';
import { BatchService } from '../../core/services/batch/batch-service';
import { IBatch } from '../../core/model/batch/batch-model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { ICommonApiResponse } from '../../core/model/common/common.model';
import { Subscription } from 'rxjs';
import { AlertBox } from '../../shared/reusable-component/alert-box/alert-box';

const MESSAGE_TITLE = APP_CONSTANT.MESSAGE_TITLE;

@Component({
  selector: 'app-batch-master',
  imports: [ReactiveFormsModule, NgClass, AlertBox],
  templateUrl: './batch-master.html',
  styleUrl: './batch-master.css',
})
export class BatchMaster implements OnInit, OnDestroy {
  // Form Group
  batchForm: FormGroup;

  // inject BatchService
  batchServie = inject(BatchService);

  // View Modes (table or card)
  tableViewMode = APP_CONSTANT.VIEW_MODE[0];
  cardViewMode = APP_CONSTANT.VIEW_MODE[1];

  // signal to hold batches list
  batches = signal<IBatch[]>([]);

  // current selected VIEW MODE (Table/Card)
  viewMode = signal<string>(this.tableViewMode); // Default to Table

  // whether Add/Edit modal is open or not
  isModalOpen = signal<boolean>(false);

  // Show alert when error comes
  isShowAlert = signal<boolean>(false);

  // loaders
  getBatchLoader = signal<boolean>(false);
  isAddEditBatchLoader = signal<boolean>(false);

  // --- Computed Pagination Logic ---
  itemsPerPage = signal<number>(APP_CONSTANT.PAGE_SIZE);
  // current page no
  currentPage = signal<number>(1);
  // pagination logic
  paginatedBatches = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.batches().slice(0, start + this.itemsPerPage());
  });
  // total Pages based on total data received
  totalPages = computed(() => Math.ceil(this.batches().length / this.itemsPerPage()));
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

  constructor(private fb: FormBuilder) {
    this.batchForm = this.fb.group({
      batchId: [0],
      batchName: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      isActive: [true] // Default true
    });
  }

  ngOnInit(): void {
    this.getBatches();
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

  // get batches list
  getBatches() {
    this.getBatchLoader.set(true);
    let getApiSubscriber = this.batchServie.getBatches().subscribe((batches: ICommonApiResponse) => {
      this.getBatchLoader.set(false);
      this.batches.set(batches.data);
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

  /**
   * Perform below operations when batch Add/EDIT success
   * @param batch 
   */
  onAddEditBatchSuccess(batch: ICommonApiResponse) {
    let resBatch = batch.data;
    this.isAddEditBatchLoader.set(false);

    if (this.batchForm.value.batchId) {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.EDIT);
      this.batches.update(values => values.map(batch => batch.batchId === resBatch.batchId ? resBatch : batch));
    } else {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.ADD);
      this.batches.update(values => [resBatch, ...values]);
    }

    this.createAlertData(batch);

    this.closeModal();
  }

  /**
   * Handle error after Add/Edit api got failed
   * @param error 
   */
  onAddEditBatchError(error: ICommonApiResponse) {
    if (this.batchForm.value.batchId) {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.EDIT);
    } else {
      this.errorTitle.set(MESSAGE_TITLE.BATCH.ADD);
    }
    this.createAlertData(error);

    this.isAddEditBatchLoader.set(false);
  }

  /**
   * Call update API and handle its success/error
   * @param newBatch 
   */
  editBatchApi(newBatch: IBatch) {
    let editApiSubscriber = this.batchServie.updateBatch(newBatch).subscribe({
      next: (updatedBatch: ICommonApiResponse) => {
        this.onAddEditBatchSuccess(updatedBatch);
      },
      error: (error: any) => {
        this.onAddEditBatchError(error.error);
      }
    });
    this.subscriptionList.push(editApiSubscriber);
  }

  /**
   * call save batch API and handle its success/error
   * @param newBatch 
   */
  createNewBatchApi(newBatch: IBatch) {
    let addApiSubscriber = this.batchServie.addBatch(newBatch).subscribe({
      next: (createdBatch: ICommonApiResponse) => {
        this.onAddEditBatchSuccess(createdBatch);
      },
      error: (error: any) => {
        this.onAddEditBatchError(error.error);
      }
    });
    this.subscriptionList.push(addApiSubscriber);
  }

  /**
   * Use below method to SAVE/EDIT batch
   * @returns 
   */
  saveBatch() {
    if (this.batchForm.valid) {
      const newBatch: IBatch = {
        ...this.batchForm.value
      };
      if (!newBatch.batchId) {
        newBatch.batchId = 0;
      }

      this.isAddEditBatchLoader.set(true);

      // Update existing batch
      if (newBatch.batchId && newBatch.batchId > 0) {
        this.editBatchApi(newBatch);
        return;
      }

      // add new batch from below method
      this.createNewBatchApi(newBatch);
    } else {
      this.batchForm.markAllAsTouched();
    }
  }

  // Helper for Date Formatting in UI
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.batchForm.reset({ isActive: true }); // Reset form
  }

  /**
   * Set form data when click on edit
   * @param batch 
   */
  editBatch(batch: IBatch) {
    // Implement edit logic here
    this.batchForm.setValue({
      batchId: batch.batchId,
      batchName: batch.batchName,
      description: batch.description,
      startDate: new Date(batch.startDate).toISOString().substring(0, 10),
      endDate: new Date(batch.endDate).toISOString().substring(0, 10),
      isActive: batch.isActive
    });
    this.openModal();
  }

  // delete batch using id
  deleteBatch(batch: IBatch) {
    let batchId = batch.batchId;
    batch.isDeleteLoader = true;

    let deleteApiSubscriber = this.batchServie.deleteBatch(2343242).subscribe({
      next: (res: ICommonApiResponse) => {
        batch.isDeleteLoader = false;
        this.errorTitle.set(MESSAGE_TITLE.BATCH.DELETE);
        this.createAlertData(res);

        this.batches.update(values => values.filter(batch => batch.batchId !== batchId));
      },
      error: (error: any) => {
        batch.isDeleteLoader = false;
        this.errorTitle.set(MESSAGE_TITLE.BATCH.DELETE);
        this.createAlertData(error.error);
      }
    })

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
