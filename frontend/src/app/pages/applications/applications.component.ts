import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ApplicationsService } from '../../services/applications.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import {
  Application,
  ApplicationStatus,
  CreateApplicationPayload,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../../models/application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [FormsModule, RouterLink, AsyncPipe],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
})
export class ApplicationsComponent {
  private applicationsService = inject(ApplicationsService);

  showForm = false;
  editingId: string | null = null;
  filterStatus: ApplicationStatus | '' = '';

  statusLabels = STATUS_LABELS;
  statusColors = STATUS_COLORS;
  statusOptions: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected', 'withdrawn'];

  private reload$ = new BehaviorSubject<ApplicationStatus | undefined>(undefined);

  applications$ = this.reload$.pipe(
    switchMap((status) => this.applicationsService.getAll(status))
  );

  form: CreateApplicationPayload = {
    company_name: '',
    role_title: '',
    applied_date: new Date().toISOString().split('T')[0],
    status: 'applied',
    notes: '',
    location: '',
    job_url: '',
  };

  reload() {
    const status = this.filterStatus ? this.filterStatus : undefined;
    this.reload$.next(status);
  }

  openForm(app?: Application) {
    if (app) {
      this.editingId = app.id;
      this.form = {
        company_name: app.company_name,
        role_title: app.role_title,
        applied_date: app.applied_date,
        status: app.status,
        notes: app.notes ?? '',
        location: app.location ?? '',
        job_url: app.job_url ?? '',
      };
    } else {
      this.editingId = null;
      this.form = {
        company_name: '',
        role_title: '',
        applied_date: new Date().toISOString().split('T')[0],
        status: 'applied',
        notes: '',
        location: '',
        job_url: '',
      };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = {
      company_name: '',
      role_title: '',
      applied_date: new Date().toISOString().split('T')[0],
      status: 'applied',
      notes: '',
      location: '',
      job_url: '',
    };
  }

  submit() {
    if (this.editingId) {
      this.applicationsService.update(this.editingId, this.form).subscribe({
        next: () => { this.closeForm(); this.reload(); },
        error: (err) => console.error(err),
      });
    } else {
      this.applicationsService.create(this.form).subscribe({
        next: () => { this.closeForm(); this.reload(); },
        error: (err) => console.error(err),
      });
    }
  }

  delete(id: string) {
    if (!confirm('Delete this application?')) return;
    this.applicationsService.delete(id).subscribe({
      next: () => this.reload(),
    });
  }

  getStatusColor(status: ApplicationStatus): string {
    return STATUS_COLORS[status];
  }

  onFilterChange() {
    this.reload();
  }
}
