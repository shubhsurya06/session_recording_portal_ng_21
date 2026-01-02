import { Component, inject, signal, OnInit, computed, OnDestroy } from '@angular/core';
import { BatchService } from '../../services/batch/batch-service';
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
  // batches = signal<IBatch[]>(
  //   Array.from({ length: 50 }, (_, i) => ({
  //     batchId: i + 1,
  //     batchName: `Full Stack Angular Batch ${i + 1}`,
  //     description: 'Comprehensive guide to modern web development.',
  //     startDate: new Date(2026, 0, 1).toISOString(),
  //     endDate: new Date(2026, 3, 1).toISOString(),
  //     isActive: i % 3 !== 0, // Randomly set some inactive
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString()
  //   }))
  // );

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

  subscriptionList: Subscription = new Subscription();

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

  }

  // get batches list
  getBatches() {
    this.getBatchLoader.set(true);
    this.batchServie.getBatches().subscribe((batches: ICommonApiResponse) => {
      this.getBatchLoader.set(false);
      this.batches.set(batches.data);
      console.log('Batches fetched:', this.batches());
    });
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
    this.closeModal();

    if (this.batchForm.value.batchId) {
      this.batches.update(values => values.map(batch => batch.batchId === resBatch.batchId ? resBatch : batch));
    } else {
      this.batches.update(values => [resBatch, ...values]);
    }
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

      if (newBatch.batchId && newBatch.batchId > 0) {
        // Update existing batch
        this.batchServie.updateBatch(newBatch).subscribe((updatedBatch: ICommonApiResponse) => {
          this.onAddEditBatchSuccess(updatedBatch);
        });
        return;
      }

      // Update signal immutably
      this.batchServie.addBatch(newBatch).subscribe((createdBatch: ICommonApiResponse) => {
        this.onAddEditBatchSuccess(createdBatch);
      });
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
    console.log('Editing batch:', this.batchForm.value);
    this.openModal();
  }

  // delete batch using id
  deleteBatch(batchId: number) {
    // Implement delete logic here
    this.batchServie.deleteBatch(batchId).subscribe(() => {
      this.batches.update(values => values.filter(batch => batch.batchId !== batchId));
    });
  }

}
