import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule, MatDialogModule, MatInputModule } from '@angular/material'
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { VisualizationComponent } from './visualization/visualization.component';
import { TextAnalysisComponent } from './text-analysis/text-analysis.component';
import { TextAnalysisSelectionDialogComponent } from './text-analysis-selection-dialog/text-analysis-selection-dialog.component';
import { FormsModule } from '@angular/forms';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { TableModule } from 'primeng/table';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { MatChipsModule } from '@angular/material/chips';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    VisualizationComponent,
    TextAnalysisComponent,
    TextAnalysisSelectionDialogComponent,
    PieChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatSelectModule,
    MatGridListModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    HttpClientModule,
    MatDialogModule,
    FormsModule,
    MatInputModule,
    TableModule,
    BreadcrumbModule,
    StepsModule,
    CardModule,
    TabViewModule,
    MatChipsModule,
    ToastModule
  ],
  entryComponents: [ TextAnalysisSelectionDialogComponent ],
  providers: [ MatIconRegistry, MessageService ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'assessment',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/assessment.svg'));
    iconRegistry.addSvgIcon(
      'comment',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/comment.svg'));
  }
}
