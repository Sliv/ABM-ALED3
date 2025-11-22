import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  Math = Math;

  @Input() tipo: 'imagen' | 'card' | 'grid' = 'imagen';
  @Input() items: any[] = [];
  @Input() visibleCount: number = 3;

  @Input() imagenes: {
    src: string;
    titulo?: string;
    subtitulo?: string;
    posicion?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    link?: string;
  }[] = [];

  @Input() mostrarFlechas: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() intervalo: number = 3500;

  @Input() width: string = '100%';
  @Input() height: string = '500px';
  @Input() gap: string = '1.5rem';


  @Input() filas: number = 2;
  @Input() columnas: number = 3;


  @Input() cardWidth: string = '1fr';
  @Input() cardHeight: string = 'auto';

  currentIndex = 0;
  disableTransition = false;

  private intervalId: any;

  ngOnInit() {
    this.resetIfNeeded();
    if (this.autoplay && this.canAutoplay()) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  private resetIfNeeded() {
    if (this.tipo === 'card') {
      const maxIndex = Math.max(0, this.items.length - this.visibleCount);
      if (this.currentIndex > maxIndex) this.currentIndex = 0;
    } else if (this.tipo === 'imagen') {
      const maxIndex = Math.max(0, this.imagenes.length - 1);
      if (this.currentIndex > maxIndex) this.currentIndex = 0;
    } else if (this.tipo === 'grid') {
      const maxIndex = Math.ceil(this.items.length / (this.filas * this.columnas)) - 1;
      if (this.currentIndex > maxIndex) this.currentIndex = 0;
    }
  }

  private canAutoplay(): boolean {
    if (this.tipo === 'card') return this.items.length > this.visibleCount;
    if (this.tipo === 'grid') return this.items.length > this.filas * this.columnas;
    return this.imagenes.length > 1;
  }

  startAutoplay() {
    this.stopAutoplay();
    this.intervalId = setInterval(() => this.next(), this.intervalo);
  }

  stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private disableThenEnableTransition(nextIndex: number) {
    this.disableTransition = true;
    this.currentIndex = nextIndex;

    requestAnimationFrame(() => {
      setTimeout(() => (this.disableTransition = false), 20);
    });
  }

  next() {
    if (this.tipo === 'grid') {
      const itemsPerPage = this.filas * this.columnas;
      const maxIndex = Math.ceil(this.items.length / itemsPerPage) - 1;

      if (this.currentIndex >= maxIndex) {
        this.disableThenEnableTransition(0);
      } else {
        this.currentIndex++;
      }

      return;
    }

    if (this.tipo === 'card') {
      const maxIndex = Math.max(0, this.items.length - this.visibleCount);

      if (this.currentIndex >= maxIndex) {
        this.disableThenEnableTransition(0);
      } else {
        this.currentIndex++;
      }
      return;
    }

    if (this.imagenes.length === 0) return;

    if (this.currentIndex >= this.imagenes.length - 1) {
      this.disableThenEnableTransition(0);
    } else {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.tipo === 'grid') {
      const itemsPerPage = this.filas * this.columnas;
      const maxIndex = Math.ceil(this.items.length / itemsPerPage) - 1;

      if (this.currentIndex <= 0) {
        this.disableThenEnableTransition(maxIndex);
      } else {
        this.currentIndex--;
      }

      return;
    }

    if (this.tipo === 'card') {
      const maxIndex = Math.max(0, this.items.length - this.visibleCount);

      if (this.currentIndex <= 0) {
        this.disableThenEnableTransition(maxIndex);
      } else {
        this.currentIndex--;
      }

      return;
    }

    // IMAGE MODE
    if (this.imagenes.length === 0) return;

    if (this.currentIndex <= 0) {
      this.disableThenEnableTransition(this.imagenes.length - 1);
    } else {
      this.currentIndex--;
    }
  }

  goTo(index: number) {
    const maxIndex =
      this.tipo === 'card'
        ? Math.max(0, this.items.length - this.visibleCount)
        : this.tipo === 'grid'
        ? Math.ceil(this.items.length / (this.filas * this.columnas)) - 1
        : Math.max(0, this.imagenes.length - 1);

    const safeIndex = Math.max(0, Math.min(index, maxIndex));

    if (this.tipo === 'card' || this.tipo === 'grid') {
      if (safeIndex === 0 && this.currentIndex >= maxIndex) {
        this.disableThenEnableTransition(safeIndex);
      } else {
        this.currentIndex = safeIndex;
      }
    } else {
      if (safeIndex === 0 && this.currentIndex === this.imagenes.length - 1) {
        this.disableThenEnableTransition(0);
      } else {
        this.currentIndex = safeIndex;
      }
    }
  }
}