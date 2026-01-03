import { Component, Input, signal, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert-box',
  imports: [NgClass],
  templateUrl: './alert-box.html',
  styleUrl: './alert-box.css',
})
export class AlertBox {

  @Input()
  title: string = '';

  @Input()
  message: string = '';

  @Input()
  isSuccess: boolean = false;

  @Output()
  sendEventEmitter: EventEmitter<boolean> = new EventEmitter();

  // hide alert box
  hideAlert(flag: boolean) {
    this.sendEventEmitter.emit(flag);
  }
}
