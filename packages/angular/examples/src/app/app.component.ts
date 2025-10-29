import { Component } from '@angular/core'
import { I18nService } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  userName = 'Angular'
  itemCount = 5
  today = new Date()
  price = 1234567.89

  constructor(public i18n: I18nService) { }

  incrementCount(): void {
    this.itemCount++
  }

  decrementCount(): void {
    this.itemCount = Math.max(0, this.itemCount - 1)
  }
}

