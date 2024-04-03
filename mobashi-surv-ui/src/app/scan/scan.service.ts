import { Injectable, ApplicationRef, Injector } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subject, BehaviorSubject } from 'rxjs';
import QrScanner from 'qr-scanner';


export interface QRScannerStatus {
  /**
   * On iOS and Android 6.0+, camera access is granted at runtime by the user (by clicking "Allow" at the dialog).
   * The authorized property is a boolean value which is true only when the user has allowed camera access to your app (AVAuthorizationStatus.Authorized).
   * On platforms with permissions granted at install (Android pre-6.0, Windows Phone) this property is always true.
   */
  authorized: boolean;
  /**
   * A boolean value which is true if the user permanently denied camera access to the app (AVAuthorizationStatus.Denied).
   * Once denied, camera access can only be gained by requesting the user change their decision (consider offering a link to the setting via openSettings()).
   */
  denied: boolean;
  /**
   * A boolean value which is true if the user is unable to grant permissions due to parental controls, organization security configuration profiles, or similar reasons.
   */
  restricted: boolean;
  /**
   * A boolean value which is true if QRScanner is prepared to capture video and render it to the view.
   */
  prepared: boolean;
  /**
   * A boolean value which is true when the preview layer is visible (and on all platforms but browser, the native webview background is transparent).
   */
  showing: boolean;
  /**
   * A boolean value which is true if QRScanner is actively scanning for a QR code.
   */
  scanning: boolean;
  /**
   * A boolean value which is true if QRScanner is displaying a live preview from the device's camera. Set to false when the preview is paused.
   */
  previewing: boolean;
  /**
   * A boolean value which is true if the light is enabled.
   */
  lightEnabled: boolean;
  /**
   * A boolean value which is true only if the users' operating system is able to QRScanner.openSettings().
   */
  canOpenSettings: boolean;
  /**
   * A boolean value which is true only if the users' device can enable a light in the direction of the currentCamera.
   */
  canEnableLight: boolean;
  /**
   * A boolean value which is true only if the current device "should" have a front camera.
   * The camera may still not be capturable, which would emit error code 3, 4, or 5 when the switch is attempted.
   * (On the browser platform, this value is false until the prepare method is called.)
   */
  canChangeCamera: boolean;
  /**
   * A number representing the index of the currentCamera. 0 is the back camera, 1 is the front.
   */
  currentCamera: number;
}


@Injectable({
  providedIn: 'root'
})
export class ScanService {
  //see: https://github.com/ionic-team/capacitor/issues/1213#issuecomment-585537613
  private readonly domElement: any;
  private readonly capabs$$ = new BehaviorSubject<any>({});
  public readonly capabs$ = this.capabs$$.asObservable();
  private readonly status$$ = new BehaviorSubject<QRScannerStatus>({} as QRScannerStatus);
  public readonly status$ = this.status$$.asObservable();
  private readonly result$$ = new BehaviorSubject<any | undefined>(undefined);
  public readonly result$ = this.result$$.asObservable();
  private resumeSubscription: any;
  private webScanner: QrScanner | undefined;

  constructor(
    private platform: Platform,
    private applicationRef: ApplicationRef,
    private injector: Injector
  ) {
    this.domElement = window.document.querySelector('ion-app') as HTMLElement;

    //verifiy if device has at least one available camera
    QrScanner.hasCamera()
      .then((hasCamera) => {
        this.capabs$$.next({
          webScan: true,                  //running inside Browser
          canScan: hasCamera,             //must have at least one camera
          //if implemented, ask the scanner if it can cycle through available cameras
          canCycle: (QrScanner as any).canCycle && (QrScanner as any).canCycle()
        });
      });

    this.setWebStatus();            //must also set an initial empty Web status
  }

  public setWebScanVideo(webScanVideo: HTMLVideoElement) {
    //for debugging purposes, show an alert for each available camera
    /* window.navigator.mediaDevices.enumerateDevices()
      .then((devices) => devices.forEach((device) => {
        console.log(device);
  
        if (device.kind == "videoinput") {
          alert(device.label + ' => ' + device.deviceId);
        }
      })
      ).catch((error) => console.error(error)); */

    if (!!this.webScanner)         //if scanner instance already created,
      return;                       //don't do it again

    this.webScanner = new QrScanner(webScanVideo, (text) => {
      console.log('decoded qr code:', text.data);
      this.hideCamera();
      this._destroy();

      this.result$$.next({
        text: text
      });
    }, {
      returnDetailedScanResult: true,
      highlightScanRegion: true,
      highlightCodeOutline: true
    });

    this.domElement.classList.add('has-camera');

    //after starting Web scanner, set Web status with relevant values (actually only flash support)
    this.result$$.next(null);         //start with no result at all
    if (this.webScanner) {
      const webScanner = this.webScanner!;
      webScanner.start().then(() => {
        webScanner.setInversionMode('both');           //support reading both dark on bright and viceversa
        webScanner.hasFlash().then((hasFlash) => {
          this.setWebStatus({
            lightEnabled: webScanner.isFlashOn(),      //this method is NOT async!!!
            canEnableLight: hasFlash
          });
        });
      });
    }
  }

  public cycleWebCamera() {
    if (this.webScanner)
      (this.webScanner as any).cycleCamera()
        .then((value: any) => console.log(value))
        .catch((error: any) => console.error(error));
  }

  public inputDone(text: string) {
    this.result$$.next({
      text: text
    });
  }

  private setWebStatus(status: Object = {}) {
    status = Object.assign({
      authorized: true,
      denied: false,
      restricted: false,
      prepared: null,
      showing: null,
      scanning: null,
      previewing: null,
      lightEnabled: null,
      canOpenSettings: false,
      canEnableLight: null,
      canChangeCamera: false,
      currentCamera: null
    }, status || {});

    this.status$$.next(status as QRScannerStatus);
  }

  public stopScanning() {
    this.hideCamera();
    this._destroy();
  }

  public scan() {
    this.result$$.next(null);         //start with no result at all
  }

  public hideCamera() {
    if (this.domElement) {
      this.domElement.classList.remove('has-camera');
    }
  }

  public reset() {
    this.result$$.next(null);         //start with no result at all
  }

  public cancel() {
    this.result$$.next({
      cancel: true
    });
  }

  private _destroy() {
    if (this.webScanner) {
      this.webScanner.stop();
      this.webScanner.destroy();
      this.webScanner = undefined;
    }
  }

  public toggleLight() {
    if (this.webScanner) {
      this.webScanner.toggleFlash();
    }
  }

}
