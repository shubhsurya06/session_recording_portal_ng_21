import { Component, Input, signal, Output, EventEmitter, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert-box',
  imports: [NgClass],
  templateUrl: './alert-box.html',
  styleUrl: './alert-box.css',
})
export class AlertBox {

  // ✅ Input signals
  title = input<string>();
  message = input<string>();
  isSuccess = input<boolean>();

  // ✅ Output signal
  sendEventEmitter = output<boolean>();

  // hide alert box
  hideAlert(flag: boolean) {
    this.sendEventEmitter.emit(flag);
  }
}
