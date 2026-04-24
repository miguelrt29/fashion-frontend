import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SizeChart {
  category: string;
  image?: string;
  table: {
    headers: string[];
    rows: string[][];
  };
}

@Component({
  selector: 'app-size-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './size-guide.html',
  styleUrl: './size-guide.css'
})
export class SizeGuide {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  activeCategory = 'top';

  sizeCharts: { [key: string]: SizeChart } = {
    top: {
      category: 'Tops & Blusas',
      table: {
        headers: ['Medida', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
        rows: [
          ['Busto (cm)', '80-84', '84-88', '88-92', '92-96', '96-102', '102-108'],
          ['Cintura (cm)', '60-64', '64-68', '68-72', '72-76', '76-82', '82-88'],
          ['Largo (cm)', '60', '62', '64', '66', '68', '70'],
        ]
      }
    },
    bottom: {
      category: 'Pantalones & Faldas',
      table: {
        headers: ['Medida', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
        rows: [
          ['Cintura (cm)', '60-64', '64-68', '68-72', '72-76', '76-82', '82-88'],
          ['Cadera (cm)', '86-90', '90-94', '94-98', '98-102', '102-108', '108-114'],
          ['Largo pants (cm)', '100', '102', '104', '106', '108', '110'],
        ]
      }
    },
    dresses: {
      category: 'Vestidos',
      table: {
        headers: ['Medida', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
        rows: [
          ['Busto (cm)', '80-84', '84-88', '88-92', '92-96', '96-102', '102-108'],
          ['Cintura (cm)', '60-64', '64-68', '68-72', '72-76', '76-82', '82-88'],
          ['Largo (cm)', '85', '87', '89', '91', '93', '95'],
        ]
      }
    },
    shoes: {
      category: 'Zapatos',
      table: {
        headers: ['Medida', '35', '36', '37', '38', '39', '40', '41', '42'],
        rows: [
          ['Largo pie (cm)', '22', '22.5', '23', '24', '24.5', '25', '26', '27'],
        ]
      }
    }
  };

  setCategory(category: string) {
    this.activeCategory = category;
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}