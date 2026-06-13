import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, Subject, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

interface AnalysisResult {
  matchScore: number;
  matchSummary: string;
  coverLetter: string;
  missingSkills: string[];
  strengths: string[];
  suggestedNotes: string;
}

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [FormsModule, RouterLink,AsyncPipe],
  templateUrl: './ai-analysis.component.html',
  styleUrl: './ai-analysis.component.scss',
})
export class AiAnalysisComponent {
  private http = inject(HttpClient);

  expandedSections: Record<string, boolean> = {
    strengths: false,
    missingSkills: false,
    interviewTips: false,
    coverLetter: false,
  };

  toggleSection(section: string) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  jobTitle = '';
  companyName = '';
  jobDescriptionText = '';
  cvFile: File | null = null;
  loading = false;
  error = '';

  private analyzeSubject = new Subject<FormData>();
  result$: Observable<AnalysisResult> = this.analyzeSubject.pipe(
    switchMap((formData) => {
      this.loading = true;
      this.error = '';
      return this.http.post<AnalysisResult>(`${environment.apiUrl}/ai/analyze`, formData);
    }),
    tap(() => {
      this.loading = false;
    }),
  );

  onCvFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.cvFile = input.files[0];
    }
  }

  analyze() {
    console.log('analyze called');
    if (!this.cvFile || !this.jobTitle || !this.companyName || !this.jobDescriptionText) {
      this.error = 'Please fill in all fields and upload your CV.';
      return;
    }

    const formData = new FormData();
    formData.append('jobTitle', this.jobTitle);
    formData.append('companyName', this.companyName);
    formData.append('jobDescriptionText', this.jobDescriptionText);
    formData.append('cv', this.cvFile);

    this.analyzeSubject.next(formData);
  }

  getScoreColor(score: number): string {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

}
