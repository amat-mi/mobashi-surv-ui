import { translate } from '@ngneat/transloco';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private durationSuccess: number = 5000;
  private durationWarning: number = 5000;
  private durationError: number = 5000;
  private translateSuccess: string | undefined;
  private translateWarning: string | undefined;
  private translateError: string | undefined;

  constructor(
    private toastController: ToastController,
    private router: Router
  ) { }

  public setDefaultDurationSuccess(duration: number) {
    this.durationSuccess = duration;
  }

  public setDefaultDurationWarning(duration: number) {
    this.durationWarning = duration;
  }

  public setDefaultDurationError(duration: number) {
    this.durationError = duration;
  }

  public setTranslateSuccess(value: string) {
    this.translateSuccess = value;
  }

  public setTranslateWarning(value: string) {
    this.translateWarning = value;
  }

  public setTranslateError(value: string) {
    this.translateError = value;
  }

  async present(message: string, options: { [key: string]: any }) {
    options = Object.assign({
      message: message,
      duration: 5000,
      buttons: [
        {
          side: 'start',
          icon: 'close',
        }
      ]
    }, options || {});

    if (options['link']) {
      const link = options['link'];
      const buttons = options['buttons'] || [];
      const button = {
        side: link.side || 'end',
        handler: () => {
          this.router.navigateByUrl(link.url);
        }
      } as { [key: string]: any };

      if (link.icon)
        button['icon'] = link.icon;

      if (link.text)
        button['text'] = link.text;

      if (!link.icon && !link.text)        //if no icon, nor text set
        button['icon'] = 'link';                 //show a default icon

      buttons.unshift(button);              //insert the link button as first button
      options['buttons'] = buttons;
    }

    const toast = await this.toastController.create(options);

    return toast.present();
  }

  async presentWithColor(message: string, color: string, options: Object = {}) {
    options = Object.assign({
      color: color
    }, options || {});

    return this.present(message, options);
  }

  async presentSuccess(message: string, options: Object = {}) {
    options = Object.assign({
      duration: this.durationSuccess
    }, options || {});

    if (this.translateSuccess)                                        //if a translate base key specified for Success
      message = translate(this.translateSuccess + '.' + message);       //try to use it

    return this.presentWithColor(message, 'success', options);
  }

  async presentWarning(message: string, options: Object = {}) {
    options = Object.assign({
      duration: this.durationWarning
    }, options || {});

    if (this.translateWarning)                                        //if a translate base key specified for Warning
      message = translate(this.translateWarning + '.' + message);       //try to use it

    return this.presentWithColor(message, 'warning', options);
  }

  async presentError(message: string, options: Object = {}) {
    options = Object.assign({
      duration: this.durationError
    }, options || {});

    if (this.translateError)                                        //if a translate base key specified for Error
      message = translate(this.translateError + '.' + message);       //try to use it

    return this.presentWithColor(message, 'danger', options);
  }
}
