import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAnalysisSelectionDialogComponent } from './text-analysis-selection-dialog.component';

describe('TextAnalysisSelectionDialogComponent', () => {
  let component: TextAnalysisSelectionDialogComponent;
  let fixture: ComponentFixture<TextAnalysisSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextAnalysisSelectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextAnalysisSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
