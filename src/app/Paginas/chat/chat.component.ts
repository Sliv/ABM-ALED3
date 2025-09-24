import { Component, OnInit, inject, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, collection, collectionData, addDoc, query, orderBy, doc, setDoc, getDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Mensaje {
  texto: string;
  remitenteId: string;
  creadoEn: any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  mensajes$: Observable<Mensaje[]> | undefined;
  nuevoMensaje: string = '';
  usuario?: User;
  chatId: string = '1'; 
  participantes: string[] = []; 

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  async ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      this.usuario = user || undefined;
      if (!this.usuario) return;

      this.participantes = ['adminId', this.usuario.uid];

      const chatDocRef = doc(this.firestore, `Chat/${this.chatId}`);
      const chatSnap = await getDoc(chatDocRef);
      if (!chatSnap.exists()) {
        await setDoc(chatDocRef, { participantes: this.participantes });
      }

      const mensajesRef = collection(this.firestore, `Chat/${this.chatId}/mensajes`);
      const q = query(mensajesRef, orderBy('creadoEn', 'asc'));
      this.mensajes$ = collectionData(q, { idField: 'id' }) as Observable<Mensaje[]>;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer?.nativeElement.scrollTo({ top: this.scrollContainer.nativeElement.scrollHeight, behavior: 'smooth' });
    } catch {}
  }

  async enviarMensaje() {
    if (!this.usuario || !this.nuevoMensaje.trim()) return;

    const mensajesRef = collection(this.firestore, `Chat/${this.chatId}/mensajes`);
    await addDoc(mensajesRef, {
      texto: this.nuevoMensaje,
      remitenteId: this.usuario.uid,
      creadoEn: serverTimestamp()
    });

    this.nuevoMensaje = '';
  }
}