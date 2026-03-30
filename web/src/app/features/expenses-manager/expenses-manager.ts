import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-expenses-manager',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './expenses-manager.html',
  styleUrl: './expenses-manager.css'
})
export class ExpensesManagerComponent {
  expenses = [
    {
      id: 'INV-9921',
      title: 'Structural Timber & Drywall',
      category: 'Materials',
      date: 'Oct 12, 2023',
      amount: 1240.50,
      unit: 'Daily Rental',
      status: 'monolith-orange',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGlMcNpXnyfrTB30P5UsBl3PZu33vvrTRnE6kk0rp_SFh5CZUcFqN_8dnyhpqIG_5ZzGi988_2dp1TjCwXIzOBnGnGJTOLDtuPI-YwPJOUr5utca3N_eO_fevqQvkslm4VLO1103PTamVB8oEMj-Dj8ctnhg4rVDzA9-I-ZBLy-VmDkwkLX0KEzGNwwglGGsyxIv843YmzJH6QiVNjK8see8i5xfm1HZkgLcY300mltFSWrUYJBaN124eNJ_9joz6frixjksaQuuM'
    },
    {
      id: 'TX-2023-Q3',
      title: 'Quarterly Property Tax Payment',
      category: 'Tax & Insurance',
      date: 'Oct 08, 2023',
      amount: 4850.00,
      unit: 'My House',
      status: 'monolith-blue',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwaretED-lwSBj_27b9rwasOsHs1AlRW9p4tj7I7g7hFrtPRIMUdFXg1_kak2haoWdt4B9W61DTlYW4Ma9DQqj2W-ElbFeSglV-l5PTToYZUw8ctgPPETsKaqBF5mNMb2zCAgCAJbUpvMs8S-gAYoR1LjtaIMHiuGgnnVKdCKhTY5ika63mryIZp4_uMqCTN_ltHtXv7Pft3gkOjJQgBYPLt19IrA5XklgGFKt3u5QP31MJtYbidr96DcxLtcH30GbHFaxnjDFnW8',
      pending: true
    },
    {
      id: 'SHOP-441',
      title: 'Bespoke Living Room Lighting',
      category: 'Materials',
      date: 'Oct 05, 2023',
      amount: 899.99,
      unit: 'Monthly Rental',
      status: 'monolith-orange',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbd8VgroFsMLBO3MEDiZ8FownQFNEnSY8IC6YB8jTc-W2wdNTUUl0jfWyD4cI7cwBnvjtxJiRDTCWaEzz_wYcjGZBiQX-RlV_kre3gT5zvXWXwPhANQKisuq2Xbf2Oai2Xn8ZkertNIA5xtYFxcBEbaT-kT7au3bpPNOg68ypEjiI30lBlybuguGBS5vQyZ8NwKJ060GQEPNpHOKP7J3cclc3PCAcBbzNG7NFbeFioTMnO7AiH9JFcyftB8fz__8qXRO4GLCtp-Ag',
      reconciled: true
    }
  ];
}
