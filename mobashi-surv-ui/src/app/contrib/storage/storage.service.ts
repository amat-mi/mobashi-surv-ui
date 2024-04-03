import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _subjects = new Map<string, BehaviorSubject<any>>;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    this._storage = await this.storage.create();
  }

  public $(key: string, value: any = null) {
    let subject = this._subjects.get(key);
    if (!subject) {
      subject = new BehaviorSubject(value);
      this._subjects.set(key, subject);
    }

    return subject.asObservable();
  }

  public async set(key: string, value: any) {
    const res = await this._storage?.set(key, value);
    this._subjects.get(key)?.next(value);

    return res;
  }

  public async get(key: string) {
    const res =  await this._storage?.get(key);
    this._subjects.get(key)?.next(res);

    return res;
  }

  public async setDefault(key: string, value: any) {
    let res = await this.get(key);
    if (res == undefined) {
      await this.set(key, value);

      return value
    }

    return res;
  }

  public async remove(key: string) {
    return await this._storage?.remove(key);
  }

  public async keys() {
    return await this._storage?.keys();
  }

  public async length() {
    return await this._storage?.length();
  }

}