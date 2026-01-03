import { Component, inject, signal, OnInit, computed, OnDestroy } from '@angular/core';
import { BatchService } from '../../core/services/batch/batch-service';
import { IBatch } from '../../core/model/batch/batch-model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { ICommonApiResponse } from '../../core/model/common/common.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-batch-master',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './batch-master.html',
  styleUrl: './batch-master.css',
})
export class BatchMaster implements OnInit, OnDestroy {
  // Form Group
  batchForm: FormGroup;

  // View Modes (table or card)
  tableViewMode = APP_CONSTANT.VIEW_MODE[0];
  cardViewMode = APP_CONSTANT.VIEW_MODE[1];

  // inject BatchService
  batchServie = inject(BatchService);

  // signal to hold batches list
  batches = signal<IBatch[]>([]);

  // --- Signals for State Management ---
  viewMode = signal<string>(this.tableViewMode); // Default to Table
  isModalOpen = signal<boolean>(false);
  currentPage = signal<number>(1);
  getBatchLoader = signal<boolean>(false);
  isAddEditBatchLoader = signal<boolean>(false);

  // --- Computed Pagination Logic ---
  itemsPerPage = signal<number>(APP_CONSTANT.PAGE_SIZE);

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

  subscriptionList: Subscription[] = [];

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
      this.batches.update(values => values.map(batch => batch.batchId === resBatch.batchId ? resBatch : batch));
    } else {
      this.batches.update(values => [resBatch, ...values]);
    }

    this.closeModal();
  }

  /**
   * Handle error after Add/Edit api got failed
   * @param error 
   */
  onAddEditBatchError(error: ICommonApiResponse) {
    this.isAddEditBatchLoader.set(false);
    alert(error.message);
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
  deleteBatch(batchId: number) {
    // Implement delete logic here
    let deleteApiSubscriber = this.batchServie.deleteBatch(batchId).subscribe({
      next: (res) => {
        this.batches.update(values => values.filter(batch => batch.batchId !== batchId));
      },
      error: (error) => {
        alert(error.error.message);
      }
    })

    this.subscriptionList.push(deleteApiSubscriber);
  }

}
